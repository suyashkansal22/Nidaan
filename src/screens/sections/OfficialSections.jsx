import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, IndianRupee, CheckCircle2, ListChecks, Activity, MousePointerClick } from 'lucide-react';
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

/* 1 — Command Overview (intentionally sparse: pipeline + risk banner + ≤3 KPIs + one CTA) */
export function OfficialOverview() {
  const { issues, heroIssue, setSelectedIssue } = useAppData();
  const { navigate } = useRole();

  const open = issues.filter(i => i.status !== 'verified');
  const dailyRisk = open.reduce((a, c) => a + (c.costOfInaction || 0), 0);
  const verified = issues.filter(i => i.status === 'verified').length;
  const animatedRisk = useCountUp(dailyRisk);

  const runLive = () => {
    if (heroIssue) setSelectedIssue(heroIssue);
    navigate('official', 'agent');
  };

  const KPI = ({ icon: Icon, value, label, color }) => (
    <div className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: `3px solid ${color}` }}>
      <Icon size={18} color={color} />
      <div className="pressure-counter-val" style={{ fontSize: '1.9rem', color: color }}>{value}</div>
      <span style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 600 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Loop pipeline — the 5-second explainer */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', overflowX: 'auto' }}>
        <LoopPipeline issues={issues} />
      </div>

      {/* Risk banner + ≤3 KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <KPI icon={IndianRupee} value={`₹${animatedRisk.toLocaleString('en-IN')}`} label="At risk / day" color="var(--pressure)" />
        <KPI icon={ListChecks} value={open.length} label="Open issues" color="var(--teal)" />
        <KPI icon={CheckCircle2} value={verified} label="Fixes verified" color="var(--grass)" />
      </div>

      {/* One dominant CTA — nothing else */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: 'var(--teal-tint)', border: '1px solid rgba(26,169,160,.3)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', maxWidth: '440px' }}>
          One AI agent can move any issue from report to verified, paid-for fix. Watch it run the whole loop.
        </p>
        <button onClick={runLive} className="glow-btn-primary" style={{ fontSize: '1.05rem', fontWeight: 800, padding: '0.85rem 1.8rem' }}>
          <Play size={18} fill="currentColor" /> Run live resolution (watch the agent)
        </button>
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
        />
      </div>
    </div>
  );
}

/* 4 — Pressure & Escalation (ranked by ₹/day, SLA timers, auto-escalation) */
export function OfficialPressure() {
  const { issues, users, setSelectedIssue, handleVoteIssue, handleSlaSweep, handlePreparedness } = useAppData();
  return (
    <LivePressureDashboard
      issues={issues}
      users={users}
      view="pressure"
      onSelectIssue={setSelectedIssue}
      onVoteIssue={handleVoteIssue}
      onSlaSweep={handleSlaSweep}
      onPreparedness={handlePreparedness}
    />
  );
}

/* 5 — Prevention (Fix-It-Right: repeat-offender + root-cause intelligence) */
export function OfficialPrevention() {
  const { issues, users, setSelectedIssue, handleVoteIssue, handleSlaSweep, handlePreparedness } = useAppData();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div data-tour-id="tour-repeat-offender">
        <LivePressureDashboard
          issues={issues}
          users={users}
          view="repeat"
          onSelectIssue={setSelectedIssue}
          onVoteIssue={handleVoteIssue}
          onSlaSweep={handleSlaSweep}
          onPreparedness={handlePreparedness}
        />
      </div>
      <IntelligencePanel issues={issues} onSelectIssue={setSelectedIssue} onPreparedness={handlePreparedness} />
    </div>
  );
}

/* 6 — GlassLedger (public scorecard + tamper-evident ledger timeline) */
export function OfficialLedger() {
  const { issues, users, selectedIssue, heroIssue } = useAppData();
  const tracked = selectedIssue || heroIssue;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {tracked && (
        <div data-tour-id="tour-ledger" style={{ maxWidth: '720px' }}>
          <LedgerTimeline issue={tracked} />
        </div>
      )}
      <PublicScorecard issues={issues} users={users} />
    </div>
  );
}
