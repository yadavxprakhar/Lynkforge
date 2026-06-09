import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useStoreContext } from "../contextApi/ContextApi";

// Linear interpolation helper
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// Pseudo-random deterministic generator for consistent starting values
function rand(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const DARK_THEME_COLORS = [
  { r: 255, g: 255, b: 255 },   // Pure White
  { r: 212, g: 212, b: 212 },   // Gray 300
  { r: 163, g: 163, b: 163 },   // Gray 400
  { r: 115, g: 115, b: 115 },   // Gray 500
  { r: 255, g: 255, b: 255 },   // Pure White
];

const LIGHT_THEME_COLORS = [
  { r: 243, g: 244, b: 246 },  // Gray 100
  { r: 229, g: 231, b: 235 },  // Gray 200
  { r: 209, g: 213, b: 219 },  // Gray 300
  { r: 156, g: 163, b: 175 },  // Gray 400
  { r: 243, g: 244, b: 246 },  // Gray 100
];

export default function FluidMotionBackground({ intensity = 0.85, blurPx = 40 }) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { theme } = useStoreContext();
  const isDark = theme === "dark";

  const activeColors = useMemo(() => {
    return isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    // Offscreen canvas for lower internal resolution rendering (performance optimization)
    const offscreen = document.createElement("canvas");
    const offscreenCtx = offscreen.getContext("2d", { alpha: true, desynchronized: true });
    if (!offscreenCtx) return;

    const prng = rand(42);
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = performance.now();
    let animationFrameId = 0;
    let gridOffset = 0;
    let globeAngleY = 0;
    let globeAngleX = 0.25; // Constant tilt

    // Mouse coordinates tracking (normalized 0 to 1)
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, active: false };

    // 1. Generate 120 points on sphere using Fibonacci distribution
    const count = 120;
    const globePoints = [];
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = 2.399963229728653 * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      globePoints.push({ x, y, z });
    }

    // 2. Generate horizontal latitudes & vertical longitudes wireframe rings
    const rings = [];
    const lats = [-0.65, -0.3, 0, 0.3, 0.65];
    lats.forEach((latY) => {
      const ringPoints = [];
      const ringRadius = Math.sqrt(1 - latY * latY);
      const segments = 40;
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI * 2;
        ringPoints.push({
          x: Math.cos(phi) * ringRadius,
          y: latY,
          z: Math.sin(phi) * ringRadius,
        });
      }
      rings.push(ringPoints);
    });

    const longs = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
    longs.forEach((rotY) => {
      const ringPoints = [];
      const segments = 40;
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI * 2;
        const rawX = Math.cos(phi);
        const rawY = Math.sin(phi);
        ringPoints.push({
          x: rawX * Math.cos(rotY),
          y: rawY,
          z: rawX * Math.sin(rotY),
        });
      }
      rings.push(ringPoints);
    });

    // 3. Generate 8 connection arcs with active pulses
    const arcs = [];
    for (let k = 0; k < 8; k++) {
      const idxA = Math.floor(prng() * count);
      let idxB = Math.floor(prng() * count);
      if (idxA === idxB) idxB = (idxA + 1) % count;
      const pA = globePoints[idxA];
      const pB = globePoints[idxB];
      
      const arcPoints = [];
      const steps = 24;
      const heightOffset = 0.08 + prng() * 0.12;
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        let ix = pA.x + t * (pB.x - pA.x);
        let iy = pA.y + t * (pB.y - pA.y);
        let iz = pA.z + t * (pB.z - pA.z);
        const len = Math.sqrt(ix * ix + iy * iy + iz * iz);
        const factor = (1 + Math.sin(t * Math.PI) * heightOffset) / len;
        arcPoints.push({
          x: ix * factor,
          y: iy * factor,
          z: iz * factor,
        });
      }
      arcs.push({
        points: arcPoints,
        progress: prng(),
        speed: 0.18 + prng() * 0.22,
        color: k % 2 === 0 ? "#A3A3A3" : "#525252",
      });
    }

    // Setup 5 floating background blobs
    const blobs = Array.from({ length: 5 }).map((_, i) => {
      const color = activeColors[i % activeColors.length];
      return {
        color,
        phaseX: prng() * Math.PI * 2,
        phaseY: prng() * Math.PI * 2,
        speedX: 0.10 + prng() * 0.06,
        speedY: 0.10 + prng() * 0.06,
        radius: 0.24 + prng() * 0.14,
        baseX: 0.15 + prng() * 0.7,
        baseY: 0.15 + prng() * 0.7,
        x: 0,
        y: 0,
        renderX: 0,
        renderY: 0,
      };
    });

    // Setup 60 space background stars
    const particles = Array.from({ length: 60 }).map(() => {
      return {
        x: prng(),
        y: prng(),
        size: 0.4 + prng() * 1.4,
        speedY: 0.01 + prng() * 0.015,
        opacity: 0.15 + prng() * 0.55,
      };
    });

    function handleResize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      const internalScale = 0.55; // Render at 55% scale for GPU fill-rate efficiency
      offscreen.width = Math.max(1, Math.floor(width * dpr * internalScale));
      offscreen.height = Math.max(1, Math.floor(height * dpr * internalScale));

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    handleResize();

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = (e.clientX - rect.left) / width;
      mouse.targetY = (e.clientY - rect.top) / height;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

    function drawBaseBackground(cCtx, w, h) {
      cCtx.globalCompositeOperation = "source-over";
      cCtx.fillStyle = isDark ? "#000000" : "#ffffff";
      cCtx.fillRect(0, 0, w, h);
    }

    function drawParallaxStars(cCtx, w, h, dt) {
      cCtx.globalCompositeOperation = "source-over";
      particles.forEach((p) => {
        p.y += p.speedY * dt * intensity;
        if (p.y > 1) {
          p.y = 0;
          p.x = Math.random();
        }

        const px = p.x * w + (mouse.x - 0.5) * 45 * p.size;
        const py = p.y * h + (mouse.y - 0.5) * 25 * p.size;

        cCtx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${p.opacity})`
          : `rgba(0, 0, 0, ${p.opacity * 0.4})`;

        cCtx.beginPath();
        cCtx.arc(px, py, p.size, 0, Math.PI * 2);
        cCtx.fill();
      });
    }

    function drawPerspectiveGrid(cCtx, w, h) {
      cCtx.globalCompositeOperation = "source-over";
      
      const horizonY = h * 0.42;
      const cameraX = w * 0.5 + (mouse.x - 0.5) * 65;
      const cameraY = horizonY + (mouse.y - 0.5) * 20;

      const gridGrad = cCtx.createLinearGradient(0, cameraY, 0, h);
      if (isDark) {
        gridGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        gridGrad.addColorStop(0.15, "rgba(255, 255, 255, 0.01)");
        gridGrad.addColorStop(1, "rgba(255, 255, 255, 0.08)");
      } else {
        gridGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        gridGrad.addColorStop(0.15, "rgba(0, 0, 0, 0.01)");
        gridGrad.addColorStop(1, "rgba(0, 0, 0, 0.05)");
      }

      cCtx.strokeStyle = gridGrad;
      cCtx.lineWidth = 1;

      const rayCount = 24;
      for (let i = -rayCount; i <= rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 0.42;
        const targetX = cameraX + Math.sin(angle) * w * 2.5;
        const targetY = h;

        cCtx.beginPath();
        cCtx.moveTo(cameraX, cameraY);
        cCtx.lineTo(targetX, targetY);
        cCtx.stroke();
      }

      const horizontalLineCount = 16;
      for (let i = 0; i < horizontalLineCount; i++) {
        const progress = (i + gridOffset) / horizontalLineCount;
        const y = cameraY + Math.pow(progress, 3.2) * (h - cameraY);

        cCtx.beginPath();
        cCtx.moveTo(0, y);
        cCtx.lineTo(w, y);
        cCtx.stroke();
      }
    }

    function draw3DGlobe(cCtx, w, h, dt) {
      globeAngleY += 0.07 * dt * intensity;

      const targetAngleX = 0.25 + (mouse.y - 0.5) * 0.12;
      globeAngleX = lerp(globeAngleX, targetAngleX, 0.05);

      const isMobile = w < 480;
      const globeCenter = {
        x: isMobile ? w * 0.5 : w * 0.78,
        y: isMobile ? h * 0.38 : h * 0.44,
      };
      const globeRadius = Math.min(w, h) * (isMobile ? 0.38 : 0.25);

      const cosY = Math.cos(globeAngleY);
      const sinY = Math.sin(globeAngleY);
      const cosX = Math.cos(globeAngleX);
      const sinX = Math.sin(globeAngleX);

      function project(p) {
        // Rotate Y
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        
        // Rotate X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const fov = 2.0;
        const scale = fov / (fov + z2);
        
        const px = globeCenter.x + x1 * globeRadius * scale;
        const py = globeCenter.y + y2 * globeRadius * scale;
        
        return { x: px, y: py, z: z2, scale };
      }

      // Project all structural layers
      const projectedPoints = globePoints.map(p => project(p));
      const projectedRings = rings.map(ring => ring.map(p => project(p)));
      const projectedArcs = arcs.map(arc => ({
        ...arc,
        projectedPoints: arc.points.map(p => project(p))
      }));

      // PASS 1: BACK SIDE (z > 0)
      cCtx.lineWidth = 1;
      
      // Back rings
      projectedRings.forEach(ring => {
        cCtx.beginPath();
        let first = true;
        for (let i = 0; i < ring.length; i++) {
          const p = ring[i];
          if (p.z > 0) {
            if (first) {
              cCtx.moveTo(p.x, p.y);
              first = false;
            } else {
              cCtx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        cCtx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.03)";
        cCtx.stroke();
      });

      // Back arcs
      projectedArcs.forEach(arc => {
        cCtx.beginPath();
        let first = true;
        for (let i = 0; i < arc.projectedPoints.length; i++) {
          const p = arc.projectedPoints[i];
          if (p.z > 0.08) {
            if (first) {
              cCtx.moveTo(p.x, p.y);
              first = false;
            } else {
              cCtx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        cCtx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.04)";
        cCtx.stroke();
      });

      // Back points
      projectedPoints.forEach(p => {
        if (p.z > 0) {
          const sz = 1.0 * p.scale;
          cCtx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${0.12 * p.scale})`
            : `rgba(0, 0, 0, ${0.06 * p.scale})`;
          cCtx.beginPath();
          cCtx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          cCtx.fill();
        }
      });

      // PASS 2: FRONT SIDE (z <= 0)
      // Front rings
      projectedRings.forEach(ring => {
        cCtx.beginPath();
        let first = true;
        for (let i = 0; i < ring.length; i++) {
          const p = ring[i];
          if (p.z <= 0) {
            if (first) {
              cCtx.moveTo(p.x, p.y);
              first = false;
            } else {
              cCtx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        cCtx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.24)" : "rgba(0, 0, 0, 0.12)";
        cCtx.stroke();
      });

      // Front arcs
      projectedArcs.forEach(arc => {
        cCtx.beginPath();
        let first = true;
        for (let i = 0; i < arc.projectedPoints.length; i++) {
          const p = arc.projectedPoints[i];
          if (p.z <= 0.08) {
            if (first) {
              cCtx.moveTo(p.x, p.y);
              first = false;
            } else {
              cCtx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        cCtx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.36)" : "rgba(0, 0, 0, 0.18)";
        cCtx.stroke();
      });

      // Front points
      projectedPoints.forEach(p => {
        if (p.z <= 0) {
          const sz = 1.3 * p.scale;
          cCtx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${0.68 * p.scale})`
            : `rgba(0, 0, 0, ${0.40 * p.scale})`;
          cCtx.beginPath();
          cCtx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          cCtx.fill();

          if (p.z < -0.6) {
            cCtx.fillStyle = isDark ? "#ffffff" : "#000000";
            cCtx.beginPath();
            cCtx.arc(p.x, p.y, sz * 0.5, 0, Math.PI * 2);
            cCtx.fill();
          }
        }
      });

      // Data packets along arcs
      projectedArcs.forEach((arc) => {
        arc.progress += arc.speed * dt * intensity;
        if (arc.progress > 1) {
          arc.progress = 0;
          arc.speed = 0.14 + Math.random() * 0.18;
        }

        const ptCount = arc.projectedPoints.length;
        const exactIndex = arc.progress * (ptCount - 1);
        const index = Math.floor(exactIndex);
        const nextIndex = Math.min(ptCount - 1, index + 1);
        const ratio = exactIndex - index;

        const p1 = arc.projectedPoints[index];
        const p2 = arc.projectedPoints[nextIndex];

        if (p1 && p2) {
          const px = p1.x + ratio * (p2.x - p1.x);
          const py = p1.y + ratio * (p2.y - p1.y);
          const pz = p1.z + ratio * (p2.z - p1.z);
          const pScale = p1.scale + ratio * (p2.scale - p1.scale);

          const isVisible = pz <= 0.15;
          if (isVisible) {
            cCtx.fillStyle = isDark ? "#ffffff" : arc.color;
            cCtx.shadowColor = arc.color;
            cCtx.shadowBlur = isDark ? 6 * pScale : 0;
            
            cCtx.beginPath();
            cCtx.arc(px, py, 2.5 * pScale, 0, Math.PI * 2);
            cCtx.fill();
            
            cCtx.shadowBlur = 0;
          }
        }
      });
    }

    function updateBlobs(w, h, dt) {
      mouse.x = lerp(mouse.x, mouse.targetX, 0.08);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.08);

      blobs.forEach((blob) => {
        blob.phaseX += blob.speedX * dt * intensity;
        blob.phaseY += blob.speedY * dt * intensity;

        const xOffset = Math.sin(blob.phaseX) * 0.15;
        const yOffset = Math.cos(blob.phaseY) * 0.15;

        blob.x = blob.baseX + xOffset;
        blob.y = blob.baseY + yOffset;

        let targetRenderX = blob.x * w;
        let targetRenderY = blob.y * h;

        if (mouse.active) {
          const mX = mouse.x * w;
          const mY = mouse.y * h;
          const dx = mX - targetRenderX;
          const dy = mY - targetRenderY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.max(w, h) * 0.35;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 75 * intensity;
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            targetRenderX += Math.cos(angle) * force;
            targetRenderY += Math.sin(angle) * force;
          }
        }

        blob.renderX = lerp(blob.renderX, targetRenderX, 0.1);
        blob.renderY = lerp(blob.renderY, targetRenderY, 0.1);
      });
    }

    function drawBlobs(cCtx, w, h) {
      cCtx.globalCompositeOperation = isDark ? "screen" : "multiply";

      blobs.forEach((blob) => {
        const rad = Math.max(w, h) * blob.radius;
        const gradient = cCtx.createRadialGradient(
          blob.renderX,
          blob.renderY,
          0,
          blob.renderX,
          blob.renderY,
          rad
        );

        const alpha = isDark ? 0.22 : 0.32;
        gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`);

        cCtx.fillStyle = gradient;
        cCtx.beginPath();
        cCtx.arc(blob.renderX, blob.renderY, rad, 0, Math.PI * 2);
        cCtx.fill();
      });
    }

    function drawGrain(cCtx, w, h) {
      cCtx.globalCompositeOperation = "overlay";
      const grainSize = 2;
      cCtx.fillStyle = isDark ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0.02)";
      for (let i = 0; i < 6000; i++) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        cCtx.fillRect(gx, gy, grainSize, grainSize);
      }
    }

    function renderLoop(now) {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      gridOffset = (gridOffset + 0.35 * dt * intensity) % 1;

      const ow = offscreen.width;
      const oh = offscreen.height;

      // 1. Render blurred background blobs on offscreen canvas
      offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
      offscreenCtx.clearRect(0, 0, ow, oh);
      updateBlobs(ow, oh, dt);
      drawBlobs(offscreenCtx, ow, oh);

      // 2. Clear main canvas and draw solid background color
      ctx.clearRect(0, 0, width, height);
      drawBaseBackground(ctx, width, height);

      // 3. Paint blurred offscreen blobs onto the main canvas
      ctx.save();
      ctx.filter = `blur(${blurPx}px)`;
      ctx.drawImage(offscreen, -12, -12, width + 24, height + 24);
      ctx.restore();

      // 4. Draw sharp elements directly on the main canvas
      drawParallaxStars(ctx, width, height, dt);
      drawPerspectiveGrid(ctx, width, height);
      draw3DGlobe(ctx, width, height, dt);

      // 5. Film grain overlay drawn on top
      ctx.save();
      ctx.filter = "none";
      drawGrain(ctx, width, height);
      ctx.restore();

      if (!reduceMotion) {
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    }

    if (reduceMotion) {
      const ow = offscreen.width;
      const oh = offscreen.height;
      updateBlobs(ow, oh, 1.0);
      drawBlobs(offscreenCtx, ow, oh);

      ctx.clearRect(0, 0, width, height);
      drawBaseBackground(ctx, width, height);

      ctx.save();
      ctx.filter = `blur(${blurPx}px)`;
      ctx.drawImage(offscreen, -12, -12, width + 24, height + 24);
      ctx.restore();

      drawParallaxStars(ctx, width, height, 1.0);
      drawPerspectiveGrid(ctx, width, height);
      draw3DGlobe(ctx, width, height, 1.0);

      ctx.save();
      ctx.filter = "none";
      drawGrain(ctx, width, height);
      ctx.restore();
    } else {
      animationFrameId = requestAnimationFrame(renderLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [activeColors, reduceMotion, intensity, blurPx, isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-100 transition-opacity duration-1000"
    />
  );
}
