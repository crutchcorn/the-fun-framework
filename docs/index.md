---
sidebar: false
nav: false
layout: home

title: The Fun Framework
titleTemplate: An experimental homegrown JS framework.
---

<div class="vp-doc">

```html
<!-- index.html -->

<!-- You can have multiple islands in one HTML file -->
<div data-island-comp="App">
  <button data-on-click="updateCount()">Count</button>
  <p>Count: {{count.value}}</p>
  <p data-if="count.value % 2 === 0">{{count.value}} is even</p>
</div>
```

```typescript
// index.ts
import {
  createState,
  registerComponent,
  render
} from "the-fun-framework";

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
App.selector = "App";
registerComponent(App);
render();
``` 
</div>
