import { db } from './db.js';

const DEMO_COORDINATES = {
  center: { lat: 12.971598, lng: 77.594562 }, // Bengaluru center
  offset: (dLat, dLng) => ({
    lat: 12.971598 + dLat,
    lng: 77.594562 + dLng,
    address: 'Demo City, Sector ' + Math.floor(Math.random() * 15 + 1)
  })
};

const sampleContractors = [
  {
    id: 'contractor_1',
    name: 'Apex Roadways Ltd',
    specialties: ['pothole', 'garbage'],
    rating: 4.8,
    completedJobs: 142,
    location: DEMO_COORDINATES.offset(0.005, -0.008),
    materialsStock: [
      { item: 'Bituminous Mix', qty: 15, unit: 'bags' },
      { item: 'Asphalt Sealant', qty: 50, unit: 'liters' },
      { item: 'Road Warning Tape', qty: 10, unit: 'rolls' }
    ],
    activeJobs: 0,
    reputation: 92,
    hourlyRate: 850
  },
  {
    id: 'contractor_2',
    name: 'HydroFix Plumbing & Piping',
    specialties: ['water_leak', 'drainage'],
    rating: 4.6,
    completedJobs: 98,
    location: DEMO_COORDINATES.offset(-0.006, 0.004),
    materialsStock: [
      { item: 'PVC Pipe 3"', qty: 8, unit: 'pcs' },
      { item: 'Iron Couplers', qty: 25, unit: 'pcs' },
      { item: 'Quick-Dry Cement', qty: 10, unit: 'bags' }
    ],
    activeJobs: 1,
    reputation: 85,
    hourlyRate: 750
  },
  {
    id: 'contractor_3',
    name: 'VoltCare Electricals',
    specialties: ['wiring', 'road_sign'],
    rating: 4.9,
    completedJobs: 215,
    location: DEMO_COORDINATES.offset(0.003, 0.007),
    materialsStock: [
      { item: 'Copper Wire 10mm', qty: 300, unit: 'meters' },
      { item: 'Insulator Caps', qty: 100, unit: 'pcs' },
      { item: 'LED Streetlight Bulb', qty: 15, unit: 'pcs' }
    ],
    activeJobs: 0,
    reputation: 97,
    hourlyRate: 1100
  },
  {
    id: 'contractor_4',
    name: 'Rapid Masonry & Debris',
    specialties: ['pothole', 'debris', 'drainage'],
    rating: 4.2,
    completedJobs: 56,
    location: DEMO_COORDINATES.offset(-0.002, -0.005),
    materialsStock: [
      { item: 'River Sand', qty: 40, unit: 'bags' },
      { item: 'Portland Cement', qty: 30, unit: 'bags' },
      { item: 'Shovel & Pickaxe Set', qty: 5, unit: 'sets' }
    ],
    activeJobs: 0,
    reputation: 74,
    hourlyRate: 600
  },
  {
    id: 'contractor_5',
    name: 'Siddharth Electricals & Signs',
    specialties: ['wiring', 'road_sign'],
    rating: 4.5,
    completedJobs: 89,
    location: DEMO_COORDINATES.offset(0.001, 0.006),
    materialsStock: [
      { item: 'Standard Copper Conduits', qty: 120, unit: 'meters' },
      { item: 'Junction boxes', qty: 20, unit: 'pcs' }
    ],
    activeJobs: 0,
    reputation: 82,
    hourlyRate: 900
  },
  {
    id: 'contractor_6',
    name: 'Bengaluru Waste Solutions',
    specialties: ['garbage', 'debris'],
    rating: 4.7,
    completedJobs: 167,
    location: DEMO_COORDINATES.offset(-0.007, -0.002),
    materialsStock: [
      { item: 'Industrial Trash Liners', qty: 1000, unit: 'bags' },
      { item: 'Dumper Rental Days', qty: 5, unit: 'days' }
    ],
    activeJobs: 0,
    reputation: 89,
    hourlyRate: 700
  },
  {
    id: 'contractor_7',
    name: 'Kaveri Water Infra',
    specialties: ['water_leak', 'drainage'],
    rating: 4.4,
    completedJobs: 112,
    location: DEMO_COORDINATES.offset(-0.003, 0.008),
    materialsStock: [
      { item: 'Rubber Gaskets', qty: 50, unit: 'pcs' },
      { item: 'Heavy Water Pump', qty: 2, unit: 'units' }
    ],
    activeJobs: 0,
    reputation: 80,
    hourlyRate: 800
  },
  {
    id: 'contractor_8',
    name: 'Namma Road Construction',
    specialties: ['pothole', 'debris'],
    rating: 4.3,
    completedJobs: 78,
    location: DEMO_COORDINATES.offset(0.006, -0.005),
    materialsStock: [
      { item: 'Cold Asphalt Mix', qty: 50, unit: 'bags' },
      { item: 'Vibratory Plate Compactor', qty: 1, unit: 'unit' }
    ],
    activeJobs: 0,
    reputation: 78,
    hourlyRate: 650
  }
];

