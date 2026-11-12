// Crosshair and hook status label. DOM only, reads values passed in, never writes state.
// The crosshair sits above screen centre (AIM_NDC_Y) so it is not on the walker's back.
export const AIM_NDC_Y = 0.3;

export function createAim(parentEl) {
  if (typeof document === 'undefined' || !parentEl) return { update() {} };

  const cross = document.createElement('div');
  Object.assign(cross.style, {
    position: 'absolute',
    left: '50%',
    top: `${50 - AIM_NDC_Y * 50}%`,
    width: '18px',
    height: '18px',
    marginLeft: '-9px',
    marginTop: '-9px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 11,
    transition: 'border-color 80ms, transform 80ms'
  });
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position: 'absolute', left: '50%', top: '50%', width: '4px', height: '4px',
    marginLeft: '-2px', marginTop: '-2px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)'
  });
  cross.appendChild(dot);

  const label = document.createElement('div');
  Object.assign(label.style, {
    position: 'absolute', left: '50%', bottom: '42px', transform: 'translateX(-50%)',
    font: '600 11px/1 -apple-system, Segoe UI, sans-serif', letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 3px rgba(0,0,0,0.6)',
    pointerEvents: 'none', zIndex: 11
  });

  parentEl.appendChild(cross);
  parentEl.appendChild(label);

  return {
    // enabled: hook on; inRange: aim ray hits terrain within range
    update(enabled, inRange) {
      cross.style.display = enabled ? 'block' : 'none';
      cross.style.borderColor = inRange ? 'rgba(255,190,90,0.95)' : 'rgba(255,255,255,0.35)';
      cross.style.transform = inRange ? 'scale(1.15)' : 'scale(1)';
      label.textContent = enabled ? 'HOOK ON  (G)' : 'HOOK OFF  (G)';
      label.style.opacity = enabled ? '0.9' : '0.55';
    }
  };
}
