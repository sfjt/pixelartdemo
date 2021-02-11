type Values =
  string |
  number |
  boolean;

type Attributes =
  Record<string, Values> |
  null |
  undefined;

type Child =
  HTMLElement |
  string |
  number |
  boolean |
  null |
  undefined;

type Children = Child | Child[];

export const create = <K extends keyof HTMLElementTagNameMap>(tagName: K, attributes: Attributes, ...children: Children[]): HTMLElementTagNameMap[K] => {
  const parent = document.createElement(tagName);

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child == null) continue;

    if (child instanceof HTMLElement) {
      parent.appendChild(child);
    } else {
      const node = document.createTextNode(child.toString());
      parent.appendChild(node);
    }
  }

  if (attributes == null) return parent;
  for (const key of Object.keys(attributes)) {
    parent.setAttribute(key, attributes[key].toString());
  }

  return parent;
};

export const setStyles = (element: HTMLElement, styles: Record<string, Values>): void => {
  for (const key of Object.keys(styles)) {
    if (key in element.style) {
      element.style[key] = styles[key].toString();
    }
  }
};

export const append = (target: HTMLElement, children: HTMLElement[]): void => {
  children.forEach(child => target.appendChild(child));
};

export const remove = (target: HTMLElement): void => {
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
};

export const get = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Could not find element with id '${id}'`);
  return element;
};
