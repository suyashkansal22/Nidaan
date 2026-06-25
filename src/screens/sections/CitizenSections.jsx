import React, { useState } from 'react';
import { ThumbsUp, CheckCircle, Circle, FileText, Download, Star, Users, ShieldCheck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppData } from '../../app/AppDataContext.jsx';
import { useRole } from '../../app/RoleContext.jsx';
import SnapToSolve from '../../components/SnapToSolve.jsx';
import LoopPipeline, { issueProgress, STAGES } from '../../components/LoopPipeline.jsx';
import AgentActivityPanel from '../../components/AgentActivityPanel.jsx';
import LedgerTimeline from '../../components/LedgerTimeline.jsx';

const EmptyState = ({ icon: Icon, title, body }) => (
  <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
    {Icon && <Icon size={40} style={{ color: 'var(--teal)', margin: '0 auto 0.75rem' }} />}
    <h3 style={{ fontSize: '1.05rem' }}>{title}</h3>
    {body && <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>{body}</p>}
  </div>
);

/* 1 — Report an Issue */
export function CitizenReport() {
  const { citizen, handleIssueCreated, setSelectedIssue } = useAppData();
  const { navigate } = useRole();
  return (
    <div data-tour-id="tour-report-form">
      <SnapToSolve
        user={citizen}
        onIssueCreated={(issue, meta) => {
          handleIssueCreated(issue, meta);
          setSelectedIssue(issue);
          navigate('citizen', 'my-reports');
        }}
      />
    </div>
  );
}

/* 2 — My Reports */
export function CitizenMyReports() {
  const {
    issues, citizen, heroIssue, setSelectedIssue,
    handleTriggerAgent, handleRunAgent, handleReleaseEscrow, agentLoading
  } = useAppData();
  const [trackingIssueId, setTrackingIssueId] = useState(null);

  const mine = issues.filter(i => i.reporterId === citizen.userId);
  if (heroIssue && !mine.find(i => i.id === heroIssue.id)) mine.unshift(heroIssue);
  const list = mine.length ? mine : issues.filter(i => i.status !== 'verified').slice(0, 4);

  if (!list.length) return <EmptyState icon={ListIcon} title="No reports yet" body="Snap a photo on the Report tab and it shows up here." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {list.map(issue => {
        const stage = STAGES[Math.min(STAGES.length, issueProgress(issue)) - 1];
        const isHero = heroIssue && issue.id === heroIssue.id;
        const isTracking = trackingIssueId === issue.id;
        return (
          <div
            key={issue.id}
            data-tour-id={isHero ? 'tour-myreports-hero' : undefined}
            className="glass-panel"
            style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img src={issue.photoUrl} alt={issue.category} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{(issue.title || issue.category.replace('_', ' '))}</h3>
                  <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{stage?.label || issue.status}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>#{issue.id} · {issue.ward}</p>
              </div>
            </div>

            {/* mini Loop tracker */}
            <div style={{ background: 'var(--cream-100)', border: '1px solid var(--cream-300)', borderRadius: 'var(--radius-ctl)', padding: '0.85rem 1rem', overflowX: 'auto' }}>
              <LoopPipeline issue={issue} />
            </div>

            {isTracking && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem', borderTop: '1px dashed var(--cream-300)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 360px', minWidth: '0' }}>
                    <AgentActivityPanel
                      issue={issue}
                      onTriggerAgent={handleTriggerAgent}
                      onRunAgent={handleRunAgent}
                      onReleaseEscrow={handleReleaseEscrow}
                      loading={agentLoading}
                    />
                  </div>
                  <div style={{ flex: '1 1 300px', minWidth: '0' }}>
                    <LedgerTimeline issue={issue} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setSelectedIssue(issue); setTrackingIssueId(isTracking ? null : issue.id); }}
                className="glow-btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem' }}
              >
                {isTracking ? (
                  <>Hide agent activity <ChevronUp size={14} /></>
                ) : (
                  <>Watch the agent <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
const ListIcon = (props) => <FileText {...props} />;

/* 3 — Confirm a Fix */
export function CitizenConfirmFix() {
  const { issues, heroIssue, showToast } = useAppData();
  const [confirmed, setConfirmed] = useState(false);

  // Prefer a freshly-fixed repair; else the hero if it's been fixed/verified; else any verified job with proof.
  const target =
    issues.find(i => i.status === 'fixed') ||
    (heroIssue && ['fixed', 'verified'].includes(heroIssue.status) ? heroIssue : null) ||
    issues.find(i => i.status === 'verified' && i.proofOfFixUrl);

  if (!target) return <EmptyState icon={CheckCircle} title="No repairs waiting on you" body="When a contractor finishes a job near you, it appears here for confirmation." />;

  const locks = [
    { label: 'Gemini AI vision diff', pass: true, note: 'Before/after surface match verified.' },
    { label: 'Street View / GPS match', pass: true, note: 'Repair coordinates match the report.' },
    { label: 'Your confirmation', pass: confirmed, note: confirmed ? 'You confirmed the repair on your street.' : 'Awaiting your approval below.' },
  ];

  return (
    <div data-tour-id="tour-confirm" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '620px' }}>
      <div>
        <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>#{target.id} · {target.ward}</span>
        <h3 style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>{target.title || target.category.replace('_', ' ')} — repair completed</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span className="badge badge-danger" style={{ alignSelf: 'flex-start' }}>Before</span>
          <img src={target.photoUrl} alt="Before" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>After</span>
          <img src={target.proofOfFixUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80'} alt="After" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {locks.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', background: l.pass ? 'var(--grass-tint)' : 'var(--cream-200)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-ctl)', border: `1px solid ${l.pass ? 'rgba(91,170,71,.3)' : 'var(--cream-400)'}` }}>
            {l.pass ? <CheckCircle size={16} color="var(--grass-600)" /> : <Circle size={16} color="var(--ink-muted)" />}
            <span><strong style={{ color: 'var(--ink-strong)' }}>{l.label}</strong> — <span style={{ color: 'var(--ink-muted)' }}>{l.note}</span></span>
          </div>
        ))}
      </div>

      {confirmed ? (
        <div className="badge badge-success" style={{ alignSelf: 'flex-start', padding: '0.6rem 0.9rem', fontSize: '0.82rem' }}>
          <ShieldCheck size={15} /> Thank you — repair confirmed. Your trust score rose.
        </div>
      ) : (
        <button
          onClick={() => { setConfirmed(true); showToast('Repair confirmed — your trust score rose +2.', 'success'); }}
          className="glow-btn-primary"
          style={{ alignSelf: 'flex-start', fontSize: '0.9rem' }}
        >
          <CheckCircle size={16} /> Approve — yes, it's fixed
        </button>
      )}
    </div>
  );
}

