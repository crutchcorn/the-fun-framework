import { describe, test, expect } from "vitest";

import userEvent from "@testing-library/user-event";
import { createState, registerComponent, render } from "the-fun-framework";
import { findByText, getByText, queryByText } from "@testing-library/dom";

const user = userEvent.setup();

describe("render", () => {
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
    user.click(getByText(document.body, "Add"));
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
    user.click(getByText(document.body, "Add"));
    expect(
      await findByText(document.body, "Count is greater than 0")
    ).toBeTruthy();
  });
});
