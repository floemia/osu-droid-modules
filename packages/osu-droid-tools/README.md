# osu-droid-tools

A module written in TypeScript that uses the [osu!droid Public API](https://new.osudroid.moe/api2/frontend/docs) with the help of [@floemia/osu-droid-api](../osu-droid-api), turning the raw responses into instances with useful methods.

## dependencies

- [@floemia/osu-droid-api](../osu-droid-api) - osu!droid Public API interaction
- [@rian8337/osu-base](https://github.com/Rian8337/osu-droid-module/tree/master/packages/osu-base) - osu! API interaction
- [@rian8337/osu-difficulty-calculator](https://github.com/Rian8337/osu-droid-module/tree/master/packages/osu-difficulty-calculator) - osu! / osu!droid difficulty and performance caclulation
- [@rian8337/osu-replay-analyzer](https://github.com/Rian8337/osu-droid-module/tree/master/packages/osu-droid-replay-analyzer) - to gather replays and analyze them

## requirements

- An osu!api v1 key. Request one [here](https://osu.ppy.sh/home/account/edit#legacy-api).

## installation

```bash
npm install @floemia/osu-droid-tools
```

## example usages

- **Request a user, calculate the performance values of their top play**

```ts
import { DroidUser } from '@floemia/osu-droid-tools';

// get a user
const user = await DroidUser.get({ id: 177955 });
// or
const user = await DroidUser.get({ username: 'MG_floemia' });

// grab the user's top plays
const top_plays = user.scores.best;
const score = top_plays[0];

// calculate difficulty and performance values for osu! and osu!droid
const performance_droid = await score.calculate('droid');
const performance_osu = await score.calculate('osu');
```

- **Having a beatmap, search the scores from another user, ordered by highest PP**

```ts
import { DroidScore, DroidUser } from '@floemia/osu-droid-tools';

const user = await DroidUser.get({ id: 123456 });
// alternatively, use their UID instead
const user = 123456;
// ... or username
const user = 'someone';

const their_scores = await DroidScore.search({
  user: user,
  beatmapOrHash: map || 'e9c0d351602d8b2d362ade920d8eb7a6',
  order: 'pp',
});

const score = their_scores[0];
console.log(score.isFC()); // true!!!!!!!!
console.log(score.getFinalSpeed()); // uhh like DT (1.5x) on top of CS(1.3x) = 1.95 !!!

// get the replay from this score
const replay = await score.getReplay();
```

- **Having a user, search their plays in a beatmap, ordered by highest score**

```ts
const user = await DroidUser.get({ username: 'MG_floemia' });
const scores = await user.getScores({
  beatmapOrHash: map || '652320f3590ebb8c66a19e2d7e37c153',
  order: 'score', // "score" | "pp" | "sid" | "date", defaults to "pp"
});
```

- **Create a score and calculate its performance values**

```ts
const score = DroidScore.create({
  n300: 1005,
  n100: 13,
  mods: 'EZHDNCPR',
  beatmap: map || '044004849f25542e49179611544e1e00',
  max_combo: 1054,
});
const performance = await score.calculate();
```

- **Get the leaderboard of a beatmap**

```ts
import { DroidServer } from "@floemia/osu-droid-tools";

const map_lb = DroidServer.getMapLeaderboard({
  beatmapOrHash: map || '044004849f25542e49179611544e1e00'
  order: "pp" // "score" | "pp" | "sid" | "date", defaults to "pp"
});
```

## to do:

- - [ ] global/regional user leaderboard support
- - [ ] add other server related methods
