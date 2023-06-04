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

registerComponent("App", App);
render();
