import React from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { ROLES } from '../config/nav.js';
import { useRole } from '../app/RoleContext.jsx';
import { useTour } from '../tour/TourContext.jsx';

/*
  SCREEN 1 — Role Select. The calm front door: pick a role, or (default path for
  a judge) take the Guided Tour. Reuses the approved cream/navy-teal visual system.
*/
export default function RoleSelect() {
  const { enterRole } = useRole();
  const tour = useTour();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
      <div className="mesh-bg" />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textAlign: 'center' }}>
          <img src="/logo.png" alt="Nidaan" width={66} height={66} style={{ borderRadius: '50%', boxShadow: 'var(--shadow-soft)' }} />
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, color: 'var(--ink-strong)', letterSpacing: '-0.02em' }}>Nidaan</h1>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--teal-600)', fontWeight: 700 }}>
              The Civic Resolution Network
            </span>
          </div>
          <p style={{ fontSize: '1.02rem', color: 'var(--ink)', maxWidth: '560px', lineHeight: 1.55, margin: '0.3rem 0 0' }}>
            From a citizen's photo to a verified, paid-for fix — <strong style={{ color: 'var(--ink-strong)' }}>one AI agent runs the whole loop.</strong>
          </p>
        </div>

        {/* Primary, dominant: Guided Tour */}
        <button
          onClick={() => tour?.start()}
          className="glow-btn-primary"
          style={{
            flexDirection: 'column', gap: '0.15rem', padding: '1rem 2.4rem', borderRadius: 'var(--radius-card)',
            fontSize: '1.15rem', fontWeight: 800, boxShadow: 'var(--shadow-lift)',
            background: 'var(--gradient-brand)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Play size={20} fill="currentColor" /> Take the Guided Tour</span>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, opacity: 0.9 }}>Recommended — see the full loop in ~2 minutes.</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '420px', color: 'var(--ink-muted)' }}>
          <span style={{ flex: 1, height: '1px', background: 'var(--cream-300)' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or enter as</span>
          <span style={{ flex: 1, height: '1px', background: 'var(--cream-300)' }} />
        </div>

        {/* Three role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.1rem', width: '100%' }}>
          {ROLES.map(r => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => enterRole(r.id)}
                className="glass-panel glass-panel-interactive"
                style={{ padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.7rem', textAlign: 'left', cursor: 'pointer' }}
              >
                <span style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-ctl)', background: r.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} />
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--ink-strong)' }}>{r.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: 1.45, margin: 0, flex: 1 }}>{r.tagline}</p>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--teal-600)' }}>
                  Enter <ArrowRight size={15} />
                </span>
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>You can switch roles anytime.</p>
      </div>
    </div>
  );
}
