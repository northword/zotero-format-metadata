/**
 * AbbrevIso v1.2 JS lib for publication title abbreviation per ISO-4 standard.
 * Copyright (C) 2023 by Marcin Wrochna. MIT License, see file: LICENSE.
 * @fileoverview Prefix trees for quickly finding patterns.
 */

/**
 * Maximum size of a node in a prefix tree. Smaller is slower, but the results
 * will contain fewer superfluous objects.
 */
const maxNodeSize = 5;

/**
 * A structure that allows to add objects at given string positions, and
 * retrieve all objects (together with some superfluous ones!) that at positions
 * that are prefixes of a given string. The string should not contain characters
 * '-' nor '?'.
 */
export default class PrefixTree {
  /** Constructs new empty PrefixTree. */
  constructor() {
    /** @private @const {!Map} The root node.*/
    this.root_ = new Map();
    this.root_.set('-', []);
  }

  /**
   * Adds an object at a given string position.
   * @param {string} position
   * @param {*} object
   */
  add(position, object) {
    let node = this.root_;
    let i = 0;
    for (const c of position) {
      // Go deeper into nodes as far as possible.
      if (node.has(c)) {
        node = node.get(c);
        i++;
      } else if (node.has('?')) {
        // If a node has already been split, add the next character to it.
        node.set(c, new Map());
        node.get(c).set('-', []);
        node = node.get(c);
        i++;
      } else {
        break;
      }
    }
    node.get('-').push([position.substr(i), object]);
    if (node.get('-').length > maxNodeSize)
      this.splitNode(node);
  }

  /**
   * Helper function that splits a node Map into a Map of Maps.
   * @param {!Map} node
   */
  splitNode(node) {
    const objectsEndingAtNode = [];
    for (const [position, object] of node.get('-')) {
      if (position.length == 0) {
        objectsEndingAtNode.push([position, object]);
        continue;
      }
      const c = position.charAt(0);
      if (!node.has(c)) {
        node.set(c, new Map());
        node.get(c).set('-', []);
      }
      node.get(c).get('-').push([position.substr(1), object]);
    }
    node.set('-', objectsEndingAtNode);
    node.set('?', true);
  }

  /**
   * Returns Array of all objects under positions that are prefixes of 'value'.
   * This returns some superfluous objects too!
   * @param {string} value
   * @return {Array<*>}
   */
  get(value) {
    let node = this.root_;
    let result = node.get('-');
    for (const c of value) {
      if (node.has(c)) {
        node = node.get(c);
        result = result.concat(node.get('-'));
      } else {
        break;
      }
    }
    return result.map(([_position, object]) => object);
  }
}
