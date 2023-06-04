import jsep from 'jsep';
import jsepAssignment from '@jsep-plugin/assignment';

jsep.plugins.register(jsepAssignment);

import {BasicEval} from 'espression';
import {walk} from "estree-walker";

export function createState<T>(initialValue: T): { listeners: Array<() => void>, value: T } {
  let val = initialValue;
  let listeners = [] as Array<() => void>;
  return {
    get value() {
      return val;
    },
    set value(v: T) {
      val = v;
      listeners.forEach(fn => fn());
    },
    listeners
  };
}

type Comp = (el: HTMLElement) => Record<string, unknown>;

const elements = {} as Record<string, Comp>

export function registerComponent(name: string, comp: Comp) {
  elements[name] = comp;
}

const staticEval = new BasicEval();

function parseExpression(expressionString: string) {
  return jsep(expressionString);
}

function walkExpression(exp: jsep.Expression, fn: (exp: jsep.Expression) => void) {
  walk(exp as never, {
    enter(node) {
      fn(node as jsep.Expression);
    }
  })
}

function evaluateExpression(exp: jsep.Expression, data: Record<string, unknown>) {
  return staticEval.evaluate(exp, data);
}

const isHTMLElement = (node: ChildNode): node is HTMLElement => node.nodeType === node.ELEMENT_NODE;

const textBindRegex = /\{\{(.*?)\}\}/g;

function bindAndHandleElement<T extends Record<string, unknown>>(node: ChildNode, data: T) {
  if (node.nodeType === node.TEXT_NODE) {
    const dataKeys = Object.keys(data);
    const listenerExps = [] as jsep.Expression[];
    // Easier to implement this than try to for loop it
    node.nodeValue?.replace(textBindRegex, (substring, varName) => {
      const parsedExp = parseExpression(varName);
      const ignoredExps = [] as jsep.Expression[];
      walkExpression(parsedExp, (exp) => {
        if (ignoredExps.includes(exp)) {
          if (exp.type !== "MemberExpression") return;
          ignoredExps.push(exp.object as jsep.Expression);
          ignoredExps.push(exp.property as jsep.Expression);
          return;
        }
        if (listenerExps.includes(exp)) return;
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
      return substring;
    });

    const originalNodeValue = node.nodeValue!;

    function updateText() {
      node.nodeValue = originalNodeValue?.replace(textBindRegex, (_, varName) => {
        const parsedExp = parseExpression(varName);
        return evaluateExpression(parsedExp, data).toString();
      })!;
    }

    for (let exp of listenerExps) {
      if (exp.type !== "Identifier") continue;
      const name = exp.name as never;
      if (!dataKeys.includes(name)) continue;
      const state = data[name] as ReturnType<typeof createState>;
      state.listeners.push(updateText);
    }
    updateText();
  }
  if (!isHTMLElement(node)) return;
  const dataKeys = Object.keys(node.dataset);
  for (let key of dataKeys) {
    if (key.startsWith("on")) {
      const name = key.replace(/^on([A-Z])/, (match) => match[2].toLowerCase())
      let fnNameWithCall = node.dataset[key]!;
      node.addEventListener(name, () => evaluateExpression(parseExpression(fnNameWithCall), data));
      continue;
    }
  }
}

function _render(compName: string, rootEl: HTMLElement) {
  const data = elements[compName]?.(rootEl);

  // Roots cannot bind anything
  function bindAndHandleChildren(children: NodeListOf<ChildNode>) {
    for (let child of children) {
      bindAndHandleElement(child, data);
      if (child.childNodes.length) {
        bindAndHandleChildren(child.childNodes)
      }
    }
  }

  bindAndHandleChildren(rootEl.childNodes);
}

export function render() {
  const roots = [...document.querySelectorAll("[data-island-comp]")] as HTMLElement[];

  for (let root of roots) {
    _render(root.dataset.islandComp!, root);
  }
}