const sampleResponders = [
  {
    id: 'resp_1',
    name: 'Inspector Suresh Kumar',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(0.001, -0.002),
    status: 'available'
  },
  {
    id: 'resp_2',
    name: 'Inspector Ananya Rao',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(-0.004, 0.003),
    status: 'available'
  },
  {
    id: 'resp_3',
    name: 'East Ward Cleanup Crew 4',
    role: 'crew',
    location: DEMO_COORDINATES.offset(0.008, -0.001),
    status: 'busy'
  },
  {
    id: 'resp_4',
    name: 'BuildMart Supply Depot',
    role: 'vendor',
    location: DEMO_COORDINATES.offset(-0.009, -0.009),
    status: 'available'
  },
  {
    id: 'resp_5',
    name: 'Inspector Ravi Shankar',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(0.003, -0.003),
    status: 'available'
  },
  {
    id: 'resp_6',
    name: 'Inspector Meera Nair',
    role: 'inspector',
    location: DEMO_COORDINATES.offset(-0.002, 0.005),
    status: 'available'
  },
  {
    id: 'resp_7',
    name: 'Central Ward Crew 2',
    role: 'crew',
    location: DEMO_COORDINATES.offset(-0.001, -0.006),
    status: 'available'
  },
  {
    id: 'resp_8',
    name: 'Kamat Material Supplies',
    role: 'vendor',
    location: DEMO_COORDINATES.offset(0.005, 0.005),
    status: 'available'
  }
];

