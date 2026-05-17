import { DroidAPI, ScoreResponse, ScoreSearchResponse } from '@floemia/osu-droid-api';
import { Accuracy, MapInfo, ModMap, ModRateAdjust, ModUtil, ScoreRank } from '@rian8337/osu-base';
import {
  DroidDifficultyCalculator,
  DroidPerformanceCalculator,
  ExtendedDroidDifficultyAttributes,
  OsuDifficultyAttributes,
  OsuDifficultyCalculator,
  OsuPerformanceCalculator,
  PerformanceCalculationOptions,
} from '@rian8337/osu-difficulty-calculator';
import { ReplayAnalyzer } from '@rian8337/osu-droid-replay-analyzer';
import { CompareParameters, ScoreCreationParameters, ScoreSearchParameters } from '@structures/parameters';
import { ScoreData } from '@structures/score';
import { DroidUser } from '~DroidUser';

/**
 * A class representing an osu!droid score.
 */
export class DroidScore {
  /**
   * The username of the user who submitted the score.
   */
  username: string | undefined;

  /**
   * The ID of the user who submitted the score.
   */
  uid: number | undefined;

  /**
   * The score's ID.
   */
  id: number;

  /**
   * The beatmap's filename.
   *
   * WARNING: The filename is broken for some beatmaps.
   */
  filename: string;

  /**
   * The obtained amount of score.
   */
  total_score: number;

  /**
   * The obtained performance points.
   * Returns `null` if the beatmap is not ranked.
   */
  pp: number | null = NaN;

  /**
   * The achieved rank.
   */
  rank: ScoreRank = 'D';

  /**
   * The achieved `Accuracy`.
   */
  accuracy: Accuracy;

  /**
   * The maximum combo achieved.
   */
  max_combo: number;

  /**
   * The `Date` the score was set at.
   */
  played_at: Date;
  /**
   * The beatmap's MD5 hash.
   * Use it to obtain the beatmap.
   */
  hash: string;

  /**
   * The applied mods.
   */
  mods: ModMap;

  /**
   * The beatmap of the score.
   *
   * Available by calling `getBeatmap()` if the beatmap exists.
   */
  beatmap: MapInfo | undefined;

  /**
   * The amount of slider head hits. Can be `null` if the replay is missing from the server.
   */
  slider_head_hits: number | null;

  /**
   * The amount of slider tick hits. Can be `null` if the replay is missing from the server.
   */
  slider_tick_hits: number | null;

  /**
   * The amount of slider repeat hits. Can be `null` if the replay is missing from the server.
   */
  slider_repeat_hits: number | null;

  /**
   * The amount of slider end hits. Can be `null` if the replay is missing from the server.
   */
  slider_end_hits: number | null;

  /**
   * The replay of the score.
   *
   * Available by calling `getReplay()` if the replay exists.
   */
  replay: ReplayAnalyzer | undefined;

  private constructor(input: ScoreData) {
    this.uid = input.uid || undefined;
    this.username = input.username || undefined;
    this.id = input.id;
    this.filename = input.filename;
    this.total_score = input.total_score;
    this.pp = input.pp;
    this.rank = input.rank;
    this.accuracy = input.accuracy;
    this.max_combo = input.max_combo;
    this.played_at = input.played_at;
    this.hash = input.hash;
    this.slider_end_hits = input.slider_end_hits;
    this.slider_head_hits = input.slider_head_hits;
    this.slider_repeat_hits = input.slider_repeat_hits;
    this.slider_tick_hits = input.slider_tick_hits;
    this.mods = input.mods;
    this.beatmap = input.beatmap;
  }

