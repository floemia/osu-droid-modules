import { DroidUser } from '@floemia/osu-droid-tools';

export type OverallRating = 'XH' | 'X' | 'SH' | 'S' | 'A' | 'B' | 'C' | 'D';

/**
 * Helps with osu!droid related operations.
 */
export abstract class DroidHelper {
  /**
   * Calculates an overall rating for a player.
   *
   * The rating is a weighted score made of:
   * - Accuracy: 30%
   * - Total PP: 30%
   * - Rank: 20% (global and country rank are averaged)
   * - Highest PP play: 20%
   *
   * @param user The player to calculate the rating for.
   */
  static getOverallRating(user: DroidUser): OverallRating {
    const stats = user.statistics;
    const highest = user.scores.best[0];

    const accuracy_score = clamp(stats.accuracy ?? 0, 0, 1) * 100;
    const pp_score = normalizeLog(stats.pp ?? 0, 20000) * 100;

    const global_rank_score = rankToScore(stats.rank.global);
    const country_rank = stats.rank.country;
    const rank_score =
      country_rank != null && country_rank > 0
        ? (global_rank_score + rankToScore(country_rank)) / 2
        : global_rank_score;

    const highpp_score = normalizeLog(highest?.pp ?? 0, 2000) * 100;

    const overall_score = accuracy_score * 0.3 + pp_score * 0.3 + rank_score * 0.2 + highpp_score * 0.2;

    if (overall_score >= 95) return 'XH';
    if (overall_score >= 90) return 'X';
    if (overall_score >= 85) return 'SH';
    if (overall_score >= 70) return 'S';
    if (overall_score >= 60) return 'A';
    if (overall_score >= 50) return 'B';
    if (overall_score >= 38) return 'C';

    return 'D';
  }

  /**
   * Returns the current level of the user.
   * @param score
   * @author Original by Rian8337
   * @see {@link https://github.com/Rian8337/Mahiru/blob/e116c36785cc180e4f576c30cb47de43137d0d61/src/utils/helpers/ScoreHelper.ts#L124}
   */
  static calculateProfileLevel(user: DroidUser) {
    const score = user.statistics.total_score;
    const calculateScoreRequirement = (level: number): number => {
      return Math.round(
        level <= 100
          ? ((5000 / 3) * (4 * Math.pow(level, 3) - 3 * Math.pow(level, 2) - level) +
              1.25 * Math.pow(1.8, level - 60)) /
              1.128
          : 23875169174 + 15000000000 * (level - 100),
      );
    };

    let level = 1;

    while (calculateScoreRequirement(level + 1) <= score) {
      ++level;
    }

    const nextLevelReq = calculateScoreRequirement(level + 1) - calculateScoreRequirement(level);
    const curLevelReq = score - calculateScoreRequirement(level);
    level += curLevelReq / nextLevelReq;

    return level;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function rankToScore(rank: number | null | undefined): number {
  return Math.max(0, 100 - Math.log10(Math.max(rank ?? 0, 1)) * 20);
}

function normalizeLog(value: number, max: number): number {
  if (value <= 0) return 0;

  return clamp(Math.log10(value + 1) / Math.log10(max), 0, 1);
}
