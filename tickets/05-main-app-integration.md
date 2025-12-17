# Ticket 5: Main App Integration

## Files
- `src/App.tsx`
- `src/data/dogPositions.ts`

## Description
Replace Vite boilerplate with game logic and integrate all components.

## Dog Positions Data
Create `src/data/dogPositions.ts`:
```ts
// Fixed positions for each dog (x, y as percentages)
export const dogPositions = [
  { spriteIndex: 0, x: 15, y: 20 },
  { spriteIndex: 1, x: 45, y: 35 },
  { spriteIndex: 2, x: 75, y: 15 },
  { spriteIndex: 3, x: 25, y: 60 },
  { spriteIndex: 4, x: 55, y: 70 },
  { spriteIndex: 5, x: 85, y: 55 },
  { spriteIndex: 6, x: 10, y: 85 },
  { spriteIndex: 7, x: 50, y: 90 },
  { spriteIndex: 8, x: 80, y: 80 },
];
```

## App.tsx Requirements
- Load and process spritesheet on mount (useEffect)
- Initialize game state with fixed positions
- Handle `onDogFound` callback to update state
- Layout: GameScene (80% width) + ItemList (20% sidebar)
- Show win message overlay when all dogs found

## State Management
```ts
const [sprites, setSprites] = useState<DogSprite[]>([]);
const [hiddenDogs, setHiddenDogs] = useState<HiddenDog[]>([]);
const [loading, setLoading] = useState(true);
```

## Acceptance Criteria
- [ ] Spritesheet loads on mount
- [ ] Game state initializes correctly
- [ ] Components receive correct props
- [ ] Finding a dog updates state
- [ ] Win condition triggers overlay
- [ ] Loading state while sprites process
