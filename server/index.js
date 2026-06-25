import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';
import { seedDatabase } from './seed.js';
import { runOrchestrator } from './orchestrator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Get all issues
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await db.getCollection('issues');
    // Sort issues by date (newest first)
    const sorted = issues.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get single issue
app.get('/api/issues/:id', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create a new issue (citizen snaps/voices report)
app.post('/api/issues', async (req, res) => {
  try {
    const { category, severity, description, location, voiceUrl, photoUrl, reporterReputation } = req.body;
    
    // Check for nearby matching issues to deduplicate
    const issues = await db.getCollection('issues');
    const duplicateRadiusKm = 0.15; // 150 meters
    let existingDuplicate = null;
    
    if (location && location.lat && location.lng) {
      existingDuplicate = issues.find(issue => {
        if (issue.status === 'verified') return false; // Ignore closed issues
        if (issue.category !== category) return false;
        
        // Distance calculation
        const R = 6371; // earth radius km
        const dLat = (issue.location.lat - location.lat) * Math.PI / 180;
        const dLon = (issue.location.lng - location.lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(location.lat * Math.PI / 180) * Math.cos(issue.location.lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = R * c;
        
        return dist <= duplicateRadiusKm;
      });
    }

    if (existingDuplicate) {
      // Deduplicate: merge reports by increasing count of affected citizens
      const updated = await db.updateDoc('issues', existingDuplicate.id, {
        citizensAffected: (existingDuplicate.citizensAffected || 1) + 1,
        // Append log to ledger trail
        ledgerTrail: [
          ...(existingDuplicate.ledgerTrail || []),
          {
            timestamp: new Date().toISOString(),
            status: existingDuplicate.status,
            actor: 'System-Deduplicator',
            message: `Deduplicated matching report. Affected count increased to ${(existingDuplicate.citizensAffected || 1) + 1}.`
          }
        ]
      });
      console.log(`Deduplicated new report. Merged with issue: ${existingDuplicate.id}`);
      return res.status(200).json({ deduplicated: true, issue: updated });
    }

    // SLA Calculation based on category/severity
    let slaHours = 72; // default
    if (severity === 'RedAlert') slaHours = 4;
    else if (severity === 'high') slaHours = 12;
    else if (severity === 'medium') slaHours = 48;
    
    // Inaction cost calculation
    let costPerDay = 250;
    if (severity === 'RedAlert') costPerDay = 8500;
    else if (severity === 'high') costPerDay = 3000;
    else if (severity === 'medium') costPerDay = 800;

    const newIssue = {
      category: category || 'pothole',
      severity: severity || 'medium',
      status: 'reported',
      description: description || 'No description provided.',
      location: location || { lat: 12.9716, lng: 77.5946, address: 'Demo City' },
      citizensAffected: 1,
      costOfInaction: costPerDay,
      slaDeadline: new Date(Date.now() + slaHours * 3600 * 1000).toISOString(),
      reporterReputation: reporterReputation || 20,
      ward: location.ward || 'Ward 4 - Green Park',
      bids: [],
      assignedContractorId: null,
      inspectorId: null,
      proofOfFixUrl: null,
      voiceUrl: voiceUrl || null,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
      ledgerTrail: [
        { timestamp: new Date().toISOString(), status: 'reported', actor: 'Citizen', message: 'Report created via Nidaan' }
      ],
      timestamp: new Date().toISOString()
    };

    const saved = await db.addDoc('issues', newIssue);
    
    // Auto-trigger the first orchestrator agent loop step in background
    runOrchestrator(saved.id, 'reported').catch(err => console.error('Agent error:', err));

    res.status(201).json({ deduplicated: false, issue: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get contractors
app.get('/api/contractors', async (req, res) => {
  try {
    const contractors = await db.getCollection('contractors');
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get responders (crews, inspectors)
app.get('/api/responders', async (req, res) => {
  try {
    const responders = await db.getCollection('responders');
    res.json(responders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Trigger specific step in Agent Orchestration (for simulation and walk-through demoing)
app.post('/api/issues/:id/trigger', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(440).json({ error: 'Issue not found' });
    
    const logs = await runOrchestrator(issue.id, issue.status);
    const updated = await db.getDoc('issues', req.params.id);
    res.json({ logs, issue: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Submit Contractor proof of fix (locks status, kicks off verification)
app.post('/api/issues/:id/fix', async (req, res) => {
  try {
    const { proofOfFixUrl } = req.body;
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: 'fixed',
      actor: 'Contractor',
      message: 'Uploaded post-fix image proof. Awaiting AI and inspector sign-off.'
    };
    
    const updated = await db.updateDoc('issues', req.params.id, {
      status: 'fixed',
      proofOfFixUrl: proofOfFixUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
    
    // Trigger agent verification step in background
    runOrchestrator(updated.id, 'fixed').catch(err => console.error('Agent error:', err));
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Increase pressure/upvote issue (representing community collective pressure)
app.post('/api/issues/:id/vote', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const newCount = (issue.citizensAffected || 1) + 1;
    let updateFields = { citizensAffected: newCount };
    
    // Automatically trigger escalation if collective pressure crosses 50 votes and still not assigned
    let escalated = false;
    if (newCount >= 50 && ['reported', 'triaged', 'bidding'].includes(issue.status)) {
      escalated = true;
      const ledgerEntry = {
        timestamp: new Date().toISOString(),
        status: 'escalated',
        actor: 'PressurePath-Agent',
        message: `Collective pressure threshold breached (${newCount} citizens). Auto-generated legal RTI grievance drafted and routed.`
      };
      updateFields.status = 'escalated';
      updateFields.ledgerTrail = [...(issue.ledgerTrail || []), ledgerEntry];
    } else {
      updateFields.ledgerTrail = [
        ...(issue.ledgerTrail || []),
        {
          timestamp: new Date().toISOString(),
          status: issue.status,
          actor: 'Citizen-Voter',
          message: `Citizen upvoted report. Active support increased to ${newCount} members.`
        }
      ];
    }
    
    const updated = await db.updateDoc('issues', req.params.id, updateFields);
    res.json({ escalated, issue: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.1. Register a new contractor
app.post('/api/contractors', async (req, res) => {
  try {
    const { name, specialties, location, hourlyRate } = req.body;
    const newContractor = {
      id: `contractor_${Date.now()}`,
      name: name || 'Anonymous Contractor',
      specialties: specialties || ['pothole'],
      rating: 5.0,
      completedJobs: 0,
      location: location || { lat: 12.971598, lng: 77.594562, address: 'Demo City' },
      materialsStock: [
        { item: 'Standard Toolset', qty: 1, unit: 'set' },
        { item: 'Safety Vests', qty: 5, unit: 'pcs' }
      ],
      activeJobs: 0,
      reputation: 80,
      hourlyRate: Number(hourlyRate) || 500
    };
    const saved = await db.addDoc('contractors', newContractor);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.2. Report physical fix failure (reopen ticket and penalise contractor reputation)
app.post('/api/issues/:id/reopen', async (req, res) => {
  try {
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const contractorId = issue.assignedContractorId;
    if (contractorId) {
      try {
        const contractor = await db.getDoc('contractors', contractorId);
        if (contractor) {
          const newRep = Math.max(0, (contractor.reputation || 80) - 15);
          const newRating = Math.max(1.0, Number((contractor.rating - 0.5).toFixed(1)));
          await db.updateDoc('contractors', contractorId, { reputation: newRep, rating: newRating });
        }
      } catch (err) {
        console.error('Error updating contractor on reopen:', err);
      }
    }

    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: 'reported',
      actor: 'Citizen-Auditor',
      message: 'Warranty Claim Failed: Physical repair failed. Penalty applied to contractor rating. Issue auto-reopened.'
    };

    const updated = await db.updateDoc('issues', req.params.id, {
      status: 'reported',
      assignedContractorId: null,
      inspectorId: null,
      proofOfFixUrl: null,
      bids: [],
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.3. Citizen donation to crowdfund ticket resolution
app.post('/api/issues/:id/donate', async (req, res) => {
  try {
    const { amount } = req.body;
    const donationAmount = Number(amount) || 500;
    const issue = await db.getDoc('issues', req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    
    const currentRaised = issue.crowdfundRaised || 0;
    const newTotal = currentRaised + donationAmount;
    
    const ledgerEntry = {
      timestamp: new Date().toISOString(),
      status: issue.status,
      actor: 'Citizen-Donors',
      message: `Received citizen crowdfunding contribution of ₹${donationAmount}. Total raised: ₹${newTotal}.`
    };
    
    const updated = await db.updateDoc('issues', req.params.id, {
      crowdfundRaised: newTotal,
      ledgerTrail: [...(issue.ledgerTrail || []), ledgerEntry]
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8.4. System status — reports which database backend is live (firestore vs. local mock)
app.get('/api/status', (req, res) => {
  res.json({
    dbType: db.getDbType(),
    agentMode: process.env.GEMINI_API_KEY ? 'gemini' : 'simulated',
    time: new Date().toISOString()
  });
});

// 9. Reset/Seed database endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database reset and seeded successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Nidaan Backend API running on http://localhost:${PORT}`);
});

// Fail gracefully with an actionable message instead of an unhandled crash
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Nidaan] Port ${PORT} is already in use — a server instance is probably still running.`);
    console.error(`         Stop the other instance, or run this one on a different port:`);
    console.error(`           PowerShell:  $env:PORT=5001; npm run server`);
    console.error(`           bash:        PORT=5001 npm run server\n`);
    process.exit(1);
  }
  throw err;
});
