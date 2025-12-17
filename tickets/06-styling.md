# Ticket 6: Styling

## File
`src/App.css`

## Description
Style the game for a polished single-page experience.

## Layout Requirements
- Full viewport height, no scrolling
- Flexbox layout: scene (80%) + sidebar (20%)
- Scene maintains aspect ratio of background image

## Scene Styling
- Background image covers scene area
- Hidden dogs:
  - Unfound: slight transparency (opacity 0.3-0.5)
  - Found: full opacity with subtle glow/highlight
- Cursor: crosshair or custom pointer

## Sidebar Styling
- Fixed width sidebar on right
- Scrollable if content overflows
- Clean list of dogs with clear found/unfound states
- Progress counter prominent at top

## Win Overlay
- Semi-transparent dark overlay
- Centered "Congratulations!" message
- Optional: "Play Again" button (refreshes page)

## Animations
- Dog found: scale pulse + opacity transition
- Win screen: fade in

## Responsive Considerations
- Minimum width to keep game playable
- Sidebar collapses or moves to bottom on very small screens (optional)

## Acceptance Criteria
- [ ] No page scroll
- [ ] Clean visual hierarchy
- [ ] Found/unfound states clearly visible
- [ ] Win overlay displays correctly
- [ ] Smooth animations
