import type { ReactNode } from 'react';
import './Tamagotchi.css';

interface TamagotchiProps {
  children: ReactNode;
  foundCount: number;
  totalCount: number;
}

export function Tamagotchi({ children, foundCount, totalCount }: TamagotchiProps) {
  return (
    <div className="tamagotchi-wrapper">
      <div className="tamagotchi-device">
        {/* Top decoration / antenna */}
        <div className="tamagotchi-antenna">
          <div className="antenna-ball"></div>
          <div className="antenna-chain"></div>
        </div>

        {/* Main egg-shaped body */}
        <div className="tamagotchi-body">
          {/* Brand label */}
          <div className="tamagotchi-brand">
            <span className="brand-text">PUPPY FINDER</span>
            <span className="brand-subtext">v1.0</span>
          </div>

          {/* Screen bezel */}
          <div className="tamagotchi-bezel">
            {/* LCD Screen */}
            <div className="tamagotchi-screen">
              {children}
            </div>

            {/* Screen decorations */}
            <div className="screen-corner top-left"></div>
            <div className="screen-corner top-right"></div>
            <div className="screen-corner bottom-left"></div>
            <div className="screen-corner bottom-right"></div>
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
            <button className="tama-button button-a" aria-label="A Button">
              <span className="button-icon">A</span>
            </button>
            <button className="tama-button button-b" aria-label="B Button">
              <span className="button-icon">B</span>
            </button>
            <button className="tama-button button-c" aria-label="C Button">
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
    </div>
  );
}
