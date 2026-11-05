import { DroidUser } from '@floemia/osu-droid-tools';
import { MapInfo } from '@rian8337/osu-base';
import { render } from './functions/render';

/**
 * Main class that helps with creating osu!droid profile cards.
 */
export abstract class DroidCard {
  /**
   * Creates a card of a osu!droid profile.
   * @param user The `DroidUser`, their UID or their username.
   * @param beatmaps `MapInfo[]` that will be used to avoid unnecesary requests.
   * @returns a `Buffer<ArrayBufferLike>` of the .png result.
   */
  static async create(user: DroidUser | string | number, beatmaps?: MapInfo[]): Promise<Buffer<ArrayBufferLike>> {
    let droid_user: DroidUser | undefined;
    if (!(user instanceof DroidUser)) droid_user = await DroidUser.get(user);
    else droid_user = user;
    if (!droid_user) throw new Error('User not found.');

    return render(droid_user, beatmaps);
  }
}
