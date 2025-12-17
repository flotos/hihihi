import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { GameScene } from './components/GameScene';
import { ItemList } from './components/ItemList';
import { LoveMessage } from './components/LoveMessage';
import { loadSpritesToFind, loadNeutralSprites } from './utils/spritesheet';
import { dogPositions, neutralPositions } from './data/dogPositions';
import type { DogSprite, HiddenDog, NeutralSprite, PlacedNeutralSprite } from './types/game';

function App() {
  const [sprites, setSprites] = useState<DogSprite[]>([]);
  const [hiddenDogs, setHiddenDogs] = useState<HiddenDog[]>([]);
  const [neutralSprites, setNeutralSprites] = useState<NeutralSprite[]>([]);
  const [placedNeutrals, setPlacedNeutrals] = useState<PlacedNeutralSprite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoveMessage, setShowLoveMessage] = useState(false);
  const [currentDogNumber, setCurrentDogNumber] = useState(0);

  const foundCount = hiddenDogs.filter((dog) => dog.found).length;
  const totalCount = hiddenDogs.length;
  const isComplete = totalCount > 0 && foundCount === totalCount;

  useEffect(() => {
    async function initGame() {
      try {
        // Load both sprite types in parallel
        const [toFindProcessed, neutralProcessed] = await Promise.all([
          loadSpritesToFind(),
          loadNeutralSprites(),
        ]);

        // Create DogSprite objects from processed sprites
        const dogSprites: DogSprite[] = toFindProcessed.sprites.map((imageUrl, index) => ({
          id: index,
          imageUrl,
          name: `Dog ${index + 1}`,
        }));

        // Create HiddenDog objects from positions
        const hidden: HiddenDog[] = dogPositions
          .filter((pos) => pos.spriteIndex < dogSprites.length)
          .map((pos, index) => ({
            id: index,
            spriteId: pos.spriteIndex,
            x: pos.x,
            y: pos.y,
            found: false,
          }));

        // Create NeutralSprite objects
        const neutralSpriteList: NeutralSprite[] = neutralProcessed.sprites.map((imageUrl, index) => ({
          id: index,
          imageUrl,
        }));

        // Create PlacedNeutralSprite objects from positions
        const placedNeutralList: PlacedNeutralSprite[] = neutralPositions
          .filter((pos) => pos.spriteIndex < neutralSpriteList.length)
          .map((pos, index) => ({
            id: index,
            spriteId: pos.spriteIndex,
            x: pos.x,
            y: pos.y,
          }));

        setSprites(dogSprites);
        setHiddenDogs(hidden);
        setNeutralSprites(neutralSpriteList);
        setPlacedNeutrals(placedNeutralList);
      } catch (error) {
        console.error('Failed to load spritesheets:', error);
      } finally {
        setLoading(false);
      }
    }

    initGame();
  }, []);

  const handleDogFound = (dogId: number) => {
    // Calculate the new dog number (how many dogs found after this one)
    const newFoundCount = hiddenDogs.filter((dog) => dog.found).length + 1;

    setHiddenDogs((prev) =>
      prev.map((dog) =>
        dog.id === dogId ? { ...dog, found: true } : dog
      )
    );

    // Trigger love message
    setCurrentDogNumber(newFoundCount);
    setShowLoveMessage(true);
  };

  const handleLoveMessageComplete = useCallback(() => {
    setShowLoveMessage(false);
  }, []);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading sprites...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="game-container">
        <GameScene
          sprites={sprites}
          hiddenDogs={hiddenDogs}
          neutralSprites={neutralSprites}
          placedNeutrals={placedNeutrals}
          onDogFound={handleDogFound}
        />
        <ItemList sprites={sprites} hiddenDogs={hiddenDogs} />
      </div>

      {showLoveMessage && currentDogNumber > 0 && (
        <LoveMessage
          dogNumber={currentDogNumber}
          onComplete={handleLoveMessageComplete}
        />
      )}

      {isComplete && (
        <div className="win-overlay">
          <div className="win-message">
            <h1>Congratulations!</h1>
            <p>You found all {totalCount} dogs!</p>
            <button onClick={handlePlayAgain}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
