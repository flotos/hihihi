/** A processed dog sprite extracted from the spritesheet */
export interface DogSprite {
  /** Unique identifier */
  id: number;
  /** Data URL from sprite processing */
  imageUrl: string;
  /** Display name (e.g., "Dog 1") */
  name: string;
}

/** A hidden dog placed in the game scene */
export interface HiddenDog {
  /** Unique identifier for this hidden dog instance */
  id: number;
  /** References DogSprite.id */
  spriteId: number;
  /** Horizontal position as percentage (0-100) */
  x: number;
  /** Vertical position as percentage (0-100) */
  y: number;
  /** Whether this dog has been found by the player */
  found: boolean;
}

/** A neutral/distractor sprite that does nothing when clicked */
export interface NeutralSprite {
  /** Unique identifier */
  id: number;
  /** Data URL from sprite processing */
  imageUrl: string;
}

/** A placed neutral sprite in the game scene */
export interface PlacedNeutralSprite {
  /** Unique identifier for this placed instance */
  id: number;
  /** References NeutralSprite.id */
  spriteId: number;
  /** Horizontal position as percentage (0-100) */
  x: number;
  /** Vertical position as percentage (0-100) */
  y: number;
}

/** Overall game state */
export interface GameState {
  /** All available dog sprites */
  sprites: DogSprite[];
  /** Dogs hidden in the scene */
  hiddenDogs: HiddenDog[];
  /** Neutral/distractor sprites */
  neutralSprites: NeutralSprite[];
  /** Placed neutral sprites in the scene */
  placedNeutrals: PlacedNeutralSprite[];
  /** Number of dogs found so far */
  foundCount: number;
  /** Total number of dogs to find */
  totalCount: number;
  /** Whether the game is complete (all dogs found) */
  isComplete: boolean;
}
