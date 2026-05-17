export interface LeaderboardParameters {
  /**
   * Order scores by: `score`, `pp`. Defaults to `pp`.
   */
  type: 'score' | 'pp';
  region?: string | 'all';
  page?: number;
  limit?: number;
}
