# Framework Fun

This is an experimentation of building a homegrown JS framework with little/no dependencies (currently: 0).

While an unfinished design, I currently value:

- HTML-first templating
- No VDOM
- Implicit re-renders (instead of calling an update function manually, "mutate")

Here's what my current code looks like:

```html
<!-- index.html -->

<!-- You can have multiple islands in one HTML file -->
<div data-island-comp="App">
  <button data-on-click="updateCount()">Count</button>
  <p data-bind="count"></p>
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

# TODOs

- [x] Handle inline state update in event listeners
- [x] Handle method props and more in event listener function bind
- [ ] Support inline interpolation rather than `data-bind`
  - EG: `<p>Count is: {{count}}</p>`
- [ ] Add `data-if` conditional rendering 
