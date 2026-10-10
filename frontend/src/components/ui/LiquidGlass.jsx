import React, { useRef, useState, useCallback } from 'react';

/**
 * LiquidGlass Component (Apple Design + visionOS Material)
 * Synthesizes dynamic mouse-tracking specular highlights from liquid-glass-react
 * with Apple's critically damped spring physics and translucent glass materials.
 */
export default function LiquidGlass({
  children,
  className = '',
  variant = 'card', // 'card' | 'pill' | 'panel' | 'button'
  interactive = false,
  glowColor = 'rgba(0, 113, 227, 0.22)', // Apple system blue specular tint
  onClick,
  active = false
}) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  const getBorderRadius = () => {
    if (variant === 'pill') return '9999px';
    if (variant === 'panel') return '16px';
    if (variant === 'button') return '10px';
    return '14px'; // default card
  };

  const borderRadius = getBorderRadius();

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ borderRadius }}
      className={`relative overflow-hidden transition-all duration-200 select-none ${
        variant === 'panel'
          ? 'bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(15,23,42,0.04)]'
          : 'bg-white/75 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_20px_rgba(15,23,42,0.03)]'
      } ${
        interactive
          ? 'cursor-pointer apple-press hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)]'
          : ''
      } ${active ? 'ring-2 ring-blue-500/80 border-transparent shadow-[0_0_20px_rgba(0,113,227,0.15)]' : ''} ${className}`}
    >
      {/* Dynamic Specular Sheen (Moves with cursor across the glass) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 0.75 : 0.15,
          background: `radial-gradient(circle 240px at ${mousePos.x}% ${mousePos.y}%, ${glowColor} 0%, rgba(255, 255, 255, 0.45) 30%, transparent 70%)`,
        }}
      />

      {/* Beveled Top-Edge Light Glare (Simulates glass thickness) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 z-10"
      />

      {/* Inner Rim Specular Border */}
      <div
        className="pointer-events-none absolute inset-0 border border-white/60 z-10"
        style={{ borderRadius }}
      />

      {/* Glass Content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
