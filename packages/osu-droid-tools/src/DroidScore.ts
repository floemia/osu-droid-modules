import { DroidAPI, ScoreResponse, ScoreSearchResponse } from '@floemia/osu-droid-api';
import { Score, ScoreCreationParameters } from '@floemia/osu-droid-base';
import { Accuracy, MapInfo } from '@rian8337/osu-base';
import { ReplayAnalyzer } from '@rian8337/osu-droid-replay-analyzer';
import { ScoreSearchParameters } from '@structures/parameters';
import { DroidUser } from '~DroidUser';

/**
 * A class representing an osu!droid score from the main server.
 */
export class DroidScore extends Score {
  /**
   * The username of the user who submitted the score.
   */
  username: string;

  /**
   * The ID of the user who submitted the score.
   */
  uid: number;

  /**
   * The score's ID.
   */
  id: number;

  /**
   * The `Date` the score was set at.
   */
  played_at: Date;

  /**
   * The replay of the score.
   *
   * Available by calling `getReplay()` if the replay exists.
   */
  replay: ReplayAnalyzer | undefined;

  private constructor(input: ScoreCreationParameters) {
    super(input);
    this.id = input.id!;
    this.uid = input.uid!;
    this.username = input.username!;
    this.played_at = input.played_at!;
  }

  /**
   * Creates a new `DroidScore` instance from an API score search response.
   * @param response The score data, found in the `/score-search` endpoint.
   */
  static fromAPISearchResponse(response: ScoreSearchResponse, beatmap?: MapInfo<true>): DroidScore {
    return new DroidScore({
      username: response.username,
      uid: response.uid,
      id: response.id,
      filename: response.filename,
      total_score: response.score,
      pp: response.pp,
      rank: response.mark,
      accuracy: new Accuracy({
        n300: response.perfect,
        n100: response.good,
        n50: response.bad,
        nmiss: response.miss,
      }),
      max_combo: response.combo,
      played_at: new Date(response.date * 1000),
      beatmapOrHash: beatmap ?? response.hash,
      mods: response.mods,
      slider_end_hits: response.sliderEndHit,
      slider_head_hits: response.sliderHeadHit,
      slider_repeat_hits: response.sliderRepeatHit,
      slider_tick_hits: response.sliderTickHit,
    });
  }

  /**
   * Creates a new `DroidScore` instance from an API response.
   * @param response The score data, found in the `/profile-uid` and `/profile-username` endpoints.
   */
  static fromAPIResponse(response: ScoreResponse, user?: DroidUser): DroidScore {
    return new DroidScore({
      uid: user?.id ?? NaN,
      username: user?.username ?? '',
      id: response.ScoreId,
      filename: response.Filename,
      total_score: response.MapScore,
      pp: response.MapPP,
      rank: response.MapRank,
      accuracy: new Accuracy({
        n300: response.MapPerfect,
        n100: response.MapGood,
        n50: response.MapBad,
        nmiss: response.MapMiss,
      }),
      max_combo: response.MapCombo,
      played_at: new Date(response.PlayedDate),
      beatmapOrHash: response.MapHash,
      mods: response.Mods,
      slider_end_hits: response.SliderEndHit,
      slider_head_hits: response.SliderHeadHit,
      slider_repeat_hits: response.SliderRepeatHit,
      slider_tick_hits: response.SliderTickHit,
    });
  }

  /**
   * Gets the replay of this score.
   */
  async getReplay(): Promise<ReplayAnalyzer | undefined> {
    if (!this.id) return undefined;
    if (this.replay) return this.replay;
    const map = await this.getBeatmap();
    if (!map) return undefined;
    this.replay = new ReplayAnalyzer({ scoreID: this.id, map: map.beatmap });
    return this.replay.analyze();
  }

  /**
   * Gets the score of another user in this beatmap.
   * @param user The other user's ID or username.
   * @param highest Whether to return the score with the highest performance or total score. Defaults to `'pp'`.
   */
  async compare(user: DroidUser | number | string, highest: 'pp' | 'score' = 'pp'): Promise<DroidScore | undefined> {
    const scores = await DroidScore.search({ user, beatmapOrHash: this.hash, order: highest });
    return scores[0];
  }

  /**
   * Gets a list of scores that match the search criteria.
   * @param params Configuration for the search request. See {@link ScoreSearchParameters}.
   */
  static async search(params: ScoreSearchParameters): Promise<DroidScore[]> {
    const { order = 'pp', page = 0, user, beatmapOrHash } = params;
    const hasBeatmap = beatmapOrHash instanceof MapInfo;
    const hash = hasBeatmap ? beatmapOrHash.hash : (beatmapOrHash ?? '');
    const u = (user instanceof DroidUser ? user.id : user) ?? '';
    const scores = await DroidAPI.scoreSearch({ user: u, hash, order, page });

    return scores.map((score) => DroidScore.fromAPISearchResponse(score, hasBeatmap ? beatmapOrHash : undefined));
  }
}
