import { DroidAPI, ScoreResponse, ScoreSearchResponse } from '@floemia/osu-droid-api';
import { Accuracy, MapInfo, ModCustomSpeed, ModMap, ModRateAdjust, ModUtil, ScoreRank } from '@rian8337/osu-base';
import {
  DroidDifficultyCalculator,
  DroidPerformanceCalculator,
  ExtendedDroidDifficultyAttributes,
  OsuDifficultyAttributes,
  OsuDifficultyCalculator,
  OsuPerformanceCalculator,
  PerformanceCalculationOptions,
} from '@rian8337/osu-difficulty-calculator';
import { ReplayAnalyzer, ReplayV3Data } from '@rian8337/osu-droid-replay-analyzer';
import { ScoreCreationParameters, ScoreSearchParameters } from '@structures/parameters';
import { DroidUser } from '~DroidUser';

/**
 * A class representing a generic osu!droid score.
 */
export class DroidScore {
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
   * The max combo achieved.
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
   * The replay of the score.
   *
   * Available by calling `getReplay()` if the replay exists.
   */
  replay: ReplayAnalyzer | undefined;

  constructor(response: ScoreResponse | ScoreSearchResponse | ScoreCreationParameters | ReplayAnalyzer) {
    if (response instanceof ReplayAnalyzer) {
      const data = response.data! as ReplayV3Data;
      this.filename = data.fileName;
      this.id = response.scoreID!;
      this.total_score = data.score;
      this.accuracy = data.accuracy;
      this.rank = data.rank;
      this.pp = null;
      this.mods = data.convertedMods;
      this.max_combo = data.maxCombo;
      this.played_at = data.time;
      this.hash = data.hash;
      this.beatmap = undefined;
      this.replay = response;
    } else if ('username' in response) {
      // is of type ScoreSearchResponse
      this.id = response.id;
      this.filename = response.filename;
      this.total_score = response.score;
      this.pp = response.pp;
      this.rank = response.mark;
      this.accuracy = new Accuracy({
        n300: response.perfect,
        n100: response.good,
        n50: response.bad,
        nmiss: response.miss,
      });
      this.max_combo = response.combo;
      this.played_at = new Date(response.date * 1000);
      this.hash = response.hash;
      this.mods = ModUtil.deserializeMods(response.mods);
      this.beatmap = undefined;
    } else if ('ScoreId' in response) {
      // is of type ScoreResponse
      this.id = response.ScoreId;
      this.filename = response.Filename;
      this.total_score = response.MapScore;
      this.pp = response.MapPP;
      this.rank = response.MapRank;
      this.accuracy = new Accuracy({
        n300: response.MapPerfect,
        n100: response.MapGood,
        n50: response.MapBad,
        nmiss: response.MapMiss,
      });
      this.max_combo = response.MapCombo;
      this.played_at = new Date(response.PlayedDate);
      this.hash = response.MapHash;
      this.mods = ModUtil.deserializeMods(response.Mods);
      this.beatmap = undefined;
    } else {
      // is of type ScoreCreationParameters
      this.id = NaN;
      this.filename = response.beatmap ? response.beatmap.fullTitle : '';
      this.accuracy = response.accuracy ?? new Accuracy({ percent: 100 });
      this.total_score = response.score ?? NaN;
      this.pp = response.pp ?? NaN;
      this.rank = response.rank ?? 'D';
      this.max_combo = response.max_combo ?? NaN;
      this.played_at = new Date();
      this.hash = response.beatmap?.hash ?? '';
      this.mods =
        response.mods instanceof ModMap
          ? response.mods
          : Array.isArray(response.mods)
            ? ModUtil.deserializeMods(response.mods)
            : ModUtil.pcStringToMods(response.mods ?? '');
      this.beatmap = response.beatmap;
    }
  }

  /**
   * Check if this score is a full combo.
   *
   * The result won't be accurate if `this.beatmap` is `undefined`.
   * @returns A `boolean` indicating the result.
   */
  isFC(): boolean {
    return this.accuracy.nmiss == 0 && (this.beatmap ? this.beatmap.maxCombo == this.max_combo : true);
  }

  /**
   * Gets the custom speed rate of this score.
   * @returns The value of the `ModCustomSpeed`, if present.
   */
  getCustomSpeed(): number | undefined {
    return this.mods.get(ModCustomSpeed)?.trackRateMultiplier.value ?? undefined;
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
      aimSliderCheesePenalty: this.replay?.sliderCheesePenalty.aimPenalty ?? 0,
      flashlightSliderCheesePenalty: this.replay?.sliderCheesePenalty.flashlightPenalty ?? 0,
      tapPenalty: this.replay?.tapPenalty ?? 0,
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
   * Retrieves a score from the osu!droid API.
   * @param id The score's ID.
   * @returns A `DroidScore` instance, if the score exists.
   */
  static async get(id: number): Promise<DroidScore | undefined> {
    const replay = await new ReplayAnalyzer({ scoreID: id }).analyze();
    if (!replay.data) return undefined;
    return new DroidScore(replay);
  }

  /**
   * Searches scores from the osu!droid API.
   * @param params The {@link ScoreSearchParameters} object containing the user, hash, order, and page.
   * @returns a `DroidScore[]` containing the requested scores.
   */
  static async search(params: ScoreSearchParameters): Promise<DroidScore[]> {
    let id, username;
    if (params.user instanceof DroidUser) id = params.user.id;
    else if (typeof params.user == 'number') id = params.user;
    else username = params.user;
    const scores = await DroidAPI.scoreSearch({
      id: id ?? NaN,
      username: username ?? '',
      hash: params.hash ?? '',
      order: params.order ?? 'sid',
      page: params.page ?? 0,
    });
    return scores.map((s) => new DroidScore(s));
  }
}
