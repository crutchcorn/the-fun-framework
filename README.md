<div align="center">
<h1>The Fun Framework</h1>

<a href="https://joypixels.com/profiles/emoji/playground-slide">
  <img
    height="80"
    width="80"
    alt="playground slide"
    src="./other/slide.png"
  />
</a>

<p>An experimental homegrown JS framework.</p>

</div>

<div align="center">

[![Build Status](https://img.shields.io/github/actions/workflow/status/crutchcorn/the-fun-framework/build.yml?branch=main)](https://github.com/crutchcorn/the-fun-framework/actions/workflows/validate.yml?query=branch%3Amain)
[![Pre-release](https://img.shields.io/npm/v/the-fun-framework.svg)](https://npm.im/the-fun-framework)
[![gzip size](https://img.badgesize.io/https://unpkg.com/the-fun-framework@latest/dist/the-fun-framework.cjs?compression=gzip)](https://unpkg.com/browse/the-fun-framework@latest/dist/the-fun-framework.cjs)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE.md)

</div>

The goals of this project are:

- HTML-first templating
- No VDOM
- Implicit re-renders (instead of calling an update function manually, "mutate")

## Usage

```html
<!-- index.html -->

<!-- You can have multiple islands in one HTML file -->
<div data-island-comp="App">
  <button data-on-click="updateCount()">Count</button>
  <p>Count: {{count.value}}</p>
  <p data-if="count.value % 2 === 0">{{count.value}} is even</p>
  <p data-if="count.value % 2 !== 0">{{count.value}} is odd</p>
</div>
```

```typescript
// index.ts
import {
  createState,
  registerComponent,
  render
} from "./framework.ts";

function App() {
  let count = createState(
    0
  );

  function updateCount() {
    count.value++;
  }

  return {
    count,
    updateCount
  }
}

// Register with the same name as `data-island-comp`
registerComponent("App", App);
render();
``` 
