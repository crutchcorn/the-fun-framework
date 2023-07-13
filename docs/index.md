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
<div data-island-comp="Count">
  <h1>Count</h1>
  <button data-on-click="updateCount()">Add</button>
  <p>Value: {{count.value}}</p>
  <p data-if="count.value % 2 === 0">{{count.value}} is even</p>
  <p data-if="count.value % 2 !== 0">{{count.value}} is odd</p>
</div>
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
import { createState, registerComponent, render } from "the-fun-framework";

function Count() {
  const count = createState(0);

  function updateCount() {
    count.value++;
  }

  return {
    count,
    updateCount,
  };
}

Count.selector = "Count";
registerComponent(Count);

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

</div>
