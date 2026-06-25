import React, { useState } from 'react';
import { Camera, Mic, MapPin, Send, AlertTriangle, CheckCircle, Sparkles, ScanLine } from 'lucide-react';

const SAMPLE_PHOTO_LINKS = {
  pothole: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
  water_leak: 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&w=600&q=80',
  wiring: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80',
  garbage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
  drainage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
  debris: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80',
  road_sign: 'https://images.unsplash.com/photo-1500353391678-d7b57979d6d2?auto=format&fit=crop&w=600&q=80'
};

export default function SnapToSolve({ onIssueCreated }) {
  const [category, setCategory] = useState('pothole');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('12th Main Road, Indiranagar, Bengaluru');
  const [gps, setGps] = useState({ lat: 12.9716, lng: 77.5946 });
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTO_LINKS.pothole);

  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newGps = { lat: position.coords.latitude, lng: position.coords.longitude };
          setGps(newGps);
          setAddress(`Geo-located: Lat ${newGps.lat.toFixed(4)}, Lng ${newGps.lng.toFixed(4)}`);
        },
        () => alert('Could not retrieve browser GPS. Using preset demo coordinates.')
      );
    }
  };

  const handleVoiceRecord = () => {
    if (recording) {
      setRecording(false);
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        if (category === 'pothole') { setDescription('Large, deep pothole in the centre of the lane. Water logging inside it — a major hazard for motorbikes.'); setSeverity('high'); }
        else if (category === 'water_leak') { setDescription('Heavy pipeline leak gushing near the sidewalk. Clean drinking water flooding the road.'); setSeverity('high'); }
        else if (category === 'wiring') { setDescription('Downed electrical wire hanging low from the post. Sparks visible. Highly dangerous, blocking the walkway.'); setSeverity('RedAlert'); }
        else { setDescription('Reported issue, description compiled from multilingual speech intake.'); }
      }, 1500);
    } else {
      setRecording(true);
      setDescription('');
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    setPhotoUrl(SAMPLE_PHOTO_LINKS[val]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitResult(null);
    setAnalyzing(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, severity, description,
          location: {
            lat: gps.lat + (Math.random() - 0.5) * 0.001,
            lng: gps.lng + (Math.random() - 0.5) * 0.001,
            address,
            ward: gps.lat > 12.971 ? 'Ward 12 - Aero City' : 'Ward 4 - Green Park'
          },
          photoUrl, reporterReputation: 85
        })
      });
      const data = await response.json();
      setAnalyzing(false);
      if (response.ok) { setSubmitResult(data); onIssueCreated(data.issue); }
      else alert('Failed to report issue: ' + data.error);
    } catch (error) {
      setAnalyzing(false);
      console.error(error);
      alert('Error connecting to backend API');
    }
  };

  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Snap to report</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>One photo. The AI does the rest — no category dropdowns needed.</p>
      </div>

      {/* Big primary capture CTA */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{
            height: '230px',
            background: `linear-gradient(rgba(14,42,69,0.25), rgba(14,42,69,0.45)), url(${photoUrl}) center/cover`,
            borderRadius: 'var(--radius-card)',
            border: '2px dashed var(--cream-400)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* AI bounding box */}
            <div style={{
              position: 'absolute', top: '26%', left: '22%',
              border: '2px solid var(--teal)', borderRadius: '6px',
              padding: '0.2rem 0.5rem', background: 'rgba(26,169,160,.28)',
              color: '#fff', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
              animation: 'pulseGlow 2.4s infinite', display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}>
              <ScanLine size={12} /> {category.toUpperCase()} · {severity.toUpperCase()}
            </div>
            <button
              type="button"
              onClick={() => alert('Camera frame permission requested. On mobile this opens the live capture.')}
              style={{
                background: 'var(--ink-strong)', border: 'none', color: '#fff',
                borderRadius: 'var(--radius-ctl)', padding: '0.85rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                fontWeight: 700, fontSize: '1rem', boxShadow: 'var(--shadow-lift)', zIndex: 2
              }}
            >
              <Camera size={20} /> SNAP to report
            </button>
          </div>
          <span style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>Gemini classifies category & severity from the photo automatically.</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Voice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Or speak it (Hindi / English)</label>
              <button
                type="button" onClick={handleVoiceRecord}
                style={{
                  background: recording ? 'var(--critical-tint)' : 'var(--cream-100)',
                  border: `1px solid ${recording ? 'rgba(215,64,47,.4)' : 'var(--cream-300)'}`,
                  color: recording ? 'var(--critical)' : 'var(--teal-600)',
                  borderRadius: '99px', padding: '0.3rem 0.7rem', fontSize: '0.72rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600
                }}
              >
                <Mic size={12} style={{ animation: recording ? 'pulse 1s infinite' : 'none' }} />
                {recording ? 'Recording… tap to stop' : 'Voice report'}
              </button>
            </div>

            {recording && (
              <div className="sunken" style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '0 1rem' }}>
                {Array.from({ length: 26 }).map((_, idx) => (
                  <div key={idx} style={{ width: '4px', height: '6px', backgroundColor: 'var(--teal)', borderRadius: '4px', animation: 'soundwave 1.2s ease-in-out infinite', animationDelay: `${(idx % 6) * 0.12}s` }} />
                ))}
              </div>
            )}

            <textarea
              className="field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The AI fills this from your photo or voice. You can edit if needed."
              style={{ height: '92px', resize: 'none', fontSize: '0.88rem' }}
            />
          </div>

          {/* AI-filled fields (kept minimal & editable) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}>Category <span style={{ color: 'var(--teal-600)', fontWeight: 700 }}>· AI</span></label>
              <select className="field" value={category} onChange={handleCategoryChange}>
                <option value="pothole">Pothole / Road crack</option>
                <option value="water_leak">Water main leak</option>
                <option value="wiring">Downed utility wire</option>
                <option value="garbage">Garbage / Litter</option>
                <option value="drainage">Blocked drainage</option>
                <option value="debris">Construction debris</option>
                <option value="road_sign">Streetlight / Sign</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}>Severity <span style={{ color: 'var(--teal-600)', fontWeight: 700 }}>· AI</span></label>
              <select className="field" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="RedAlert">RedAlert (emergency)</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}>Location</label>
              <input className="field" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <button type="button" onClick={handleGetLocation} className="glow-btn-secondary" style={{ height: '42px' }}>
              <MapPin size={16} color="var(--teal)" /> GPS
            </button>
          </div>

          <button type="submit" className="glow-btn-primary" disabled={analyzing} style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '0.95rem' }}>
            {analyzing ? (<><Sparkles size={16} style={{ animation: 'spin 2s linear infinite' }} /> AI triaging & lodging…</>) : (<><Send size={16} /> Lodge grievance to Nidaan</>)}
          </button>
        </form>
      </div>

      {submitResult && (
        <div className="glass-panel animate-fade-in-up" style={{
          padding: '1.1rem', display: 'flex', gap: '0.85rem', alignItems: 'center',
          borderTop: `3px solid ${submitResult.deduplicated ? 'var(--alert)' : 'var(--grass)'}`,
          background: submitResult.deduplicated ? 'var(--alert-tint)' : 'var(--grass-tint)'
        }}>
          {submitResult.deduplicated ? (
            <>
              <AlertTriangle size={24} color="var(--alert)" />
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--ink-strong)' }}>Smart deduplication triggered</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                  An active ticket already exists nearby for {submitResult.issue.category.replace('_', ' ')}. Your report merged — community pressure rose to <strong style={{ color: 'var(--ink)' }}>{submitResult.issue.citizensAffected} reports</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle size={24} color="var(--grass)" />
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--ink-strong)' }}>Ticket created</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                  Logged as <strong style={{ color: 'var(--ink)' }}>{submitResult.issue.id}</strong>. The Resolution Orchestrator is triaging it now.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
