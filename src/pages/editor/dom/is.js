export const array = Array.isArray;
export function primitive(s) {
  return typeof s === "string" ||
    typeof s === "number" ||
    s instanceof String ||
    s instanceof Number;
}

export function dom(dom) {
    return typeof dom === 'object' && dom.nodeType && dom.nodeName;
}