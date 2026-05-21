import { DroidAPI, LeaderboardParameters, PPLeaderboardUser, ScoreLeaderboardUser } from '@floemia/osu-droid-api';
import { MapLeaderboardParameters } from '@structures/parameters';
import { DroidScore } from '~DroidScore';
import { PPLBDroidUser, ScoreLBDroidUser } from '~DroidUser';

export type LBDroidUserType<T extends LeaderboardParameters['type']> = T extends 'pp'
  ? PPLBDroidUser
  : ScoreLBDroidUser;

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
    await this.getUserLeaderboard({ type: params.order });
    return DroidScore.search(params);
  }

  /**
   * Get a PP leaderboard from the server.
   * @param params Configuration for the request. See {@link LeaderboardParameters}.
   */
  static async getUserLeaderboard(
    params?: Omit<LeaderboardParameters, 'type'> & { type?: 'pp' },
  ): Promise<PPLBDroidUser[]>;

  /**
   * Get a score leaderboard from the server.
   * @param params Configuration for the request. See {@link LeaderboardParameters}.
   */
  static async getUserLeaderboard(
    params: Omit<LeaderboardParameters, 'type'> & { type: 'score' },
  ): Promise<ScoreLBDroidUser[]>;

  /**
   * Get a PP or score leaderboard from the server.
   * @param params Configuration for the request. See {@link LeaderboardParameters}.
   */
  static async getUserLeaderboard(
    params?: LeaderboardParameters,
  ): Promise<LBDroidUserType<LeaderboardParameters['type']>[]>;

  static async getUserLeaderboard<T extends LeaderboardParameters['type'] = 'pp'>(
    params?: Omit<LeaderboardParameters, 'type'> & { type: T },
  ): Promise<LBDroidUserType<T>[]> {
    if (!params) params = { limit: 50, page: 1, type: 'pp' as T, region: 'all' };
    const { limit = 50, page = 1, type = 'pp', region = 'all' } = params;
    const leaderboard = await DroidAPI.getLeaderboard({ limit, page, type, region });
    return leaderboard.Results.map((user) =>
      type == 'pp' ? new PPLBDroidUser(user as PPLeaderboardUser) : new ScoreLBDroidUser(user as ScoreLeaderboardUser),
    ) as LBDroidUserType<T>[];
  }
}
