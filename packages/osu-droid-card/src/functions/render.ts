import { DroidScore, DroidUser } from '@floemia/osu-droid-tools';
import { createCanvas, GlobalFonts, Image, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import { MapInfo } from '@rian8337/osu-base';
import path from 'path';
import { DroidHelper } from '../helpers';
import { CanvasHelper } from '../helpers/CanvasHelper';
import { ColorHelper } from '../helpers/ColorHelper';
import { PathHelper } from '../helpers/PathHelper';

const assets = PathHelper.getAssetsDir();

GlobalFonts.registerFromPath(path.join(assets, './fonts/SF-Pro-Rounded-Heavy.otf'), 'Title');
GlobalFonts.registerFromPath(path.join(assets, './fonts/SF-Pro-Rounded-Bold.otf'), 'Subtitle');

const map_info_cache = new Map<string, Promise<MapInfo | null>>();
const map_cover_cache = new Map<number, Promise<Image>>();
const mod_icon_cache = new Map<string, Promise<Image>>();

/**
 * Shortens a piece of text with an ellipsis until it fits in `maxWidth`.
 */
function fitText(ctx: SKRSContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let result = text;
  while (result.length > 0 && ctx.measureText(`${result}...`).width > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result.trimEnd()}...`;
}

/**
 * Resolves the beatmap of a score.
 *
 * The beatmap is taken from the score itself or from the passed beatmaps. If
 * neither is available, it is fetched from the osu! API using the score's hash
 * and cached for later renders.
 */
async function resolveBeatmap(score: DroidScore, beatmaps?: MapInfo[]): Promise<MapInfo | null> {
  if (score.map_info) return score.map_info;

  const passed = beatmaps?.find((beatmap) => beatmap.hash === score.hash);
  if (passed) return passed;

  let pending = map_info_cache.get(score.hash);
  if (!pending) {
    pending = MapInfo.getInformation(score.hash, false);
    map_info_cache.set(score.hash, pending);
  }

  return pending;
}

/**
 * Loads the cover of a beatmap, caching it by beatmap set ID.
 */
async function getBeatmapCover(map: MapInfo | null) {
  const set_id = map?.beatmapSetId;
  if (!set_id) return null;

  let pending = map_cover_cache.get(set_id);
  if (!pending) {
    pending = loadImage(`https://assets.ppy.sh/beatmaps/${set_id}/covers/cover.jpg`).catch(() =>
      loadImage(path.join(assets, './fallback/default-bg@2x.png')),
    );
    map_cover_cache.set(set_id, pending);
  }

  return pending;
}

/**
 * Loads the banner of a user, if they have one.
 */
async function getUserBanner(user_id: number): Promise<Image | null> {
  try {
    const response = await fetch(`https://new.osudroid.moe/api2/frontend/banner/userid/${user_id}`);
    if (!response.ok) return null;

    const content_type = response.headers.get('content-type') ?? '';
    if (!content_type.startsWith('image/')) return null;

    return await loadImage(Buffer.from(await response.arrayBuffer()));
  } catch {
    return null;
  }
}

/**
 * Loads a mod's icon, caching it by acronym.
 */
async function getModIcon(mod: string) {
  let pending = mod_icon_cache.get(mod);
  if (!pending) {
    let icon_path = '';
    if (mod.startsWith('CS')) {
      const rate = mod.match(/\b(\d+(?:\.\d+)?)(?=x\b)/)![1]!;
      icon_path += './CS/' + rate.replace('.', '') + '.png';
    } else icon_path += `./${mod}.png`;
    icon_path = path.join(assets, './icons/mods', icon_path);

    pending = loadImage(icon_path);
    mod_icon_cache.set(mod, pending);
  }

  return pending;
}

