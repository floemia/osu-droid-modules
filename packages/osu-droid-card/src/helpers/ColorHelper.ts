import { createCanvas, Image, loadImage } from "@napi-rs/canvas";

/**
 * Helps with color related operations.
 */
export abstract class ColorHelper {
  /**
   * Converts a string color to its number equivalent.
   * @param hex_color The hex color `(#xxxxxx)`
   */
  static hexToNumber(hex_color: string): number {
    return Number(`0x${hex_color.slice(1)}`);
  }

  /**
   * Retrieves the dominant color from an image.
   * @param source URL or buffer of the image.
   */
  static async getDominantColor(
    source: string | Image | ArrayBufferLike | Buffer<ArrayBufferLike>,
  ): Promise<string> {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");
    try {
      const image = await loadImage(source);
      ctx.drawImage(image, 0, 0, 1, 1);

      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const toHex = (n: number) => n.toString(16).padStart(2, "0");

      return `#${toHex(r!)}${toHex(g!)}${toHex(b!)}`;
    } catch {
      return "#ffffff";
    }
  }

  /**
   * Retrieves the accent color from an image.
   *
   * This is the dominant color of the image, brightened until it is no longer dark.
   * @param source URL or buffer of the image.
   */
  static async getAccentColor(
    source: string | Image | ArrayBufferLike | Buffer<ArrayBufferLike>,
  ): Promise<string> {
    let color = await this.getDominantColor(source);

    while (this.isDark(color)) {
      const brighter = ColorHelper.adjustSaturation(
        this.adjustBrightness(color, 40),
        5,
      );
      if (brighter === color) break;
      color = brighter;
    }

    return color;
  }

  /**
   * Returns whether a color is too dark to be used as an accent color.
   * @param color The color as a hex string (e.g., '#rrggbb').
   */
  static isDark(color: string): boolean {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Perceived brightness, from 0 (black) to 1 (white).
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return brightness < 0.75;
  }

  /**
   * Adjusts the brightness of a hex color by a given percentage (-100 to 100).
   * @param color The hex color string (e.g., '#rrggbb' or 'rrggbb').
   * @param percent The percentage to adjust brightness (-100 to 100).
   *                Positive values brighten, negative values darken.
   */
  static adjustBrightness(color: string, percent: number): string {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Clamp percent between -100 and 100, then convert to a factor between -1 and 1
    const factor = Math.min(Math.max(percent, -100), 100) / 100;

    const adjust = (channel: number) => {
      if (factor >= 0) {
        // Brighten: mix with white
        return Math.round(channel + (255 - channel) * factor);
      } else {
        // Darken: scale down towards black (factor is negative)
        return Math.round(channel * (1 + factor));
      }
    };

    const toHex = (n: number) =>
      Math.min(Math.max(n, 0), 255).toString(16).padStart(2, "0");

    return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
  }

  /**
   * Adjusts the saturation of a hex color by a given percentage (-100 to 100).
   * @param color The hex color string (e.g., '#rrggbb' or 'rrggbb').
   * @param percent The percentage to adjust saturation (-100 to 100).
   *                Positive values increase saturation, negative values decrease it (towards grayscale).
   */
  static adjustSaturation(color: string, percent: number): string {
    const hex = color.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // --- Step 1: Convert RGB to HSL ---
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    // --- Step 2: Adjust Saturation ---
    const factor = Math.min(Math.max(percent, -100), 100) / 100;
    if (factor >= 0) {
      s = s + (1 - s) * factor; // Increase towards maximum saturation
    } else {
      s = s * (1 + factor); // Decrease towards grayscale (factor is negative)
    }
    s = Math.min(Math.max(s, 0), 1); // Clamp between 0 and 1

    // --- Step 3: Convert HSL back to RGB ---
    const hueToRgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let rOut: number, gOut: number, bOut: number;
    if (s === 0) {
      rOut = gOut = bOut = l; // Achromatic (grayscale)
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      rOut = hueToRgb(p, q, h + 1 / 3);
      gOut = hueToRgb(p, q, h);
      bOut = hueToRgb(p, q, h - 1 / 3);
    }

    // --- Step 4: Convert back to Hex ---
    const toHex = (n: number) =>
      Math.round(Math.min(Math.max(n, 0), 1) * 255)
        .toString(16)
        .padStart(2, "0");

    return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
  }
}
