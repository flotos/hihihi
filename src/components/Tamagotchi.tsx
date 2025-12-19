import { useState, useCallback, useRef, type ReactNode } from 'react';
import './Tamagotchi.css';

interface TamagotchiProps {
  children: ReactNode;
  foundCount: number;
  totalCount: number;
  onButtonA?: () => void;
  onButtonB?: () => void;
  onButtonC?: () => void;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

interface CursorShadow {
  x: number;
  y: number;
  visible: boolean;
}

export function Tamagotchi({ children, foundCount, totalCount, onButtonA, onButtonB, onButtonC }: TamagotchiProps) {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [neonActive, setNeonActive] = useState(false);
  const [cursorShadow, setCursorShadow] = useState<CursorShadow>({ x: 0, y: 0, visible: false });
  const bodyRef = useRef<HTMLDivElement>(null);
  const bezelRef = useRef<HTMLDivElement>(null);

  const handleButtonA = useCallback(() => {
    // Create heart particles
    const newHearts: HeartParticle[] = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40, // Random x position around center
      y: 40 + Math.random() * 20, // Random y position
      delay: Math.random() * 0.3,
    }));
    setHearts(prev => [...prev, ...newHearts]);

    // Clean up hearts after animation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 2000);

    onButtonA?.();
  }, [onButtonA]);

  const handleButtonB = useCallback(() => {
    onButtonB?.();
  }, [onButtonB]);

  const handleButtonC = useCallback(() => {
    setNeonActive(true);
    setTimeout(() => setNeonActive(false), 1500);
    onButtonC?.();
  }, [onButtonC]);

  const handleBodyMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Check if we're over the bezel/screen - if so, hide the shadow
    if (bezelRef.current) {
      const bezelRect = bezelRef.current.getBoundingClientRect();
      if (
        e.clientX >= bezelRect.left &&
        e.clientX <= bezelRect.right &&
        e.clientY >= bezelRect.top &&
        e.clientY <= bezelRect.bottom
      ) {
        setCursorShadow(prev => ({ ...prev, visible: false }));
        return;
      }
    }

    setCursorShadow({ x: e.clientX, y: e.clientY, visible: true });
  }, []);

  const handleBodyMouseLeave = useCallback(() => {
    setCursorShadow(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <div className="tamagotchi-wrapper">
      <div className="tamagotchi-device">
        {/* Top decoration / antenna */}
        <div className="tamagotchi-antenna">
          <div className="antenna-ball"></div>
          <div className="antenna-chain"></div>
        </div>

        {/* Main egg-shaped body */}
        <div
          ref={bodyRef}
          className="tamagotchi-body"
          onMouseMove={handleBodyMouseMove}
          onMouseLeave={handleBodyMouseLeave}
        >
          {/* Brand label */}
          <div className="tamagotchi-brand">
            <span className="brand-text">PUPPY FINDER</span>
            <span className="brand-subtext">v1.0</span>
          </div>

          {/* Screen bezel */}
          <div ref={bezelRef} className={`tamagotchi-bezel ${neonActive ? 'neon-active' : ''}`}>
            {/* LCD Screen */}
            <div className="tamagotchi-screen">
              {children}
            </div>

            {/* Heart particles container */}
            {hearts.map(heart => (
              <div
                key={heart.id}
                className="heart-particle"
                style={{
                  left: `${heart.x}%`,
                  top: `${heart.y}%`,
                  animationDelay: `${heart.delay}s`,
                }}
              >
                ❤️
              </div>
            ))}

          </div>

          {/* Stats display under screen */}
          <div className="tamagotchi-stats">
            <div className="stat-display">
              <span className="stat-label">FOUND</span>
              <span className="stat-value">{foundCount}/{totalCount}</span>
            </div>
            <div className="stat-hearts">
              {Array.from({ length: totalCount }).map((_, i) => (
                <span
                  key={i}
                  className={`stat-heart ${i < foundCount ? 'filled' : ''}`}
                >
                  ♥
                </span>
              ))}
            </div>
          </div>

          {/* Button row */}
          <div className="tamagotchi-buttons">
            <button className="tama-button button-a" aria-label="A Button" onClick={handleButtonA}>
              <span className="button-icon">A</span>
            </button>
            <button className="tama-button button-b" aria-label="B Button" onClick={handleButtonB}>
              <span className="button-icon">B</span>
            </button>
            <button className="tama-button button-c" aria-label="C Button" onClick={handleButtonC}>
              <span className="button-icon">C</span>
            </button>
          </div>

          {/* Speaker grille */}
          <div className="tamagotchi-speaker">
            <div className="speaker-line"></div>
            <div className="speaker-line"></div>
            <div className="speaker-line"></div>
            <div className="speaker-line"></div>
            <div className="speaker-line"></div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="tamagotchi-bottom-decor">
          <div className="decor-dot"></div>
          <div className="decor-dot"></div>
          <div className="decor-dot"></div>
        </div>
      </div>

      {/* Cursor shadow */}
      {cursorShadow.visible && (
        <div
          className="cursor-shadow"
          style={{
            left: cursorShadow.x,
            top: cursorShadow.y,
          }}
        />
      )}
    </div>
  );
}
