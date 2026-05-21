import { DroidAPI, PPLeaderboardUser, ScoreLeaderboardUser, ScoreResponse, UserResponse } from '@floemia/osu-droid-api';
import { User } from '@floemia/osu-droid-base';
import { UserScoreSearchParameters } from '@structures/parameters';
import { DroidScore } from '~DroidScore';

/**
 * The scores of a user.
 */
export interface DroidUserScores {
  /**
   * The recent scores of the user.
   */
  recent: DroidScore[];
  /**
   * The best scores of the user.
   */
  best: DroidScore[];
}

/**
 * A class representing an osu!droid user from the main server.
 */
export class DroidUser extends User {
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

  private constructor(response: UserResponse) {
    const {
      UserId,
      Username,
      Region,
      GlobalRank,
      CountryRank,
      OverallScore,
      OverallPP,
      OverallPlaycount,
      OverallAccuracy,
      Registered,
      LastLogin,
      Supporter,
      CoreDeveloper,
      Developer,
      Contributor,
      Top50Plays,
      Last50Scores,
    } = response;

    super({
      id: UserId,
      username: Username,
      avatar_url: `https://osudroid.moe/user/avatar/${UserId}.png`,
      country: Region,
      url: `https://osudroid.moe/profile.php?uid=${UserId}`,
      statistics: {
        rank: { global: GlobalRank, country: CountryRank },
        total_score: OverallScore,
        pp: OverallPP,
        playcount: OverallPlaycount,
        accuracy: OverallAccuracy,
      },
    });
    this.registered_at = new Date(Registered);
    this.last_login = new Date(LastLogin);
    this.supporter = Boolean(Supporter);
    this.core_developer = Boolean(CoreDeveloper);
    this.developer = Boolean(Developer);
    this.contributor = Boolean(Contributor);
    this.scores = {
      best: this.mapScores(Top50Plays),
      recent: this.mapScores(Last50Scores),
    };
  }

  static async fromLeaderboardUser(user: LBDroidUser): Promise<DroidUser> {
    return (await DroidUser.get(user.id)) as DroidUser;
  }
  /**
   * Converts an API score to a `DroidScore` instance.
   * @param scores The raw API response of a score.
   */
  private mapScores(scores: ScoreResponse[]): DroidScore[] {
    return scores.map((score) => DroidScore.fromAPIResponse(score, this));
  }

  /**
   * Get a `DroidUser` instance, containing their information and scores.
   * @param user The user's ID or username.
   * @param check_avatar_url Whether to validate the user's avatar URL or not. Defaults to `true`.
   */
  static async get(user: number | string, check_avatar_url: boolean = true): Promise<DroidUser | undefined> {
    const response = await DroidAPI.getUser(user);
    if (!response) return undefined;

    const u = new DroidUser(response);
    if (check_avatar_url) await u.validateAvatarURL();
    return u;
  }

  /**
   * Validates the user's avatar URL. Falls back to the default avatar if 404 or unreachable.
   */
  private async validateAvatarURL(): Promise<void> {
    try {
      const response = await fetch(this.avatar_url, { method: 'HEAD' });
      if (response.status == 200) return;
    } catch {}
    this.avatar_url = 'https://osu.ppy.sh/images/layout/avatar-guest@2x.png';
  }

  /**
   * Get a list of scores of this user that match the search criteria.
   * @param params Configuration for the search request. See {@link UserScoreSearchParameters}.
   */
  async getScores(params: UserScoreSearchParameters): Promise<DroidScore[]> {
    return DroidScore.search({ ...params, user: this });
  }
}

/**
 * A class representing a user in the main server's leaderboard.
 *
 * Contains partial information.
 */
export class LBDroidUser {
  /**
   * The user's ID.
   */
  id: number;

  /**
   * The user's username.
   */
  username: string;

  /**
   * The user's total playcount.
   */
  playcount: number;

  constructor(user: ScoreLeaderboardUser | PPLeaderboardUser) {
    this.id = user.UserId;
    this.username = user.Username;
    this.playcount = user.OverallPlaycount;
  }

  /**
   * Converts this instance to a full `DroidUser` instance.
   */
  async toDroidUser(): Promise<DroidUser> {
    return DroidUser.fromLeaderboardUser(this);
  }
}

/**
 * A class representing a user in the main server's score leaderboard.
 */
export class ScoreLBDroidUser extends LBDroidUser {
  /**
   * The user's total score.
   */
  score: number;

  constructor(user: ScoreLeaderboardUser) {
    super(user);
    this.score = user.OverallScore;
  }
}

/**
 * A class representing a user in the main server's performance points leaderboard.
 */
export class PPLBDroidUser extends LBDroidUser {
  /**
   * The user's total performance points.
   */
  pp: number;

  constructor(user: PPLeaderboardUser) {
    super(user);
    this.pp = user.OverallPP;
  }
}
