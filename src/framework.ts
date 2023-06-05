import jsep from "jsep";
import jsepAssignment from "@jsep-plugin/assignment";

jsep.plugins.register(jsepAssignment);

import { BasicEval } from "espression";
import { walk } from "estree-walker";

export function createState<T>(initialValue: T): {
  listeners: Array<() => void>;
  value: T;
} {
  let val = initialValue;
  const listeners = [] as Array<() => void>;
  return {
    get value() {
      return val;
    },
    set value(v: T) {
      val = v;
      listeners.forEach((fn) => fn());
    },
    listeners,
  };
}

type Comp = (el: HTMLElement) => Record<string, unknown>;

const elements = {} as Record<string, Comp>;

export function registerComponent(name: string, comp: Comp) {
  elements[name] = comp;
}

const staticEval = new BasicEval();

function parseExpression(expressionString: string) {
  return jsep(expressionString);
}

function walkExpression(
  exp: jsep.Expression,
  fn: (exp: jsep.Expression) => void
) {
  walk(exp as never, {
    enter(node) {
      fn(node as jsep.Expression);
    },
  });
}

/**
 * Walks the expression, only persists the top-level identifiers
 */
function walkParentExpression(
  parsedExp: jsep.Expression,
  ignoredExps: jsep.Expression[],
  listenerExps: jsep.Expression[]
) {
  walkExpression(parsedExp, (exp) => {
    if (ignoredExps.includes(exp)) {
      if (exp.type !== "MemberExpression") return;
      ignoredExps.push(exp.object as jsep.Expression);
      ignoredExps.push(exp.property as jsep.Expression);
      return;
    }
    if (exp.type === "MemberExpression") {
      listenerExps.push(exp.object as jsep.Expression);
      ignoredExps.push(exp.property as jsep.Expression);
      return;
    }
    if (exp.type === "Identifier") {
      listenerExps.push(exp);
      return;
    }
  });
}

function evaluateExpression(
  exp: jsep.Expression,
  data: Record<string, unknown>
) {
  return staticEval.evaluate(exp, data);
}

const isHTMLElement = (node: ChildNode): node is HTMLElement =>
  node.nodeType === node.ELEMENT_NODE;

const textBindRegex = /\{\{(.*?)\}\}/g;

function bindAndHandleElement<T extends Record<string, unknown>>(
  node: ChildNode,
  data: T
) {
  if (node.nodeType === node.COMMENT_NODE) {
    return;
  }
  if (node.nodeType === node.TEXT_NODE) {
    const dataKeys = Object.keys(data);
    const listenerExps = [] as jsep.Expression[];
    // Easier to implement this than try to for loop it
    node.nodeValue?.replace(textBindRegex, (substring, varName) => {
      const parsedExp = parseExpression(varName);
      const ignoredExps = [] as jsep.Expression[];
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
      state.listeners.push(updateText);
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
      if (key.startsWith("if")) {
        const expression = node.dataset[key]!;
        const parsedExp = parseExpression(expression);
        const listenerExps = [] as jsep.Expression[];
        const ignoredExps = [] as jsep.Expression[];
        walkParentExpression(parsedExp, ignoredExps, listenerExps);

        const parent = node.parentNode!;
        function checkAndConditionallyRender() {
          const shouldKeep = evaluateExpression(parsedExp, data);
          if (shouldKeep) {
            parent.append(node);
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
}

const handledElements = new WeakSet<ChildNode>();

function _render(compName: string, rootEl: HTMLElement) {
  const data = elements[compName]?.(rootEl);

  // Roots cannot bind anything
  function bindAndHandleChildren(children: NodeListOf<ChildNode>) {
    for (const child of children) {
      if (handledElements.has(child)) continue;
      bindAndHandleElement(child, data);
      handledElements.add(child);
      if (child.childNodes.length) {
        bindAndHandleChildren(child.childNodes);
      }
    }
  }

  bindAndHandleChildren(rootEl.childNodes);
}

export function render() {
  const roots = [
    ...document.querySelectorAll("[data-island-comp]"),
  ] as HTMLElement[];

  for (const root of roots) {
    _render(root.dataset.islandComp!, root);
  }
}
