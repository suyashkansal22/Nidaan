import React from 'react';
import { Activity, Shield, Megaphone, Map, Briefcase, RefreshCw } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab, onResetDb, dbType }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="mesh-bg"></div>

      {/* Premium Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 11, 16, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--gradient-primary)',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px hsla(var(--primary), 0.4)'
          }}>
            <Activity size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, background: 'linear-gradient(95deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Nidaan
            </h1>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>
              Resolution Grid
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'dashboard', label: 'GlassLedger', icon: Shield },
            { id: 'radar', label: 'Responder Radar', icon: Map },
            { id: 'report', label: 'Snap-to-Solve', icon: Megaphone },
            { id: 'marketplace', label: 'FixForce', icon: Briefcase },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid rgba(110, 68, 255, 0.25)' : '1px solid transparent'
                }}
                className={isActive ? '' : 'nav-btn-hover'}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* System & Model Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="pulsing-indicator"></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                Orchestrator Online
              </span>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-mono)' }}>
              Model: Gemini 1.5 Flash
            </span>
          </div>

          <button
            onClick={onResetDb}
            title="Reset & Seed Database"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'hsl(var(--text-secondary))',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
          >
            <RefreshCw size={16} />
          </button>

          <span style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            background: dbType === 'firestore' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            color: dbType === 'firestore' ? 'hsl(var(--status-success))' : 'hsl(var(--status-warning))',
            border: `1px solid ${dbType === 'firestore' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase'
          }}>
            DB: {dbType}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* Premium Footer */}
      <footer style={{
        padding: '1.5rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(10, 11, 16, 0.5)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'hsl(var(--text-muted))'
      }}>
        <div>Nidaan — Autonomous Resolution Engine. Deployed on Google Cloud Run via Google AI Studio.</div>
        <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          Zero-Friction Citizen Engagement · TruthMesh Ledger · Escrow Payout Gating
        </div>
      </footer>
    </div>
  );
}
