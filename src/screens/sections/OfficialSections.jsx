import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, IndianRupee, CheckCircle2, ListChecks, Activity, MousePointerClick, MapPin, ShieldCheck } from 'lucide-react';
import { useAppData } from '../../app/AppDataContext.jsx';
import { useRole } from '../../app/RoleContext.jsx';
import LoopPipeline from '../../components/LoopPipeline.jsx';
import AgentActivityPanel from '../../components/AgentActivityPanel.jsx';
import LedgerTimeline from '../../components/LedgerTimeline.jsx';
import ResponderRadar from '../../components/ResponderRadar.jsx';
import FixForceMarketplace from '../../components/FixForceMarketplace.jsx';
import LivePressureDashboard from '../../components/LivePressureDashboard.jsx';
import IntelligencePanel from '../../components/IntelligencePanel.jsx';
import PublicScorecard from '../../components/PublicScorecard.jsx';

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* 1 — Command Overview (detailed list of active issues with progress and individual risks) */
export function OfficialOverview() {
  const { issues, setSelectedIssue } = useAppData();
  const { navigate } = useRole();
  const [filter, setFilter] = useState('report');

  const openIssues = issues.filter(i => i.status !== 'verified');
  const dailyRisk = openIssues.reduce((a, c) => a + (c.costOfInaction || 0), 0);
  const verificationIssues = issues.filter(i => i.status === 'fixed');
  
  const animatedRisk = useCountUp(dailyRisk);

  const filteredIssues = filter === 'report' ? issues : verificationIssues;

  const handleAction = (issue) => {
    setSelectedIssue(issue);
    if (issue.status === 'fixed') {
      navigate('official', 'dispatch');
    } else if (issue.status === 'verified') {
      navigate('official', 'ledger');
    } else {
      navigate('official', 'agent');
    }
  };

  const STAGES = [
    { id: 'reported', label: 'Report' },
    { id: 'triaged', label: 'Triage' },
    { id: 'bidding', label: 'Bid' },
    { id: 'assigned', label: 'Assign' },
    { id: 'in_progress', label: 'Repair' },
    { id: 'fixed', label: 'Verify' },
    { id: 'verified', label: 'Payout' }
  ];

  const getStageIndex = (status) => {
    if (status === 'escalated') return 1;
    const idx = STAGES.findIndex(s => s.id === status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* Total reports */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '3px solid var(--teal)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--teal-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ListChecks size={20} color="var(--teal)" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink-strong)', fontFamily: 'var(--font-mono)' }}>{issues.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Total Reports</div>
          </div>
        </div>

        {/* Verification count */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '3px solid var(--alert)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--alert-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} color="var(--alert)" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink-strong)', fontFamily: 'var(--font-mono)' }}>{verificationIssues.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>In Verification</div>
          </div>
        </div>

        {/* Cumulative Daily Loss */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '3px solid var(--pressure)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--critical-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IndianRupee size={20} color="var(--pressure)" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--pressure)', fontFamily: 'var(--font-mono)' }}>₹{animatedRisk.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Active Loss / Day</div>
          </div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cream-300)', paddingBottom: '0.5rem' }}>
        <div className="glass-panel" style={{ padding: '0.3rem', display: 'flex', gap: '0.3rem' }}>
          {[
            { id: 'report', label: `Reports (${issues.length})` },
            { id: 'verify', label: `Verify (${verificationIssues.length})` }
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '0.5rem 1.1rem',
                  background: active ? 'var(--teal-tint)' : 'transparent',
                  border: active ? '1px solid rgba(26,169,160,.3)' : '1px solid transparent',
                  color: active ? 'var(--teal-600)' : 'var(--ink-muted)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-ctl)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Showing {filteredIssues.length} tickets</span>
      </div>

      {/* Incident List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredIssues.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
            No tickets match this filter right now.
          </div>
        ) : (
          filteredIssues.map(issue => {
            const currentIdx = getStageIndex(issue.status);
            const isVerified = issue.status === 'verified';
            const isRedAlert = issue.severity === 'RedAlert';
            
            let accentColor = 'var(--teal)';
            if (isVerified) accentColor = 'var(--grass)';
            else if (isRedAlert) accentColor = 'var(--critical)';
            else if (issue.severity === 'high') accentColor = 'var(--alert)';

            return (
              <div 
                key={issue.id} 
                className="glass-panel animate-fade-in-up" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  gap: '1.25rem', 
                  alignItems: 'center',
                  borderLeft: `4px solid ${accentColor}`,
                  transition: 'transform var(--transition-fast)',
                }}
              >
                {/* Photo Thumbnail */}
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-ctl)', overflow: 'hidden', border: '1px solid var(--cream-300)', flexShrink: 0 }}>
                  <img src={issue.photoUrl} alt={issue.category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, left: 0, right: 0, 
                    background: 'rgba(0,0,0,0.6)', 
                    color: '#fff', 
                    fontSize: '0.55rem', 
                    textAlign: 'center',
                    padding: '0.15rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {issue.category.replace('_', ' ')}
                  </div>
                </div>

                {/* Details Content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>TICKET #{issue.id}</span>
                    <span className={`badge ${isVerified ? 'badge-success' : isRedAlert ? 'badge-danger' : issue.severity === 'high' ? 'badge-warning' : 'badge-info'}`} style={{ textTransform: 'capitalize', fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, textTransform: 'capitalize', color: 'var(--ink-strong)' }}>
                    {issue.title || issue.category.replace('_', ' ')}
                  </h3>

                  <div style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={12} /> {issue.ward}
                  </div>

                  {/* 7-stage Progress Loop Visualizer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', overflowX: 'auto', padding: '0.2rem 0', maxWidth: '100%' }}>
                    {STAGES.map((stage, sIdx) => {
                      const passed = sIdx <= currentIdx;
                      const active = sIdx === currentIdx;
                      
                      let stepBorderColor = 'var(--cream-400)';
                      let stepBg = 'var(--cream-100)';
                      if (passed) {
                        stepBorderColor = accentColor;
                        stepBg = active ? accentColor : 'var(--teal-tint)';
                      }

                      return (
                        <React.Fragment key={stage.id}>
                          {sIdx > 0 && (
                            <div style={{
                              flex: '1 0 10px', height: '2px', minWidth: '10px',
                              background: passed ? accentColor : 'var(--cream-300)'
                            }} />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                            <div style={{
                              width: '12px', height: '12px', borderRadius: '50%',
                              background: stepBg,
                              border: `1px solid ${stepBorderColor}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {passed && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: active ? '#fff' : accentColor }} />}
                            </div>
                            <span style={{ fontSize: '0.55rem', fontWeight: active ? 700 : 500, color: active ? accentColor : 'var(--ink-muted)', whiteSpace: 'nowrap' }}>{stage.label}</span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Loss & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '160px', flexShrink: 0 }}>
                  
                  {/* Daily Cost of Inaction / Loss Stopped Badge */}
                  {isVerified ? (
                    <div style={{ 
                      width: '100%',
                      textAlign: 'right',
                      background: 'var(--grass-tint)', 
                      border: '1px solid rgba(91,170,71,.2)', 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: 'var(--radius-ctl)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--grass-600)', fontWeight: 700 }}>Loss Stopped</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--grass-600)', fontFamily: 'var(--font-mono)' }}>
                        ₹{(issue.costOfInaction || 0).toLocaleString('en-IN')}/day
                      </span>
                    </div>
                  ) : (
                    <div style={{ 
                      width: '100%',
                      textAlign: 'right',
                      background: isRedAlert ? 'var(--critical-tint)' : 'var(--alert-tint)', 
                      border: `1px solid ${isRedAlert ? 'rgba(215,64,47,.2)' : 'rgba(224,138,30,.15)'}`, 
                      padding: '0.4rem 0.75rem', 
                      borderRadius: 'var(--radius-ctl)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: isRedAlert ? 'var(--critical)' : 'var(--alert)', fontWeight: 700 }}>Daily Inaction Loss</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isRedAlert ? 'var(--critical)' : 'var(--alert)', fontFamily: 'var(--font-mono)' }}>
                        ₹{(issue.costOfInaction || 0).toLocaleString('en-IN')}/day
                      </span>
                    </div>
                  )}

                  {/* Contextual Action Button */}
                  <button 
                    onClick={() => handleAction(issue)}
                    className="glow-btn-primary" 
                    style={{ 
                      fontSize: '0.74rem', 
                      padding: '0.4rem 0.9rem',
                      width: '100%',
                      justifyContent: 'center',
                      background: isVerified ? 'var(--ink)' : 'var(--teal)',
                    }}
                  >
                    {issue.status === 'fixed' 
                      ? 'Verify & Release Payout' 
                      : isVerified 
                        ? 'View Ledger Record' 
                        : 'Orchestrate Resolution'
                    }
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* 2 — Agent Activity (the star: streaming orchestrator + Approve / Override) */
export function OfficialAgent() {
  const { selectedIssue, heroIssue, setSelectedIssue, handleTriggerAgent, handleRunAgent, handleReleaseEscrow, agentLoading } = useAppData();
  const tracked = selectedIssue || heroIssue;

  if (!tracked) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Activity size={40} style={{ color: 'var(--teal)', margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.05rem' }}>No case selected</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>Pick an issue from Pressure & Escalation to trace its orchestration.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 360px)', gap: '1.5rem', alignItems: 'start' }} className="agent-grid">
      <div data-tour-id="tour-agent-feed">
        <AgentActivityPanel
          issue={tracked}
          onTriggerAgent={handleTriggerAgent}
          onRunAgent={handleRunAgent}
          onReleaseEscrow={handleReleaseEscrow}
          loading={agentLoading}
        />
      </div>
      <LedgerTimeline issue={tracked} />
    </div>
  );
}

/* 3 — FixForce Dispatch (radar + reverse-auction + proof-gated escrow) */
export function OfficialDispatch() {
  const {
    issues, contractors, responders, selectedIssue, heroIssue, setSelectedIssue, agentLoading,
    handleTriggerFix, handleRegisterContractor, handleReportFailure, handleDonate, handleReleaseEscrow, handleWorkspace,
  } = useAppData();
  const tracked = selectedIssue || heroIssue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <ResponderRadar issues={issues} contractors={contractors} responders={responders} onSelectIssue={setSelectedIssue} />
      <div data-tour-id="tour-auction">
        <FixForceMarketplace
          issue={tracked}
          contractors={contractors}
          onTriggerFix={handleTriggerFix}
          loading={agentLoading}
          onRegisterContractor={handleRegisterContractor}
          onReportFailure={handleReportFailure}
          onDonate={handleDonate}
          onReleaseEscrow={handleReleaseEscrow}
          onWorkspace={handleWorkspace}
          hideRegistrationTab={true}
          isOfficial={true}
          issues={issues}
        />
      </div>
    </div>
  );
}

/* 4 — Pressure & Escalation (ranked by ₹/day, SLA timers, auto-escalation) */
export function OfficialPressure() {
  const { issues, users, setSelectedIssue, handleVoteIssue, handleSlaSweep, handlePreparedness } = useAppData();
  const { navigate } = useRole();

  const handleTrack = (issue) => {
    setSelectedIssue(issue);
    navigate('official', 'agent');
  };

  return (
    <LivePressureDashboard
      issues={issues}
      users={users}
      view="pressure"
      onSelectIssue={handleTrack}
      onVoteIssue={handleVoteIssue}
      onSlaSweep={handleSlaSweep}
      onPreparedness={handlePreparedness}
    />
  );
}

/* 5 — Prevention (Fix-It-Right: repeat-offender + root-cause intelligence) */
export function OfficialPrevention() {
  const { issues, users, setSelectedIssue, handleVoteIssue, handleSlaSweep, handlePreparedness } = useAppData();
  const { navigate } = useRole();

  const handleTrack = (issue) => {
    setSelectedIssue(issue);
    navigate('official', 'agent');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div data-tour-id="tour-repeat-offender">
        <LivePressureDashboard
          issues={issues}
          users={users}
          view="repeat"
          onSelectIssue={handleTrack}
          onVoteIssue={handleVoteIssue}
          onSlaSweep={handleSlaSweep}
          onPreparedness={handlePreparedness}
        />
      </div>
      <IntelligencePanel issues={issues} onSelectIssue={handleTrack} onPreparedness={handlePreparedness} />
    </div>
  );
}

/* 6 — GlassLedger (public scorecard) */
export function OfficialLedger() {
  const { issues, users } = useAppData();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} data-tour-id="tour-ledger">
      <PublicScorecard issues={issues} users={users} />
    </div>
  );
}
