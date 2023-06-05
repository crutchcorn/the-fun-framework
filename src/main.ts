import { createState, registerComponent, render } from "./framework.ts";

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

registerComponent("App", App);
render();
