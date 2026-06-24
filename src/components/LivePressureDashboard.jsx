import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Eye, 
  ThumbsUp, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  CloudRain, 
  Briefcase, 
  FileText 
} from 'lucide-react';

export default function LivePressureDashboard({ issues, onSelectIssue, onVoteIssue }) {
  const [tickerCost, setTickerCost] = useState(0);
  const [showBriefing, setShowBriefing] = useState(true);

  // Filter issues
  const activeIssues = issues.filter(i => i.status !== 'verified');
  const resolvedIssues = issues.filter(i => i.status === 'verified');

  // Compute stats
  const totalActive = activeIssues.length;
  const citizensAffected = activeIssues.reduce((acc, curr) => acc + (curr.citizensAffected || 1), 0);
  const dailyCost = activeIssues.reduce((acc, curr) => acc + (curr.costOfInaction || 0), 0);
  
  const totalSaved = resolvedIssues.reduce((acc, curr) => {
    const acceptedBid = curr.bids?.find(b => b.status === 'accepted');
    return acc + (acceptedBid ? acceptedBid.price : 0);
  }, 0);

  // Animate the daily cost ticker to feel alive!
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(dailyCost / 40) || 1;
    const timer = setInterval(() => {
      current += step;
      if (current >= dailyCost) {
        setTickerCost(dailyCost);
        clearInterval(timer);
      } else {
        setTickerCost(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [dailyCost]);

  // SLA Time Remaining Helper
  const getSLATimeRemaining = (deadlineStr) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;
    
    if (diffMs <= 0) {
      return { text: 'SLA BREACHED', urgent: true };
    }
    
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffMins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    
    if (diffHours < 4) {
      return { text: `${diffHours}h ${diffMins}m left`, urgent: true };
    }
    return { text: `${diffHours}h left`, urgent: false };
  };

  // Repeat offender calculator: checks if 3 or more issues exist at the exact same location (within 10 meters)
  const getRepeatOffenderCount = (lat, lng) => {
    const threshold = 0.0001; // ~10m latitude difference
    return issues.filter(i => {
      return Math.abs(i.location.lat - lat) < threshold && 
             Math.abs(i.location.lng - lng) < threshold;
    }).length;
  };

  // Mock department leaderboard data based on actual issues
  const departments = [
    { name: 'Water & Sewerage Board', active: issues.filter(i => i.category === 'water_leak' && i.status !== 'verified').length, resolved: issues.filter(i => i.category === 'water_leak' && i.status === 'verified').length },
    { name: 'Electricity Authority', active: issues.filter(i => i.category === 'wiring' && i.status !== 'verified').length, resolved: issues.filter(i => i.category === 'wiring' && i.status === 'verified').length },
    { name: 'Roads & Works Dept', active: issues.filter(i => (i.category === 'pothole' || i.category === 'road_sign') && i.status !== 'verified').length, resolved: issues.filter(i => (i.category === 'pothole' || i.category === 'road_sign') && i.status === 'verified').length },
    { name: 'Solid Waste Management', active: issues.filter(i => (i.category === 'garbage' || i.category === 'debris') && i.status !== 'verified').length, resolved: issues.filter(i => (i.category === 'garbage' || i.category === 'debris') && i.status === 'verified').length }
  ];

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ⛈️ Weather Preparedness Pre-dispatch Banner */}
      <div className="glass-panel" style={{
        padding: '1rem',
        background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.08) 0%, rgba(15, 18, 28, 0.45) 100%)',
        border: '1px solid rgba(0, 180, 216, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <CloudRain size={24} color="hsl(var(--secondary))" style={{ animation: 'pulse 2s infinite' }} />
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--secondary))' }}>
            ⛈️ Monsoon Weather Preparedness Active
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
            Heavy rainfall forecast in Bengaluru within 12h. Nidaan pre-dispatched <strong>1 Dewatering Pump</strong> and emergency crews to Ward 4 Underpass.
          </p>
        </div>
      </div>

      {/* Signature Metrics Row */}
      <div className="stats-grid">
        {/* Pulsing Daily Cost Card */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 18, 28, 0.45) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: '0 0 25px rgba(239, 68, 68, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'hsl(var(--status-danger))', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Daily Cost of Inaction
            </span>
            <span className="pulsing-indicator" style={{ backgroundColor: 'hsl(var(--status-danger))' }}></span>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span className="pressure-counter-val" style={{ color: 'hsl(var(--status-danger))', WebkitTextFillColor: 'unset' }}>
              ₹{tickerCost.toLocaleString('en-IN')}
            </span>
            <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>/day</span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'hsl(var(--text-secondary))' }}>
            Economic loss from active street damage, leaking main lines & delayed fixes.
          </p>
        </div>

        {/* Affected Citizens Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', fontWeight: 600 }}>
            Citizens Under Pressure
          </span>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="pressure-counter-val">{citizensAffected.toLocaleString()}</span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Aggregated residents directly affected by open reports.
          </p>
        </div>

        {/* Active Issues Count Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', fontWeight: 600 }}>
            Active Tickets
          </span>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="pressure-counter-val">{totalActive}</span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Open municipal issues currently routed to the agent.
          </p>
        </div>

        {/* Total Funds Managed */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 18, 28, 0.45) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <span style={{ color: 'hsl(var(--status-success))', fontSize: '0.85rem', fontWeight: 700 }}>
            Escrow Payouts Cleared
          </span>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="pressure-counter-val" style={{ color: 'hsl(var(--status-success))', WebkitTextFillColor: 'unset' }}>
              ₹{totalSaved.toLocaleString('en-IN')}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'hsl(var(--text-secondary))' }}>
            Funds securely paid out to contractors upon triple-lock proof verification.
          </p>
        </div>
      </div>

      {/* Main Grid: Active Issues vs. Department Rankings */}
      <div className="dashboard-grid">
        
        {/* Left Side: Active Issues List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Live Public Grievances</h2>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
              Showing {activeIssues.length} active cases
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeIssues.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <CheckCircle2 size={48} style={{ color: 'hsl(var(--status-success))', margin: '0 auto 1rem' }} />
                <p>No active issues. The grid is clean!</p>
              </div>
            ) : (
              activeIssues.map(issue => {
                const sla = getSLATimeRemaining(issue.slaDeadline);
                const isRed = issue.severity === 'RedAlert';
                
                const repeatCount = getRepeatOffenderCount(issue.location.lat, issue.location.lng);
                const isRepeatOffender = repeatCount >= 3;
                
                return (
                  <div
                    key={issue.id}
                    className={`glass-panel ${isRed ? 'red-alert-card' : ''}`}
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1.25rem',
                      alignItems: 'flex-start',
                      transition: 'transform var(--transition-fast)'
                    }}
                  >
                    {/* Category Icon and Image */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={issue.photoUrl}
                        alt={issue.category}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}
                      />
                      <span className={`badge ${isRed ? 'badge-danger' : issue.severity === 'high' ? 'badge-warning' : 'badge-info'}`} style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                        fontSize: '0.6rem',
                        padding: '0.1rem 0.4rem'
                      }}>
                        {issue.severity}
                      </span>
                    </div>

                    {/* Middle Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'hsl(var(--text-muted))' }}>
                          ID: {issue.id} · {issue.ward}
                        </span>
                        
                        {/* SLA indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: sla.urgent ? 'hsl(var(--status-danger))' : 'hsl(var(--text-secondary))', fontWeight: 600 }}>
                          <Clock size={12} />
                          <span>{sla.text}</span>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                        {issue.category.replace('_', ' ').toUpperCase()}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {issue.description}
                      </p>

                      {/* ⚠️ Repeat-Offender Warning Banner */}
                      {isRepeatOffender && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.5rem 0.75rem',
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'hsl(var(--status-danger))',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          <div>
                            <strong>⚠️ Repeat-Offender Coordinate:</strong> Patched {repeatCount} times in 6 months at this spot.
                          </div>
                          <div style={{ color: 'hsl(var(--text-secondary))' }}>
                            Repeated patchwork costs ₹10,500. Suggested permanent resolution: <strong>Bituminous Asphalt Resurfacing</strong> (Est: ₹18,000). Stops repetitive waste.
                          </div>
                        </div>
                      )}

                      {/* Bottom row: status and support */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        {/* Status Badge */}
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.5rem',
                          color: issue.status === 'reported' ? 'hsl(var(--text-secondary))' :
                                 issue.status === 'triaged' ? 'hsl(var(--status-info))' :
                                 issue.status === 'bidding' ? 'hsl(var(--status-warning))' :
                                 issue.status === 'verified' ? 'hsl(var(--status-success))' :
                                 'hsl(var(--status-warning))',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          STATUS: {issue.status.replace('_', ' ')}
                        </span>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          {/* Citizens support count */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'hsl(var(--text-secondary))' }}>
                            <ThumbsUp size={14} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{issue.citizensAffected || 1} support</span>
                          </div>

                          <button
                            onClick={() => onVoteIssue(issue.id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'hsl(var(--text-primary))',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all var(--transition-fast)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            Upvote
                          </button>

                          <button
                            onClick={() => onSelectIssue(issue)}
                            className="glow-btn-secondary"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              height: 'auto'
                            }}
                          >
                            <Eye size={12} />
                            Track
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Briefing & Accountable Scorecards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 📋 Official's Daily Triage Briefing */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="hsl(var(--primary))" />
                Official's Daily Briefing
              </h2>
              <button 
                onClick={() => setShowBriefing(!showBriefing)}
                style={{ background: 'transparent', border: 'none', color: 'hsl(var(--primary))', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {showBriefing ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showBriefing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>🚨</span>
                  <span>
                    <strong>1 RedAlert</strong> emergency wire hazard currently pending. Instant crew assembly requested.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>⚠️</span>
                  <span>
                    <strong>Repeat-Offender</strong> spot active in Ward 4. Resurfacing recommended to prevent waste.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>📈</span>
                  <span>
                    Escrow releases saved <strong>₹{totalSaved.toLocaleString('en-IN')}</strong> in municipal loss this cycle.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Department Rankings */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} color="hsl(var(--primary))" />
              Responsiveness Scorecard
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {departments.map((dept, index) => {
                const total = dept.active + dept.resolved;
                const score = total > 0 ? Math.round((dept.resolved / total) * 100) : 100;
                
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>{dept.name}</span>
                      <span style={{ fontWeight: 700, color: score > 75 ? 'hsl(var(--status-success))' : score > 40 ? 'hsl(var(--status-warning))' : 'hsl(var(--status-danger))' }}>
                        {score}% Clear
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${score}%`,
                        background: score > 75 ? 'hsl(var(--status-success))' : score > 40 ? 'hsl(var(--status-warning))' : 'hsl(var(--status-danger))',
                        borderRadius: '99px'
                      }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                      <span>{dept.active} active</span>
                      <span>{dept.resolved} resolved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wards Leaderboard */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="hsl(var(--secondary))" />
              Grievance Load by Ward
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Ward 4 - Green Park', load: activeIssues.filter(i => i.ward === 'Ward 4 - Green Park').length, cost: activeIssues.filter(i => i.ward === 'Ward 4 - Green Park').reduce((acc, c) => acc + c.costOfInaction, 0) },
                { name: 'Ward 12 - Aero City', load: activeIssues.filter(i => i.ward === 'Ward 12 - Aero City').length, cost: activeIssues.filter(i => i.ward === 'Ward 12 - Aero City').reduce((acc, c) => acc + c.costOfInaction, 0) },
                { name: 'Ward 8 - Malleswaram', load: activeIssues.filter(i => i.ward === 'Ward 8 - Malleswaram').length, cost: activeIssues.filter(i => i.ward === 'Ward 8 - Malleswaram').reduce((acc, c) => acc + c.costOfInaction, 0) },
              ].sort((a,b) => b.cost - a.cost).map((ward, idx) => (
                <div key={idx} style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ward.name}</div>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{ward.load} tickets pending</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--status-danger))' }}>₹{ward.cost}/day</div>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>Loss rate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
