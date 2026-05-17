# osu-droid-api

> [!NOTE]
> You may be better off using [@floemia/osu-droid-tools](), a module that converts the data obtained from this wrapper into instances with useful methods.

This is a basic wrapper for the [osu!droid Public API](https://new.osudroid.moe/api2/frontend/docs/) written in TypeScript. All of the methods return the raw data given by the API. 100% coverage.

## Installation

```bash
npm install @floemia/osu-droid-api
```

## Example usages

```ts
import { DroidAPI } from '@floemia/osu-droid-api';
// const { DroidAPI } = require('@floemia/osu-droid-api');

// get a user
const user = await DroidAPI.getUser({ id: 177955 });
const user = await DroidAPI.getUser({ username: 'MG_floemia' });

// get a pp/score leaderboard (no params => defaults to global pp leaderboard)
const global_lb_pp = await DroidAPI.getLeaderboard();
const global_lb_score = await DroidAPI.getLeaderboard({ type: 'score' });

// regional pp/score leaderboard
const py_lb_pp = await DroidAPI.getLeaderboard({ region: 'py' });
const py_lb_score = await DroidAPI.getLeaderboard({ type: 'score', region: 'py' });

// get a list of scores of a user in a map, ordered by PP
const scores = await DroidAPI.scoreSearch({
  id: 177955,
  hash: 'e9c0d351602d8b2d362ade920d8eb7a6',
  order: 'pp', // pp | score | date | sid , defaults to "pp"
});
```
