import React, { useRef, useEffect } from 'react';
import { Terminal, Play, Cpu, ShieldAlert, FileText, Calendar, DollarSign, Mail } from 'lucide-react';

export default function AgentActivityPanel({ issue, onTriggerAgent, loading }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [issue?.ledgerTrail]);

  // Determine tool icon color based on keywords
  const getLogIcon = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes('stripe') || text.includes('escrow') || text.includes('payment')) {
      return { Icon: DollarSign, color: 'hsl(var(--status-success))' };
    }
    if (text.includes('calendar') || text.includes('schedule') || text.includes('inspector')) {
      return { Icon: Calendar, color: 'hsl(var(--primary))' };
    }
    if (text.includes('mail') || text.includes('notify') || text.includes('ping')) {
      return { Icon: Mail, color: 'hsl(var(--status-info))' };
    }
    if (text.includes('rti') || text.includes('complaint') || text.includes('escalat')) {
      return { Icon: ShieldAlert, color: 'hsl(var(--status-danger))' };
    }
    if (text.includes('triage') || text.includes('bom') || text.includes('dedupe')) {
      return { Icon: Cpu, color: 'hsl(var(--secondary))' };
    }
    return { Icon: Terminal, color: 'hsl(var(--text-secondary))' };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'reported': return 'rgba(255,255,255,0.06)';
      case 'triaged': return 'rgba(59, 130, 246, 0.08)';
      case 'bidding': return 'rgba(245, 158, 11, 0.08)';
      case 'assigned':
      case 'in_progress': return 'rgba(110, 68, 255, 0.08)';
      case 'fixed': return 'rgba(16, 185, 129, 0.06)';
      case 'verified': return 'rgba(16, 185, 129, 0.12)';
      case 'escalated': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(255,255,255,0.04)';
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      background: 'rgba(10, 11, 16, 0.65)',
      height: '100%',
      minHeight: '400px'
    }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={18} color="hsl(var(--secondary))" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Resolution Orchestrator Activity</h2>
        </div>
        
        {issue && (
          <button
            onClick={() => onTriggerAgent(issue.id)}
            disabled={loading || issue.status === 'verified'}
            className="glow-btn-primary"
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              boxShadow: issue.status === 'verified' ? 'none' : '0 4px 15px hsla(var(--primary), 0.25)',
              opacity: (loading || issue.status === 'verified') ? 0.5 : 1,
              cursor: (loading || issue.status === 'verified') ? 'not-allowed' : 'pointer'
            }}
          >
            <Play size={12} fill="currentColor" />
            {loading ? 'Running...' : 'Trigger Agent Step'}
          </button>
        )}
      </div>

      {/* Selected issue details */}
      {issue ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1 }}>
            <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
              Tracking Case: #{issue.id} ({issue.category.toUpperCase()})
            </span>
            <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>
              Current State: <strong style={{ color: 'hsl(var(--primary))' }}>{issue.status.toUpperCase()}</strong>
            </span>
          </div>
          <div style={{ height: '8px', width: '8px', borderRadius: '50%', background: issue.status === 'verified' ? 'hsl(var(--status-success))' : 'hsl(var(--status-warning))', animation: issue.status !== 'verified' ? 'pulseGlow 1.5s infinite' : 'none' }}></div>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
          Select an active ticket from the GlassLedger dashboard to trace and control its orchestration.
        </div>
      )}

      {/* Terminal log window */}
      <div style={{
        flex: 1,
        background: '#040508',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxHeight: '400px'
      }}>
        {issue && issue.ledgerTrail && issue.ledgerTrail.length > 0 ? (
          issue.ledgerTrail.map((trail, index) => {
            const { Icon, color } = getLogIcon(trail.message);
            return (
              <div
                key={index}
                style={{
                  padding: '0.6rem 0.8rem',
                  background: getStatusStyle(trail.status),
                  borderLeft: `3px solid ${color || 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '0 4px 4px 0',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  animation: 'slideInUp 0.2s ease-out forwards'
                }}
              >
                <div style={{ marginTop: '0.15rem' }}>
                  <Icon size={14} color={color} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                    <span>[{trail.actor}]</span>
                    <span>{new Date(trail.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span style={{ color: 'hsl(var(--text-primary))', lineHeight: '1.4' }}>
                    {trail.message}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: 'hsl(var(--text-muted))', padding: '1rem', textAlign: 'center' }}>
            [System Ready] Awaiting issue selection...
            <span className="terminal-cursor"></span>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'hsl(var(--secondary))', padding: '0.5rem' }}>
            <Cpu size={14} style={{ animation: 'spin 2s linear infinite' }} />
            <span>Agent reasoning and resolving...</span>
            <span className="terminal-cursor"></span>
          </div>
        )}
        <div ref={terminalEndRef}></div>
      </div>
    </div>
  );
}