  /**
   * Given a search response, creates a new `DroidScore` instance.
   * @param response The raw response from the `/score-search` API endpoint.
   */
  static fromAPISearchResponse(response: ScoreSearchResponse): DroidScore {
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
      hash: response.hash,
      mods: ModUtil.deserializeMods(response.mods),
      slider_end_hits: response.sliderEndHit,
      slider_head_hits: response.sliderHeadHit,
      slider_repeat_hits: response.sliderRepeatHit,
      slider_tick_hits: response.sliderTickHit,
    });
  }

  /**
   * Given a raw score from the `/profile-uid` and `/profile-username` endpoints, creates a new `DroidScore` instance.
   * @param response The raw response from the osu!droid API.
   * @param user The `DroidUser` instance of the user who submitted the score.
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
      hash: response.MapHash,
      mods: ModUtil.deserializeMods(response.Mods),
      slider_end_hits: response.SliderEndHit,
      slider_head_hits: response.SliderHeadHit,
      slider_repeat_hits: response.SliderRepeatHit,
      slider_tick_hits: response.SliderTickHit,
    });
  }

  /**
   * Creates a new instance of `DroidScore`.
   * @param data Details of the score. See {@link ScoreCreationParameters}.
   */
  static create(data: ScoreCreationParameters): DroidScore {
    const acc =
      data.accuracy instanceof Accuracy
        ? data.accuracy
        : new Accuracy({
            // percent: data.accuracy ?? 100,
            nmiss: data.nmiss ?? 0,
            n300: data.n300 ?? 0,
            n100: data.n100 ?? 0,
            n50: data.n50 ?? 0,
            nobjects: data.beatmap?.objects ?? NaN,
          });
    let mods = new ModMap();
    if (data.mods && !(data.mods instanceof ModMap)) {
      if (typeof data.mods == 'string') {
        mods = ModUtil.pcStringToMods(data.mods);
      } else mods = ModUtil.deserializeMods(data.mods);
    }
    return new DroidScore({
      id: NaN,
      filename: data.beatmap?.fullTitle ?? '',
      total_score: data.score ?? NaN,
      pp: data.pp ?? NaN,
      rank: data.rank ?? 'D',
      accuracy: acc,
      max_combo: data.max_combo ?? NaN,
      played_at: new Date(),
      hash: data.beatmap?.hash ?? '',
      slider_end_hits: data.slider_end_hits ?? null,
      slider_head_hits: data.slider_head_hits ?? null,
      slider_repeat_hits: data.slider_repeat_hits ?? null,
      slider_tick_hits: data.slider_tick_hits ?? null,
      mods: mods,
      beatmap: data.beatmap,
    });
  }

  /**
   * Check if this score is a full combo.
   *
   * The result won't be accurate if `this.beatmap` is `undefined`.
   * @returns A `boolean` indicating the result.
   */
  isFC(): boolean {
    return this.beatmap ? this.beatmap.maxCombo == this.max_combo : this.accuracy.nmiss == 0;
  }

  /**
   * Gets the combined speed rate of all `ModRateAdjust` mods present in this score.
   * @returns The value of the final speed rate multiplier.
   */
  getFinalSpeed(): number {
    let final_rate = 1;
    for (const mod of this.mods.values().filter((m) => m instanceof ModRateAdjust)) {
      final_rate *= mod.trackRateMultiplier.value;
    }
    return final_rate;
  }

  /**
   * Retrieves the replay of this score.
   * @returns A `ReplayAnalyzer` instance, if the replay exists.
   */
  async getReplay(): Promise<ReplayAnalyzer | undefined> {
    if (!this.id) return undefined;
    if (this.replay) return this.replay;
    const map = await this.getBeatmap();
    if (!map) return undefined;
    return new ReplayAnalyzer({ scoreID: this.id, map: map.beatmap }).analyze();
  }

  /**
   * Gets the beatmap of this score.
   * @returns A `MapInfo` instance, if the beatmap exists.
   */
  async getBeatmap(): Promise<MapInfo<true> | undefined> {
    if (this.beatmap) return this.beatmap;
    const map = await MapInfo.getInformation(this.hash);
    if (!map) return undefined;
    this.beatmap = map;
    return map;
  }

  /**
   * Calculates the performance of this score, using the osu!droid gamemode.
   * @returns A `DroidPerformanceCalculator` instance.
   */
  async calculate(mode: 'droid'): Promise<DroidPerformanceCalculator | undefined>;

  /**
   * Calculates the performance of this score, using the osu! gamemode.
   * @returns A `OsuPerformanceCalculator` instance.
   */
  async calculate(mode: 'osu'): Promise<OsuPerformanceCalculator | undefined>;

  async calculate(
    mode: 'osu' | 'droid' = 'droid',
  ): Promise<OsuPerformanceCalculator | DroidPerformanceCalculator | undefined> {
    const map = await this.getBeatmap();
    if (!map) return undefined;

    const calc_options: PerformanceCalculationOptions = {
      accPercent: this.accuracy,
      combo: this.max_combo,
      ...(this.replay
        ? {
            aimSliderCheesePenalty: this.replay.sliderCheesePenalty.aimPenalty,
            flashlightSliderCheesePenalty: this.replay.sliderCheesePenalty.flashlightPenalty,
            tapPenalty: this.replay.tapPenalty,
          }
        : {}),
    };
    const diff_calculator = mode == 'osu' ? new OsuDifficultyCalculator() : new DroidDifficultyCalculator();
    const rating = diff_calculator.calculate(map.beatmap, this.mods);
    const perf_calculator =
      mode == 'osu'
        ? new OsuPerformanceCalculator(rating as OsuDifficultyAttributes)
        : new DroidPerformanceCalculator(rating as ExtendedDroidDifficultyAttributes);
    const performance = perf_calculator.calculate(calc_options);
    return performance;
  }

  /**
   * Returns the score of another user in this score's map.
   * @param params Configuration for the search request. See {@link CompareParameters}.
   */
  async compare(params: CompareParameters): Promise<DroidScore | undefined> {
    const map = await this.getBeatmap();
    if (!map) return undefined;
    const score = await DroidScore.search({
      user: params.user ?? '',
      beatmapOrHash: map.hash,
      order: 'pp',
      page: 0,
    });
    return score[0];
  }

  /**
   * Searches scores from the osu!droid API.
   * @param params The {@link ScoreSearchParameters}
   */
  static async search(params: ScoreSearchParameters): Promise<DroidScore[]> {
    let id, username, beatmap;
    if (params.user instanceof DroidUser) id = params.user.id;
    else if (typeof params.user == 'number') id = params.user;
    else username = params.user;
    beatmap = params.beatmapOrHash instanceof MapInfo ? params.beatmapOrHash.hash : params.beatmapOrHash;
    const scores = await DroidAPI.scoreSearch({
      id: id ?? NaN,
      username: username ?? '',
      hash: beatmap ?? '',
      order: params.order ?? 'sid',
      page: params.page ?? 0,
    });
    return scores.map((s) => DroidScore.fromAPISearchResponse(s));
  }
}
