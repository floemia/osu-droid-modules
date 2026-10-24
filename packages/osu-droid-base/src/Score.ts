import { Accuracy, Beatmap, MapInfo, ModMap, ModRateAdjust, ModUtil, ScoreRank } from '@rian8337/osu-base';
import {
  DroidDifficultyCalculator,
  DroidPerformanceCalculator,
  ExtendedDroidDifficultyAttributes,
  IDroidPerformanceAttributes,
  IOsuPerformanceAttributes,
  OsuDifficultyAttributes,
  OsuDifficultyCalculator,
  OsuPerformanceCalculator,
  PerformanceCalculationOptions,
} from '@rian8337/osu-difficulty-calculator';
import { ScoreCreationParameters } from '@structures/parameters';

/**
 * Available gamemodes.
 */
type Mode = 'osu' | 'droid';

/**
 * A class representing a generic osu!droid score.
 */
export class Score {
  /**
   * The score's ID.
   */
  id?: number;

  /**
   * The username of the user who submitted the score.
   */
  username?: string;

  /**
   * The ID of the user who submitted the score.
   */
  uid?: number;

  /**
   * The `Date` the score was set at.
   */
  played_at?: Date;

  /**
   * The filename of the beatmap.
   */
  filename: string;

  /**
   * The obtained score.
   */
  total_score: number;

  /**
   * The obtained performance points.
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
   * The beatmap's MD5 hash.
   */
  hash: string;

  /**
   * The mods applied to the score.
   */
  mods: ModMap;

  /**
   * The amount of slider head hits.
   */
  slider_head_hits?: number | null;

  /**
   * The amount of slider tick hits.
   */
  slider_tick_hits?: number | null;

  /**
   * The amount of slider repeat hits.
   */
  slider_repeat_hits?: number | null;

  /**
   * The amount of slider end hits.
   */
  slider_end_hits?: number | null;

  /**
   * The beatmap of the score.
   *
   * Available by calling `getBeatmap()` if the beatmap exists.
   */
  beatmap: Beatmap | null;

  /**
   * Information of the beatmap.
   *
   * Available by calling `getBeatmap()` if the beatmap exists.
   */
  map_info: MapInfo<boolean> | undefined;

  private checked: boolean = false;
  private osu_diff: OsuDifficultyAttributes | undefined;
  private droid_diff: ExtendedDroidDifficultyAttributes | undefined;
  private osu_perf: IDroidPerformanceAttributes | undefined;
  private droid_perf: IOsuPerformanceAttributes | undefined;

  constructor(input: ScoreCreationParameters) {
    const {
      filename = '',
      total_score = 0,
      pp = null,
      rank = 'D',
      mods,
      accuracy,
      max_combo = 0,
      n100 = 0,
      n300 = 0,
      n50 = 0,
      nmiss = 0,
      beatmapOrHash,
    } = input;
    if (input.id) this.id = input.id;
    if (input.uid) this.uid = input.uid;
    if (input.username) this.username = input.username;
    if (input.played_at) this.played_at = input.played_at;
    this.filename = filename;
    this.total_score = total_score;
    this.pp = pp;
    this.rank = rank;
    this.accuracy = accuracy ?? new Accuracy({ n300, n100, n50, nmiss });
    this.max_combo = max_combo;
    this.slider_head_hits = input.slider_head_hits ?? null;
    this.slider_tick_hits = input.slider_tick_hits ?? null;
    this.slider_repeat_hits = input.slider_repeat_hits ?? null;
    this.slider_end_hits = input.slider_end_hits ?? null;
    if (mods instanceof ModMap) this.mods = mods;
    else if (Array.isArray(mods)) this.mods = ModUtil.deserializeMods(mods);
    else this.mods = ModUtil.pcStringToMods(mods ?? '');
    if (beatmapOrHash instanceof Beatmap) {
      this.beatmap = beatmapOrHash;
      this.hash = '';
    } else if (beatmapOrHash instanceof MapInfo) {
      this.hash = beatmapOrHash.hash;
      this.map_info = beatmapOrHash;
      this.beatmap = beatmapOrHash.beatmap;
    } else {
      this.hash = beatmapOrHash ?? '';
      this.beatmap = null;
    }
  }

  /**
   * Check if this score is a full combo.
   *
   * Potentially inaccurate if `this.beatmap` is `undefined`.
   */
  isFC(): boolean {
    return this.beatmap ? this.beatmap.maxCombo == this.max_combo : this.accuracy.nmiss == 0;
  }

  /**
   * Gets the combined speed rate of all `ModRateAdjust` mods present in this score.
   */
  getFinalSpeed(): number {
    let final_rate = 1;
    for (const mod of this.mods.values().filter((m) => m instanceof ModRateAdjust)) {
      final_rate *= mod.rate;
    }
    return final_rate;
  }

