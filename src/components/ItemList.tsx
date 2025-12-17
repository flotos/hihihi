import type { DogSprite, HiddenDog } from '../types/game';

interface ItemListProps {
  sprites: DogSprite[];
  hiddenDogs: HiddenDog[];
}

export function ItemList({ sprites, hiddenDogs }: ItemListProps) {
  const foundCount = hiddenDogs.filter((dog) => dog.found).length;
  const totalCount = hiddenDogs.length;

  // Create a map of spriteId to found status
  const foundStatus = new Map<number, boolean>();
  hiddenDogs.forEach((dog) => {
    foundStatus.set(dog.spriteId, dog.found);
  });

  return (
    <div className="item-list">
      <div className="item-list-header">
        <h2>Dogs to Find</h2>
        <div className="progress-counter">
          {foundCount} / {totalCount}
        </div>
      </div>
      <div className="item-list-items">
        {sprites.map((sprite) => {
          const isFound = foundStatus.get(sprite.id) ?? false;
          return (
            <div
              key={sprite.id}
              className={`item-list-item ${isFound ? 'found' : ''}`}
            >
              <img
                src={sprite.imageUrl}
                alt={`Dog ${sprite.id + 1}`}
                className="item-sprite"
              />
              {isFound && <span className="item-checkmark">&#10003;</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
