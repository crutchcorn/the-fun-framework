import { describe, test, expect } from "vitest";

import userEvent from "@testing-library/user-event";
import { createState, registerComponent, render } from "the-fun-framework";
import { findByText, getByText, queryByText } from "@testing-library/dom";

const user = userEvent.setup();

describe("render", () => {
  test("should support rendering static values", async () => {
    document.body.innerHTML = `
       <div data-island-comp="App">
        <p>{{message}}</p>
      </div>
    `;

    function App() {
      return {
        message: "Hello, world",
      };
    }

    App.selector = "App";

    registerComponent(App);
    render();
    expect(await findByText(document.body, "Hello, world")).toBeTruthy();
  });

  test("should support rendered values and updating them", async () => {
    document.body.innerHTML = `
       <div data-island-comp="App">
        <button data-on-click="updateCount()">Add</button>
        <p>Count: {{count.value}}</p>
      </div>
    `;

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

    registerComponent(App);
    render();

    expect(await findByText(document.body, "Count: 0")).toBeTruthy();
    await user.click(getByText(document.body, "Add"));
    expect(await findByText(document.body, "Count: 1")).toBeTruthy();
  });

  test("should support conditionally rendering", async () => {
    document.body.innerHTML = `
       <div data-island-comp="App">
        <button data-on-click="updateCount()">Add</button>
        <p data-if="count.value > 0">Count is greater than 0</p>
      </div>
    `;

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

    registerComponent(App);
    render();

    expect(
      await queryByText(document.body, "Count is greater than 0")
    ).not.toBeTruthy();
    user.click(getByText(document.body, "Add"));
    expect(
      await findByText(document.body, "Count is greater than 0")
    ).toBeTruthy();
  });

  test("should support conditionally rendering multiple items", async () => {
    document.body.innerHTML = `
       <div data-island-comp="App">
        <button data-on-click="updateCount()">Add</button>
        <p data-if="count.value > 0">Count is greater than 0</p>
        <p data-if="count.value === 0">Count is 0</p>
      </div>
    `;

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

    registerComponent(App);
    render();

    expect(await findByText(document.body, "Count is 0")).toBeTruthy();
    await user.click(getByText(document.body, "Add"));
    expect(
      await findByText(document.body, "Count is greater than 0")
    ).toBeTruthy();
  });

  test("should support for loop rendering", async () => {
    document.body.innerHTML = `
       <div data-island-comp="App">
        <p data-for="item of items" data-key="item.key">{{item.val}}</p>
      </div>
    `;

    function App() {
      return {
        items: [
          { key: 1, val: "Hello" },
          { key: 2, val: "Goodbye" },
        ],
      };
    }

    App.selector = "App";

    registerComponent(App);
    render();

    expect(await findByText(document.body, "Hello")).toBeTruthy();
    expect(await findByText(document.body, "Goodbye")).toBeTruthy();
  });

  test("should support for dynamic loop rendering", async () => {
    document.body.innerHTML = `
       <div data-island-comp="App">
        <div>
          <p data-for="person of people.value" data-key="person.key">{{person.name}}</p>
        </div>
        <button data-on-click="addPerson()">Add person</button>
      </div>
    `;

    function App() {
      const people = createState([
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
        const newList = [...people.value];
        ++personCount;
        newList.push({
          name: `Person ${personCount}`,
          key: `person_${personCount}`,
        });
        people.value = newList;
      }

      return {
        people,
        addPerson,
      };
    }

    App.selector = "App";

    registerComponent(App);
    render();

    expect(await findByText(document.body, "Corbin")).toBeTruthy();
    expect(await findByText(document.body, "Ade")).toBeTruthy();
    await user.click(getByText(document.body, "Add person"));
    expect(await findByText(document.body, "Person 1")).toBeTruthy();
    await user.click(getByText(document.body, "Add person"));
    expect(await findByText(document.body, "Person 2")).toBeTruthy();
    await user.click(getByText(document.body, "Add person"));
    expect(await findByText(document.body, "Person 3")).toBeTruthy();
  });
});