  /**
   * Gets information of the beatmap.
   *
   * @param downloadBeatmap Downloads the .osu file and decodes the data to `this.beatmap`. Defaults to `true`.
   */
  async getMapInfo(downloadBeatmap: boolean = true): Promise<MapInfo<boolean> | undefined> {
    const data = await MapInfo.getInformation(this.hash, downloadBeatmap);
    if (downloadBeatmap) this.checked = true;
    if (!data) return undefined;
    this.map_info = data;
    this.beatmap = data.beatmap;
    return this.map_info;
  }

  /**
   * Requests the beatmap this score was set on.
   */
  async getBeatmap(): Promise<Beatmap | null> {
    if (this.beatmap || this.checked == true) return this.beatmap;
    await this.getMapInfo();
    return this.beatmap;
  }

  /**
   * Calculates the difficulty values of this score, using the osu!droid difficulty system.
   **/
  async calculateDifficulty(mode?: 'droid'): Promise<ExtendedDroidDifficultyAttributes | undefined>;

  /**
   * Calculates the difficulty values of this score, using the osu! difficulty system.
   **/
  async calculateDifficulty(mode: 'osu'): Promise<OsuDifficultyAttributes | undefined>;

  /**
   * Calculates the difficulty values of this score, using the osu!droid or osu! difficulty system.
   * @param mode The system to use. Defaults to `droid`.
   */
  async calculateDifficulty(
    mode: Mode,
  ): Promise<OsuDifficultyAttributes | ExtendedDroidDifficultyAttributes | undefined>;

  async calculateDifficulty<T extends Mode = 'droid'>(
    mode: Mode = 'droid' as T,
  ): Promise<OsuDifficultyAttributes | ExtendedDroidDifficultyAttributes | undefined> {
    const isDroid = mode == 'droid';
    const cached_rating = isDroid ? this.droid_diff : this.osu_diff;
    if (cached_rating) return cached_rating;

    const map = await this.getBeatmap();
    if (!map) return undefined;
    const diff_calculator = isDroid ? new DroidDifficultyCalculator() : new OsuDifficultyCalculator();
    return diff_calculator.calculate(map, this.mods);
  }

  /**
   * Calculates the performance values of this score, using the osu!droid PP system.
   **/
  async calculatePerformance(mode?: 'droid'): Promise<IDroidPerformanceAttributes | undefined>;

  /**
   * Calculates the performance values of this score, using the osu! PP system.
   **/
  async calculatePerformance(mode: 'osu'): Promise<IOsuPerformanceAttributes | undefined>;

  /**
   * Calculates the performance values of this score, using the osu!droid or osu! PP system.
   * @param mode The system to use. Defaults to `droid`.
   */
  async calculatePerformance(mode: Mode): Promise<IOsuPerformanceAttributes | IDroidPerformanceAttributes | undefined>;

  async calculatePerformance<T extends Mode = 'droid'>(
    mode: T = 'droid' as T,
  ): Promise<IOsuPerformanceAttributes | IDroidPerformanceAttributes | undefined> {
    const isDroid = mode == 'droid';
    const cached_perf = isDroid ? this.droid_perf : this.osu_perf;
    if (cached_perf) return cached_perf;
    const rating = await this.calculateDifficulty(mode);
    if (!rating) return;
    const calc_options: PerformanceCalculationOptions = {
      accPercent: this.accuracy,
      combo: this.max_combo,
      totalScore: this.total_score,
    };

    const perf_calculator = isDroid
      ? new DroidPerformanceCalculator(rating as ExtendedDroidDifficultyAttributes)
      : new OsuPerformanceCalculator(rating as OsuDifficultyAttributes);
    const performance = perf_calculator.calculate(calc_options);
    return performance;
  }

  /**
   * Converts this score to a full combo score and returns it.
   */
  toFC(): this {
    const cloned = Object.create(Object.getPrototypeOf(this)) as this;
    Object.assign(cloned, this);

    cloned.max_combo = this.beatmap?.maxCombo ?? NaN;
    cloned.pp = null;

    // null everything means the calculator will consider every slider as completely hit
    cloned.slider_end_hits = null;
    cloned.slider_head_hits = null;
    cloned.slider_repeat_hits = null;
    cloned.slider_tick_hits = null;

    cloned.accuracy = new Accuracy({
      n300: this.accuracy.n300 + this.accuracy.nmiss,
      n100: this.accuracy.n100,
      n50: this.accuracy.n50,
      nmiss: 0,
    });

    return cloned;
  }
}
