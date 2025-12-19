import { useMemo, useState, useEffect } from 'react';
import type { DogSprite, HiddenDog, NeutralSprite, PlacedNeutralSprite } from '../types/game';

// 10 emojis that make creatures feel alive
const BUBBLE_EMOJIS = ['💭', '💤', '✨', '💕', '🎵', '❓', '💡', '🌟', '😊', '🍀'];

interface WanderOffset {
  x: number;
  y: number;
}

interface BubbleState {
  emoji: string;
  visible: boolean;
}

interface GameSceneProps {
  sprites: DogSprite[];
  hiddenDogs: HiddenDog[];
  neutralSprites: NeutralSprite[];
  placedNeutrals: PlacedNeutralSprite[];
  onDogFound: (dogId: number) => void;
  onMiss?: () => void;
  jumpActive?: boolean;
}

export function GameScene({
  sprites,
  hiddenDogs,
  neutralSprites,
  placedNeutrals,
  onDogFound,
  onMiss,
  jumpActive = false,
}: GameSceneProps) {
  // Create a map of spriteId to sprite for quick lookup
  const spriteMap = new Map<number, DogSprite>();
  sprites.forEach((sprite) => {
    spriteMap.set(sprite.id, sprite);
  });

  // Create a map of neutral spriteId to sprite
  const neutralSpriteMap = new Map<number, NeutralSprite>();
  neutralSprites.forEach((sprite) => {
    neutralSpriteMap.set(sprite.id, sprite);
  });

  // Generate random delays for jump animation (organic feel)
  const jumpDelays = useMemo(() => {
    const delays: Record<string, number> = {};
    hiddenDogs.forEach((dog) => {
      delays[`dog-${dog.id}`] = Math.random() * 0.3;
    });
    placedNeutrals.forEach((neutral) => {
      delays[`neutral-${neutral.id}`] = Math.random() * 0.3;
    });
    return delays;
  }, [hiddenDogs.length, placedNeutrals.length]);

  // Wandering offsets for all sprites
  const [wanderOffsets, setWanderOffsets] = useState<Record<string, WanderOffset>>({});

  // Bubble states for all sprites
  const [bubbles, setBubbles] = useState<Record<string, BubbleState>>({});

  // Track sprites that were just repelled (for faster animation)
  const [repelledSprites, setRepelledSprites] = useState<Set<string>>(new Set());

  // Track sprite that was clicked (for shake animation)
  const [shakenSprite, setShakenSprite] = useState<string | null>(null);

  // Build a map of original positions for bounds checking
  const originalPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    hiddenDogs.forEach((dog) => {
      positions[`dog-${dog.id}`] = { x: dog.x, y: dog.y };
    });
    placedNeutrals.forEach((neutral) => {
      positions[`neutral-${neutral.id}`] = { x: neutral.x, y: neutral.y };
    });
    return positions;
  }, [hiddenDogs, placedNeutrals]);

  // Initialize and update wander offsets periodically
  useEffect(() => {
    // Initialize offsets for all sprites
    const initOffsets: Record<string, WanderOffset> = {};
    hiddenDogs.forEach((dog) => {
      initOffsets[`dog-${dog.id}`] = { x: 0, y: 0 };
    });
    placedNeutrals.forEach((neutral) => {
      initOffsets[`neutral-${neutral.id}`] = { x: 0, y: 0 };
    });
    setWanderOffsets(initOffsets);

    // Update random sprite offsets every 800ms
    const interval = setInterval(() => {
      setWanderOffsets((prev) => {
        const newOffsets = { ...prev };
        // Pick a few random sprites to move each tick (not all at once)
        const allKeys = Object.keys(newOffsets);
        const numToMove = Math.ceil(allKeys.length * 0.3); // Move ~30% of sprites each tick

        for (let i = 0; i < numToMove; i++) {
          const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
          const originalPos = originalPositions[randomKey];
          if (randomKey && newOffsets[randomKey] && originalPos) {
            const maxWander = 1.5; // Max % offset from original position
            const step = 0.4; // Step size in %

            let newX = newOffsets[randomKey].x + (Math.random() - 0.5) * step * 2;
            let newY = newOffsets[randomKey].y + (Math.random() - 0.5) * step * 2;

            // Clamp to max wander range
            newX = Math.max(-maxWander, Math.min(maxWander, newX));
            newY = Math.max(-maxWander, Math.min(maxWander, newY));

            // Ensure final position stays within screen bounds (2-98% to keep sprites visible)
            const finalX = originalPos.x + newX;
            const finalY = originalPos.y + newY;

            if (finalX < 2) newX = 2 - originalPos.x;
            if (finalX > 98) newX = 98 - originalPos.x;
            if (finalY < 2) newY = 2 - originalPos.y;
            if (finalY > 98) newY = 98 - originalPos.y;

            newOffsets[randomKey] = { x: newX, y: newY };
          }
        }
        return newOffsets;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [hiddenDogs.length, placedNeutrals.length, originalPositions]);

  // Randomly show/hide emoji bubbles
  useEffect(() => {
    // Initialize bubble states
    const initBubbles: Record<string, BubbleState> = {};
    hiddenDogs.forEach((dog) => {
      initBubbles[`dog-${dog.id}`] = { emoji: BUBBLE_EMOJIS[0], visible: false };
    });
    placedNeutrals.forEach((neutral) => {
      initBubbles[`neutral-${neutral.id}`] = { emoji: BUBBLE_EMOJIS[0], visible: false };
    });
    setBubbles(initBubbles);

    // Randomly show bubbles on some sprites
    const interval = setInterval(() => {
      setBubbles((prev) => {
        const newBubbles = { ...prev };
        const allKeys = Object.keys(newBubbles);

        // First, hide some currently visible bubbles (30% chance each)
        allKeys.forEach((key) => {
          if (newBubbles[key]?.visible && Math.random() < 0.3) {
            newBubbles[key] = { ...newBubbles[key], visible: false };
          }
        });

        // Then, show a new bubble on 1-2 random sprites
        const numToShow = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numToShow; i++) {
          const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
          if (randomKey && newBubbles[randomKey] && !newBubbles[randomKey].visible) {
            const randomEmoji = BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)];
            newBubbles[randomKey] = { emoji: randomEmoji, visible: true };
          }
        }

        return newBubbles;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [hiddenDogs.length, placedNeutrals.length]);

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Detection radius as percentage of scene dimensions
    const detectionRadius = 7;

    // Check if click is near any unfound dog
    for (const dog of hiddenDogs) {
      if (dog.found) continue;

      const offset = wanderOffsets[`dog-${dog.id}`] || { x: 0, y: 0 };
      const distance = Math.sqrt(
        Math.pow(clickX - (dog.x + offset.x), 2) + Math.pow(clickY - (dog.y + offset.y), 2)
      );

      if (distance <= detectionRadius) {
        onDogFound(dog.id);
        return;
      }
    }

    // Check if click is near any neutral sprite (miss sound)
    let clickedNeutralKey: string | null = null;
    for (const neutral of placedNeutrals) {
      const offset = wanderOffsets[`neutral-${neutral.id}`] || { x: 0, y: 0 };
      const distance = Math.sqrt(
        Math.pow(clickX - (neutral.x + offset.x), 2) + Math.pow(clickY - (neutral.y + offset.y), 2)
      );

      if (distance <= detectionRadius) {
        onMiss?.();
        clickedNeutralKey = `neutral-${neutral.id}`;
        setShakenSprite(clickedNeutralKey);
        setTimeout(() => setShakenSprite(null), 400);
        break;
      }
    }

    // Push nearby sprites away from click
    const repelRadius = 22.5; // Radius in % to affect sprites
    const repelStrength = 2; // How far to push in %

    setWanderOffsets((prev) => {
      const newOffsets = { ...prev };

      // Check all sprites and push them away if close to click
      const checkAndRepel = (key: string, spriteX: number, spriteY: number) => {
        const offset = prev[key] || { x: 0, y: 0 };
        const currentX = spriteX + offset.x;
        const currentY = spriteY + offset.y;
        const distance = Math.sqrt(
          Math.pow(clickX - currentX, 2) + Math.pow(clickY - currentY, 2)
        );

        if (distance < repelRadius && distance > 0) {
          // Calculate direction away from click
          const dirX = (currentX - clickX) / distance;
          const dirY = (currentY - clickY) / distance;

          // Strength decreases with distance
          const strength = repelStrength * (1 - distance / repelRadius);

          let newX = offset.x + dirX * strength;
          let newY = offset.y + dirY * strength;

          // Clamp to max wander range
          const maxWander = 3;
          newX = Math.max(-maxWander, Math.min(maxWander, newX));
          newY = Math.max(-maxWander, Math.min(maxWander, newY));

          // Ensure final position stays within screen bounds
          const originalPos = originalPositions[key];
          if (originalPos) {
            const finalX = originalPos.x + newX;
            const finalY = originalPos.y + newY;
            if (finalX < 2) newX = 2 - originalPos.x;
            if (finalX > 98) newX = 98 - originalPos.x;
            if (finalY < 2) newY = 2 - originalPos.y;
            if (finalY > 98) newY = 98 - originalPos.y;
          }

          newOffsets[key] = { x: newX, y: newY };
        }
      };

      const repelled: string[] = [];

      // Repel dogs
      hiddenDogs.forEach((dog) => {
        if (!dog.found) {
          const key = `dog-${dog.id}`;
          const before = prev[key];
          checkAndRepel(key, dog.x, dog.y);
          if (newOffsets[key] !== before) repelled.push(key);
        }
      });

      // Repel neutrals
      placedNeutrals.forEach((neutral) => {
        const key = `neutral-${neutral.id}`;
        const before = prev[key];
        checkAndRepel(key, neutral.x, neutral.y);
        if (newOffsets[key] !== before) repelled.push(key);
      });

      // Mark repelled sprites for fast animation
      if (repelled.length > 0) {
        setRepelledSprites(new Set(repelled));
        setTimeout(() => setRepelledSprites(new Set()), 250);
      }

      return newOffsets;
    });
  };

  return (
    <div className="game-scene" onClick={handleSceneClick}>
      {/* Render neutral/distractor sprites */}
      {placedNeutrals.map((placed) => {
        const sprite = neutralSpriteMap.get(placed.spriteId);
        if (!sprite) return null;

        const key = `neutral-${placed.id}`;
        const offset = wanderOffsets[key] || { x: 0, y: 0 };
        const bubble = bubbles[key];
        const isRepelled = repelledSprites.has(key);
        return (
          <div
            key={key}
            className="sprite-container"
            style={{
              left: `${placed.x + offset.x}%`,
              top: `${placed.y + offset.y}%`,
              transition: isRepelled
                ? 'left 0.15s ease-out, top 0.15s ease-out'
                : 'left 0.8s ease-in-out, top 0.8s ease-in-out',
            }}
          >
            {bubble?.visible && (
              <div className="emoji-bubble">{bubble.emoji}</div>
            )}
            <img
              src={sprite.imageUrl}
              alt="Distractor"
              className={`neutral-sprite ${jumpActive ? 'jumping' : ''} ${shakenSprite === key ? 'shaking' : ''}`}
              style={{
                animationDelay: jumpActive ? `${jumpDelays[key]}s` : undefined,
              }}
            />
          </div>
        );
      })}
      {/* Render hidden dogs to find */}
      {hiddenDogs.map((dog) => {
        const sprite = spriteMap.get(dog.spriteId);
        if (!sprite) return null;

        const key = `dog-${dog.id}`;
        const offset = wanderOffsets[key] || { x: 0, y: 0 };
        const bubble = bubbles[key];
        const isRepelled = repelledSprites.has(key);
        return (
          <div
            key={key}
            className="sprite-container"
            style={{
              left: `${dog.x + offset.x}%`,
              top: `${dog.y + offset.y}%`,
              transition: isRepelled
                ? 'left 0.15s ease-out, top 0.15s ease-out'
                : 'left 0.8s ease-in-out, top 0.8s ease-in-out',
            }}
          >
            {bubble?.visible && (
              <div className="emoji-bubble">{bubble.emoji}</div>
            )}
            <img
              src={sprite.imageUrl}
              alt={sprite.name}
              className={`hidden-dog ${dog.found ? 'found' : ''} ${jumpActive ? 'jumping' : ''}`}
              style={{
                animationDelay: jumpActive ? `${jumpDelays[`dog-${dog.id}`]}s` : undefined,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
