import {
  LeaderboardParameters,
  LeaderboardType,
  LeaderboardUserType,
  MapLeaderboardParameters,
  SearchRequestParameters,
} from '@structures/parameters';
import {
  ActivityFeedResponse,
  LeaderboardResponse,
  MapLeaderboardResponse,
  OnlineStatsResponse,
  OverallPPLeaderboardUser,
  OverallScoreLeaderboardUser,
  ScoreSearchResponse,
  SpecialUsersResponse,
  UserResponse,
} from '@structures/responses';

/**
 * A class that with methods that return the raw responses from the [osu!droid Public API](https://new.osudroid.moe/api2/frontend/docs/).
 */
export abstract class DroidAPI {
  /**
   * The base url of the osu!droid API.
   */
  static readonly BASE_URL = 'https://new.osudroid.moe/api2/';

  /**
   * Basic fetch method with `BASE_URL` as prefix. Returns `undefined` if 404.
   * @param suffix The suffix of the URL.
   */
  private static async call(suffix: string): Promise<Response | undefined> {
    console.log(this.BASE_URL + suffix);
    const response = await fetch(this.BASE_URL + suffix);
    if (!response.ok) {
      if (response.status == 404) return undefined;
      const json = await response.json();
      throw new Error(`${response.status} ${response.statusText} - ${json.error}`);
    }
    return response;
  }

  /**
   * Returns the response of an API call as JSON.
   * @param suffix The suffix of the URL.
   */
  private static async getJSON(suffix: string): Promise<any | undefined> {
    const response = await this.call(suffix);
    if (!response) return undefined;
    return response.json();
  }

  /**
   * Returns the response of an API call as an `ArrayBuffer`.
   * @param suffix The suffix of the URL.
   */
  private static async getArrayBuffer(suffix: string): Promise<ArrayBuffer | undefined> {
    const response = await this.call(suffix);
    if (!response) return undefined;
    return response.arrayBuffer();
  }

  /**
   * Requests a user's profile (`/profile-uid` or `/profile-username`).
   *
   * @param user The user's ID or username.
   */
  static async getUser(user: number | string): Promise<UserResponse | undefined> {
    return this.getJSON(typeof user == 'string' ? `frontend/profile-username/${user}` : `frontend/profile-uid/${user}`);
  }

  /**
   * Requests a performance points leaderboard (`/leaderboard`).
   * @param params Configuration for the leaderboard request. See {@link LeaderboardParameters}
   */
  static async getLeaderboard<T extends LeaderboardType>(
    params: Omit<LeaderboardParameters, 'type'> & { type?: 'pp' },
  ): Promise<LeaderboardResponse<OverallPPLeaderboardUser>>;

  /**
   * Requests a score leaderboard (`/leaderboard`).
   * @param params Configuration for the leaderboard request. See {@link LeaderboardParameters}
   */
  static async getLeaderboard<T extends LeaderboardType>(
    params: Omit<LeaderboardParameters, 'type'> & { type: 'score' },
  ): Promise<LeaderboardResponse<OverallScoreLeaderboardUser>>;

  /**
   * Requests a score or performance points leaderboard (`/leaderboard`).
   * @param params Configuration for the leaderboard request. See {@link LeaderboardParameters}
   */
  static async getLeaderboard<T extends LeaderboardType>(
    params: Omit<LeaderboardParameters, 'type'> & { type: T },
  ): Promise<LeaderboardResponse<LeaderboardUserType<T>>>;

  static async getLeaderboard<T extends LeaderboardType>(
    params?: LeaderboardParameters,
  ): Promise<LeaderboardResponse<LeaderboardUserType<T>>> {
    if (!params) params = { limit: 50, page: 1, type: 'pp', region: 'all' };
    const { limit = 50, page = 1, type = 'pp', region = 'all' } = params;

    if (limit > 50 || limit < 1) throw new Error('Limit must be between 1 and 50.');
    if (page < 1) throw new Error('Page must be greater or equal to 1.');
    if (region != 'all' && region.length != 2)
      throw new Error('Invalid country code provided. Must be ISO 3166-1 alpha-2 compliant.');

    return this.getJSON(`frontend/leaderboard/type=${type}/region=${region}/page=${page}/limit=${limit}`);
  }

  /**
   * Requests the leaderboard of a beatmap (`/game/leaderboard`).
   * @param params Configuration for the beatmap leaderboard request. See {@link MapLeaderboardParameters}
   */
  static async getMapLeaderboard(params: MapLeaderboardParameters): Promise<MapLeaderboardResponse> {
    const { type = 'score', hash, uid } = params;
    let suffix = `game/leaderboard/?hash=${hash}`;
    if (type) suffix += `&type=${type}`;
    if (uid) suffix += `&uid=${uid}`;
    return this.getJSON(suffix);
  }

  /**
   * Requests the default avatar (`/avatar/default`).
   * @param size Must be less than or equal to 512. Defaults to 256.
   */
  static async getDefaultAvatar(size: number = 256): Promise<ArrayBuffer> {
    if (size < 0 || size > 256) throw new Error('Size must be between 0 and 512 pixels.');
    return this.getArrayBuffer(`frontend/avatar/default?size=${size}`) as Promise<ArrayBuffer>;
  }

  /**
   * Requests the avatar of a user (`/avatar/userid`).
   * @param id The user's ID.
   * @param size Must be less than or equal to 512. Defaults to 256.
   */
  static async getAvatar(id: number, size: number = 256): Promise<ArrayBuffer | undefined> {
    if (size < 0 || size > 256) throw new Error('Size must be between 0 and 512 pixels.');
    return this.getArrayBuffer(`frontend/avatar/userid/${id}?size=${size}`);
  }

  /**
   * Requests a list of scores (`/score-search`).
   *
   * **Limited to 20 requests per minute. Has 100 results per page.**
   * @param params Configuration for the search request. See {@link SearchRequestParameters}.
   */
  static async scoreSearch(params: SearchRequestParameters): Promise<ScoreSearchResponse[]> {
    if (!params) throw new Error('No parameters provided.');
    if (!params.user && !params.hash) throw new Error('No user or beatmap hash provided.');
    const { user, hash, order = 'score', page = 0 } = params;

    if (page && page < 0) throw new Error('Page must be greater than or equal to 0.');
    let suffix = `frontend/score-search?${user ? (typeof user == 'string' ? `username=${user}` : `uid=${user}`) : ''}`;
    if (hash) suffix += `&hash=${hash}`;
    suffix += `&order=${order}`;
    if (page) suffix += `&page=${page}`;

    return this.getJSON(suffix);
  }

  /**
   * Requests the single most recent score across all players (`/activity-feed`).
   *
   * **Limited to 20 requests per minute. Excludes restricted, archived and banned users.**
   */
  static async getActivityFeed(): Promise<ActivityFeedResponse> {
    return this.getJSON('frontend/activity-feed');
  }

  /**
   * Requests the current server's online statistics (`/online-stats`).
   */
  static async getOnlineStats(): Promise<OnlineStatsResponse> {
    return this.getJSON('frontend/online-stats');
  }

  /**
   * Requests the list of developers, contributors and supporters (`/special-users`).
   */
  static async getSpecialUsers(): Promise<SpecialUsersResponse[]> {
    return this.getJSON('frontend/special-users');
  }
}
