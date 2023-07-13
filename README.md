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
[![Test Status](https://img.shields.io/github/actions/workflow/status/crutchcorn/the-fun-framework/test.yml?branch=main&label=tests)](https://github.com/crutchcorn/the-fun-framework/actions/workflows/validate.yml?query=branch%3Amain)
[![Pre-release](https://img.shields.io/npm/v/the-fun-framework.svg)](https://npm.im/the-fun-framework)
[![gzip size](https://img.badgesize.io/https://unpkg.com/the-fun-framework@latest/dist/the-fun-framework.cjs?compression=gzip)](https://unpkg.com/browse/the-fun-framework@latest/dist/the-fun-framework.cjs)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE.md)

</div>

The goals of this project are:

- HTML-first templating
- No VDOM
- Implicit re-renders (instead of calling an update function manually, "mutate")

## Installation

```shell
npm install the-fun-framework
```

## Usage

```html
<!-- index.html -->

<!-- You can have multiple islands in one HTML file -->
<div data-island-comp="App">
  <p>{{message}}</p>
</div>
```

```typescript
// index.ts
import { createState, registerComponent, render } from "the-fun-framework";

function App() {
  return {
    message: "Hello, world",
  };
}

// Register with the same name as `data-island-comp`
App.selector = "App";
registerComponent(App);
render();
```

### Conditional Display

```html
<!-- index.html -->
<div data-island-comp="Counter">
  <button data-on-click="updateCount()">Count</button>
  <p>Count: {{count.value}}</p>
  <p data-if="count.value % 2 === 0">{{count.value}} is even</p>
</div>
```

```typescript
// index.ts
import { createState, registerComponent, render } from "the-fun-framework";

function Counter() {
  let count = createState(0);

  function updateCount() {
    count.value++;
  }

  return {
    count,
    updateCount,
  };
}

// Register with the same name as `data-island-comp`
Counter.selector = "Counter";
registerComponent(Counter);
render();
```

### Loop Display

```html
<!-- index.html -->
<div data-island-comp="People">
  <h1>Names</h1>
  <ul>
    <li data-for="item of list.value" data-key="item.key">{{item.name}}</li>
  </ul>
  <button data-on-click="addPerson()">Add person</button>
</div>
```

```typescript
// index.ts
function People() {
  const list = createState([
    {
      name: "Corbin",
      key: "corbin",
    },
    {
      name: "Ade",
      key: "ade",
    },
  ]);

  let personCount = 0;
  function addPerson() {
    const newList = [...list.value];
    ++personCount;
    newList.push({
      name: `Person ${personCount}`,
      key: `person_${personCount}`,
    });
    list.value = newList;
  }

  return {
    list,
    addPerson,
  };
}

People.selector = "People";
registerComponent(People);
render();
```
