import {
  SKRSContext2D,
  Image,
  Canvas,
  loadImage,
  createCanvas,
} from "@napi-rs/canvas";
export abstract class CanvasHelper {
  /**
   * Draws an image with rounded corners onto a canvas context.
   *
   * @param ctx - The canvas 2D rendering context
   * @param image - The image source (Image object, Canvas, etc.)
   * @param x - The x-coordinate of the destination rectangle
   * @param y - The y-coordinate of the destination rectangle
   * @param width - The width of the destination rectangle
   * @param height - The height of the destination rectangle
   * @param radius - The border radius for the corners (number or array of radii)
   */
  static drawRoundedImage(
    ctx: SKRSContext2D,
    image: Image | any,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | number[],
  ): void {
    ctx.save();
    ctx.beginPath();

    ctx.roundRect(x, y, width, height, radius);
    ctx.clip();

    ctx.drawImage(image, x, y, width, height);

    ctx.restore();
  }

  /**
   * Creates a rounded rectangle and fills it.
   *
   * @param ctx - The canvas 2D rendering context
   * @param x - The x-coordinate of the rectangle
   * @param y - The y-coordinate of the rectangle
   * @param width - The width of the rectangle
   * @param height - The height of the rectangle
   * @param radius - The border radius for the corners (number or array of radii)
   * @param fillColor - The color used to fill the rectangle
   */
  static roundFillRect(
    ctx: SKRSContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | number[],
    fillColor?: string,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    if (fillColor) ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Retrieves the Twemoji image of a country's flag.
   *
   * Twemoji only ships 72x72 PNGs, so the SVG variant is rendered at the
   * requested size for a sharp result.
   *
   * @param countryCode - The ISO 3166-1 alpha-2 country code (e.g. `US`)
   * @param size - The width and height of the resulting image.
   * @returns The flag image.
   */
  static async getFlagImage(countryCode: string, size = 128): Promise<Canvas> {
    const code = countryCode.trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(code)) {
      throw new Error(`Invalid country code: "${countryCode}"`);
    }

    const codepoints = [...code]
      .map((char) => (0x1f1e6 + char.charCodeAt(0) - 0x41).toString(16))
      .join("-");

    const flag = await loadImage(
      `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`,
    );

    const canvas = createCanvas(size, size);
    canvas.getContext("2d").drawImage(flag, 0, 0, size, size);

    return canvas;
  }

  static async tintImage(
    source: string | Buffer | Image,
    hex_color: string,
    intensity: number,
  ): Promise<Canvas> {
    const img = source instanceof Image ? source : await loadImage(source);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    if (intensity > 0) {
      ctx.save();

      const alpha = Math.min(Math.max(intensity, 0), 1);
      ctx.globalAlpha = alpha;

      ctx.globalCompositeOperation = "source-atop";

      ctx.fillStyle = hex_color.startsWith("#") ? hex_color : `#${hex_color}`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();
    }

    return canvas;
  }
}
