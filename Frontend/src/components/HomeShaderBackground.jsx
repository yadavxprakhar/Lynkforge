import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function rand(seed) {
  // deterministic-ish PRNG (mulberry32)
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const DEFAULT_COLORS = [
  "#2563eb", // blue
  "#4f46e5", // indigo
  "#a78bfa", // violet
  "#38bdf8", // sky
  "#06b6d4", // cyan
];

/**
 * Canvas2D “shader-like” background: animated blobs + screen blend.
 * Full-bleed, pointer-events none.
 */
export default function HomeShaderBackground({
  className = "",
  intensity = 0.85,
  blurPx = 34,
  colors = DEFAULT_COLORS,
}) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const palette = useMemo(() => colors.filter(Boolean), [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { alpha: true, desynchronized: true });
    if (!offCtx) return;

    const prng = rand(1337);

    let raf = 0;
    let w = 1;
    let h = 1;
    let dpr = 1;
    let last = performance.now();
    let t = 0;

    const blobCount = 6;
    const blobs = Array.from({ length: blobCount }).map((_, i) => {
      const c = palette[i % palette.length] ?? "#2563eb";
      return {
        color: c,
        phase: prng() * Math.PI * 2,
        speed: 0.06 + prng() * 0.09,
        r: 0.22 + prng() * 0.22,
        // base positions (0..1)
        bx: prng(),
        by: prng(),
      };
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      // Render at lower internal res for perf, then upscale.
      const scale = 0.6;
      off.width = Math.max(1, Math.floor(w * dpr * scale));
      off.height = Math.max(1, Math.floor(h * dpr * scale));

      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function drawBackground(targetCtx, width, height) {
      // deep navy base (kept subtle so stars/globe still read)
      targetCtx.globalCompositeOperation = "source-over";
      targetCtx.fillStyle = "rgba(5, 10, 20, 1)";
      targetCtx.fillRect(0, 0, width, height);

      // faint vignette
      const vignette = targetCtx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        Math.min(width, height) * 0.15,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.45)");
      targetCtx.fillStyle = vignette;
      targetCtx.fillRect(0, 0, width, height);
    }

    function drawBlobs(targetCtx, width, height, time) {
      targetCtx.globalCompositeOperation = "screen";

      const s = clamp01(intensity);
      for (const b of blobs) {
        const x =
          (b.bx +
            0.16 * Math.cos(time * b.speed + b.phase) +
            0.08 * Math.sin(time * (b.speed * 0.7) + b.phase * 1.3)) %
          1;
        const y =
          (b.by +
            0.18 * Math.sin(time * b.speed + b.phase) +
            0.06 * Math.cos(time * (b.speed * 0.85) + b.phase * 0.8)) %
          1;

        const cx = width * (0.1 + 0.8 * x);
        const cy = height * (0.05 + 0.9 * y);
        const rr = Math.max(width, height) * b.r;

        const g = targetCtx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, `${b.color}CC`);
        g.addColorStop(0.55, `${b.color}33`);
        g.addColorStop(1, `${b.color}00`);

        targetCtx.fillStyle = g;
        targetCtx.globalAlpha = 0.5 * s;
        targetCtx.beginPath();
        targetCtx.arc(cx, cy, rr, 0, Math.PI * 2);
        targetCtx.fill();
      }
      targetCtx.globalAlpha = 1;
      targetCtx.globalCompositeOperation = "source-over";
    }

    function drawGrain(targetCtx, width, height, time) {
      // tiny animated grain: sparse, very low alpha
      const step = 28;
      targetCtx.globalCompositeOperation = "overlay";
      targetCtx.globalAlpha = 0.05;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const n = Math.sin((x * 12.9898 + y * 78.233 + time * 0.8) * 0.015);
          const a = (n * 0.5 + 0.5) * 0.8;
          targetCtx.fillStyle = `rgba(255,255,255,${a})`;
          targetCtx.fillRect(x, y, 1, 1);
        }
      }
      targetCtx.globalAlpha = 1;
      targetCtx.globalCompositeOperation = "source-over";
    }

    function render(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      const ow = off.width;
      const oh = off.height;

      offCtx.setTransform(1, 0, 0, 1, 0, 0);
      offCtx.clearRect(0, 0, ow, oh);
      drawBackground(offCtx, ow, oh);

      // Use a slower time scale to feel “gel-like”
      drawBlobs(offCtx, ow, oh, t * 0.85);

      // upscale + blur into main canvas
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.filter = `blur(${Math.max(0, blurPx)}px)`;
      ctx.drawImage(off, 0, 0, w, h);
      ctx.restore();

      // add subtle grain on top
      ctx.save();
      ctx.filter = "none";
      drawGrain(ctx, w, h, t);
      ctx.restore();

      if (!reduceMotion) {
        raf = requestAnimationFrame(render);
      }
    }

    // Initial render (and animate unless reduced motion)
    render(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [palette, reduceMotion, intensity, blurPx]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={[
        "absolute inset-0 h-full w-full",
        "opacity-[0.72]",
        className,
      ].join(" ")}
    />
  );
}

