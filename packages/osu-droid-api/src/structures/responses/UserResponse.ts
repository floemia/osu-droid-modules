import { ScoreResponse } from './ScoreResponse';

/**
 * The raw response from the `/profile-uid/` and `/profile-username/` endpoints.
 *
 * Contains information about the user and their scores.
 */
export interface UserResponse {
  /**
   * The user's ID.
   */
  UserId: number;

  /**
   * The user's username.
   */
  Username: string;

  /**
   * The user's global PP rank.
   */
  GlobalRank: number;

  /**
   * The user's country PP rank.
   */
  CountryRank: number;

  /**
   * The user's overall score.
   */
  OverallScore: number;

  /**
   * The user's overall PP.
   */
  OverallPP: number;

  /**
   * The user's overall playcount.
   */
  OverallPlaycount: number;

  /**
   * The user's overall accuracy.
   */
  OverallAccuracy: number;

  /**
   * The user's registered date. In milliseconds.
   */
  Registered: string;

  /**
   * The user's last login date. In milliseconds.
   */
  LastLogin: string;

  /**
   * The user's country. [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) compliant.
   */
  Region: string;

  /**
   * Whether the user is a supporter or not.
   */
  Supporter: number;

  /**
   * Whether the user is a core developer or not.
   */
  CoreDeveloper: number;

  /**
   * Whether the user is a developer or not.
   */
  Developer: number;

  /**
   * Whether the user is a contributor or not.
   */
  Contributor: number;

  /**
   * The user's top 50 scores, sorted by highest PP.
   */
  Top50Plays: ScoreResponse[];

  /**
   * The user's last 50 scores, sorted by latest.
   */
  Last50Scores: ScoreResponse[];
}
