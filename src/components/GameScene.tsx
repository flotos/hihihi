import { useMemo, useState, useEffect } from 'react';
import type { DogSprite, HiddenDog, NeutralSprite, PlacedNeutralSprite } from '../types/game';

interface WanderOffset {
  x: number;
  y: number;
}

interface GameSceneProps {
  sprites: DogSprite[];
  hiddenDogs: HiddenDog[];
  neutralSprites: NeutralSprite[];
  placedNeutrals: PlacedNeutralSprite[];
  onDogFound: (dogId: number) => void;
  jumpActive?: boolean;
}

export function GameScene({
  sprites,
  hiddenDogs,
  neutralSprites,
  placedNeutrals,
  onDogFound,
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

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Detection radius as percentage of scene dimensions
    const detectionRadius = 7;

    // Check if click is near any unfound dog (neutral sprites are ignored)
    for (const dog of hiddenDogs) {
      if (dog.found) continue;

      const distance = Math.sqrt(
        Math.pow(clickX - dog.x, 2) + Math.pow(clickY - dog.y, 2)
      );

      if (distance <= detectionRadius) {
        onDogFound(dog.id);
        break;
      }
    }
  };

  return (
    <div className="game-scene" onClick={handleSceneClick}>
      {/* Render neutral/distractor sprites */}
      {placedNeutrals.map((placed) => {
        const sprite = neutralSpriteMap.get(placed.spriteId);
        if (!sprite) return null;

        const offset = wanderOffsets[`neutral-${placed.id}`] || { x: 0, y: 0 };
        return (
          <img
            key={`neutral-${placed.id}`}
            src={sprite.imageUrl}
            alt="Distractor"
            className={`neutral-sprite ${jumpActive ? 'jumping' : ''}`}
            style={{
              left: `${placed.x + offset.x}%`,
              top: `${placed.y + offset.y}%`,
              animationDelay: jumpActive ? `${jumpDelays[`neutral-${placed.id}`]}s` : undefined,
              transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out',
            }}
          />
        );
      })}
      {/* Render hidden dogs to find */}
      {hiddenDogs.map((dog) => {
        const sprite = spriteMap.get(dog.spriteId);
        if (!sprite) return null;

        const offset = wanderOffsets[`dog-${dog.id}`] || { x: 0, y: 0 };
        return (
          <img
            key={`dog-${dog.id}`}
            src={sprite.imageUrl}
            alt={sprite.name}
            className={`hidden-dog ${dog.found ? 'found' : ''} ${jumpActive ? 'jumping' : ''}`}
            style={{
              left: `${dog.x + offset.x}%`,
              top: `${dog.y + offset.y}%`,
              animationDelay: jumpActive ? `${jumpDelays[`dog-${dog.id}`]}s` : undefined,
              transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out',
            }}
          />
        );
      })}
    </div>
  );
}
