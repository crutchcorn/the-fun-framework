type Comp = string | ((args: any) => HTMLElement);

function c(tagOrComp: Comp, props: object, children: Array<Comp>) {
  if (typeof tagOrComp === "function" ) {
    return tagOrComp({...props, children});
  }
  const el = document.createElement(tagOrComp);
  for (let _prop of Object.keys(props)) {
    const prop = _prop as keyof typeof props;
    if (_prop.startsWith("on")) {
      const name = _prop.replace(/^on([A-Z])/, (match) => match[2].toLowerCase())
      el.addEventListener(name, props[prop]);
      continue;
    }
    if (prop in el) {
      el[prop] = props[prop] as never;
      continue;
    }

    el.setAttribute(prop, props[prop]);
  }
  for (let child of children) {
    if (typeof child === "string") {
      el.innerText = child;
    } else {
      const childEl = c(child, {}, []);
      el.append(childEl);
    }
  }
  return el;
}

function Child() {
  return c("button", {onClick: () => alert("Hi"), test: 123}, [
    "Test"
  ]);
}

function App() {
  return c("div", {}, [
    Child
  ])
}

function render(el: HTMLElement, Comp: Comp) {
  el.append(c(Comp, {}, [])!);
}


render(document.querySelector<HTMLElement>('#app')!, App)
