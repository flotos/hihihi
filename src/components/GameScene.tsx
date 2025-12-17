import type { DogSprite, HiddenDog, NeutralSprite, PlacedNeutralSprite } from '../types/game';

interface GameSceneProps {
  sprites: DogSprite[];
  hiddenDogs: HiddenDog[];
  neutralSprites: NeutralSprite[];
  placedNeutrals: PlacedNeutralSprite[];
  onDogFound: (dogId: number) => void;
}

export function GameScene({
  sprites,
  hiddenDogs,
  neutralSprites,
  placedNeutrals,
  onDogFound,
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

        return (
          <img
            key={`neutral-${placed.id}`}
            src={sprite.imageUrl}
            alt="Distractor"
            className="neutral-sprite"
            style={{
              left: `${placed.x}%`,
              top: `${placed.y}%`,
            }}
          />
        );
      })}
      {/* Render hidden dogs to find */}
      {hiddenDogs.map((dog) => {
        const sprite = spriteMap.get(dog.spriteId);
        if (!sprite) return null;

        return (
          <img
            key={`dog-${dog.id}`}
            src={sprite.imageUrl}
            alt={sprite.name}
            className={`hidden-dog ${dog.found ? 'found' : ''}`}
            style={{
              left: `${dog.x}%`,
              top: `${dog.y}%`,
            }}
          />
        );
      })}
    </div>
  );
}
