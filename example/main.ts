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
