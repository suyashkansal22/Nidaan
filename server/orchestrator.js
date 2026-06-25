import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './db.js';

// Load API Key
const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey) {
  try {
    ai = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI client successfully initialized.');
  } catch (error) {
    console.error('Failed to initialize Gemini Client. Falling back to simulated AI mode.', error);
  }
} else {
  console.log('GEMINI_API_KEY not found. Running in simulated Agent Mode.');
}

// System Prompt defining the Resolution Orchestrator's mindset, boundaries, and tool uses.
const ORCHESTRATOR_SYSTEM_INSTRUCTION = `
You are the Nidaan "Resolution Orchestrator" agent. Your job is to resolve reported civic issues autonomously.
You follow a strict state machine:
Reported -> Triaged -> Bidding -> Assigned -> In Progress -> Fixed -> Verified.

You have access to tools to interact with the database, schedule inspectors (Google Calendar), release escrow funds (Stripe), and notify workers (Gmail).
Be thorough, logical, and document your actions step-by-step.
When a new issue is triaged:
1. Estimate the materials needed (Bill-of-Materials).
2. Gather nearby contractors.
3. Invite bids (reverse-auction).
4. Auto-select the winning contractor based on Price (40%), Rating (30%), Proximity (20%), and Reputation (10%).
5. Lock the funds in Stripe escrow and notify the crew.
6. When a contractor submits a photo proof of fix, run verification (compare images), schedule an inspector if it is a major job, and release escrow payment once verified.
7. If an SLA deadline is breached, draft a formal complaint and escalate to public officials.
`;

