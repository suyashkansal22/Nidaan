import React, { useState } from 'react';
import { Shield, MapPin, Truck, HelpCircle, HardHat, Compass } from 'lucide-react';

export default function ResponderRadar({ issues, contractors, responders, onSelectIssue }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Bounds mapping helper to convert latitude/longitude coordinates to SVG viewBox (800x500)
  // seeded center is: Lat: 12.971598, Lng: 77.594562
  const mapWidth = 800;
  const mapHeight = 450;
  
  const getCoordinates = (lat, lng) => {
    // Relative range offset from center
    const latDiff = lat - 12.971598;
    const lngDiff = lng - 77.594562;
    
    // Scale factors to spread pins cleanly in the box
    const x = (mapWidth / 2) + (lngDiff * 35000);
    const y = (mapHeight / 2) - (latDiff * 35000); // Latitudes go up, SVG y goes down
    
    return { x, y };
  };

  const getIssueColor = (severity, status) => {
    if (status === 'verified') return 'hsl(var(--status-success))';
    if (severity === 'RedAlert') return 'hsl(var(--status-danger))';
    if (severity === 'high') return 'hsl(var(--status-warning))';
    return 'hsl(var(--status-info))';
  };

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Responder Radar Dispatch Grid</h2>
          <p style={{ fontSize: '0.85rem' }}>Tactical view of active issues, contractors, and municipal inspector units.</p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--status-danger))' }}></span>
            <span>RedAlert</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--status-warning))' }}></span>
            <span>Medium/High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--status-success))' }}></span>
            <span>Verified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--secondary))' }}></span>
            <span>Contractors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary))' }}></span>
            <span>Inspectors</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* SVG Tactical Radar Screen */}
        <div className="glass-panel" style={{
          position: 'relative',
          background: '#04060b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          aspectRatio: '16/9'
        }}>
          {/* Grid Matrix lines */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
            pointerEvents: 'none'
          }}></div>

          {/* Animated sweep line */}
          <div className="radar-sweep-line"></div>

          {/* Compass layout overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '320px',
            border: '1px solid rgba(0, 180, 216, 0.05)',
            borderRadius: '50%',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ width: '180px', height: '180px', border: '1px solid rgba(0, 180, 216, 0.03)', borderRadius: '50%' }}></div>
          </div>

          <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} style={{ width: '100%', height: '100%', display: 'block' }}>
            {/* Draw active dispatch route lines */}
            {issues.map(issue => {
              if (issue.status !== 'verified' && issue.assignedContractorId) {
                const contractor = contractors.find(c => c.id === issue.assignedContractorId);
                if (contractor) {
                  const pt1 = getCoordinates(issue.location.lat, issue.location.lng);
                  const pt2 = getCoordinates(contractor.location.lat, contractor.location.lng);
                  return (
                    <g key={`route-${issue.id}`}>
                      <line
                        x1={pt2.x}
                        y1={pt2.y}
                        x2={pt1.x}
                        y2={pt1.y}
                        stroke="hsla(var(--primary), 0.4)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        style={{ animation: 'dash 30s linear infinite' }}
                      />
                      <circle cx={pt1.x} cy={pt1.y} r="18" fill="none" stroke="hsla(var(--primary), 0.2)" strokeWidth="1">
                        <animate attributeName="r" values="8;24;8" dur="3s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                }
              }
              return null;
            })}

            {/* Render Contractors (Briefcase) */}
            {contractors.map(c => {
              const { x, y } = getCoordinates(c.location.lat, c.location.lng);
              return (
                <g
                  key={c.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setHoveredNode({ type: 'contractor', data: c })}
                  onMouseEnter={() => setHoveredNode({ type: 'contractor', data: c })}
                >
                  <circle cx="0" cy="0" r="10" fill="hsla(190, 90%, 50%, 0.15)" stroke="hsl(190, 90%, 50%)" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3" fill="hsl(190, 90%, 50%)" />
                </g>
              );
            })}

            {/* Render Responders (Inspectors) */}
            {responders.map(r => {
              const { x, y } = getCoordinates(r.location.lat, r.location.lng);
              return (
                <g
                  key={r.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setHoveredNode({ type: 'responder', data: r })}
                  onMouseEnter={() => setHoveredNode({ type: 'responder', data: r })}
                >
                  <circle cx="0" cy="0" r="8" fill="hsla(263, 85%, 65%, 0.15)" stroke="hsl(263, 85%, 65%)" strokeWidth="1.5" />
                  <polygon points="0,-4 3,2 -3,2" fill="hsl(263, 85%, 65%)" />
                </g>
              );
            })}

            {/* Render Issues */}
            {issues.map(issue => {
              const { x, y } = getCoordinates(issue.location.lat, issue.location.lng);
              const color = getIssueColor(issue.severity, issue.status);
              const isVerified = issue.status === 'verified';
              
              return (
                <g
                  key={issue.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setHoveredNode({ type: 'issue', data: issue });
                    onSelectIssue(issue);
                  }}
                  onMouseEnter={() => setHoveredNode({ type: 'issue', data: issue })}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={isVerified ? "7" : "9"}
                    fill={isVerified ? "rgba(16, 185, 129, 0.15)" : issue.severity === 'RedAlert' ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.15)"}
                    stroke={color}
                    strokeWidth="2"
                  />
                  {issue.severity === 'RedAlert' && issue.status !== 'verified' && (
                    <circle cx="0" cy="0" r="16" fill="none" stroke="hsl(var(--status-danger))" strokeWidth="1" opacity="0.6">
                      <animate attributeName="r" values="8;18;8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx="0" cy="0" r="2" fill="#fff" />
                </g>
              );
            })}
          </svg>

          {/* Interactive Node Info Overlay (Tooltip Panel) */}
          {hoveredNode && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'rgba(10, 11, 16, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              maxWidth: '300px',
              zIndex: 10,
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)',
              animation: 'slideInUp 0.15s ease-out'
            }}>
              {hoveredNode.type === 'issue' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-mono)' }}>#{hoveredNode.data.id}</span>
                    <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: getIssueColor(hoveredNode.data.severity, hoveredNode.data.status) + '22', color: getIssueColor(hoveredNode.data.severity, hoveredNode.data.status), borderColor: getIssueColor(hoveredNode.data.severity, hoveredNode.data.status) + '44' }}>
                      {hoveredNode.data.severity.toUpperCase()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>{hoveredNode.data.category.toUpperCase().replace('_', ' ')}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>{hoveredNode.data.description}</p>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                    Status: <strong style={{ color: 'hsl(var(--secondary))' }}>{hoveredNode.data.status.replace('_', ' ')}</strong>
                  </div>
                </div>
              )}

              {hoveredNode.type === 'contractor' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <HardHat size={14} color="hsl(var(--secondary))" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{hoveredNode.data.name}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.25rem' }}>
                    Specialties: {hoveredNode.data.specialties.join(', ')}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                    <span>Rating: ⭐{hoveredNode.data.rating}</span>
                    <span>Jobs: {hoveredNode.data.completedJobs} done</span>
                  </div>
                </div>
              )}

              {hoveredNode.type === 'responder' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Truck size={14} color="hsl(var(--primary))" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{hoveredNode.data.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                    Role: {hoveredNode.data.role.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: hoveredNode.data.status === 'available' ? 'hsl(var(--status-success))' : 'hsl(var(--status-warning))', marginTop: '0.25rem' }}>
                    Status: {hoveredNode.data.status.toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
