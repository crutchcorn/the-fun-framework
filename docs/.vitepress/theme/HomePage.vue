<script setup>
import {createState, registerComponent, render} from "../../../lib/index";
import {nextTick, onMounted} from "vue";

function App() {
    const count = createState(0);

    function updateCount() {
        count.value++;
    }

    return {
        count,
        updateCount,
    };
}

App.selector = "App";

onMounted(() => {
    nextTick(() => {
        registerComponent(App);
        render();
    })
})
</script>

<template>
    <div class="island-root" data-island-comp="App">
        <h1>Demo</h1>
        <button data-on-click="updateCount()">Add 1 to the count</button>
        <p>{{ `Count: \{\{count.value\}\}` }}</p>
        <p data-if="count.value % 2 === 0">{{ `\{\{count.value\}\} is even` }}</p>
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
