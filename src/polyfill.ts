import "core-js/modules/es.global-this";
import "core-js/modules/es.array.flat";

if (!Element.prototype.toggleAttribute) {
  Element.prototype.toggleAttribute = function (name, force) {
    if (force !== void 0) force = !!force;

    if (this.hasAttribute(name)) {
      if (force) return true;

      this.removeAttribute(name);
      return false;
    }
    if (force === false) return false;

    this.setAttribute(name, "");
    return true;
  };
}

if (!HTMLSlotElement.prototype.assignedElements) {
  HTMLSlotElement.prototype.assignedElements = function (...args) {
    return HTMLSlotElement.prototype.assignedNodes
      .apply(this, args)
      .filter(n => n instanceof Element) as Element[];
  };
}

if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function () {
    return [];
  };
}
