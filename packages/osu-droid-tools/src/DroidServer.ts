import { MapLeaderboardParameters } from '@structures/parameters';
import { DroidScore } from '~DroidScore';

/**
 * A class with some methods that interact with the main osu!droid server.
 */
export abstract class DroidServer {
  /**
   * Get a beatmap's leaderboard from the server.
   * @param params Configuration for the request. See {@link MapLeaderboardParameters}.
   */
  static async getMapLeaderboard(params: MapLeaderboardParameters): Promise<DroidScore[]> {
    if (!params.order) params.order = 'score';
    return DroidScore.search(params);
  }
}
