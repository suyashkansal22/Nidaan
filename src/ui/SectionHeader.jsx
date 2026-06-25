import React from 'react';
import InfoButton from './InfoButton.jsx';

/*
  SectionHeader — the consistent "one job per screen" header rendered above every
  section body: title + the "i" InfoButton (+ optional rubric tag) + a one-line
  "what to do here" hint. `action` is an optional right-aligned focal control.
*/
export default function SectionHeader({ icon: Icon, title, info, tag, hint, action }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '1rem', flexWrap: 'wrap', marginBottom: '0.25rem',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {Icon && (
            <span style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-ctl)',
              background: 'var(--teal-tint)', border: '1px solid rgba(26,169,160,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={19} color="var(--teal-600)" />
            </span>
          )}
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--ink-strong)', letterSpacing: '-0.01em' }}>
            {title}
          </h1>
          {info && <InfoButton text={info} tag={tag} />}
        </div>
        {hint && (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: '0.4rem 0 0', paddingLeft: Icon ? '2.9rem' : 0 }}>
            {hint}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
