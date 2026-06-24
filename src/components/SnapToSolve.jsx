import React, { useState } from 'react';
import { Camera, Mic, MapPin, Send, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

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

  // Trigger browser geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newGps = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setGps(newGps);
          setAddress(`Geo-located: Lat ${newGps.lat.toFixed(4)}, Lng ${newGps.lng.toFixed(4)}`);
        },
        (error) => {
          console.warn('Geolocation error, using defaults.', error);
          alert('Could not retrieve browser GPS. Using preset demo coordinates.');
        }
      );
    }
  };

  // Simulate speaking and having Gemini transcribe + triage description
  const handleVoiceRecord = () => {
    if (recording) {
      setRecording(false);
      setAnalyzing(true);
      
      // Simulate transcription and triage latency
      setTimeout(() => {
        setAnalyzing(false);
        if (category === 'pothole') {
          setDescription('There is a large, deep pothole in the center of the lane. Water is logging inside it, creating a major safety hazard for motorbikes passing here.');
          setSeverity('high');
        } else if (category === 'water_leak') {
          setDescription('Heavy water pipeline leakage gushing out near the sidewalk. It is clean drinking water flooding the road and creating a massive pool.');
          setSeverity('high');
        } else if (category === 'wiring') {
          setDescription('Downed electrical wire is hanging low from the post. Sparks visible. Highly dangerous, blocking the walkway!');
          setSeverity('RedAlert');
        } else {
          setDescription('Reported issue with description compiled from multilingual speech intake.');
        }
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
          category,
          severity,
          description,
          location: {
            lat: gps.lat + (Math.random() - 0.5) * 0.001, // add minor jitter
            lng: gps.lng + (Math.random() - 0.5) * 0.001,
            address,
            ward: gps.lat > 12.971 ? 'Ward 12 - Aero City' : 'Ward 4 - Green Park'
          },
          photoUrl,
          reporterReputation: 85
        })
      });

      const data = await response.json();
      setAnalyzing(false);

      if (response.ok) {
        setSubmitResult(data);
        onIssueCreated(data.issue);
      } else {
        alert('Failed to report issue: ' + data.error);
      }
    } catch (error) {
      setAnalyzing(false);
      console.error(error);
      alert('Error connecting to backend API');
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Snap-to-Solve Grid Intake</h2>
        <p style={{ fontSize: '0.9rem' }}>Capture, describe, and lodge complaints. Gemini handles categorization and triage.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Upload Visual Mock-Up */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
            Visual Capture (Photo / Video Triage)
          </label>
          <div style={{
            height: '240px',
            background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${photoUrl}) center/cover`,
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Nano Banana AI Bounding Box simulator */}
            <div style={{
              position: 'absolute',
              border: '2px solid hsl(var(--secondary))',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              background: 'rgba(0, 180, 216, 0.25)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              top: '30%',
              left: '25%',
              animation: 'pulseGlow 2s infinite'
            }}>
              [GEMINI NANO: {category.toUpperCase()} SEVERITY={severity.toUpperCase()}]
            </div>

            <div style={{ display: 'flex', gap: '1rem', zIndex: 10 }}>
              <button
                type="button"
                style={{
                  background: 'rgba(10, 11, 16, 0.85)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Camera frame permission requested. AI Studio Camera Frame will capture on mobile.')}
              >
                <Camera size={16} />
                Lodge Snap
              </button>
            </div>
          </div>
        </div>

        {/* Input Details */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Category Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category</label>
              <select
                value={category}
                onChange={handleCategoryChange}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              >
                <option value="pothole">Pothole / Road Crack</option>
                <option value="water_leak">Water Main Leak</option>
                <option value="wiring">Downed Utility Wire</option>
                <option value="garbage">Garbage / Litter Dump</option>
                <option value="drainage">Blocked Sewer/Drainage</option>
                <option value="debris">Construction Debris</option>
                <option value="road_sign">Broken Streetlight / Sign</option>
              </select>
            </div>

            {/* Severity Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reported Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              >
                <option value="low">Low (Routine maintenance)</option>
                <option value="medium">Medium (Requires attention)</option>
                <option value="high">High (Action within 12 hours)</option>
                <option value="RedAlert">RedAlert (Immediate emergency)</option>
              </select>
            </div>
          </div>

          {/* Voice Triage and Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Report Description</label>
              
              {/* Voice Button */}
              <button
                type="button"
                onClick={handleVoiceRecord}
                style={{
                  background: recording ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${recording ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: recording ? 'hsl(var(--status-danger))' : 'hsl(var(--secondary))',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Mic size={12} style={{ animation: recording ? 'pulse 1s infinite' : 'none' }} />
                {recording ? 'Recording Speak... (Click Stop)' : 'Multilingual Voice Report'}
              </button>
            </div>

            {recording && (
              <div style={{
                height: '60px',
                background: 'rgba(10, 11, 16, 0.6)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '0 1rem',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
              }}>
                {Array.from({ length: 24 }).map((_, idx) => {
                  const animDelay = `${(idx % 6) * 0.12}s`;
                  return (
                    <div key={idx} style={{
                      width: '4px',
                      height: '6px',
                      backgroundColor: 'hsl(var(--status-danger))',
                      boxShadow: '0 0 8px hsla(var(--status-danger), 0.6)',
                      borderRadius: '4px',
                      animation: 'soundwave 1.2s ease-in-out infinite',
                      animationDelay: animDelay
                    }}></div>
                  );
                })}
              </div>
            )}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue. (Or use the Multilingual Voice Report button above to transcribe spoken inputs via Gemini Live API)"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                height: '100px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Location details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Location Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'hsl(var(--text-primary))',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                height: '46px'
              }}
            >
              <MapPin size={16} color="hsl(var(--secondary))" />
              Auto GPS
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="glow-btn-primary"
            disabled={analyzing}
            style={{ width: '100%', justifyContent: 'center', height: '48px', opacity: analyzing ? 0.7 : 1 }}
          >
            {analyzing ? (
              <>
                <Sparkles size={16} style={{ animation: 'spin 2s linear infinite' }} />
                AI Triaging & Lodging...
              </>
            ) : (
              <>
                <Send size={16} />
                Lodge Grievance to Nidaan
              </>
            )}
          </button>

        </form>
      </div>

      {/* Success / Deduplication result alerts */}
      {submitResult && (
        <div className="glass-panel animate-fade-in-up" style={{
          padding: '1.25rem',
          background: submitResult.deduplicated 
            ? 'linear-gradient(90deg, rgba(245,158,11,0.08) 0%, rgba(15,18,28,0.45) 100%)'
            : 'linear-gradient(90deg, rgba(16,185,129,0.08) 0%, rgba(15,18,28,0.45) 100%)',
          border: `1px solid ${submitResult.deduplicated ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {submitResult.deduplicated ? (
            <>
              <AlertTriangle size={24} color="hsl(var(--status-warning))" />
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'hsl(var(--status-warning))' }}>Smart Deduplication Triggered</h3>
                <p style={{ fontSize: '0.85rem' }}>
                  An active ticket already exists near your location for {submitResult.issue.category.toUpperCase()}. 
                  Your report has been merged, and the community pressure rating is increased to <strong>{submitResult.issue.citizensAffected} support votes</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle size={24} color="hsl(var(--status-success))" />
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'hsl(var(--status-success))' }}>Ticket Created Successfully</h3>
                <p style={{ fontSize: '0.85rem' }}>
                  Grievance logged under ID <strong>{submitResult.issue.id}</strong>. The Resolution Orchestrator is triaging the incident in the background.
                </p>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
