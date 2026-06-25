import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import LivePressureDashboard from './components/LivePressureDashboard.jsx';
import ResponderRadar from './components/ResponderRadar.jsx';
import SnapToSolve from './components/SnapToSolve.jsx';
import FixForceMarketplace from './components/FixForceMarketplace.jsx';
import AgentActivityPanel from './components/AgentActivityPanel.jsx';
import IntelligencePanel from './components/IntelligencePanel.jsx';
import PublicScorecard from './components/PublicScorecard.jsx';
import LedgerTimeline from './components/LedgerTimeline.jsx';
import AuthGate from './components/AuthGate.jsx';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nidaan_user') || 'null'); } catch { return null; }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [issues, setIssues] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [responders, setResponders] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [dbType, setDbType] = useState('mock');
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, tone = 'info') => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 4200);
  };

  // Default landing tab by role
  useEffect(() => {
    if (user) setActiveTab(user.role === 'citizen' ? 'report' : 'dashboard');
  }, [user?.role]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [resIssues, resContractors, resResponders, resUsers] = await Promise.all([
        fetch('/api/issues'), fetch('/api/contractors'), fetch('/api/responders'), fetch('/api/users'),
      ]);
      const dataIssues = await resIssues.json();
      setIssues(dataIssues);
      setContractors(await resContractors.json());
      setResponders(await resResponders.json());
      try { setUsers(await resUsers.json()); } catch { setUsers([]); }

      if (selectedIssue) {
        const updated = dataIssues.find(i => i.id === selectedIssue.id);
        if (updated) setSelectedIssue(updated);
      }
      try {
        const status = await (await fetch('/api/status')).json();
        setDbType(status.dbType || 'mock');
      } catch { setDbType('mock'); }
    } catch (error) {
      console.error('Error fetching data from backend APIs:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [!!user]);

  const handleSignOut = () => {
    try { localStorage.removeItem('nidaan_user'); } catch { /* ignore */ }
    setUser(null);
  };

  const handleResetDb = async () => {
    if (window.confirm('Reset the database to default seed data? This will overwrite active tickets.')) {
      setLoading(true);
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        if (res.ok) { setSelectedIssue(null); await fetchData(false); showToast('Demo city re-seeded.', 'success'); }
        else showToast('Failed to seed database', 'danger');
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    }
  };

  const handleVoteIssue = async (issueId) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setIssues(prev => prev.map(i => i.id === issueId ? data.issue : i));
        if (selectedIssue?.id === issueId) setSelectedIssue(data.issue);
        if (data.escalated) showToast('Collective pressure threshold breached — auto-escalation triggered.', 'danger');
        else if (data.petitioned) showToast('Group petition auto-assembled from collective pressure.', 'success');
      }
    } catch (error) { console.error(error); }
  };

  // Single agent step (manual stepping, with live Gemini reasoning)
  const handleTriggerAgent = async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/trigger`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { await fetchData(false); setSelectedIssue(data.issue); }
      else showToast('Agent failed: ' + data.error, 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  };

  // Autonomous full resolution run (Report → ... → Prevent)
  const handleRunAgent = async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/run`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { await fetchData(false); setSelectedIssue(data.issue); showToast('Autonomous resolution complete — loop closed.', 'success'); }
      else showToast('Run failed: ' + data.error, 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  };

  // Release escrow — only succeeds when triple-lock is all green
  const handleReleaseEscrow = async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/release`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { await fetchData(false); setSelectedIssue(data.issue); showToast('Escrow released — contractor paid on verified proof.', 'success'); }
      else showToast(data.error || 'Payout still locked.', 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  };

  const handleSlaSweep = async () => {
    try {
      const res = await fetch('/api/sla/sweep', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchData(false);
        showToast(data.escalatedCount ? `SLA sweep: ${data.escalatedCount} breached ticket(s) auto-escalated.` : 'SLA sweep: no breaches.', data.escalatedCount ? 'danger' : 'success');
      }
    } catch (error) { console.error(error); }
  };

  const handlePreparedness = async (trigger) => {
    try {
      const res = await fetch('/api/preparedness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trigger }) });
      const data = await res.json();
      if (res.ok) showToast(data.message, 'info');
    } catch (error) { console.error(error); }
  };

  const handleTriggerFix = async (issueId, proofOfFixUrl) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/fix`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proofOfFixUrl })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData(false);
        setSelectedIssue(data);
        showToast('Proof uploaded — triple-lock verification running. Pay button unlocks when all green.', 'info');
      } else showToast('Failed to submit proof', 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  };

  const handleRegisterContractor = async (contractorData) => {
    try {
      const res = await fetch('/api/contractors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contractorData) });
      if (res.ok) { await fetchData(false); showToast('Contractor registered — now eligible for auctions.', 'success'); }
      else showToast('Failed to register contractor', 'danger');
    } catch (error) { console.error(error); }
  };

  const handleReportFailure = async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/reopen`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { await fetchData(false); setSelectedIssue(data); showToast('Warranty claim accepted — ticket reopened, contractor rating penalised.', 'danger'); }
      else showToast('Failed to file warranty claim', 'danger');
    } catch (error) { console.error(error); }
    finally { setAgentLoading(false); }
  };

  const handleDonate = async (issueId, amount) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/donate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
      const data = await res.json();
      if (res.ok) { setIssues(prev => prev.map(i => i.id === issueId ? data : i)); setSelectedIssue(data); }
      else showToast('Failed to submit donation', 'danger');
    } catch (error) { console.error(error); }
  };

  const handleWorkspace = async (issueId, kind, body = {}) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/workspace/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) { await fetchData(false); if (selectedIssue?.id === issueId) setSelectedIssue(data.issue); showToast(data.result.message, 'success'); }
    } catch (error) { console.error(error); }
  };

  const handleIssueCreated = (newIssue, meta = {}) => {
    setIssues(prev => [newIssue, ...prev]);
    setSelectedIssue(newIssue);
    if (meta.emergency) showToast('🚨 RedAlert — routed to the Emergency lane and emergency services notified.', 'danger');
    else showToast('Ticket created — Resolution Orchestrator is triaging it now.', 'success');
    setActiveTab('dashboard');
  };

  if (!user) return <AuthGate onSignIn={setUser} />;

  return (
    <Layout
      activeTab={activeTab} setActiveTab={setActiveTab} onResetDb={handleResetDb}
      dbType={dbType} issues={issues} user={user} onSignOut={handleSignOut}
    >
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 999,
          background: 'var(--ink-strong)', color: '#fff', padding: '0.8rem 1.2rem', borderRadius: '99px',
          boxShadow: 'var(--shadow-lift)', fontSize: '0.85rem', fontWeight: 600, maxWidth: '90vw',
          borderLeft: `4px solid ${toast.tone === 'danger' ? 'var(--critical)' : toast.tone === 'success' ? 'var(--grass)' : 'var(--teal)'}`,
          animation: 'slideInUp 0.3s ease-out'
        }}>
          {toast.text}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <div className="pulsing-indicator" style={{ width: '20px', height: '20px' }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>Establishing Nidaan connection…</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedIssue ? '1fr 380px' : '1fr', gap: '2rem', alignItems: 'start', transition: 'grid-template-columns var(--transition-slow)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
            {activeTab === 'dashboard' && (
              <LivePressureDashboard issues={issues} users={users} onSelectIssue={setSelectedIssue} onVoteIssue={handleVoteIssue} onSlaSweep={handleSlaSweep} onPreparedness={handlePreparedness} />
            )}
            {activeTab === 'radar' && (
              <ResponderRadar issues={issues} contractors={contractors} responders={responders} onSelectIssue={setSelectedIssue} />
            )}
            {activeTab === 'report' && (
              <SnapToSolve user={user} onIssueCreated={handleIssueCreated} />
            )}
            {activeTab === 'marketplace' && (
              <FixForceMarketplace issue={selectedIssue} contractors={contractors} onTriggerFix={handleTriggerFix} loading={agentLoading} onRegisterContractor={handleRegisterContractor} onReportFailure={handleReportFailure} onDonate={handleDonate} onReleaseEscrow={handleReleaseEscrow} onWorkspace={handleWorkspace} />
            )}
            {activeTab === 'insights' && (
              <IntelligencePanel issues={issues} onSelectIssue={setSelectedIssue} onPreparedness={handlePreparedness} />
            )}
            {activeTab === 'scorecard' && (
              <PublicScorecard issues={issues} users={users} />
            )}
          </div>

          {selectedIssue && (
            <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--ink-muted)' }}>Selected Incident Track</span>
                <button onClick={() => setSelectedIssue(null)} style={{ background: 'transparent', border: 'none', color: 'var(--critical)', cursor: 'pointer', fontWeight: 600 }}>Close Track</button>
              </div>

              <AgentActivityPanel
                issue={selectedIssue}
                onTriggerAgent={handleTriggerAgent}
                onRunAgent={handleRunAgent}
                onReleaseEscrow={handleReleaseEscrow}
                loading={agentLoading}
              />

              <LedgerTimeline issue={selectedIssue} />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setActiveTab('marketplace')} className="glow-btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>Bids & Escrow</button>
                <button onClick={() => setActiveTab('radar')} className="glow-btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>Locate on Radar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