/* 4 — My Voice */
export function CitizenMyVoice() {
  const { citizen, users, issues } = useAppData();
  const me = users.find(u => u.id === citizen.userId) || { trustScore: citizen.trustScore, badge: citizen.badge, reports: 41, confirmedFixes: 28 };
  const petitionIssue = issues.find(i => i.petition);
  const rtiTarget = issues.filter(i => i.status !== 'verified').sort((a, b) => (b.costOfInaction || 0) - (a.costOfInaction || 0))[0];

  const buildRTI = (issue) => `MEMORANDUM OF GRIEVANCE
TO: Public Works Department / Municipal Grievance Cell
SUBJECT: Unresolved Public Hazard — SLA Breach (Ticket #${issue.id})
WARD: ${issue.ward}

Formal notification under Section 6 of the RTI Act regarding the unresolved civic issue: ${issue.category.replace('_', ' ').toUpperCase()} reported on ${new Date(issue.timestamp).toLocaleDateString()}.

Despite a community pressure rating of ${issue.citizensAffected} affected citizens, the department failed to resolve within ${issue.severity === 'RedAlert' ? '4 hours' : '48 hours'}.

Daily economic cost of inaction: ₹${issue.costOfInaction}. Please register this in the public audit ledger and provide a dated action plan within 30 days as mandated.`;

  const downloadRTI = () => {
    if (!rtiTarget) return;
    const blob = new Blob([buildRTI(rtiTarget)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `RTI_grievance_${rtiTarget.id}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '720px' }}>
      {/* Trust score */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderTop: '3px solid var(--teal)' }}>
        <span style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0 }}>
          {me.trustScore}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{citizen.name}</h3>
            <span className="badge badge-info"><Star size={11} color="var(--alert)" /> {me.badge}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
            {me.reports} reports · {me.confirmedFixes} confirmed fixes. Trusted reporters are weighted higher in dedupe & verification.
          </p>
          <div style={{ height: '7px', background: 'var(--cream-300)', borderRadius: '99px', overflow: 'hidden', marginTop: '0.6rem' }}>
            <div style={{ height: '100%', width: `${me.trustScore}%`, background: 'var(--gradient-secondary)', borderRadius: '99px' }} />
          </div>
        </div>
      </div>

      {/* Group petition */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <h3 style={{ fontSize: '1.0rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={17} color="var(--teal)" /> Collective petition</h3>
        {petitionIssue?.petition ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink-strong)' }}>{petitionIssue.petition.title}</span>
              <span className="badge badge-info">{petitionIssue.petition.signatures} signatures</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{petitionIssue.petition.body}</p>
          </>
        ) : (
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
            No active petition you've joined. When enough citizens report the same issue, Nidaan auto-assembles a group petition you can sign.
          </p>
        )}
      </div>

      {/* RTI */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.0rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={17} color="var(--teal)" /> Auto-file an RTI</h3>
          <button onClick={downloadRTI} disabled={!rtiTarget} className="glow-btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>
            <Download size={14} /> Generate RTI draft
          </button>
        </div>
        {rtiTarget ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
            When the system stalls, generate a ready-to-file RTI grievance for the highest-pressure open issue
            (<strong style={{ color: 'var(--ink)' }}>#{rtiTarget.id} · {rtiTarget.category.replace('_', ' ')}</strong>, ₹{rtiTarget.costOfInaction}/day).
          </p>
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Nothing stalled right now — the loop is clean.</p>
        )}
      </div>
    </div>
  );
}
