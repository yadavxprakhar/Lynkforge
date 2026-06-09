import { useEffect, useRef } from "react";

const CursorDot = () => {
  const dotRef = useRef(null);

  useEffect(() => {
    // Check if the device supports hover (desktop/fine pointer)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mediaQuery.matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", onMouseMove);

    const updatePosition = () => {
      // Smooth interpolation (lerp)
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(updatePosition);
    };

    const animFrame = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="cursor-dot fixed top-0 left-0 w-4 h-4 bg-[#4DFFB4] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    />
  );
};

export default CursorDot;
