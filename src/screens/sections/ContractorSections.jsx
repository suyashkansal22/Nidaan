import React, { useState } from 'react';
import { Briefcase, MapPin, Users, IndianRupee, Clock, Send, CheckCircle, Wallet } from 'lucide-react';
import { useAppData } from '../../app/AppDataContext.jsx';
import FixForceMarketplace from '../../components/FixForceMarketplace.jsx';

const EmptyState = ({ icon: Icon, title, body }) => (
  <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
    {Icon && <Icon size={40} style={{ color: 'var(--teal)', margin: '0 auto 0.75rem' }} />}
    <h3 style={{ fontSize: '1.05rem' }}>{title}</h3>
    {body && <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>{body}</p>}
  </div>
);

// Shared FixForce wrapper (maximum reuse — FixForce already renders the right
// content per issue status: crew/BOM when assigned, triple-lock when fixed,
// escrow + warranty + rating when verified).
function FixForcePanel({ issue, tourId }) {
  const {
    contractors, agentLoading,
    handleTriggerFix, handleRegisterContractor, handleReportFailure,
    handleDonate, handleReleaseEscrow, handleWorkspace,
  } = useAppData();
  return (
    <div data-tour-id={tourId}>
      <FixForceMarketplace
        issue={issue}
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
  );
}

/* 1 — Available Jobs (reverse-auction bid entry) */
export function ContractorJobs() {
  const { issues, showToast } = useAppData();
  const jobs = issues.filter(i => ['reported', 'triaged', 'bidding'].includes(i.status));
  const [openId, setOpenId] = useState(null);
  const [bids, setBids] = useState({}); // id -> {price, eta}
  const [placed, setPlaced] = useState({});

  if (!jobs.length) return <EmptyState icon={Briefcase} title="No open jobs right now" body="When citizens report issues that match your trade, the agent invites you to bid here." />;

  const submitBid = (id) => {
    const b = bids[id] || {};
    if (!b.price || !b.eta) { showToast('Enter a price and ETA to bid.', 'danger'); return; }
    setPlaced(p => ({ ...p, [id]: true }));
    setOpenId(null);
    showToast(`Bid submitted — ₹${Number(b.price).toLocaleString('en-IN')} · ${b.eta}m ETA. The agent scores it on cost · rating · proximity.`, 'success');
  };

  return (
    <div data-tour-id="tour-jobs" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {jobs.map(issue => {
        const open = openId === issue.id;
        const isPlaced = placed[issue.id];
        const b = bids[issue.id] || {};
        return (
          <div key={issue.id} className="glass-panel" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img src={issue.photoUrl} alt={issue.category} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-ctl)', border: '1px solid var(--cream-300)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{issue.title || issue.category.replace('_', ' ')}</h3>
                <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', fontSize: '0.74rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {issue.ward}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {issue.citizensAffected || 1} affected</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--pressure)', fontWeight: 700 }}><IndianRupee size={12} /> {(issue.costOfInaction || 0).toLocaleString('en-IN')}/day</span>
                </div>
              </div>
              <span className="badge badge-neutral">{(issue.bids?.length || 0)} vendors invited</span>
            </div>

            {isPlaced ? (
              <div className="badge badge-success" style={{ alignSelf: 'flex-start', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}>
                <CheckCircle size={14} /> Bid placed — you'll be notified if you win.
              </div>
            ) : open ? (
              <div className="sunken" style={{ padding: '1rem', borderRadius: 'var(--radius-ctl)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-muted)' }}>Your quote (₹)</label>
                  <input className="field" type="number" placeholder="9500" value={b.price || ''} onChange={e => setBids(s => ({ ...s, [issue.id]: { ...b, price: e.target.value } }))} style={{ width: '130px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-muted)' }}>ETA (min)</label>
                  <input className="field" type="number" placeholder="45" value={b.eta || ''} onChange={e => setBids(s => ({ ...s, [issue.id]: { ...b, eta: e.target.value } }))} style={{ width: '100px' }} />
                </div>
                <button onClick={() => submitBid(issue.id)} className="glow-btn-primary" style={{ fontSize: '0.8rem' }}><Send size={14} /> Submit bid</button>
              </div>
            ) : (
              <button onClick={() => setOpenId(issue.id)} className="glow-btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}>
                Place a bid
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* 2 — My Assignments */
export function ContractorAssignments() {
  const { issues, heroIssue } = useAppData();
  const pick =
    (heroIssue && ['assigned', 'in_progress'].includes(heroIssue.status) ? heroIssue : null) ||
    issues.find(i => ['assigned', 'in_progress'].includes(i.status));
  if (!pick) return <EmptyState icon={Briefcase} title="No active assignments" body="Win a job in Available Jobs and the agent-planned crew + materials appear here." />;
  return <FixForcePanel issue={pick} tourId="tour-assignment" />;
}

/* 3 — Submit Proof */
export function ContractorProof() {
  const { issues, heroIssue } = useAppData();
  const pick =
    (heroIssue && ['assigned', 'in_progress', 'fixed'].includes(heroIssue.status) ? heroIssue : null) ||
    issues.find(i => ['assigned', 'in_progress', 'fixed'].includes(i.status));
  if (!pick) return <EmptyState icon={Briefcase} title="Nothing to prove yet" body="Once you're on an active job, upload before/after photos here for the AI to verify." />;
  return <FixForcePanel issue={pick} tourId="tour-proof-locks" />;
}

/* 4 — Earnings & Rating */
export function ContractorEarnings() {
  const { issues, heroIssue } = useAppData();
  const pick =
    (heroIssue && heroIssue.status === 'verified' ? heroIssue : null) ||
    issues.find(i => i.status === 'verified' && i.assignedContractorId);
  if (!pick) return <EmptyState icon={Wallet} title="No payouts yet" body="When a job passes the triple-lock proof, the escrow release, warranty and rating impact show here." />;
  return <FixForcePanel issue={pick} tourId="tour-earnings" />;
}