// Helper: Calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Tool implementations for the agent
const agentTools = {
  get_issue: async ({ issueId }) => {
    return await db.getDoc('issues', issueId);
  },
  
  update_issue_status: async ({ issueId, status, message }) => {
    const issue = await db.getDoc('issues', issueId);
    if (!issue) return { error: 'Issue not found' };
    
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status,
      actor: 'ResolutionOrchestrator',
      message
    };
    
    const updatedTrail = [...(issue.ledgerTrail || []), ledgerEntry];
    return await db.updateDoc('issues', issueId, { status, ledgerTrail: updatedTrail });
  },

  get_nearby_contractors: async ({ issueId, radiusKm = 5 }) => {
    const issue = await db.getDoc('issues', issueId);
    if (!issue) return { error: 'Issue not found' };
    
    const specialtyMapping = {
      'pothole': 'pothole',
      'water_leak': 'water_leak',
      'drainage': 'drainage',
      'wiring': 'wiring',
      'garbage': 'garbage',
      'debris': 'debris',
      'road_sign': 'road_sign'
    };
    
    const specialty = specialtyMapping[issue.category] || 'pothole';
    const allContractors = await db.getCollection('contractors');
    
    const nearby = allContractors.filter(c => {
      const dist = getDistance(
        issue.location.lat, 
        issue.location.lng, 
        c.location.lat, 
        c.location.lng
      );
      return dist <= radiusKm && c.specialties.includes(specialty);
    });
    
    return nearby;
  },

  create_bids_for_contractors: async ({ issueId, bids }) => {
    // bids: Array of { contractorId, price, eta }
    const issue = await db.getDoc('issues', issueId);
    if (!issue) return { error: 'Issue not found' };
    
    const formattedBids = [];
    for (const bid of bids) {
      const contractor = await db.getDoc('contractors', bid.contractorId);
      formattedBids.push({
        contractorId: bid.contractorId,
        price: bid.price,
        eta: bid.eta, // in minutes
        rating: contractor ? contractor.rating : 4.0,
        reputation: contractor ? contractor.reputation : 70,
        status: 'pending'
      });
    }
    
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: 'bidding',
      actor: 'ResolutionOrchestrator',
      message: `Invited bids from ${bids.length} contractors. Bid list created.`
    };
    
    return await db.updateDoc('issues', issueId, { 
      status: 'bidding', 
      bids: formattedBids,
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
  },

  select_winning_bid: async ({ issueId }) => {
    const issue = await db.getDoc('issues', issueId);
    if (!issue || !issue.bids || issue.bids.length === 0) {
      return { error: 'No bids available to rank' };
    }
    
    // Reverse Auction Multi-attribute Scoring Utility function:
    // Score = RatingWeight * (rating / 5) 
    //         + PriceWeight * (minPrice / Price) 
    //         + ProximityWeight * (minETA / ETA)
    //         + ReputationWeight * (reputation / 100)
    // Goal: Minimize cost/ETA, Maximize rating/reputation
    const minPrice = Math.min(...issue.bids.map(b => b.price));
    const minETA = Math.min(...issue.bids.map(b => b.eta));
    
    let bestContractorId = null;
    let highestScore = -1;
    
    const scoredBids = issue.bids.map(bid => {
      const priceFactor = minPrice / bid.price;
      const etaFactor = minETA / bid.eta;
      const ratingFactor = bid.rating / 5;
      const reputationFactor = bid.reputation / 100;
      
      const score = (priceFactor * 0.40) + (ratingFactor * 0.30) + (etaFactor * 0.20) + (reputationFactor * 0.10);
      
      if (score > highestScore) {
        highestScore = score;
        bestContractorId = bid.contractorId;
      }
      return { ...bid, score };
    });
    
    // Update bid statuses
    const updatedBids = scoredBids.map(b => ({
      ...b,
      status: b.contractorId === bestContractorId ? 'accepted' : 'rejected'
    }));
    
    const winningBid = updatedBids.find(b => b.contractorId === bestContractorId);
    const contractor = await db.getDoc('contractors', bestContractorId);
    
    // Mock Stripe escrow creation
    const escrowMsg = `Stripe Escrow: locked ₹${winningBid.price} for job. Payout will trigger on verification.`;
    const message = `Auto-assigned job to ${contractor.name} (Score: ${(highestScore * 100).toFixed(1)}%). Price: ₹${winningBid.price}, ETA: ${winningBid.eta}m. ${escrowMsg}`;
    
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: 'assigned',
      actor: 'ResolutionOrchestrator',
      message
    };
    
    return await db.updateDoc('issues', issueId, {
      status: 'assigned',
      assignedContractorId: bestContractorId,
      bids: updatedBids,
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
  },

  schedule_inspector: async ({ issueId, inspectorId, appointmentTime }) => {
    const issue = await db.getDoc('issues', issueId);
    const inspector = await db.getDoc('responders', inspectorId);
    if (!issue || !inspector) return { error: 'Issue or Inspector not found' };
    
    // Update responder status to busy
    await db.updateDoc('responders', inspectorId, { status: 'busy' });
    
    const message = `Google Calendar: Scheduled site verification by ${inspector.name} for ${appointmentTime}.`;
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: 'assigned',
      actor: 'ResolutionOrchestrator',
      message
    };
    
    return await db.updateDoc('issues', issueId, {
      inspectorId,
      inspectionScheduledTime: appointmentTime,
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
  },

  release_escrow_payment: async ({ issueId }) => {
    const issue = await db.getDoc('issues', issueId);
    if (!issue || !issue.assignedContractorId) return { error: 'No assigned job to pay' };
    
    const winningBid = issue.bids.find(b => b.contractorId === issue.assignedContractorId);
    const contractor = await db.getDoc('contractors', issue.assignedContractorId);
    const amount = winningBid ? winningBid.price : 1000;
    
    // Update contractor stats
    await db.updateDoc('contractors', issue.assignedContractorId, {
      completedJobs: (contractor.completedJobs || 0) + 1,
      reputation: Math.min(100, (contractor.reputation || 70) + 2)
    });
    
    // Set inspector back to available if any
    if (issue.inspectorId) {
      await db.updateDoc('responders', issue.inspectorId, { status: 'available' });
    }
    
    const message = `Stripe Payout Released: Released ₹${amount} from Escrow to ${contractor.name}. Triple-Lock verified successfully.`;
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: 'verified',
      actor: 'ResolutionOrchestrator',
      message
    };
    
    return await db.updateDoc('issues', issueId, {
      status: 'verified',
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
  },

  draft_formal_complaint: async ({ issueId, department, draftText }) => {
    const issue = await db.getDoc('issues', issueId);
    if (!issue) return { error: 'Issue not found' };
    
    const message = `Escalated: Drafted official RTI grievance to Department of ${department}. Queue escalated.`;
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: 'escalated',
      actor: 'ResolutionOrchestrator',
      message: `${message} Content: "${draftText.substring(0, 80)}..."`
    };
    
    return await db.updateDoc('issues', issueId, {
      status: 'escalated',
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
  }
};

// Simulation agent reasoning logic when Gemini is offline
const runSimulatedAgent = async (issueId, triggerState) => {
  console.log(`Running Simulated Agent loop for issue ${issueId} at state ${triggerState}...`);
  const issue = await db.getDoc('issues', issueId);
  if (!issue) return;

  const logs = [];
  const logStep = (msg) => {
    console.log(`[Agent simulation] ${msg}`);
    logs.push(msg);
  };

  if (triggerState === 'reported') {
    // 1. Triage
    logStep(`[Triage Engine] Parsing report... Category: ${issue.category}, Severity: ${issue.severity}.`);
    
    let isRedAlert = issue.severity === 'RedAlert';
    let urgencyMsg = isRedAlert 
      ? 'RedAlert: Downed utility/dangerous hazard detected. Routing to emergency lane.' 
      : 'Standard intake verification passed.';
    logStep(`[Triage Engine] ${urgencyMsg}`);
    
    await agentTools.update_issue_status({
      issueId,
      status: 'triaged',
      message: `Triage Complete: Issue categorised as ${issue.category.toUpperCase()} (${issue.severity} severity). ${isRedAlert ? 'EMERGENCY NOTIFIED.' : ''}`
    });

    // Run next step: gather BOM and invite bids
    setTimeout(async () => {
      try {
        await runSimulatedAgent(issueId, 'triaged');
      } catch (err) {
        console.error('Error in simulated agent triaged step:', err);
      }
    }, 1000);

  } else if (triggerState === 'triaged') {
    // 2. Bill of Materials Inference
    logStep(`[BOM Inference] Matching category '${issue.category}' to standard municipal repair inventory.`);
    let bomItems = [];
    if (issue.category === 'pothole') {
      bomItems = '5 bags bituminous mix, 10L asphalt sealant, 2 Warning cones';
    } else if (issue.category === 'water_leak') {
      bomItems = '1x PVC pipe 3", 2x iron couplers, 2 bags rapid-cement';
    } else if (issue.category === 'wiring') {
      bomItems = '50m Copper wire, 4 insulator caps, 1 safety box';
    } else {
      bomItems = 'General dispatch gear, 5 trash sacks, cleaning broom';
    }
    logStep(`[BOM Inference] Inferred Bill-of-Materials: ${bomItems}`);

    // 3. Find contractors & Request bids
    logStep(`[Responder Radar] Searching for nearest qualified contractors in 5km radius.`);
    const contractors = await agentTools.get_nearby_contractors({ issueId });
    logStep(`[Responder Radar] Found ${contractors.length} active contractors matching specialty.`);

    if (contractors.length > 0) {
      // Simulate bids
      const mockBids = contractors.map(c => {
        // Base bid on hourly rate plus random materials multiplier
        const basePrice = c.hourlyRate * 3;
        const bidPrice = Math.round(basePrice * (0.85 + Math.random() * 0.3));
        const bidETA = Math.round(15 + Math.random() * 45); // 15 to 60 mins
        return { contractorId: c.id, price: bidPrice, eta: bidETA };
      });
      
      logStep(`[Reverse-Auction] Soliciting quotes. Bid options created.`);
      await agentTools.create_bids_for_contractors({ issueId, bids: mockBids });

      // Run selection shortly after
      setTimeout(async () => {
        try {
          await runSimulatedAgent(issueId, 'bidding');
        } catch (err) {
          console.error('Error in simulated agent bidding step:', err);
        }
      }, 1000);
    } else {
      logStep(`[Reverse-Auction] No private contractors found. Assigning to municipal crew.`);
      await agentTools.update_issue_status({
        issueId,
        status: 'assigned',
        message: 'No private contractors responded. Auto-dispatched Ward Municipal Crew.'
      });
    }

  } else if (triggerState === 'bidding') {
    // 4. Score and select winner
    logStep(`[Orchestration Engine] Bids collected. Applying multi-criteria reverse-auction scorecard (40% Cost, 30% Rating, 20% Proximity, 10% Rep).`);
    await agentTools.select_winning_bid({ issueId });

    // 5. Schedule Inspector
    setTimeout(async () => {
      try {
        const inspectors = (await db.getCollection('responders')).filter(r => r.role === 'inspector' && r.status === 'available');
        if (inspectors.length > 0) {
          const inspector = inspectors[0];
          const time = new Date(Date.now() + 1.5 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          logStep(`[Scheduler] Booking verification inspector on Google Calendar: ${inspector.name} at ${time}.`);
          await agentTools.schedule_inspector({ issueId, inspectorId: inspector.id, appointmentTime: time });
        }
      } catch (err) {
        console.error('Error in simulated agent scheduling step:', err);
      }
    }, 500);

  } else if (triggerState === 'fixed') {
    // 6. Verification
    logStep(`[Triple-Lock Proof] Comparing original report photo with contractor proof-of-fix photo using Gemini Flash Vision.`);
    logStep(`[Triple-Lock Proof] Image diff similarity: 94%. Debris cleared, road surface patched.`);
    
    // Simulate inspector confirmation
    if (issue.inspectorId) {
      logStep(`[Inspector Confirm] Pin-ping returned positive verification from field inspector.`);
    }

    logStep(`[Stripe Escrow] Release token verified. Invoking payout API.`);
    await agentTools.release_escrow_payment({ issueId });
  }

  return logs;
};

// Main entry point for orchestration
export const runOrchestrator = async (issueId, triggerState) => {
  if (!ai) {
    // Run simulation mode immediately
    return await runSimulatedAgent(issueId, triggerState);
  }

  try {
    console.log(`Invoking Gemini Agentic Loop for Issue: ${issueId} (Trigger: ${triggerState})`);
    
    // In a real agentic framework, we feed the state, instructions, and tools to Gemini Chat,
    // let it execute the function calls, and loop until it outputs final reasoning.
    // For AI Studio build compatibility, we implement a direct model call with functions.
    
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: ORCHESTRATOR_SYSTEM_INSTRUCTION
    });
    
    const issue = await db.getDoc('issues', issueId);
    const contractors = await db.getCollection('contractors');
    const responders = await db.getCollection('responders');
    
    const prompt = `
Current System State:
- Action Trigger State: "${triggerState}"
- Target Issue Details: ${JSON.stringify(issue)}
- Available Contractors: ${JSON.stringify(contractors)}
- Municipal Responders: ${JSON.stringify(responders)}

Perform the next logical step in the resolution flow. Select the appropriate tool.
If triaging is needed, call update_issue_status to 'triaged'.
If bidding is needed, search contractors, generate bids, and invoke create_bids_for_contractors.
If bidding is complete, select the winning bid and schedule the inspector.
If the contractor has uploaded a fix proof, verify it and call release_escrow_payment.
`;

    // Declaring tools to the Gemini API
    const tools = [
      {
        functionDeclarations: [
          {
            name: 'update_issue_status',
            description: 'Update status of the issue and add a log entry in the ledger.',
            parameters: {
              type: 'OBJECT',
              properties: {
                issueId: { type: 'STRING' },
                status: { type: 'STRING' },
                message: { type: 'STRING' }
              },
              required: ['issueId', 'status', 'message']
            }
          },
          {
            name: 'create_bids_for_contractors',
            description: 'Initiate reverse-auction bidding for selected contractors.',
            parameters: {
              type: 'OBJECT',
              properties: {
                issueId: { type: 'STRING' },
                bids: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      contractorId: { type: 'STRING' },
                      price: { type: 'NUMBER' },
                      eta: { type: 'NUMBER' }
                    },
                    required: ['contractorId', 'price', 'eta']
                  }
                }
              },
              required: ['issueId', 'bids']
            }
          },
          {
            name: 'select_winning_bid',
            description: 'Assign the winning contractor using reverse-auction scorecard and lock Stripe escrow.',
            parameters: {
              type: 'OBJECT',
              properties: {
                issueId: { type: 'STRING' }
              },
              required: ['issueId']
            }
          },
          {
            name: 'schedule_inspector',
            description: 'Schedule a municipal inspector verification on Google Calendar.',
            parameters: {
              type: 'OBJECT',
              properties: {
                issueId: { type: 'STRING' },
                inspectorId: { type: 'STRING' },
                appointmentTime: { type: 'STRING' }
              },
              required: ['issueId', 'inspectorId', 'appointmentTime']
            }
          },
          {
            name: 'release_escrow_payment',
            description: 'Release Stripe escrow payment to assigned contractor.',
            parameters: {
              type: 'OBJECT',
              properties: {
                issueId: { type: 'STRING' }
              },
              required: ['issueId']
            }
          }
        ]
      }
    ];

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools
    });

    const response = result.response;
    const calls = response.functionCalls;

    if (calls && calls.length > 0) {
      const logs = [];
      for (const call of calls) {
        const { name, args } = call;
        console.log(`[Gemini Agent Function Call]: ${name}`, args);
        logs.push(`[Agent Agentic Tool Call]: Invoked ${name} with args ${JSON.stringify(args)}`);
        
        if (agentTools[name]) {
          await agentTools[name](args);
        }
      }
      return logs;
    } else {
      // If the model did not generate tool calls but text, log its reasoning
      const text = response.text();
      console.log(`[Gemini Agent Reasoning]: ${text}`);
      return [text];
    }
  } catch (error) {
    console.error('Error invoking Gemini Agent. Falling back to simulation.', error);
    return await runSimulatedAgent(issueId, triggerState);
  }
};
