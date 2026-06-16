export type CmsFieldKind = 'text' | 'link' | 'image';

/**
 * Single source of truth for how editable content is keyed.
 *
 * Every editable element emits a stable `data-cms-id` (e.g. `text:hero-subtitle`).
 * That id is the canonical key used by the editor, the server renderer, and the
 * content getters. A field's `selector` is always derived from its id so the
 * three layers can never drift apart.
 */

export function cssEscapeAttr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function selectorForId(id: string): string {
  return `[data-cms-id="${cssEscapeAttr(id)}"]`;
}

function hashSeed(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

/**
 * Deterministic, fixed-length id for an element that was never authored with a
 * `data-cms-id` (the "edit any element in <main>" affordance). Hashing the
 * structural seed keeps the id short and — crucially — stops the unbounded
 * nested-selector growth that the old `computeSelector` approach produced.
 */
export function adHocId(kind: CmsFieldKind, seed: string): string {
  return `${kind}:adhoc-${hashSeed(seed)}`;
}
