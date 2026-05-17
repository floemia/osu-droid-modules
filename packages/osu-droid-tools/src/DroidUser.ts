import { DroidAPI, ScoreResponse, UserParameters, UserResponse } from '@floemia/osu-droid-api';
import { MapInfo } from '@rian8337/osu-base';
import { UserScoreSearchParameters } from '@structures/parameters';
import { DroidUserScores } from '@structures/score';
import { DroidUserStats } from '@structures/user';
import { DroidScore } from '~DroidScore';

/**
 * A class representing an osu!droid user.
 */
export class DroidUser {
  /**
   * The user's ID.
   */
  id: number;

  /**
   * The user's username.
   */
  username: string;

  /**
   * The user's avatar URL.
   *
   * If `DroidUser.get()` is called with `check_avatar_url` set to `false`, the URL may return 404.
   */
  avatar_url: string;

  /**
   * The user's country.
   */
  country: string | null;

  /**
   * The user's page URL.
   */
  url: string;

  /**
   * The user's statistics.
   */
  statistics: DroidUserStats;

  /**
   * The `Date` the user was registered.
   */
  registered_at: Date;

  /**
   * The user's last login.
   */
  last_login: Date;

  /**
   * Whether the user is a supporter or not.
   */
  supporter: boolean;

  /**
   * Whether the user is a core developer or not.
   */
  core_developer: boolean;

  /**
   * Whether the user is a developer or not.
   */
  developer: boolean;

  /**
   * Whether the user is a contributor or not.
   */
  contributor: boolean;

  /**
   * The user's scores.
   */
  scores: DroidUserScores;

  constructor(response: UserResponse) {
    this.id = response.UserId;
    this.username = response.Username;
    this.avatar_url = `https://osudroid.moe/user/avatar/${this.id}.png`;
    this.country = response.Region;
    this.url = 'https://osudroid.moe/profile.php?uid=' + this.id;
    this.statistics = {
      rank: {
        global: response.GlobalRank,
        country: response.CountryRank,
      },
      total_score: response.OverallScore,
      pp: response.OverallPP,
      playcount: response.OverallPlaycount,
      accuracy: response.OverallAccuracy,
    };
    this.registered_at = new Date(response.Registered);
    this.last_login = new Date(response.LastLogin);
    this.supporter = Boolean(response.Supporter);
    this.core_developer = Boolean(response.CoreDeveloper);
    this.developer = Boolean(response.Developer);
    this.contributor = Boolean(response.Contributor);
    this.scores = {
      best: this.map_scores(response.Top50Plays, this),
      recent: this.map_scores(response.Last50Scores, this),
    };
  }

  /**
   * Converts an API score to a `DroidScore` instance.
   * @param scores The raw API response of a score.
   * @param user The user who submitted the score.
   */
  private map_scores = (scores: ScoreResponse[], user: DroidUser): DroidScore[] =>
    scores.map((s) => DroidScore.fromAPIResponse(s, user));
  /**
   * Retrieves a user from the osu!droid API.
   * @param params A `UserParameters` object containing the user's ID or username.
   * @param check_avatar_url Whether to validate the user's avatar URL or not. Defaults to `true`.
   * @returns A `DroidUser` object containing the requested user's profile and scores.
   */
  static async get(params: UserParameters, check_avatar_url: boolean = true): Promise<DroidUser | undefined> {
    const response = await DroidAPI.getUser(params);
    if (!response) return undefined;
    const user = new DroidUser(response);
    if (check_avatar_url) await user.getAvatarURL();
    return user;
  }

  /**
   * Validates and returns the user's avatar URL.
   * If the avatar is not found, it will return the default avatar.
   * @returns A `string` containing the user's avatar URL.
   */
  async getAvatarURL(): Promise<string> {
    const response = await fetch(this.avatar_url, { method: 'HEAD' });
    if (response.status == 200) return this.avatar_url;
    else {
      this.avatar_url = 'https://osu.ppy.sh/images/layout/avatar-guest@2x.png';
      return this.avatar_url;
    }
  }

  /**
   * Retrieves a list of scores of a user.
   * @param params Configuration for the search request. See {@link UserScoreSearchParameters}.
   */
  async getScores(params: UserScoreSearchParameters): Promise<DroidScore[]> {
    return await DroidScore.search({
      user: this,
      beatmapOrHash: params.beatmapOrHash instanceof MapInfo ? params.beatmapOrHash : (params.beatmapOrHash ?? ''),
      order: params.order ?? 'pp',
    });
  }
}
