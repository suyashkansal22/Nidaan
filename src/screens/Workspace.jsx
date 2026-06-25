import React from 'react';
import { Play, Info } from 'lucide-react';
import { useRole } from '../app/RoleContext.jsx';
import { useAppData } from '../app/AppDataContext.jsx';
import { useTour } from '../tour/TourContext.jsx';
import { sectionsFor, sectionMeta, roleById } from '../config/nav.js';
import { sectionComponent } from './sections/registry.js';
import SectionHeader from '../ui/SectionHeader.jsx';
import RoleSwitcher from '../ui/RoleSwitcher.jsx';

/*
  SCREEN 2 — Role Workspace shell. Same shell for every role: top bar (brand,
  section tabs, role switcher, tour restart) and a body that renders exactly ONE
  focused section at a time with its title + "i" InfoButton + "what to do" hint.
*/
export default function Workspace() {
  const { role, section, setSection, goToRoleSelect } = useRole();
  const { loading, toast } = useAppData();
  const tour = useTour();

  const roleDef = roleById(role);
  const tabs = sectionsFor(role);
  const meta = sectionMeta(role, section);
  const SectionView = sectionComponent(role, section);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="mesh-bg" />

      {/* ---- Top bar ---- */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(252,249,242,0.86)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--cream-300)', padding: '0.7rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        {/* Brand → back to Role Select */}
        <button onClick={goToRoleSelect} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} title="Back to Role Select">
          <img src="/logo.png" alt="Nidaan" width={40} height={40} style={{ borderRadius: '50%', boxShadow: 'var(--shadow-soft)' }} />
          <div style={{ lineHeight: 1.05, textAlign: 'left' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--ink-strong)', letterSpacing: '-0.02em' }}>Nidaan</h1>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--teal-600)', fontWeight: 700 }}>
              {roleDef?.name}
            </span>
          </div>
        </button>

        {/* Section tabs */}
        <nav style={{ display: 'flex', gap: '0.3rem', background: 'var(--cream-200)', padding: '0.3rem', borderRadius: '99px', border: '1px solid var(--cream-300)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {tabs.map(t => {
            const Icon = t.icon; const isActive = section === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSection(t.id)}
                className={isActive ? '' : 'nav-btn-hover'}
                style={{
                  background: isActive ? 'var(--cream-50)' : 'transparent',
                  color: isActive ? 'var(--teal-600)' : 'var(--ink-muted)',
                  padding: '0.45rem 0.8rem', borderRadius: '99px', fontWeight: 600, fontSize: '0.8rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid var(--cream-300)' : '1px solid transparent',
                  boxShadow: isActive ? 'var(--shadow-soft)' : 'none',
                }}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Guided Tour + Role switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={() => tour?.start()} className="glow-btn-secondary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem' }}>
            <Play size={13} fill="currentColor" color="var(--teal)" /> Guided Tour
          </button>
          <RoleSwitcher />
        </div>
      </header>

      {/* ---- Hint strip: point new users at the InfoButtons ---- */}
      <div style={{
        background: 'var(--cream-100)', borderBottom: '1px solid var(--cream-300)',
        padding: '0.4rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
      }}>
        <Info size={12} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
          Hover (or tap) the <strong style={{ color: 'var(--teal-600)' }}>"i"</strong> next to a section title to learn what that feature does and why it matters.
        </span>
      </div>

      {/* ---- Body: exactly one section ---- */}
      <main style={{ flex: 1, padding: '1.75rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', gap: '1rem' }}>
            <div className="pulsing-indicator" style={{ width: '20px', height: '20px' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>Establishing Nidaan connection…</p>
          </div>
        ) : (
          <div key={`${role}/${section}`} className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {meta && (
              <SectionHeader icon={meta.icon} title={meta.label} info={meta.info} tag={meta.tag} hint={meta.hint} />
            )}
            {SectionView ? <SectionView /> : <p style={{ color: 'var(--ink-muted)' }}>Section not found.</p>}
          </div>
        )}
      </main>

      {/* ---- Toast ---- */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 950,
          background: 'var(--ink-strong)', color: '#fff', padding: '0.8rem 1.2rem', borderRadius: '99px',
          boxShadow: 'var(--shadow-lift)', fontSize: '0.85rem', fontWeight: 600, maxWidth: '90vw',
          borderLeft: `4px solid ${toast.tone === 'danger' ? 'var(--critical)' : toast.tone === 'success' ? 'var(--grass)' : 'var(--teal)'}`,
          animation: 'slideInUp 0.3s ease-out',
        }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
