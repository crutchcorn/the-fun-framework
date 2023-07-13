<script setup>
import { createState, registerComponent, render } from "../../../lib/index";
import { nextTick, onMounted } from "vue";

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

onMounted(() => {
  nextTick(() => {
    registerComponent(Count);
    registerComponent(People);
    render();
  });
});
</script>

<template>
  <h1>Demo</h1>
  <div class="island-root" data-island-comp="Count">
    <h2>Count</h2>
    <button data-on-click="updateCount()">Add 1 to the count</button>
    <p>{{ `Count: \{\{count.value\}\}` }}</p>
    <p data-if="count.value % 2 === 0">{{ `\{\{count.value\}\} is even` }}</p>
  </div>
  <div class="island-root" data-island-comp="People">
    <h2>Names</h2>
    <ul>
      <li data-for="item of list.value" data-key="item.key">
        {{ `\{\{item.name\}\}` }}
      </li>
    </ul>
    <button data-on-click="addPerson()">Add person</button>
  </div>
  <h1>Code</h1>
</template>

<style scoped>
.island-root {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  text-align: center;
}

.island-root > * {
  margin: 1em auto;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

button {
  padding: 1rem;
  background: darkblue;
  color: white;
  border-radius: 0.5rem;
  width: fit-content;
}
</style>
