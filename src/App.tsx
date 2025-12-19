import { useState, useEffect, useCallback } from "react";
import "./App.css";

// Short low beep for clicking on wrong sprite
function playMissSound() {
  const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'square';
  // Very low frequency with slight variation (80-110 Hz)
  oscillator.frequency.setValueAtTime(80 + Math.random() * 30, audioContext.currentTime);

  // Very short beep
  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + 0.08);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.08);
}

// Generate a cute tamagotchi-style sound with slight variation
function playTamagotchiSound() {
  const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  // Random variations
  const baseFreq = 600 + Math.random() * 200; // Base frequency varies between 600-800 Hz
  const freqMultiplier = 1.2 + Math.random() * 0.3; // How much the frequency rises
  const duration = 0.08 + Math.random() * 0.04; // Duration of each note
  const noteCount = 3 + Math.floor(Math.random() * 2); // 3-4 notes

  for (let i = 0; i < noteCount; i++) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Chip-tune style square wave
    oscillator.type = 'square';

    // Each note goes up in pitch (classic happy tamagotchi pattern)
    const noteFreq = baseFreq * Math.pow(freqMultiplier, i) + (Math.random() * 30 - 15);
    oscillator.frequency.setValueAtTime(noteFreq, audioContext.currentTime + i * duration);

    // Quick attack, quick decay envelope
    const startTime = audioContext.currentTime + i * duration;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.9);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
}
import { GameScene } from "./components/GameScene";
import { ItemList } from "./components/ItemList";
import { LoveMessage } from "./components/LoveMessage";
import { Tamagotchi } from "./components/Tamagotchi";
import { loadSpritesToFind, loadNeutralSprites } from "./utils/spritesheet";
import { dogPositions, neutralPositions } from "./data/dogPositions";
import type {
  DogSprite,
  HiddenDog,
  NeutralSprite,
  PlacedNeutralSprite,
} from "./types/game";

function App() {
  const [sprites, setSprites] = useState<DogSprite[]>([]);
  const [hiddenDogs, setHiddenDogs] = useState<HiddenDog[]>([]);
  const [neutralSprites, setNeutralSprites] = useState<NeutralSprite[]>([]);
  const [placedNeutrals, setPlacedNeutrals] = useState<PlacedNeutralSprite[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showLoveMessage, setShowLoveMessage] = useState(false);
  const [currentDogNumber, setCurrentDogNumber] = useState(0);
  const [jumpActive, setJumpActive] = useState(false);

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
        const dogSprites: DogSprite[] = toFindProcessed.sprites.map(
          (imageUrl, index) => ({
            id: index,
            imageUrl,
            name: `Dog ${index + 1}`,
          })
        );

        // Minimum distance between sprites (in %)
        const MIN_DISTANCE = 12;
        const placedPositions: { x: number; y: number }[] = [];

        // Helper to generate random position that's separated from existing ones
        const getSeparatedPosition = () => {
          const maxAttempts = 50;
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = 8 + Math.random() * 84; // 8-92% for more margin
            const y = 8 + Math.random() * 84;

            // Check distance from all placed positions
            let tooClose = false;
            for (const pos of placedPositions) {
              const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
              if (dist < MIN_DISTANCE) {
                tooClose = true;
                break;
              }
            }

            if (!tooClose) {
              placedPositions.push({ x, y });
              return { x, y };
            }
          }
          // Fallback if no good position found
          const fallback = { x: 8 + Math.random() * 84, y: 8 + Math.random() * 84 };
          placedPositions.push(fallback);
          return fallback;
        };

        // Create HiddenDog objects with separated positions
        const hidden: HiddenDog[] = dogPositions
          .filter((pos) => pos.spriteIndex < dogSprites.length)
          .map((pos, index) => {
            const randPos = getSeparatedPosition();
            return {
              id: index,
              spriteId: pos.spriteIndex,
              x: randPos.x,
              y: randPos.y,
              found: false,
            };
          });

        // Create NeutralSprite objects
        const neutralSpriteList: NeutralSprite[] = neutralProcessed.sprites.map(
          (imageUrl, index) => ({
            id: index,
            imageUrl,
          })
        );

        // Create PlacedNeutralSprite objects with separated positions
        // Randomly exclude 5 neutral sprites each game
        const validNeutralPositions = neutralPositions.filter(
          (pos) => pos.spriteIndex < neutralSpriteList.length
        );
        const shuffled = [...validNeutralPositions].sort(() => Math.random() - 0.5);
        const selectedNeutrals = shuffled.slice(5); // Remove 5 random sprites

        const placedNeutralList: PlacedNeutralSprite[] = selectedNeutrals.map(
          (pos, index) => {
            const randPos = getSeparatedPosition();
            return {
              id: index,
              spriteId: pos.spriteIndex,
              x: randPos.x,
              y: randPos.y,
            };
          }
        );

        setSprites(dogSprites);
        setHiddenDogs(hidden);
        setNeutralSprites(neutralSpriteList);
        setPlacedNeutrals(placedNeutralList);
      } catch (error) {
        console.error("Failed to load spritesheets:", error);
      } finally {
        setLoading(false);
      }
    }

    initGame();
  }, []);

  const handleDogFound = (dogId: number) => {
    // Play cute tamagotchi sound
    playTamagotchiSound();

    // Calculate the new dog number (how many dogs found after this one)
    const newFoundCount = hiddenDogs.filter((dog) => dog.found).length + 1;

    setHiddenDogs((prev) =>
      prev.map((dog) => (dog.id === dogId ? { ...dog, found: true } : dog))
    );

    // Trigger love message
    setCurrentDogNumber(newFoundCount);
    setShowLoveMessage(true);
  };

  const handleLoveMessageComplete = useCallback(() => {
    setShowLoveMessage(false);
  }, []);

  const handleButtonB = useCallback(() => {
    setJumpActive(true);
    setTimeout(() => setJumpActive(false), 800);
  }, []);

  const handleMiss = useCallback(() => {
    playMissSound();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading sprites...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Tamagotchi
        foundCount={foundCount}
        totalCount={totalCount}
        onButtonB={handleButtonB}
      >
        <div className="tamagotchi-game-layout">
          <GameScene
            sprites={sprites}
            hiddenDogs={hiddenDogs}
            neutralSprites={neutralSprites}
            placedNeutrals={placedNeutrals}
            onDogFound={handleDogFound}
            onMiss={handleMiss}
            jumpActive={jumpActive}
          />
          <ItemList
            sprites={sprites}
            hiddenDogs={hiddenDogs}
            jumpActive={jumpActive}
          />
        </div>
      </Tamagotchi>

      {showLoveMessage && currentDogNumber > 0 && !isComplete && (
        <LoveMessage
          dogNumber={currentDogNumber}
          onComplete={handleLoveMessageComplete}
        />
      )}

      {isComplete && (
        <div className="win-overlay">
          <div className="confetti-container">
            {Array.from({ length: 150 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  backgroundColor: [
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#ff00ff",
                    "#00ffff",
                    "#ff6600",
                    "#9900ff",
                    "#ff69b4",
                    "#32cd32",
                  ][Math.floor(Math.random() * 10)],
                }}
              />
            ))}
          </div>
          <div className="win-message">
            <div className="message-hearts-top">💕💕💕💕💕</div>
            <div className="giant-key-emoji">🔑</div>
            <h1 className="love-text final-message">Tu as gagnée !</h1>
            <p className="win-subtext">
              Non mais t'a été vraiment trop forte, bravo t'a tout gagnée
            </p>
            <div className="message-hearts-bottom">💖💖💖💖💖</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
