import { useEffect, useState } from "react";
import "./LoveMessage.css";

interface LoveMessageProps {
  dogNumber: number; // 1-indexed: which dog was just found
  onComplete: () => void;
}

// Escalating love messages - getting more romantic with each dog found!
const LOVE_MESSAGES = [
  "Je t'aime",
  "Chérie chérie chérie",
  "Mon amour ? Mon Coeur !",
  "Olalala qu'elle est forteeeee !",
  "On ne l'arrête plus !",
  "Ohhh darling my dear dear love ohh yeaaaah !",
  "CHOUPINETTE !",
  "gnoooo <3",
  "Non mais t'a été vraiment trop forte, bravo t'a tout gagnée",
];

// Heart types for variety
const HEART_EMOJIS = ["💕", "💖", "💗", "💓", "💝", "💘", "❤️", "🩷", "💜"];

interface FloatingHeart {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function LoveMessage({ dogNumber, onComplete }: LoveMessageProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [visible, setVisible] = useState(true);

  // Get message based on dog number (cycle if more dogs than messages)
  const messageIndex = Math.min(dogNumber - 1, LOVE_MESSAGES.length - 1);
  const message = LOVE_MESSAGES[messageIndex];

  // Number of hearts increases with each dog found
  const heartCount = Math.min(5 + dogNumber * 3, 30);

  // Message emphasis level (1-3)
  const emphasisLevel = Math.min(Math.ceil(dogNumber / 3), 3);

  useEffect(() => {
    // Generate floating hearts
    const generatedHearts: FloatingHeart[] = [];
    for (let i = 0; i < heartCount; i++) {
      generatedHearts.push({
        id: i,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2 + Math.random() * 2,
        size: 1 + Math.random() * (0.5 + emphasisLevel * 0.3),
      });
    }
    setHearts(generatedHearts);

    // Auto-hide after animation
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 1500 + emphasisLevel * 500);

    return () => clearTimeout(timer);
  }, [dogNumber, heartCount, emphasisLevel, onComplete]);

  if (!visible) return null;

  return (
    <div className={`love-message-overlay emphasis-${emphasisLevel}`}>
      {/* Floating hearts background */}
      <div className="hearts-container">
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="floating-heart"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              fontSize: `${heart.size}rem`,
            }}
          >
            {heart.emoji}
          </span>
        ))}
      </div>

      {/* Main message */}
      <div className={`love-message-content emphasis-${emphasisLevel}`}>
        <div className="message-hearts-top">
          {"💕".repeat(Math.min(dogNumber, 5))}
        </div>
        <h1 className="love-text">{message}</h1>
        <div className="message-hearts-bottom">
          {"💖".repeat(Math.min(dogNumber, 5))}
        </div>
      </div>
    </div>
  );
}