const sampleIssues = [
  {
    id: 'issue_1',
    category: 'pothole',
    severity: 'medium',
    status: 'reported',
    description: 'Deep pothole in the middle of the road near Sector 4 corner, posing risk to motorbikes.',
    photoUrl: 'https://images.unsplash.com/photo-1605514449459-92aebf7f2ba9?auto=format&fit=crop&w=600&q=80',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 28,
    costOfInaction: 450, // Rs per day
    slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // 48h from now
    reporterReputation: 45,
    ward: 'Ward 4 - Green Park',
    bids: [],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { timestamp: new Date().toISOString(), status: 'reported', actor: 'Citizen_Vibe', message: 'Reported pothole via Snap-to-Solve' }
    ],
    timestamp: new Date().toISOString()
  },
  {
    id: 'issue_2',
    category: 'wiring',
    severity: 'RedAlert',
    status: 'triaged',
    description: 'Downed power wire sparked on the sidewalk. Dangerous for pedestrians.',
    photoUrl: 'https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&w=600&q=80',
    location: DEMO_COORDINATES.offset(0.004, 0.002),
    citizensAffected: 142,
    costOfInaction: 8500, // Rs per day
    slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4h SLA for emergency RedAlert
    reporterReputation: 89,
    ward: 'Ward 12 - Aero City',
    bids: [],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { timestamp: new Date().toISOString(), status: 'reported', actor: 'Citizen_Anil', message: 'Submitted photo of live wire' },
      { timestamp: new Date().toISOString(), status: 'triaged', actor: 'GeminiAgent', message: 'Classified severity as RedAlert and alerted Emergency Services' }
    ],
    timestamp: new Date().toISOString()
  },
  {
    id: 'issue_3',
    category: 'water_leak',
    severity: 'high',
    status: 'bidding',
    description: 'Underground main water pipe burst. Millions of liters of potable water flooding the street.',
    photoUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
    location: DEMO_COORDINATES.offset(-0.005, 0.001),
    citizensAffected: 320,
    costOfInaction: 3200,
    slaDeadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    reporterReputation: 120,
    ward: 'Ward 4 - Green Park',
    bids: [
      { contractorId: 'contractor_2', price: 9500, eta: 45, rating: 4.6, status: 'pending' },
      { contractorId: 'contractor_4', price: 11000, eta: 30, rating: 4.2, status: 'pending' }
    ],
    assignedContractorId: null,
    inspectorId: null,
    proofOfFixUrl: null,
    ledgerTrail: [
      { timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), status: 'reported', actor: 'Citizen_Sita', message: 'Reported water gushing from street' },
      { timestamp: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(), status: 'triaged', actor: 'GeminiAgent', message: 'Triage complete. Deduplicated 3 identical reports.' },
      { timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(), status: 'bidding', actor: 'GeminiAgent', message: 'BOM Inferred: PVC pipe, 2 couplers, concrete. Triggered reverse-auction.' }
    ],
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_4',
    category: 'garbage',
    severity: 'low',
    status: 'verified',
    description: 'Commercial debris piled up outside community gates.',
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    location: DEMO_COORDINATES.offset(-0.003, -0.003),
    citizensAffected: 15,
    costOfInaction: 150,
    slaDeadline: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Overdue
    reporterReputation: 30,
    ward: 'Ward 8 - Malleswaram',
    bids: [
      { contractorId: 'contractor_1', price: 4200, eta: 120, rating: 4.8, status: 'accepted' }
    ],
    assignedContractorId: 'contractor_1',
    inspectorId: 'resp_1',
    proofOfFixUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    ledgerTrail: [
      { timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), status: 'reported', actor: 'Citizen_Dev', message: 'Reported heap of concrete blocks' },
      { timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), status: 'assigned', actor: 'GeminiAgent', message: 'Assigned Apex Roadways Ltd. Escrow locked.' },
      { timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), status: 'fixed', actor: 'contractor_1', message: 'Submitted photo proof of clean site' },
      { timestamp: new Date(Date.now() - 19 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Triple-lock proof passed. AI comparison verified. Released ₹4,200 from escrow.' }
    ],
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_history_1',
    category: 'pothole',
    severity: 'medium',
    status: 'verified',
    description: 'Pothole patch repair at Sector 4.',
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 12,
    costOfInaction: 450,
    slaDeadline: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    reporterReputation: 35,
    ward: 'Ward 4 - Green Park',
    bids: [{ contractorId: 'contractor_1', price: 3500, eta: 45, rating: 4.8, status: 'accepted' }],
    assignedContractorId: 'contractor_1',
    inspectorId: 'resp_1',
    proofOfFixUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    ledgerTrail: [{ timestamp: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Released ₹3,500' }],
    timestamp: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_history_2',
    category: 'pothole',
    severity: 'medium',
    status: 'verified',
    description: 'Emergency patch filling near sector 4 bend.',
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 18,
    costOfInaction: 450,
    slaDeadline: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    reporterReputation: 40,
    ward: 'Ward 4 - Green Park',
    bids: [{ contractorId: 'contractor_4', price: 3200, eta: 30, rating: 4.2, status: 'accepted' }],
    assignedContractorId: 'contractor_4',
    inspectorId: 'resp_2',
    proofOfFixUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    ledgerTrail: [{ timestamp: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Released ₹3,200' }],
    timestamp: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'issue_history_3',
    category: 'pothole',
    severity: 'low',
    status: 'verified',
    description: 'Minor fissure filling near Sector 4 corner.',
    photoUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    location: DEMO_COORDINATES.offset(0.002, -0.004),
    citizensAffected: 8,
    costOfInaction: 250,
    slaDeadline: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    reporterReputation: 25,
    ward: 'Ward 4 - Green Park',
    bids: [{ contractorId: 'contractor_8', price: 2900, eta: 50, rating: 4.3, status: 'accepted' }],
    assignedContractorId: 'contractor_8',
    inspectorId: 'resp_1',
    proofOfFixUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    ledgerTrail: [{ timestamp: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(), status: 'verified', actor: 'GeminiAgent', message: 'Released ₹2,900' }],
    timestamp: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString()
  }
];

export const seedDatabase = async () => {
  console.log('Seeding Database with Demo City (Bengaluru)...');
  
  if (db.getDbType() === 'mock') {
    db.resetMockDb({
      issues: sampleIssues,
      contractors: sampleContractors,
      responders: sampleResponders
    });
    console.log('Mock database seeded successfully.');
  } else {
    // Write individually to Firestore
    try {
      for (const item of sampleContractors) {
        await db.addDoc('contractors', item);
      }
      for (const item of sampleResponders) {
        await db.addDoc('responders', item);
      }
      for (const item of sampleIssues) {
        await db.addDoc('issues', item);
      }
      console.log('Firestore Database seeded successfully.');
    } catch (err) {
      console.error('Error seeding Firestore database:', err);
    }
  }
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