export async function render(user: DroidUser, beatmaps?: MapInfo[]) {
  // init canvas
  const canvas = createCanvas(2000, 1080);
  const ctx = canvas.getContext('2d');

  // get avatar
  const avatar = await loadImage(user.avatar_url);

  // get banner, if the user has one
  const banner = await getUserBanner(user.id);

  // get accent color, preferring the banner over the avatar
  const accent = await ColorHelper.getAccentColor(banner ?? avatar);

  // get bg
  const bg = await CanvasHelper.tintImage(
    path.join(assets, './background/background2.png'),
    ColorHelper.adjustSaturation(ColorHelper.adjustBrightness(accent, -95), 40),
    0.5,
  );
  // clip everything to round rect aka final image rounded corner
  ctx.roundRect(0, 0, canvas.width, canvas.height, 60);
  ctx.clip();

  // get user country flag
  const flag = user.country
    ? await CanvasHelper.getFlagImage(user.country)
    : await loadImage(path.join(assets, './fallback/unknown_flag.png'));

  // draw background
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // replace the top half of the background with the banner, fading it out
  if (banner) {
    const banner_height = canvas.height / 2;
    const banner_canvas = createCanvas(canvas.width, banner_height);
    const banner_ctx = banner_canvas.getContext('2d');
    banner_ctx.filter = 'blur(9px) brightness(50%)';
    banner_ctx.drawImage(banner, -40, -40, canvas.width + 80, banner_height + 80);
    banner_ctx.filter = 'none';

    const banner_fade = banner_ctx.createLinearGradient(0, banner_height / 2, 0, banner_height);
    banner_fade.addColorStop(0, 'rgba(0,0,0,1)');
    banner_fade.addColorStop(1, 'rgba(0,0,0,0)');
    banner_ctx.globalCompositeOperation = 'destination-in';
    banner_ctx.fillStyle = banner_fade;
    banner_ctx.fillRect(0, 0, canvas.width, banner_height);

    ctx.drawImage(banner_canvas, 0, 0);
  }

  // draw background of second section
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  const bg_x = 40;
  const bg_y = 411;
  const bg_width = 1920;
  const bg_height = 629;
  const bg_radius = 90;
  CanvasHelper.roundFillRect(ctx, bg_x, bg_y, bg_width, bg_height, bg_radius);

  // draw gradient
  // const bg_gradient = ctx.createLinearGradient(0, 0, 0, 1080);
  // bg_gradient.addColorStop(0, "transparent");
  // bg_gradient.addColorStop(1, accent + "15");
  // ctx.fillStyle = bg_gradient;
  // CanvasHelper.roundFillRect(ctx, bg_x, bg_y, bg_width, bg_height, bg_radius);

  // draw avatar
  CanvasHelper.drawRoundedImage(ctx, avatar, 80, 50, 320, 320, 60);

  // shadow
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';

  // draw username
  ctx.textBaseline = 'top';
  ctx.fillStyle = accent;
  ctx.font = '100px Title';

  ctx.fillText(user.username, 470, 100);

  // draw flag and country
  ctx.drawImage(flag, 470, 239, 80, 80);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '64px Subtitle';
  const country = user.country
    ? new Intl.DisplayNames(['en'], { type: 'region' }).of(user.country.toUpperCase())
    : 'Unknown';
  ctx.fillText(country || 'Unknown', 580, 250);

  // draw rectangle of ranks and pp
  const ranking_x = 80;
  const ranking_y = 451;
  const ranking_width = 870;
  const ranking_height = 175;
  const ranking_radius = 60;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  CanvasHelper.roundFillRect(ctx, ranking_x, ranking_y, ranking_width, ranking_height, ranking_radius);

  // draw gradient
  // const rank_gradient = ctx.createLinearGradient(0, 451, 0, 601);
  // rank_gradient.addColorStop(0, "transparent");
  // rank_gradient.addColorStop(1, accent + "09");
  // ctx.fillStyle = rank_gradient;
  // CanvasHelper.roundFillRect(
  //   ctx,
  //   ranking_x,
  //   ranking_y,
  //   ranking_width,
  //   ranking_height,
  //   ranking_radius,
  // );
  // get earth emoji
  const earth = await loadImage(path.join(assets, './icons/earth.png'));

  // rank display
  // (earth emoji) #(global rank) | (country icon) #(country rank)
  const rank_top = 514;
  const rank_size = 55;
  const rank_middle = rank_top + rank_size / 2;
  const rank_gap = 30;
  const rank_separator_gap = 40;
  const rank_separator_width = 4;
  const rank_max_width = 500;

  const global_rank = user.statistics.rank.global ?? 0;
  const global_text = `#${global_rank.toLocaleString('en-US')}`;
  const country_rank = user.statistics.rank.country;
  const country_text = country_rank ? `#${country_rank.toLocaleString('en-US')}` : '';

  // glow of the global rank, based on how high the user is ranked
  const glow =
    global_rank === 1
      ? '#f47972' // red
      : global_rank >= 2 && global_rank <= 10
        ? '#72b7fc' // blue
        : global_rank >= 11 && global_rank <= 50
          ? '#ffef9e' // yellow
          : '#dedede';

  // shrink the font until the whole row fits in the available width
  let rank_font = 55;

  const measureRankRow = () => {
    ctx.font = `${rank_font}px Subtitle`;
    return (
      rank_size +
      rank_gap +
      ctx.measureText(global_text).width +
      rank_separator_gap +
      rank_separator_width +
      rank_separator_gap +
      rank_size +
      rank_gap +
      ctx.measureText(country_text).width
    );
  };
  while (rank_font > 24 && measureRankRow() > rank_max_width) rank_font -= 2;

  ctx.textBaseline = 'middle';
  ctx.font = `${rank_font}px Title`;

  const rank_separator_metrics = ctx.measureText('|');
  const rank_separator_height =
    rank_separator_metrics.actualBoundingBoxAscent + rank_separator_metrics.actualBoundingBoxDescent;

  let rank_x = 130;
  // earth emoji + global rank
  ctx.drawImage(earth, rank_x, rank_top - 3, rank_size, rank_size);
  rank_x += rank_size + rank_gap;

  ctx.fillStyle = '#FFFFFF';

  // draw global rank with glow
  ctx.save();
  ctx.shadowColor = glow;
  ctx.fillStyle = glow;
  ctx.shadowBlur = 40;
  ctx.fillText(global_text, rank_x, rank_middle);
  ctx.restore();

  rank_x += ctx.measureText(global_text).width + rank_separator_gap;

  if (user.country) {
    // separator
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    CanvasHelper.roundFillRect(
      ctx,
      rank_x,
      rank_middle - rank_separator_height / 2,
      rank_separator_width,
      rank_separator_height,
      rank_separator_width / 2,
    );
    rank_x += rank_separator_width + rank_separator_gap;

    // flag icon + country rank
    ctx.drawImage(flag, rank_x, rank_top - 5, rank_size + 5, rank_size + 5);
    rank_x += rank_size + rank_gap;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(country_text, rank_x, rank_middle);
    ctx.restore();
  }

  // draw pp
  const pp = user.statistics.pp.toLocaleString('en-US', { maximumFractionDigits: 0 }) + 'pp';
  ctx.textAlign = 'right';
  ctx.fillText(pp, 880, rank_middle);

  // draw rating square
  const rating = DroidHelper.getOverallRating(user);
  const rating_x = 650;
  const rating_y = 638;
  const rating_width = 300;
  const rating_height = 362;
  const rating_radius = 60;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  CanvasHelper.roundFillRect(ctx, rating_x, rating_y, rating_width, rating_height, rating_radius);

  // draw gradient
  // const rating_gradient = ctx.createLinearGradient(
  //   0,
  //   rating_y,
  //   0,
  //   rating_y + rating_height,
  // );
  // rating_gradient.addColorStop(0, "transparent");
  // rating_gradient.addColorStop(1, accent + "12");
  // ctx.fillStyle = rating_gradient;
  // CanvasHelper.roundFillRect(
  //   ctx,
  //   rating_x,
  //   rating_y,
  //   rating_width,
  //   rating_height,
  //   rating_radius,
  // );

  const rating_icon = await loadImage(path.join(assets, `./icons/ranks/${rating}.png`));
  const rating_glow = await ColorHelper.getDominantColor(rating_icon);
  const rating_icon_size = 240;
  const rating_icon_x = rating_x + (rating_width - rating_icon_size) / 2;
  const rating_icon_y = rating_y + (rating_height - rating_icon_size) / 2 + 10;

  ctx.save();
  ctx.shadowColor = rating_glow;
  ctx.shadowBlur = 40;
  ctx.drawImage(rating_icon, rating_icon_x, rating_icon_y, rating_icon_size, rating_icon_size);
  ctx.restore();

  // draw rating label
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '34px Title';
  ctx.fillText('RATING', rating_x + rating_width / 2, rating_y + 56);
  ctx.restore();

  // draw stats of the user, to the left of the rating square
  const stats_x = 120;
  const stats_right = 530;

  // separator between the stats and the rating square
  const separator_x = (stats_right + rating_x) / 2;
  const separator_margin = 40;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  CanvasHelper.roundFillRect(ctx, separator_x, rating_y + separator_margin, 4, rating_height - separator_margin * 2, 1);

  const stats_rows = [
    {
      label: 'ACCURACY',
      value: `${((user.statistics.accuracy ?? 0) * 100).toFixed(2)}%`,
    },
    {
      label: 'PLAYCOUNT',
      value: (user.statistics.playcount ?? 0).toLocaleString('en-US'),
    },
    {
      label: 'TOTAL SCORE',
      value: new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(user.statistics.total_score),
    },
  ];

  ctx.save();
  ctx.textBaseline = 'middle';

  ctx.font = '30px Title';
  stats_rows.forEach((row, index) => {
    const row_middle = rating_y + 56 + index * 60;

    // label
    ctx.textAlign = 'left';
    ctx.fillStyle = accent;
    ctx.fillText(row.label, stats_x, row_middle);

    // value
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(row.value, stats_right, row_middle);
  });

  // draw level
  const profile_level = DroidHelper.calculateProfileLevel(user);
  const level = Math.floor(profile_level);
  const level_progress = Math.min(Math.max(profile_level - level, 0), 1);

  const level_x = 120;
  const level_y = rating_y + 56 + 190;
  const level_width = stats_right - 120;
  const level_height = 110;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  CanvasHelper.roundFillRect(ctx, level_x, level_y, level_width, level_height, 30);

  // draw level progress bar
  const bar_x = stats_x + 45;
  const bar_y = rating_y + rating_height - 50;
  const bar_height = 15;
  const bar_radius = bar_height / 2;
  const bar_width = 320;

  ctx.fillStyle = accent;
  ctx.font = ctx.textAlign = 'left';
  ctx.fillText(`LEVEL ${level}`, bar_x, bar_y - 25);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText((level_progress * 100).toFixed(0) + '%', bar_x + bar_width, bar_y - 25);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';

  CanvasHelper.roundFillRect(ctx, bar_x, bar_y, bar_width, bar_height, bar_radius);

  if (level_progress > 0) {
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 20;
    ctx.fillStyle = accent;
    CanvasHelper.roundFillRect(
      ctx,
      bar_x,
      bar_y,
      Math.max(bar_height, bar_width * level_progress),
      bar_height,
      bar_radius,
    );
    ctx.restore();
  }
  ctx.restore();

  const scores = user.scores.best.slice(0, 3);
  const score_x = 1000;
  const score_y = ranking_y;
  const step = 187;
  const score_width = ranking_width + 51;
  const score_height = ranking_height;
  const radii = [
    [60, 60, 30, 30],
    [30, 30, 30, 30],
    [30, 30, 60, 60],
  ];

  const cover_radii = [
    [30, 60, 30, 30],
    [30, 30, 30, 30],
    [30, 30, 60, 30],
  ];
  // the score's position is displayed to the left of its card
  const index_width = 90;
  const card_x = score_x + index_width;
  const card_width = score_width - index_width;
  const card_padding = 35;
  const score_rank_styles = [
    { fill: '#ffd166', glow: '#ffb703' },
    { fill: '#e5e7eb', glow: '#9ca3af' },
    { fill: '#d08b5b', glow: '#a1552c' },
  ];

  for (const [index, score] of scores.entries()) {
    const row_y = score_y + step * index;
    const row_middle = row_y + score_height / 2;
    const row_radius = radii[index]!;
    const rank_style = score_rank_styles[index]!;

    // background of the whole row, including the index
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    CanvasHelper.roundFillRect(ctx, score_x, row_y, score_width, score_height, row_radius);

    // card background, holding the beatmap cover
    const card_radius = cover_radii[index]!;
    const map_info = await resolveBeatmap(score, beatmaps);
    const cover = await getBeatmapCover(map_info);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(card_x, row_y, card_width, score_height, card_radius);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fill();
    ctx.clip();

    if (cover) {
      // draw the cover blurred and slightly oversized to avoid transparent edges
      ctx.filter = 'blur(10px) brightness(40%) saturate(40%)';
      ctx.globalAlpha = 0.9;
      ctx.drawImage(cover, card_x - 40, row_y - 40, card_width + 80, score_height + 80);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }

    // darken the left for the title and the right for the pp and accuracy
    // const cover_gradient = ctx.createLinearGradient(
    //   card_x,
    //   0,
    //   card_x + card_width,
    //   0,
    // );
    // cover_gradient.addColorStop(0, "rgba(0,0,0,0.35)");
    // cover_gradient.addColorStop(0.55, "rgba(0,0,0,0.55)");
    // cover_gradient.addColorStop(1, "rgba(0,0,0,0.72)");
    // ctx.fillStyle = cover_gradient;
    // ctx.fillRect(card_x, row_y, card_width, score_height);
    ctx.restore();

    // score index
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '55px Title';
    ctx.shadowColor = rank_style.glow;
    ctx.shadowBlur = 35;
    ctx.fillStyle = rank_style.fill;
    ctx.fillText(`${index + 1}`, score_x + index_width / 2, row_middle);
    ctx.restore();

    // score rank image
    const rank_image_path = path.join(assets, './icons/ranks', `${score.rank}.png`);
    const score_rank_icon = await loadImage(rank_image_path);

    // pp and accuracy, right aligned
    const pp_text = `${Math.round(score.pp!).toLocaleString('en-US')}pp`;

    const accuracy = score.accuracy.value * 100;
    const accuracy_text = `${accuracy.toFixed(2)}%`;

    // draw the rank image
    ctx.save();
    ctx.font = '42px Title';
    const pp_width = ctx.measureText(pp_text).width;
    ctx.font = '26px Subtitle';
    const accuracy_width = ctx.measureText(accuracy_text).width;
    const result_width = Math.max(pp_width, accuracy_width);
    const rank_icon_size = 72;
    const rank_icon_x = card_x + card_width - card_padding - result_width - 24 - rank_icon_size;
    const title_max_width = rank_icon_x - (card_x + card_padding) - 20;
    ctx.restore();

    if (score_rank_icon) {
      ctx.drawImage(score_rank_icon, rank_icon_x, row_middle - rank_icon_size / 2, rank_icon_size, rank_icon_size);
    }

    // beatmap title and difficulty
    const title = map_info?.title!;
    const version = map_info?.version!;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.font = '36px Title';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(fitText(ctx, title, title_max_width), card_x + card_padding, row_y + 24);

    ctx.font = '28px Subtitle';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(fitText(ctx, version, title_max_width), card_x + card_padding, row_y + 72);

    // mod icons, below the difficulty
    const mod_icon_size = 44;
    const mod_gap = 8;
    const mod_y = row_y + 111;
    let mod_x = card_x + card_padding;

    // i mean rv6 is nottttt a *mod* per se.............. right??
    const ordered_mods = score.mods
      .toString()
      .split(',')
      .filter((m) => m != 'RV6');
    if (ordered_mods.length == 0) ordered_mods.push('NM');
    for (const mod of ordered_mods) {
      if (mod_x + mod_icon_size > card_x + card_padding + title_max_width) {
        break;
      }
      const mod_icon = await getModIcon(mod);
      if (!mod_icon) continue;

      ctx.drawImage(mod_icon, mod_x, mod_y, mod_icon_size, mod_icon_size);
      mod_x += mod_icon_size + mod_gap;
    }

    // pp and accuracy, right aligned
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    ctx.font = '42px Title';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(pp_text, card_x + card_width - card_padding, row_y + 70);

    ctx.font = '26px Subtitle';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(accuracy_text, card_x + card_width - card_padding, row_y + 120);
    ctx.restore();
  }

  return canvas.encode('png');
}

// export async function renderCustomSpeedMod() {
//   const multis = [
//     0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55,
//     1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2,
//   ];

//   const incr = await loadImage(path.join(assets, './icons/mods/mod_inc_square.png'));
//   const decr = await loadImage(path.join(assets, './icons/mods/mod_deq_square.png'));
//   const spdmtr = await loadImage(path.join(assets, './icons/mods/speedom.png'));

//   for (const multi of multis) {
//     const canvas = createCanvas(512, 512);
//     const ctx = canvas.getContext('2d');
//     const increase = multi > 1;
//     if (!increase) ctx.drawImage(decr, 0, 0);
//     else ctx.drawImage(incr, 0, 0);
//     const mult = multi.toLocaleString('en-US', { minimumFractionDigits: 2 });
//     ctx.font = '150px Title';
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillStyle = increase ? '#4d2f2f' : '#3a4d34';
//     ctx.drawImage(await CanvasHelper.tintImage(spdmtr, ctx.fillStyle, 1), 73, 48);

//     ctx.fillText(`${mult}x`, 512 / 2, 368);
//     const buffer = await canvas.encode('png');
//     writeFileSync(path.join(assets, `./icons/mods/CS/${mult.replace('.', '')}.png`), buffer);
//   }
// }
