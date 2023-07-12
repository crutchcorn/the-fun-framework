import { createState, registerComponent, render } from "the-fun-framework";

function App() {
  const count = createState(0);
  const list = [
    {
      name: "Corbin",
      key: "corbin",
    },
    {
      name: "Ade",
      key: "ade",
    },
  ];

  function updateCount() {
    count.value++;
  }

  return {
    count,
    updateCount,
    list,
  };
}

App.selector = "App";

registerComponent(App);
render();
