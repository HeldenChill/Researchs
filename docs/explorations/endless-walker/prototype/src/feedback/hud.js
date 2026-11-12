export function createHud(el) {
  let canvas = null;
  let ctx = null;

  if (el) {
    canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 10;
    canvas.style.width = '320px';
    canvas.style.height = '10px';
    canvas.style.display = 'block';
    canvas.style.borderRadius = '2px';
    canvas.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    el.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }

  return {
    update(state, config) {
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;
      const maxStam = config.staminaMax;

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = 'rgba(20, 24, 30, 0.7)';
      ctx.fillRect(0, 0, w, h);

      // Stamina bar (white)
      const currentStam = Math.max(0, state.stamina);
      const stamWidth = Math.min(w, (currentStam / maxStam) * w);
      if (stamWidth > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, stamWidth, h);
      }

      // Blocked load area (hatched grey)
      const currentLoad = Math.max(0, state.load);
      const blockedWidth = (currentLoad / maxStam) * w;
      if (blockedWidth > 0) {
        const startX = w - blockedWidth;
        ctx.save();
        ctx.beginPath();
        ctx.rect(startX, 0, blockedWidth, h);
        ctx.clip();

        ctx.fillStyle = '#4a5568';
        ctx.fillRect(startX, 0, blockedWidth, h);

        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1.5;
        for (let x = startX - h; x < w + h; x += 4) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + h, h);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  };
}
