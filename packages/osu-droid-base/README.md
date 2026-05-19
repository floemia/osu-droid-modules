# osu-droid-base

Base classes and methods for my osu!droid modules. Contains generic classes used in my other modules to interact with supported osu!droid servers.

## installation

```bash
npm install @floemia/osu-droid-base
```

Then, import it in your code:

```ts
import { Score, User } from '@floemia/osu-droid-base';
const { Score, User } = require('@floemia/osu-droid-base');
```

## example usages

- **Create a score and calculate its performance values**

```ts
const score = new Score({
  n300: 1005,
  n100: 13,
  mods: 'EZHDNCPR',
  beatmapOrHash: map || '044004849f25542e49179611544e1e00',
  max_combo: 1054,
});

// no params defaults to osu!droid
const performance = await score.calculate('osu' || 'droid');
```

- **Convert a score to a full combo score**

```ts
const score = new Score({
  n300: 1917,
  n100: 30,
  n50: 3,
  nmiss: 4,
  mods: 'EZHDNCPR',
  beatmapOrHash: map || 'acfa733e6d62976a809de8df85934c04',
  max_combo: 1792,
});
const performance = await score.calculate();

// true, score has misses
if (!score.isFC()) {
  const score_fc = score.toFC();
  const performance_fc = await score_fc.calculate();
  console.log(performance_fc.total - performance.total);
}
```
