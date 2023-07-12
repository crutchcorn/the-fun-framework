import { FunComponent } from "./types";
import {
  evaluateExpression,
  Expression,
  parseExpression,
  walkParentExpression,
} from "./expression-parser";
import { createState } from "./hooks";

const elements = {} as Record<string, FunComponent>;

export function registerComponent(comp: FunComponent) {
  elements[comp.selector] = comp;
}

const isHTMLElement = (node: ChildNode): node is HTMLElement =>
  node.nodeType === node.ELEMENT_NODE;

const textBindRegex = /\{\{(.*?)\}\}/g;

function bindAndHandleElement<T extends Record<string, unknown>>(
  node: ChildNode,
  data: T
): boolean {
  if (node.nodeType === node.COMMENT_NODE) {
    return;
  }
  if (node.nodeType === node.TEXT_NODE) {
    const dataKeys = Object.keys(data);
    const listenerExps = [] as Expression[];
    // Easier to implement this than try to for loop it
    node.nodeValue?.replace(textBindRegex, (substring, varName) => {
      const parsedExp = parseExpression(varName);
      const ignoredExps = [] as Expression[];
      walkParentExpression(parsedExp, ignoredExps, listenerExps);
      return substring;
    });

    const originalNodeValue = node.nodeValue!;

    function updateText() {
      node.nodeValue = originalNodeValue?.replace(
        textBindRegex,
        (_, varName) => {
          const parsedExp = parseExpression(varName);
          return evaluateExpression(parsedExp, data).toString();
        }
      );
    }

    const boundListenerNames = [] as string[];
    for (const exp of listenerExps) {
      const name = exp.name as never;
      if (boundListenerNames.includes(name)) continue;
      if (!dataKeys.includes(name)) continue;
      const state = data[name] as ReturnType<typeof createState>;
      state.listeners && state.listeners.push(updateText);
      boundListenerNames.push(name);
    }
    updateText();
    return;
  }
  if (isHTMLElement(node)) {
    const dataKeys = Object.keys(node.dataset);
    for (const key of dataKeys) {
      if (key.startsWith("on")) {
        const name = key.replace(/^on([A-Z])/, (match) =>
          match[2].toLowerCase()
        );
        const fnNameWithCall = node.dataset[key]!;
        node.addEventListener(name, () =>
          evaluateExpression(parseExpression(fnNameWithCall), data)
        );
        continue;
      }
      if (key.startsWith("for")) {
        // "item of list"
        const listExpression = node.dataset[key]!;
        // item.key
        const keyExpression = node.dataset.key!;
        const parsedListExp = parseExpression(listExpression);
        const listenerListExps = [] as Expression[];
        walkParentExpression(parsedListExp, [], listenerListExps);
        let list!: Array<unknown>;
        let itemVarName!: string;
        for (const exp of listenerListExps) {
          const name = exp.name as never;
          if (Object.keys(data).includes(name)) {
            // TODO: This doesn't work with `createState`
            list = data[name] as Array<unknown>;
            if (!Array.isArray(list))
              throw "You must bind `data-for` to an array";
          } else if (name !== "of" && name !== "in") {
            itemVarName = name;
          }
        }

        const keyExp = parseExpression(keyExpression);

        function extractKeys() {
          const keys: Array<{ key: string; val: unknown }> = [];

          for (const item of list) {
            keys.push({
              key: evaluateExpression(keyExp, {
                ...data,
                [itemVarName]: item,
              }),
              val: item,
            });
          }
          return keys;
        }

        /**
         * TODO: Add `data-for` state listeners that will re-run this rendering
         *  and key extractions. AKA use list and check if it's an `createState`.
         */
        const keys = extractKeys();
        const template = node.outerHTML;
        const parent = node.parentElement!;
        const newEls: HTMLElement[] = [];
        for (const { val } of keys) {
          const el = document.createElement("div");
          el.innerHTML = template;
          const child = el.firstElementChild as HTMLElement;
          child.removeAttribute("data-for");
          child.removeAttribute("data-key");
          bindAndHandleChildren([child], {
            ...data,
            [itemVarName]: val,
          });
          newEls.push(child);
        }
        parent.replaceChildren(...newEls);
        return false;
      }
      if (key.startsWith("if")) {
        const expression = node.dataset[key]!;
        const parsedExp = parseExpression(expression);
        const listenerExps = [] as Expression[];
        const ignoredExps = [] as Expression[];
        walkParentExpression(parsedExp, ignoredExps, listenerExps);

        // TODO: This won't work if the previous sibling also changes or whatnot
        const previousSibling = node.previousElementSibling as HTMLElement;
        function checkAndConditionallyRender() {
          const shouldKeep = evaluateExpression(parsedExp, data);
          if (shouldKeep) {
            previousSibling.insertAdjacentElement("afterend", node);
            return;
          }
          node.remove();
        }

        const boundListenerNames = [] as string[];
        for (const exp of listenerExps) {
          const name = exp.name as never;
          if (boundListenerNames.includes(name)) continue;
          if (!Object.keys(data).includes(name)) continue;
          const state = data[name] as ReturnType<typeof createState>;
          state.listeners.push(checkAndConditionallyRender);
          boundListenerNames.push(name);
        }
        checkAndConditionallyRender();
      }
    }
  }
  return true;
}

const handledElements = new WeakSet<ChildNode>();

// Roots cannot bind anything
function bindAndHandleChildren(
  children: NodeListOf<ChildNode>,
  data: Record<string, unknown> | undefined
) {
  for (const child of children) {
    if (handledElements.has(child)) continue;
    const shouldBindChildren = bindAndHandleElement(child, data);
    handledElements.add(child);
    if (shouldBindChildren && child.childNodes.length) {
      bindAndHandleChildren(child.childNodes, data);
    }
  }
}

function _render(compName: string, rootEl: HTMLElement) {
  const data = elements[compName]?.(rootEl);

  bindAndHandleChildren(rootEl.childNodes, data);
}

export function render() {
  const roots = [
    ...document.querySelectorAll("[data-island-comp]"),
  ] as HTMLElement[];

  for (const root of roots) {
    _render(root.dataset.islandComp!, root);
  }
}
