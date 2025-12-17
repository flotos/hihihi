/** Number of "to find" spritesheets to load (sprites_to_find_01.jpg, sprites_to_find_02.jpg, etc.) */
export const SPRITES_TO_FIND_COUNT = 1;

/** Number of neutral/distractor spritesheets to load (neutral/01.png, neutral/02.png, etc.) */
export const SPRITES_NEUTRAL_COUNT = 4;

export interface ProcessedSprites {
  sprites: string[]; // Array of data URLs
  spriteWidth: number;
  spriteHeight: number;
}

/**
 * Loads a spritesheet and processes it by extracting individual sprites
 * and optionally making white backgrounds transparent.
 * @param src - Image source path
 * @param hasTransparency - If true, skip white-to-transparent processing (image already has alpha)
 */
export async function loadAndProcessSpritesheet(src: string, hasTransparency = false): Promise<ProcessedSprites> {
  const image = await loadImage(src);

  const cols = 3;
  const rows = 3;
  const spriteWidth = Math.floor(image.width / cols);
  const spriteHeight = Math.floor(image.height / rows);

  const sprites: string[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const spriteDataUrl = extractAndProcessSprite(
        image,
        col * spriteWidth,
        row * spriteHeight,
        spriteWidth,
        spriteHeight,
        hasTransparency
      );
      sprites.push(spriteDataUrl);
    }
  }

  return {
    sprites,
    spriteWidth,
    spriteHeight,
  };
}

/**
 * Loads multiple spritesheets and combines all sprites into a single array.
 * @param basePattern - Pattern with {index} placeholder, e.g., "/sprites_to_find_{index}.png"
 * @param count - Number of spritesheets to load
 * @param hasTransparency - If true, skip white-to-transparent processing
 */
export async function loadMultipleSpritesheets(
  basePattern: string,
  count: number,
  hasTransparency = false
): Promise<ProcessedSprites> {
  const allSprites: string[] = [];
  let spriteWidth = 0;
  let spriteHeight = 0;

  for (let i = 1; i <= count; i++) {
    const src = basePattern.replace('{index}', i.toString().padStart(2, '0'));
    const result = await loadAndProcessSpritesheet(src, hasTransparency);
    allSprites.push(...result.sprites);
    spriteWidth = result.spriteWidth;
    spriteHeight = result.spriteHeight;
  }

  return {
    sprites: allSprites,
    spriteWidth,
    spriteHeight,
  };
}

/**
 * Loads all "to find" spritesheets based on SPRITES_TO_FIND_COUNT.
 */
export async function loadSpritesToFind(): Promise<ProcessedSprites> {
  return loadMultipleSpritesheets('/to_find/{index}.png', SPRITES_TO_FIND_COUNT, true);
}

/**
 * Loads all neutral/distractor spritesheets based on SPRITES_NEUTRAL_COUNT.
 */
export async function loadNeutralSprites(): Promise<ProcessedSprites> {
  return loadMultipleSpritesheets('/neutral/{index}.png', SPRITES_NEUTRAL_COUNT, true);
}

/**
 * Loads an image from a URL and returns a promise that resolves with the HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Extracts a single sprite from the spritesheet, optionally processes it to make
 * white pixels transparent, and returns a data URL.
 * @param hasTransparency - If true, skip white-to-transparent processing
 */
function extractAndProcessSprite(
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  hasTransparency = false
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Draw the sprite region onto the canvas
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  // Skip processing if image already has transparency
  if (!hasTransparency) {
    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Process each pixel: make white/near-white pixels transparent
    // Using distance-based approach for smoother edges
    const WHITE_THRESHOLD = 30; // Distance from pure white to start transparency
    const FADE_RANGE = 20; // Range over which transparency fades

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate distance from pure white (255, 255, 255)
      const distanceFromWhite = Math.sqrt(
        Math.pow(255 - r, 2) +
        Math.pow(255 - g, 2) +
        Math.pow(255 - b, 2)
      );

      if (distanceFromWhite < WHITE_THRESHOLD) {
        // Fully transparent for pixels very close to white
        data[i + 3] = 0;
      } else if (distanceFromWhite < WHITE_THRESHOLD + FADE_RANGE) {
        // Gradual fade for anti-aliased edges
        const alpha = ((distanceFromWhite - WHITE_THRESHOLD) / FADE_RANGE) * 255;
        data[i + 3] = Math.round(alpha);
      }
      // Pixels further from white keep their original alpha
    }

    // Put processed data back
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas.toDataURL('image/png');
}
