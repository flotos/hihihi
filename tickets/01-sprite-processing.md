# Ticket 1: Sprite Processing Utility

## File
`src/utils/spritesheet.ts`

## Description
Create a utility to load and process the dog spritesheet, making white backgrounds transparent.

## Requirements
- Load `public/sprites_01.png` (3x3 grid of dog sprites)
- Split into 9 individual dog images
- Use Canvas API to process each sprite:
  - For each pixel, if RGB is close to white (255,255,255), set alpha to 0
- Return an array of 9 processed image data URLs

## Implementation Details
```ts
interface ProcessedSprites {
  sprites: string[]; // Array of 9 data URLs
  spriteWidth: number;
  spriteHeight: number;
}

async function loadAndProcessSpritesheet(src: string): Promise<ProcessedSprites>
```

## Acceptance Criteria
- [ ] Spritesheet loads successfully
- [ ] 9 individual sprites are extracted
- [ ] White backgrounds are transparent
- [ ] Returns usable data URLs for `<img>` elements
