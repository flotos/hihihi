# Ticket 4: Game Scene Component

## File
`src/components/GameScene.tsx`

## Description
Main game area where players click to find hidden dogs.

## Props
```ts
interface GameSceneProps {
  sprites: DogSprite[];
  hiddenDogs: HiddenDog[];
  onDogFound: (dogId: number) => void;
}
```

## Requirements
- Display background image (`public/background.png`)
- Render hidden dogs at their fixed positions
- Dogs should be semi-visible (blend into scene)
- Handle click events:
  - Check if click is within proximity of any unfound dog
  - Call `onDogFound(dogId)` when found
- Visual feedback:
  - Found dogs become fully visible / highlighted
  - Optional: brief animation on find

## Click Detection
- Use percentage-based positions for responsiveness
- Detection radius ~5-10% of scene width
- Only detect unfound dogs

## Acceptance Criteria
- [ ] Background image displays correctly
- [ ] Dogs render at correct positions
- [ ] Click detection works accurately
- [ ] Found dogs are visually distinct
- [ ] Scene is responsive to window size
