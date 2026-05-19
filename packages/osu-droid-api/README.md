# osu-droid-api

> [!NOTE]
> Consider using [@floemia/osu-droid-tools]() instead, a module that converts the data obtained from this wrapper into instances with useful methods.

This is a basic wrapper for the [osu!droid Public API](https://new.osudroid.moe/api2/frontend/docs/) written in TypeScript. All of the methods return the raw data given by the API. 100% coverage.

## installation

```bash
npm install @floemia/osu-droid-api
```

Then, import it in your code:

```ts
import { DroidAPI } from '@floemia/osu-droid-api';
const { DroidAPI } = require('@floemia/osu-droid-api');
```

## example usages

- **Request a user**

```ts
const user = await DroidAPI.getUser('MG_floemia' || 177955);
```

- **Get a pp/score global or regional leaderboard**

```ts
// defaults to global pp leaderboard if no params are provided
const lb_scoreOrPP = await DroidAPI.getLeaderboard({ type: 'score' || 'pp' });
const py_lb_scoreOrPP = await DroidAPI.getLeaderboard({
  type: 'score' || 'pp',
  region: 'py',
});
```

- **Get a list of scores of a user in a map, ordered by PP**

```ts
const scores = await DroidAPI.scoreSearch({
  id: 177955,
  hash: 'e9c0d351602d8b2d362ade920d8eb7a6',
  order: 'pp', // pp | score | date | sid , defaults to "score"
});
```
