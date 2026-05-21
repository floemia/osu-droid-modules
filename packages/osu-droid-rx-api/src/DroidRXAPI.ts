import { BeatmapData, PlayerData, ScoreData } from '@structures/responses';

/**
 * Structure of every response from the osudroid!rx API.
 */
interface RelaxResponse {
  /**
   * The raw response from the API.
   */
  data: Object;

  /**
   * The status of the response.
   */
  status: string;
}

/**
 * A class with methods that interact with the osudroid!rx API.
 */
export abstract class DroidRXAPI {
  /**
   * The base url of the osudroid!rx API.
   */
  static readonly BASE_URL = 'https://v4rx.me/api';

  /**
   * Basic fetch method with `BASE_URL` as prefix. Returns `undefined` if 404.
   * @param url The url to call.
   */
  private static async call(suffix: string): Promise<any | undefined> {
    const response = await fetch(this.BASE_URL + suffix);
    if (!response.ok) {
      if (response.status == 404) return undefined;
      else throw new Error(`${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as RelaxResponse;
    return json.data;
  }

  private static validateUser(user: number | string): void {
    if (typeof user == 'string' && user.length < 2) throw new Error('Invalid username.');
  }
  private static validateLimit(limit: number, max?: number): void {
    if (limit <= -1) throw new Error('Limit must be greater than -1.');
    if (max && limit > max) throw new Error(`Limit must be less than or equal to ${max}.`);
  }
  /**
   * Requests a beatmap's information. (`/beatmap`)
   * @param map The ID of the beatmap or its MD5 hash.
   */
  static async getBeatmap(map: number | string): Promise<BeatmapData | undefined> {
    const suffix = '/beatmap/' + (typeof map == 'number' ? `?bid=${map}` : `?md5=${map}`);
    return this.call(suffix) as Promise<BeatmapData | undefined>;
  }

  /**
   * **(VERY SLOW)** Requests a beatmap's leaderboard. (`/beatmap_leaderboard`)
   * @param map The ID of the beatmap or its MD5 hash.
   */
  static async getMapLeaderboard(map: number | string): Promise<any | undefined> {
    const suffix = '/beatmap_leaderboard/' + (typeof map == 'number' ? `?bid=${map}` : `?md5=${map}`);
    const response = await this.call(suffix);
    if (!response) return undefined;
    const json = await response.json();
    return json.data as any;
  }

  /**
   * Requests a player's profile (`/get_user`).
   * @param user The user's ID or username.
   */
  static async getUser(user: number | string): Promise<PlayerData | undefined> {
    this.validateUser(user);
    const suffix = `/get_user/?` + (typeof user == 'string' ? `username=${user}` : `id=${user}`);
    return this.call(suffix);
  }

  /**
   * Requests a player's recent scores (`/get_scores`).
   * @param user The user's ID.
   * @param limit The limit of scores to fetch. Defaults to 50.
   */
  static async getRecentScores(user: number, limit: number = 50): Promise<ScoreData[] | undefined> {
    this.validateLimit(limit);
    const suffix = `/get_scores/?id=${user}` + (limit ? `&limit=${limit}` : '');
    return this.call(suffix);
  }

  /**
   * Requests a player's recent scores (`/top_scores`).
   * @param user The user's ID.
   * @param limit The limit of scores to fetch. Defaults to 100.
   */
  static async getTopScores(user: number, limit: number = 100): Promise<ScoreData[] | undefined> {
    this.validateLimit(limit, 100);
    const suffix = `/top_scores/?id=${user}` + (limit ? `&limit=${limit}` : '');
    return this.call(suffix);
  }

  /**
   * **(SLOW)** Requests a player's scores in a beatmap (`/get_beatmap_scores`).
   * @param user The user's ID.
   * @param map The ID of the beatmap or its MD5 hash.
   */
  static async userScoresInMap(user: number | string, map: number | string): Promise<ScoreData[] | undefined> {
    this.validateUser(user);
    const suffix =
      `/get_beatmap_scores/?` +
      (typeof user == 'string' ? `username=${user}` : `uid=${user}`) +
      (typeof map == 'string' ? `&md5=${map}` : `&bid=${map}`);
    return this.call(suffix);
  }

  /**
   * Requests the number of online users. (`/get_online`)
   */
  static async getOnlineUsers(): Promise<number> {
    return this.call('/get_online');
  }

  /**
   * Return a recent score of a user. (`/recent`)
   * @param user The user's ID or username.
   * @param offset The offset to apply. Defaults to 0.
   */
  static async recent(user: number, offset = 0): Promise<ScoreData | undefined> {
    const suffix = `/recent/?id=${user}` + (offset ? `&offset=${offset}` : '');
    return this.call(suffix);
  }

  /**
   * Requests a leaderboard, ordered by performance points or ranked score (`/leaderboard`).
   * @param type The type of leaderboard to fetch. Defaults to `pp`.
   * @param country The country code of the country to fetch. Defaults to global.
   */
  static async getLeaderboard(type: 'pp' | 'score', country?: string): Promise<PlayerData[] | undefined> {
    const suffix = `/leaderboard/?type=${type}` + (country ? `&country=${country}` : '');
    return this.call(suffix);
  }
}
