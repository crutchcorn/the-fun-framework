import { createState, registerComponent, render } from "the-fun-framework";

function App() {
  const count = createState(0);
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

  function updateCount() {
    count.value++;
  }

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
    count,
    updateCount,
    list,
    addPerson,
  };
}

App.selector = "App";

registerComponent(App);
render();
