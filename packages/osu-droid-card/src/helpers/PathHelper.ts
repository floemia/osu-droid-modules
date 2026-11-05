import { join } from "node:path";

export abstract class PathHelper {
  /**
   * Returns the `./assets` directory path.
   */
  static getAssetsDir(): string {
    return join(__dirname, "../assets");
  }
}
