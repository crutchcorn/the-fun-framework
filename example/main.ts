import { createState, registerComponent, render } from "the-fun-framework";

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
