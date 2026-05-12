import {
  AvatarByHashParameters,
  AvatarByIDParameters,
  AvatarHashesByIDsParameters,
  LeaderboardParameters,
  ScoreSearchParameters,
  UserParameters,
} from '@structures/parameters';
import {
  ActivityFeedResponse,
  AvatarHashesResponse,
  LeaderboardResponse,
  OnlineStatsResponse,
  PPLeaderboardUser,
  ScoreLeaderboardUser,
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
  static readonly BASE_URL = 'https://new.osudroid.moe/api2/frontend';

  /**
   * Basic fetch method with `BASE_URL` as prefix. Returns `undefined` if 404.
   * @param url The url to call.
   */
  private static async call(suffix: string): Promise<Response | undefined> {
    const response = await fetch(this.BASE_URL + suffix);
    if (!response.ok) {
      if (response.status == 404) return undefined;
      else throw new Error(`${response.status} ${response.statusText}`);
    }
    return response;
  }

  /**
   * Requests a user's profile (`/profile-uid` or `/profile-username`).
   *
   * @param params Configuration for the request. See {@link UserParameters}.
   */
  static async getUser(params: UserParameters): Promise<UserResponse | undefined> {
    if (!params.id && !params.username) throw new Error('No user id or username provided!');
    const suffix = params.id ? `/profile-uid/${params.id}` : `/profile-username/${params.username}`;
    const response = await this.call(suffix);
    if (!response) return undefined;
    return await response.json();
  }

  /**
   * Requests a PP leaderboard (`/leaderboard`).
   * @param params Configuration for the leaderboard request. See {@link LeaderboardParameters}.
   */
  static async getLeaderboard(
    params: Omit<LeaderboardParameters, 'type'> & { type?: 'pp' },
  ): Promise<LeaderboardResponse<PPLeaderboardUser>>;

  /**
   * Requests a score leaderboard (`/leaderboard`).
   * @param params Configuration for the leaderboard request. See {@link LeaderboardParameters}.
   */
  static async getLeaderboard(
    params: Omit<LeaderboardParameters, 'type'> & { type: 'score' },
  ): Promise<LeaderboardResponse<ScoreLeaderboardUser>>;

  static async getLeaderboard(params: LeaderboardParameters): Promise<LeaderboardResponse<any>> {
    const { limit = 50, page = 1, type = 'pp', region = 'all' } = params;

    if (limit > 50 || limit < 1) throw new Error('Limit must be between 1 and 50.');
    if (page < 1) throw new Error('Page must be greater or equal to 1.');
    if (region != 'all' && region.length != 2)
      throw new Error('Invalid country code provided. Must be ISO 3166-1 alpha-2 compliant.');

    const suffix = `/leaderboard/type=${type}/region=${region}/page=${page}/limit=${limit}`;

    const response = await this.call(suffix);
    // returns "Results" = [] even if 404
    return await response!.json();
  }

  /**
   * Requests the default avatar (`/avatar/default`).
   * @param size Must be between 64 and 256. Defaults to 128.
   */
  static async getDefaultAvatar(size: number = 128): Promise<ArrayBuffer> {
    if (size < 64 || size > 256) throw new Error('Size must be between 64 and 256.');
    const suffix = `/avatar/default?size=${size}`;

    // it's always there i mean it's the default avatar endpoint
    const response = (await this.call(suffix))!;
    return await response.arrayBuffer();
  }

  /**
   * Requests the avatar of a user (`/avatar/userid`).
   * @param params Configuration for the avatar request. See {@link AvatarByIDParameters}.
   */
  static async getAvatar(params: AvatarByIDParameters): Promise<ArrayBuffer | undefined> {
    const { id, size = 128 } = params;
    if (size < 64 || size > 256) throw new Error('Size must be between 64 and 256.');

    const suffix = `/avatar/userid/${id}?size=${size}`;
    const response = await this.call(suffix);
    if (!response) return undefined;
    return await response.arrayBuffer();
  }

  /**
   * Requests an avatar by its SHA-512 hash. (`/avatar/hash`)
   * @param params Configuration for the avatar request. See {@link AvatarByHashParameters}.
   */
  static async getAvatarByHash(params: AvatarByHashParameters): Promise<ArrayBuffer | undefined> {
    const { hash, size = 128 } = params;
    if (size < 64 || size > 256) throw new Error('Size must be between 64 and 256.');

    const suffix = `/avatar/hash/${hash}?size=${size}`;
    const response = await this.call(suffix);
    if (!response) return undefined;
    return await response.arrayBuffer();
  }

  /**
   * Requests a list of avatars and their SHA-512 hashes by their user IDs (`/avatar/hashes/userids`).
   * @param params Configuration for the avatar list request. See {@link AvatarHashesByIDsParameters}.
   */
  static async getAvatarHashesByIDs(params: AvatarHashesByIDsParameters): Promise<AvatarHashesResponse> {
    let { ids, size = 128 } = params;
    if (typeof ids == 'number') ids = [ids];
    if (size < 64 || size > 256) throw new Error('Size must be between 64 and 256.');
    if (ids.length < 1 || ids.length > 100) throw new Error('IDs must be between 1 and 100.');
    const suffix = `/avatar/hashes/${ids.join(',')}?size=${size}`;

    const response = await this.call(suffix);
    // returns "list" = [] even if 404
    return await response!.json();
  }

  /**
   * Requests a list of scores (`/score-search`).
   *
   * **Limited to 20 requests per minute. Has 100 results per page.**
   * @param params Configuration for the search request. See {@link ScoreSearchParameters}.
   */
  static async scoreSearch(params: ScoreSearchParameters): Promise<ScoreSearchResponse[]> {
    const { id, username, hash, order = 'sid', page = 0 } = params;

    if (page && page < 0) throw new Error('Page must be greater than or equal to 0.');
    let suffix = `/score-search?`;
    if (id) suffix += `uid=${id}`;
    else if (username) suffix += `username=${username}`;
    if (hash) suffix += `&hash=${hash}`;
    suffix += `&order=${order}`;
    if (page) suffix += `&page=${page}`;

    // returns [] even if user is 404
    const response = await this.call(suffix);
    return await response!.json();
  }

  /**
   * Requests the single most recent score across all players (`/activity-feed`).
   *
   * **Limited to 20 requests per minute. Excludes restricted, archived and banned users.**
   */
  static async getActivityFeed(): Promise<ActivityFeedResponse> {
    const response = await this.call('/activity-feed');
    return await response!.json();
  }

  /**
   * Requests the current server's online statistics (`/online-stats`).
   */
  static async getOnlineStats(): Promise<OnlineStatsResponse> {
    const response = await this.call('/online-stats');
    return await response!.json();
  }

  /**
   * Requests the list of developers, contributors and supporters (`/special-users`).
   */
  static async getSpecialUsers(): Promise<SpecialUsersResponse[]> {
    const response = await this.call('/special-users');
    return await response!.json();
  }
}
