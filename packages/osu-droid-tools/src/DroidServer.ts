import { MapLeaderboardParameters } from '@structures/parameters';
import { DroidScore } from '~DroidScore';

export abstract class DroidServer {
  /**
   * Request a beatmap leaderboard from the server.
   * @param params Configuration for the request. See {@link MapLeaderboardParameters}.
   */
  static async getMapLeaderboard(params: MapLeaderboardParameters): Promise<DroidScore[]> {
    return await DroidScore.search(params);
  }
}
