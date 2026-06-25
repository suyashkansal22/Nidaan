import React, { useRef, useEffect, useState } from 'react';
import { Activity, Play, ChevronRight, Check, ShieldAlert, Cpu } from 'lucide-react';

// Map a ledger message to a tool name, service badge and tone.
function describeStep(trail) {
  const text = (trail.message || '').toLowerCase();
  const status = trail.status;

  let service = null;
  if (text.includes('stripe') || text.includes('escrow') || text.includes('payout') || text.includes('payment')) service = 'Stripe';
  else if (text.includes('calendar') || text.includes('schedule') || text.includes('inspector')) service = 'Calendar';
  else if (text.includes('street view') || text.includes('maps') || text.includes('gps') || text.includes('radar') || text.includes('nearby')) service = 'Maps';
  else if (text.includes('gemini') || text.includes('vision') || text.includes('triage') || text.includes('classif') || text.includes('bom') || text.includes('dedup') || text.includes('image')) service = 'Gemini';

  const toolByStatus = {
    reported:   'ingestReport',
    triaged:    'triageIssue',
    bidding:    'runReverseAuction',
    assigned:   'assignContractor',
    in_progress:'dispatchCrew',
    fixed:      'submitProofOfFix',
    verified:   'releaseEscrow',
    escalated:  'draftGrievance',
  };
  const tool = toolByStatus[status] || 'orchestrate';

  let tone = 'info';
  if (status === 'verified' || status === 'fixed') tone = 'success';
  else if (status === 'bidding' || status === 'assigned' || status === 'in_progress') tone = 'warn';
  else if (status === 'escalated') tone = 'danger';

  return { tool, service, tone };
}

const TONE = {
  info:    { bar: 'var(--teal)',     dot: 'var(--teal-600)' },
  success: { bar: 'var(--grass)',    dot: 'var(--grass-600)' },
  warn:    { bar: 'var(--alert)',    dot: '#B26A12' },
  danger:  { bar: 'var(--critical)', dot: 'var(--critical)' },
};

function StepCard({ trail, index, isLast }) {
  const { tool, service, tone } = describeStep(trail);
  const [open, setOpen] = useState(false);
  const t = TONE[tone];

  return (
    <div style={{ position: 'relative', paddingLeft: '0.25rem' }}>
      <div
        style={{
          background: 'var(--cream-50)',
          border: '1px solid var(--cream-300)',
          borderLeft: `3px solid ${t.bar}`,
          borderRadius: '0 var(--radius-ctl) var(--radius-ctl) 0',
          padding: '0.6rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.3rem',
          animation: 'slideInUp 0.3s ease-out both',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--ink-strong)' }}>
            {tool}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-muted)' }}>
            {new Date(trail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-muted)', marginTop: '1px' }}>out:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink)', lineHeight: 1.45, flex: 1 }}>
            {trail.message}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {service && <span className="svc-badge">{service}</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink-muted)' }}>[{trail.actor}]</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--grass-tint)', color: 'var(--grass-600)' }}>
            <Check size={11} strokeWidth={3} />
          </span>
        </div>

        {/* view reasoning expander */}
        <button
          onClick={() => setOpen(o => !o)}
          className="glow-btn-ghost"
          style={{ fontSize: '0.64rem', padding: 0, marginTop: '0.1rem', alignSelf: 'flex-start' }}
        >
          <ChevronRight size={11} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
          view reasoning
        </button>
        {open && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--ink-muted)', background: 'var(--cream-100)', border: '1px dashed var(--cream-400)', borderRadius: '8px', padding: '0.5rem', lineHeight: 1.5 }}>
            Stage <strong style={{ color: 'var(--ink)' }}>{trail.status}</strong> · actor <strong style={{ color: 'var(--ink)' }}>{trail.actor}</strong>. The orchestrator selected <strong style={{ color: 'var(--teal-600)' }}>{tool}</strong>{service ? <> using <strong style={{ color: 'var(--teal-600)' }}>{service}</strong></> : null} and recorded this to the tamper-evident ledger.
          </div>
        )}
      </div>

      {/* vertical connector — echoes the loop */}
      {!isLast && <div style={{ width: '2px', height: '12px', marginLeft: '1rem', background: 'var(--cream-300)' }} />}
    </div>
  );
}

export default function AgentActivityPanel({ issue, onTriggerAgent, loading }) {
  const endRef = useRef(null);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [issue?.ledgerTrail, loading]);

  const trail = issue?.ledgerTrail || [];
  const showApprove = issue && (issue.status === 'bidding' || issue.status === 'triaged');

  return (
    <div className="sunken" style={{ display: 'flex', flexDirection: 'column', minHeight: '420px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderBottom: '1px solid var(--cream-300)', background: 'var(--cream-50)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={17} color="var(--teal)" />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink-strong)', fontFamily: 'var(--font-display)' }}>Resolution Orchestrator</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="pulsing-indicator" style={{ width: '7px', height: '7px' }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--teal-600)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>running</span>
            </div>
          </div>
        </div>

        {issue && (
          <button
            onClick={() => onTriggerAgent(issue.id)}
            disabled={loading || issue.status === 'verified'}
            className="glow-btn-primary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
          >
            <Play size={12} fill="currentColor" />
            {loading ? 'Running…' : 'Trigger step'}
          </button>
        )}
      </div>

      {/* Selected case strip */}
      {issue ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderBottom: '1px solid var(--cream-300)', fontSize: '0.78rem', background: 'var(--cream-50)' }}>
          <div style={{ flex: 1, lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700, color: 'var(--ink-strong)', fontFamily: 'var(--font-mono)' }}>#{issue.id}</span>
            <span style={{ color: 'var(--ink-muted)' }}> · {issue.category.replace('_', ' ')}</span>
          </div>
          <span className={`badge ${issue.status === 'verified' ? 'badge-success' : 'badge-info'}`} style={{ textTransform: 'uppercase' }}>
            {issue.status.replace('_', ' ')}
          </span>
        </div>
      ) : (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--cream-300)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--ink-muted)', background: 'var(--cream-50)' }}>
          Select a case from the War Room to trace its orchestration.
        </div>
      )}

      {/* Streaming feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {trail.length > 0 ? (
          trail.map((t, i) => <StepCard key={i} trail={t} index={i} isLast={i === trail.length - 1 && !loading && !showApprove} />)
        ) : (
          <div style={{ color: 'var(--ink-muted)', padding: '1.5rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            Awaiting orchestration<span className="terminal-cursor" />
          </div>
        )}

        {/* Approve / Override inline control at the assign step */}
        {showApprove && !loading && (
          <div style={{ marginLeft: '0.25rem', marginTop: '0.25rem', background: 'var(--teal-tint)', border: '1px solid rgba(26,169,160,.3)', borderRadius: 'var(--radius-ctl)', padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ flex: 1, fontSize: '0.72rem', color: 'var(--ink)', fontWeight: 600 }}>Agent recommends the next action. Approve to proceed.</span>
            <button onClick={() => onTriggerAgent(issue.id)} className="glow-btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>Approve</button>
            <button onClick={() => alert('Override: you can reassign the winning bid or inspector from the FixForce console.')} className="glow-btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>Override</button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--teal-600)', padding: '0.6rem 0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
            <Cpu size={14} style={{ animation: 'spin 2s linear infinite' }} />
            <span>orchestrator reasoning…</span>
            <span className="terminal-cursor" />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
