# Ticket 3: Item List Component

## File
`src/components/ItemList.tsx`

## Description
Sidebar component displaying all dogs to find with their found/unfound status.

## Props
```ts
interface ItemListProps {
  sprites: DogSprite[];
  hiddenDogs: HiddenDog[];
}
```

## Requirements
- Display all 9 dog sprites in a vertical list
- Show dog name next to each sprite
- Visual indicator when a dog is found:
  - Reduced opacity or grayscale
  - Checkmark overlay or strikethrough on name
- Counter showing "X / 9 found"

## UI Layout
```
┌─────────────────┐
│  Dogs to Find   │
│    3 / 9        │
├─────────────────┤
│ [img] Dog 1  ✓  │
│ [img] Dog 2     │
│ [img] Dog 3  ✓  │
│ [img] Dog 4     │
│ ...             │
└─────────────────┘
```

## Acceptance Criteria
- [ ] All 9 dogs displayed with sprites
- [ ] Found dogs visually distinct from unfound
- [ ] Progress counter updates correctly
- [ ] Responsive within sidebar width
