# Ticket 2: Game State & Types

## File
`src/types/game.ts`

## Description
Define TypeScript types for the game state and entities.

## Types to Create

```ts
// A processed dog sprite
interface DogSprite {
  id: number;        // 0-8
  imageUrl: string;  // Data URL from sprite processing
  name: string;      // Display name (e.g., "Dog 1")
}

// A hidden dog placed in the scene
interface HiddenDog {
  id: number;
  spriteId: number;  // References DogSprite.id
  x: number;         // Position as % (0-100)
  y: number;         // Position as % (0-100)
  found: boolean;
}

// Overall game state
interface GameState {
  sprites: DogSprite[];
  hiddenDogs: HiddenDog[];
  foundCount: number;
  totalCount: number;
  isComplete: boolean;
}
```

## Acceptance Criteria
- [ ] All types are exported
- [ ] Types are well-documented with comments
- [ ] No `any` types used
