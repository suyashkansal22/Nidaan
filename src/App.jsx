import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import LivePressureDashboard from './components/LivePressureDashboard.jsx';
import ResponderRadar from './components/ResponderRadar.jsx';
import SnapToSolve from './components/SnapToSolve.jsx';
import FixForceMarketplace from './components/FixForceMarketplace.jsx';
import AgentActivityPanel from './components/AgentActivityPanel.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [issues, setIssues] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [responders, setResponders] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  const [dbType, setDbType] = useState('mock');
  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);

  // Fetch initial data
  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Fetch issues
      const resIssues = await fetch('/api/issues');
      const dataIssues = await resIssues.json();
      setIssues(dataIssues);

      // Fetch contractors
      const resContractors = await fetch('/api/contractors');
      const dataContractors = await resContractors.json();
      setContractors(dataContractors);

      // Fetch responders
      const resResponders = await fetch('/api/responders');
      const dataResponders = await resResponders.json();
      setResponders(dataResponders);

      // Sync selected issue if already active
      if (selectedIssue) {
        const updated = dataIssues.find(i => i.id === selectedIssue.id);
        if (updated) setSelectedIssue(updated);
      }

      // Check DB type by fetching a sample configuration/status
      setDbType(dataIssues.length > 0 && dataIssues[0].dbType === 'firestore' ? 'firestore' : 'mock');
    } catch (error) {
      console.error('Error fetching data from backend APIs:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Reset / Seed Database
  const handleResetDb = async () => {
    if (window.confirm('Reset the database to default seed data? This will overwrite active tickets.')) {
      setLoading(true);
      try {
        const res = await fetch('/api/seed', { method: 'POST' });
        if (res.ok) {
          setSelectedIssue(null);
          await fetchData(false);
        } else {
          alert('Failed to seed database');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Upvote issue (pressure increment)
  const handleVoteIssue = async (issueId) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        // Update local state
        setIssues(issues.map(i => i.id === issueId ? data.issue : i));
        if (selectedIssue && selectedIssue.id === issueId) {
          setSelectedIssue(data.issue);
        }
        if (data.escalated) {
          alert('Collective pressure threshold breached! PWD Escalation mechanism auto-triggered.');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Trigger agent orchestrator step
  const handleTriggerAgent = async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/trigger`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        // Refetch and update
        await fetchData(false);
        const updated = data.issue;
        setSelectedIssue(updated);
      } else {
        alert('Agent failed to execute: ' + data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAgentLoading(false);
    }
  };

  // Submit Contractor Proof of Fix
  const handleTriggerFix = async (issueId, proofOfFixUrl) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofOfFixUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setIssues(issues.map(i => i.id === issueId ? data : i));
        setSelectedIssue(data);
        // Automatically fetch and trigger agent loop verification
        setTimeout(() => {
          handleTriggerAgent(issueId);
        }, 1500);
      } else {
        alert('Failed to submit contractor proof');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAgentLoading(false);
    }
  };

  // Handle registering a contractor in frontend state & backend
  const handleRegisterContractor = async (contractorData) => {
    try {
      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractorData)
      });
      if (res.ok) {
        // Refetch all database records to sync UI
        await fetchData(false);
      } else {
        alert('Failed to register contractor');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Report warranty failure and reopen the ticket
  const handleReportFailure = async (issueId) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/reopen`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchData(false);
        setSelectedIssue(data);
        alert('Warranty audit failed! Escalated contract reopened. The incident is now back to REPORTED status.');
      } else {
        alert('Failed to file warranty claim');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAgentLoading(false);
    }
  };

  // Contribute micro-crowdfunding donations
  const handleDonate = async (issueId, amount) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        setIssues(issues.map(i => i.id === issueId ? data : i));
        setSelectedIssue(data);
      } else {
        alert('Failed to submit donation');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Callback when a citizen creates an issue in Snap-to-Solve
  const handleIssueCreated = (newIssue) => {
    // Add to list and select
    setIssues([newIssue, ...issues]);
    setSelectedIssue(newIssue);
    // Switch to dashboard to track it
    setActiveTab('dashboard');
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onResetDb={handleResetDb} dbType={dbType}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <div className="pulsing-indicator" style={{ width: '20px', height: '20px' }}></div>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Establishing Nidaan connection...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedIssue ? '1fr 380px' : '1fr',
          gap: '2rem',
          alignItems: 'start',
          transition: 'grid-template-columns var(--transition-slow)'
        }}>
          
          {/* Active Tab Component rendering */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
            {activeTab === 'dashboard' && (
              <LivePressureDashboard
                issues={issues}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onVoteIssue={handleVoteIssue}
              />
            )}
            
            {activeTab === 'radar' && (
              <ResponderRadar
                issues={issues}
                contractors={contractors}
                responders={responders}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
              />
            )}

            {activeTab === 'report' && (
              <SnapToSolve
                onIssueCreated={handleIssueCreated}
              />
            )}

            {activeTab === 'marketplace' && (
              <FixForceMarketplace
                issue={selectedIssue}
                contractors={contractors}
                onTriggerFix={handleTriggerFix}
                loading={agentLoading}
                onRegisterContractor={handleRegisterContractor}
                onReportFailure={handleReportFailure}
                onDonate={handleDonate}
              />
            )}
          </div>

          {/* Right Sidebar: Agent Activity Console when an issue is selected */}
          {selectedIssue && (
            <div style={{
              position: 'sticky',
              top: '90px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Active Ticket Quick Navigator */}
              <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Selected Incident Track</span>
                <button
                  onClick={() => setSelectedIssue(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--status-danger))',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Close Track
                </button>
              </div>

              {/* Live activity log list */}
              <AgentActivityPanel
                issue={selectedIssue}
                onTriggerAgent={handleTriggerAgent}
                loading={agentLoading}
              />

              {/* Quick links to actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="glow-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  Manage Bids & Escrow
                </button>
                <button
                  onClick={() => setActiveTab('radar')}
                  className="glow-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  Locate on Radar
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </Layout>
  );
}
