import React, { useRef, useState, useEffect } from 'react';

/**
 * LiquidGlass Component
 * Distilled from liquid-glass-react with Apple Design principles:
 * - Fine specular border highlight with mouse-reactive sheen
 * - Translucent backdrop blur with high contrast ink text
 * - Responsive pointer-down feedback (apple-press)
 */
export default function LiquidGlass({
  children,
  className = '',
  intensity = 1,
  cornerRadius = 0,
  interactive = false,
  onClick
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        borderRadius: `${cornerRadius}px`,
      }}
      className={`relative overflow-hidden bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs transition-all duration-200 ${
        interactive ? 'cursor-pointer apple-press hover:border-blue-400' : ''
      } ${className}`}
    >
      {/* Specular Liquid Sheen Overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.35 * intensity : 0.08,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(37, 99, 235, 0.18) 0%, rgba(255, 255, 255, 0) 65%)`,
        }}
      />

      {/* Hairline Glass Highlight Edge */}
      <div
        className="pointer-events-none absolute inset-0 border border-white/60"
        style={{ borderRadius: `${cornerRadius}px` }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
