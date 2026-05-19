<div align="center">
  <h1>osu-droid-tools</h1>
</div>

A module written in TypeScript that uses the [osu!droid Public API](https://new.osudroid.moe/api2/frontend/docs) with the help of [@floemia/osu-droid-api](../osu-droid-api), turning the raw responses into instances with useful methods.

## dependencies (thank you)

- [@rian8337/osu-base](https://github.com/Rian8337/osu-droid-module/tree/master/packages/osu-base) - osu! API interaction and other utilities
- [@rian8337/osu-difficulty-calculator](https://github.com/Rian8337/osu-droid-module/tree/master/packages/osu-difficulty-calculator) - osu! / osu!droid difficulty and performance calculation
- [@rian8337/osu-replay-analyzer](https://github.com/Rian8337/osu-droid-module/tree/master/packages/osu-droid-replay-analyzer) - osu!droid replay gathering and analysis

## requirements

- An osu!api v1 key. Request one [here](https://osu.ppy.sh/home/account/edit#legacy-api).

## installation

```bash
npm install @floemia/osu-droid-tools
```

Then, import it in your code:

```ts
import { DroidUser, DroidScore, DroidServer } from '@floemia/osu-droid-tools';
// or
const { DroidUser, DroidScore, DroidServer } = require('@floemia/osu-droid-tools');
```

## example usages

- #### Request a user, calculate the performance values of their top play

```ts
// get a user
const user = await DroidUser.get('MG_floemia' || 177955);

const top_plays = user.scores.best;
const score = top_plays[0];

const performance = await score.calculate('droid' || 'osu'); // defaults to 'droid'
```

- #### Having a score, compare it to another user's score in the same beatmap

```ts
const user = await DroidUser.get('MG_floemia' || 177955);
const my_score = user.scores.best[0];
const their_score = await score.compare('someone', 'pp' || 'score'); // defaults to highest 'pp' score
console.log(score.pp > other_score.pp);
```

- #### Having a score, convert it to a full combo and compare the performance values

```ts
const score = user.scores.recent[0];
const performance = await score.calculate();

if (!score.isFC()) {
  const score_fc = score.toFC();
  const performance_fc = await score_fc.calculate();
  console.log(performance_fc.total - performance.total);
}
```

- #### Having a user, search their plays in a beatmap

```ts
const user = await DroidUser.get('MG_floemia' || 177955);
const scores = await user.getScores({
  beatmapOrHash: map || '652320f3590ebb8c66a19e2d7e37c153',
  order: 'score' || 'pp' || 'sid' || 'date', // defaults to highest 'pp' first
});
```

- #### Get the leaderboard of a beatmap

```ts
const map_lb = DroidServer.getMapLeaderboard({
  beatmapOrHash: map || '044004849f25542e49179611544e1e00',
  order: 'pp' || 'score' || 'sid' || 'date', // defaults to highest 'pp' first
});
```

## to do:

- [ ] global/regional user leaderboard support
- [ ] add other server related methods
