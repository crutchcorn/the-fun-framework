import jsep from "jsep";
import jsepAssignment from "@jsep-plugin/assignment";
import { BasicEval } from "espression";
import { walk } from "estree-walker";

jsep.plugins.register(jsepAssignment);

export type Expression = jsep.Expression;

const staticEval = new BasicEval();

export function parseExpression(expressionString: string) {
  return jsep(expressionString);
}

export function walkExpression(
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
export function walkParentExpression(
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

export function evaluateExpression(
  exp: jsep.Expression,
  data: Record<string, unknown>
) {
  return staticEval.evaluate(exp, data);
}
