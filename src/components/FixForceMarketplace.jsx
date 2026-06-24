import React, { useState } from 'react';
import { 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  Award, 
  Hammer, 
  Image, 
  CheckCircle, 
  RefreshCcw, 
  UserPlus, 
  HardHat, 
  FileText, 
  Send, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  MapPin 
} from 'lucide-react';

export default function FixForceMarketplace({ 
  issue, 
  contractors, 
  onTriggerFix, 
  loading, 
  onRegisterContractor, 
  onReportFailure, 
  onDonate 
}) {
  const [activeSubTab, setActiveSubTab] = useState('dispatch'); // 'dispatch' | 'register'
  const [proofUrl, setProofUrl] = useState('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80');
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('pothole');
  const [regRate, setRegRate] = useState('700');
  const [regLatOffset, setRegLatOffset] = useState('0.003');
  const [regLngOffset, setRegLngOffset] = useState('-0.004');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Inspector Override State
  const [overrideInspector, setOverrideInspector] = useState('resp_1');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName) return alert('Please enter contractor name');
    
    const lat = 12.971598 + Number(regLatOffset);
    const lng = 77.594562 + Number(regLngOffset);
    
    const contractorData = {
      name: regName,
      specialties: [regSpecialty],
      hourlyRate: Number(regRate),
      location: { lat, lng, address: `Indiranagar Sector ${Math.floor(Math.random() * 10 + 1)}` }
    };
    
    if (onRegisterContractor) {
      await onRegisterContractor(contractorData);
      setRegistrationSuccess(true);
      setRegName('');
      setTimeout(() => setRegistrationSuccess(false), 4000);
    }
  };

  const getBOM = (category) => {
    switch (category) {
      case 'pothole':
        return {
          items: [
            { name: 'Bituminous Cold Mix', qty: '5 bags', cost: 1750 },
            { name: 'Asphalt Sealant Emulsion', qty: '10 liters', cost: 1200 },
            { name: 'Road Warning cones & markers', qty: '2 units', cost: 550 }
          ],
          total: 3500
        };
      case 'water_leak':
        return {
          items: [
            { name: 'PVC Mainline Pipe 3"', qty: '1 length (6m)', cost: 4200 },
            { name: 'Iron Flanged Couplers', qty: '2 units', cost: 2800 },
            { name: 'Quick-Dry Concrete Mix', qty: '3 bags', cost: 2500 }
          ],
          total: 9500
        };
      case 'wiring':
        return {
          items: [
            { name: 'Standard Copper Wiring 10mm', qty: '50 meters', cost: 3800 },
            { name: 'Weatherproof Junction Boxes', qty: '1 unit', cost: 1500 },
            { name: 'Pole Insulator Caps', qty: '4 units', cost: 1200 }
          ],
          total: 6500
        };
      default:
        return {
          items: [
            { name: 'Commercial Grade Debris Sacks', qty: '15 sacks', cost: 1000 },
            { name: 'Municipal Crew Dispatch Gear', qty: '1 set', cost: 900 },
            { name: 'Heavy sweep broom & shovel set', qty: '2 units', cost: 600 }
          ],
          total: 2500
        };
    }
  };

  const handleInspectorOverride = () => {
    alert(`Auto-dispatch overrode inspector configuration! Swapped to assigned duty for Inspector ID: ${overrideInspector} on Google Calendar.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Sub-tab Navigation */}
      <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('dispatch')}
          style={{
            flex: 1,
            padding: '0.6rem',
            background: activeSubTab === 'dispatch' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: activeSubTab === 'dispatch' ? '1px solid rgba(110, 68, 255, 0.2)' : '1px solid transparent',
            color: activeSubTab === 'dispatch' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Hammer size={16} />
          Active Dispatch Control
        </button>
        <button
          onClick={() => setActiveSubTab('register')}
          style={{
            flex: 1,
            padding: '0.6rem',
            background: activeSubTab === 'register' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: activeSubTab === 'register' ? '1px solid rgba(110, 68, 255, 0.2)' : '1px solid transparent',
            color: activeSubTab === 'register' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <UserPlus size={16} />
          Register Contractor
        </button>
      </div>

      {/* RENDER REGISTRATION TAB */}
      {activeSubTab === 'register' && (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardHat size={20} color="hsl(var(--secondary))" />
              Contractor Registration Portal
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
              Self-register private contracting firms. Once validated, they participate in reverse-auction dispatches.
            </p>
          </div>

          {registrationSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              color: 'hsl(var(--status-success))',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={16} />
              Contractor profile initialized successfully! Pin mapped on Responder Radar.
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Firm / Contractor Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Kaveri Drainage Systems Ltd"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Specialty Domain</label>
                <select
                  value={regSpecialty}
                  onChange={(e) => setRegSpecialty(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="pothole">Potholes / Roadways</option>
                  <option value="water_leak">Water Pipelines</option>
                  <option value="wiring">Electrical Utility</option>
                  <option value="garbage">Garbage Cleanups</option>
                  <option value="drainage">Sewerage & Drainage</option>
                  <option value="debris">Masonry / Debris</option>
                  <option value="road_sign">Streetlights / Signage</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hourly Labor Rate (₹)</label>
                <input
                  type="number"
                  value={regRate}
                  onChange={(e) => setRegRate(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Latitude Offset (from Center)</label>
                <input
                  type="text"
                  value={regLatOffset}
                  onChange={(e) => setRegLatOffset(e.target.value)}
                  placeholder="e.g. 0.003"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Longitude Offset (from Center)</label>
                <input
                  type="text"
                  value={regLngOffset}
                  onChange={(e) => setRegLngOffset(e.target.value)}
                  placeholder="e.g. -0.004"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="glow-btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '40px', marginTop: '0.5rem' }}
            >
              <Send size={14} />
              Register Contractor
            </button>
          </form>
        </div>
      )}

      {/* RENDER DISPATCH TAB */}
      {activeSubTab === 'dispatch' && (
        <>
          {!issue ? (
            <div className="glass-panel animate-fade-in-up" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              <Hammer size={48} style={{ color: 'hsl(var(--primary))', margin: '0 auto 1rem' }} />
              <h3>FixForce Dispatch Console</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Select an active ticket from the GlassLedger dashboard to manage bidding, contractors, and escrow payouts.</p>
            </div>
          ) : (
            <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-mono)' }}>TICKET #{issue.id}</span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{issue.category.toUpperCase().replace('_', ' ')} DISPATCH DETAILS</h2>
                </div>
                <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>
                  Status: {issue.status.replace('_', ' ')}
                </span>
              </div>

              {/* 1. BIDDING STATE (Reverse Auction & Smart BOM) */}
              {issue.status === 'bidding' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Smart Bill of Materials (BOM) */}
                  <div style={{
                    background: 'rgba(110, 68, 255, 0.04)',
                    border: '1px solid rgba(110, 68, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={16} color="hsl(var(--primary))" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                        Agent-Inferred Bill-of-Materials (Smart BOM)
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {getBOM(issue.category).items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                          <span>[✓] {item.qty} × {item.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>₹{item.cost}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', marginTop: '0.5rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--secondary))' }}>
                        <span>Estimated Material Cost:</span>
                        <span>₹{getBOM(issue.category).total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    <strong>Reverse-Auction Active:</strong> Resolution Orchestrator invited bids from nearest matching contractors. Ranks dynamically on Price, Proximity, Rating, and Reputation.
                  </div>

                  <h3 style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Bids Submitted</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {issue.bids && issue.bids.length > 0 ? (
                      issue.bids.map((bid, idx) => {
                        const contractor = contractors.find(c => c.id === bid.contractorId);
                        return (
                          <div key={idx} style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff' }}>{contractor ? contractor.name : 'Unknown Contractor'}</div>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                                Rating: ⭐{bid.rating} · Reputation: {bid.reputation}%
                              </span>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>ETA</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{bid.eta} mins</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Quote</div>
                                <div style={{ fontWeight: 800, color: 'hsl(var(--secondary))', fontSize: '1rem' }}>₹{bid.price.toLocaleString('en-IN')}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                        Waiting for bids to be registered by the orchestrator...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. ASSIGNED / IN PROGRESS (Stripe Escrow + Auto Crew Assembly + Override) */}
              {(issue.status === 'assigned' || issue.status === 'in_progress') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Escrow Banner */}
                  {issue.bids?.find(b => b.status === 'accepted') && (
                    <div style={{
                      background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.06) 0%, rgba(15, 18, 28, 0.45) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <DollarSign size={20} color="hsl(var(--status-success))" style={{ background: 'rgba(16,185,129,0.1)', padding: '4px', borderRadius: '50%', width: '28px', height: '28px' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--status-success))' }}>Stripe Escrow Account Active</div>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                          ₹{issue.bids.find(b => b.status === 'accepted').price.toLocaleString('en-IN')} locked. Funds release upon verification.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Auto Crew Assembly Timeline */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--primary))' }}>
                      Auto-Assembled Crew & Resources
                    </span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                      {/* Step 1: Inspector */}
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(110,68,255,0.15)', border: '1px solid hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>1</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Duty Inspector Booking</div>
                          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                            {issue.inspectorId ? `Inspector ${issue.inspectorId === 'resp_1' ? 'Suresh Kumar' : 'Ravi Shankar'}` : 'Unassigned'} · Google Calendar Active
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--status-success))', fontWeight: 600 }}>SCHEDULED</span>
                      </div>

                      {/* Step 2: Contractor */}
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(110,68,255,0.15)', border: '1px solid hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>2</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Physical Repairs Contractor</div>
                          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                            {contractors.find(c => c.id === issue.assignedContractorId)?.name || 'Ward Municipal Crew'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--status-success))', fontWeight: 600 }}>LOCKED</span>
                      </div>

                      {/* Step 3: Material Vendor */}
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(110,68,255,0.15)', border: '1px solid hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>3</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Material Logistics Sourcing</div>
                          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>BuildMart Supply Depot · Materials Released</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--status-success))', fontWeight: 600 }}>DISPATCHED</span>
                      </div>
                    </div>

                    {/* Official Override Panel */}
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Override Assigned Inspector</label>
                        <select
                          value={overrideInspector}
                          onChange={(e) => setOverrideInspector(e.target.value)}
                          style={{
                            background: 'rgba(10, 11, 16, 0.8)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            outline: 'none'
                          }}
                        >
                          <option value="resp_1">Inspector Suresh Kumar</option>
                          <option value="resp_5">Inspector Ravi Shankar</option>
                          <option value="resp_6">Inspector Meera Nair</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleInspectorOverride}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '0.4rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Override Crew
                      </button>
                    </div>

                  </div>

                  {/* Upload Proof */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Image size={14} color="hsl(var(--secondary))" />
                      Contractor Proof-of-Fix Submission
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '1rem' }}>
                      Simulate contractor uploading visual proof of completion.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        type="text"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          outline: 'none',
                          fontSize: '0.8rem'
                        }}
                      />
                      <button
                        onClick={() => onTriggerFix(issue.id, proofUrl)}
                        disabled={loading}
                        className="glow-btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', height: '36px' }}
                      >
                        Submit Proof
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* 3. FIXED STATE (Comparing before/after + Triple-Lock details) */}
              {issue.status === 'fixed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    <strong>Pending Verification:</strong> Proof-of-Fix uploaded. Running multimodal AI comparison and SMS verification audits. Click <strong>"Trigger Agent Step"</strong> on the right panel to release escrow funds.
                  </div>

                  <h3 style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Triple-Lock Verification Visuals</h3>

                  {/* Side-by-side comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--status-danger))', fontWeight: 600 }}>BEFORE REPORT</span>
                      <img
                        src={issue.photoUrl}
                        alt="Before"
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--status-success))', fontWeight: 600 }}>AFTER PROOF</span>
                      <img
                        src={issue.proofOfFixUrl || proofUrl}
                        alt="After"
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                    </div>
                  </div>

                  {/* High Contrast Locks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <ShieldCheck size={16} color="hsl(var(--status-success))" />
                      <span><strong>Lock 1: AI Vision Scan</strong> — Gemini compared images. 94% similarity match. Pothole filled.</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <ShieldCheck size={16} color="hsl(var(--status-success))" />
                      <span><strong>Lock 2: Citizen Confirmation</strong> — SMS ping confirmation returned from nearby resident Anil (Rep: 89).</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <ShieldCheck size={16} color="hsl(var(--status-success))" />
                      <span><strong>Lock 3: Street View GPS Reference</strong> — Metadata coordinates match reported repair location.</span>
                    </div>
                  </div>

                  {/* Street View Mock Graphic */}
                  <div style={{
                    height: '80px',
                    background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80) center/center',
                    backgroundSize: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'hsl(var(--secondary))',
                    fontWeight: 700
                  }}>
                    [GOOGLE MAPS STREET VIEW GPS ALIGNED]
                  </div>

                </div>
              )}

              {/* 4. VERIFIED STATE (Escrow Released + Warranty Active + Reopen Trigger) */}
              {issue.status === 'verified' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Success released */}
                  <div style={{
                    background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 18, 28, 0.45) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <ShieldCheck size={36} color="hsl(var(--status-success))" />
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>Escrow Payout Released</h3>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                      Stripe transferred payment to {contractors.find(c => c.id === issue.assignedContractorId)?.name || 'assigned contractor'}.
                    </p>
                  </div>

                  {/* FixWarranty Active Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.06) 0%, rgba(15, 18, 28, 0.45) 100%)',
                    border: '1px solid rgba(0, 180, 216, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Nidaan FixWarranty Shield Active
                      </span>
                      <span className="badge badge-success" style={{ background: 'rgba(0, 180, 216, 0.15)', color: 'hsl(var(--secondary))', border: '1px solid rgba(0, 180, 216, 0.25)' }}>
                        365 Days Active
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                      If this repair fails or decays within the quality assurance window, citizens can report failure. The contractor rating will be penalized, and the ticket will auto-reopen.
                    </p>

                    <button
                      onClick={() => {
                        if (window.confirm('Report physical repair failure? This will reopen the issue and penalize contractor rating.')) {
                          onReportFailure(issue.id);
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: 'hsl(var(--status-danger))',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all var(--transition-fast)',
                        marginTop: '0.25rem'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'}
                    >
                      Report Warranty Failure (Trigger Triage Re-open)
                    </button>
                  </div>

                  {/* Performance impacts */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.75rem' }}>Contractor Performance Scorecard Impact</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Completed Jobs</span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--status-success))' }}>+1</div>
                      </div>
                      <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Reputation Rank</span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--status-success))' }}>+2%</div>
                      </div>
                      <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Warranty Status</span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--secondary))' }}>1 Yr Active</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* 5. ESCALATED STATE (RTI Instrument + Crowdfund Donations) */}
              {issue.status === 'escalated' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div style={{
                    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 18, 28, 0.45) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    fontSize: '0.85rem'
                  }}>
                    <strong style={{ color: 'hsl(var(--status-danger))' }}>SLA BREACHED / SYSTEM ESCALATED:</strong> 
                    {' '}Official resolution timeline exceeded. The orchestrator generated a formal legal grievance.
                  </div>

                  {/* Multi-path mitigation and donations */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(110, 68, 255, 0.05) 0%, rgba(15, 18, 28, 0.45) 100%)',
                    border: '1px solid rgba(110, 68, 255, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={16} color="hsl(var(--primary))" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                        Collective Pressure Multi-Path Mitigation
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                      When government departments stall, Nidaan activates citizen crowdfunding, NGO coordination, and CSR sponsorship avenues to resolve the issue directly.
                    </p>

                    {/* Crowdfund status */}
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                        <span>Micro-Crowdfund Raised</span>
                        <strong style={{ color: 'hsl(var(--secondary))' }}>
                          ₹{issue.crowdfundRaised || 0} / ₹5,000 Target
                        </strong>
                      </div>
                      
                      {/* Donation progress bar */}
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, ((issue.crowdfundRaised || 0) / 5000) * 100)}%`,
                          background: 'var(--gradient-secondary)',
                          borderRadius: '99px',
                          transition: 'width 0.4s ease'
                        }}></div>
                      </div>

                      <button
                        onClick={() => onDonate(issue.id, 500)}
                        className="glow-btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', fontSize: '0.75rem', height: '32px' }}
                      >
                        + Contribute ₹500
                      </button>
                    </div>

                    {/* Alternative delegation links */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        onClick={() => alert('Delegated complaint packet to East Bengaluru Citizens Forum NGO.')}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Delegate to NGO
                      </button>
                      <button
                        onClick={() => alert('Auto-requested HDFC CSR community budget grant sponsorship.')}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          padding: '0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Trigger Corporate CSR
                      </button>
                    </div>

                  </div>

                  <h3 style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Drafted Legal RTI Instrument</h3>
                  <div style={{
                    background: '#040508',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'hsl(var(--text-secondary))',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.4'
                  }}>
{`MEMORANDUM OF GRIEVANCE
TO: Public Works Department / Municipal Grievance Cell
SUBJECT: Unresolved Public Hazard - SLA Breach (Ticket #${issue.id})
WARD: ${issue.ward}

This constitutes a formal notification under Section 6 of the RTI Act regarding the unresolved civic issue: ${issue.category.toUpperCase().replace('_', ' ')} reported on ${new Date(issue.timestamp).toLocaleDateString()}.

Despite accumulating a community pressure rating of ${issue.citizensAffected} affected citizens, the department has failed to resolve the issue within the allotted timeline of ${issue.severity === 'RedAlert' ? '4 hours' : '48 hours'}.

Daily economic cost of inaction from this case is estimated at ₹${issue.costOfInaction}. Please register this as a formal complaint in the public audit ledger.`}
                  </div>
                </div>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
}
