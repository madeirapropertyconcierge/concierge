/** Pure DOM predicates for locating editable elements and admin controls. */

const TEXT_TAGS = new Set([
  'P',
  'SPAN',
  'DIV',
  'LI',
  'BLOCKQUOTE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'STRONG',
  'EM',
]);

export function isSharedPackageElement(element: Element | null): element is HTMLElement {
  return Boolean(element instanceof HTMLElement && element.dataset.cmsSharedDoc === 'packages');
}

function hasSharedEditableDescendant(element: HTMLElement): boolean {
  return Boolean(element.querySelector('[data-cms-shared-doc="packages"]'));
}

export function isSharedOwnedElement(element: Element | null): boolean {
  const owner = element instanceof HTMLElement
    ? element.closest<HTMLElement>('[data-cms-owner]')
    : null;

  return Boolean(owner && owner.dataset.cmsOwner && owner.dataset.cmsOwner !== 'page');
}

export function isAdminControl(element: Element | null): boolean {
  return Boolean(element?.closest('[data-admin-allow]'));
}

/**
 * Whether a link's entire inner content is owned by its CMS label, so the
 * label can be edited and re-rendered without clobbering authored structure.
 * True for managed links (e.g. `EditableLink`) and for plain text-only links;
 * false for links wrapping custom markup (icons, nested elements).
 */
export function linkOwnsLabel(element: HTMLElement): boolean {
  return element.dataset.cmsLinkManaged !== undefined || element.childElementCount === 0;
}

export function isTextCandidate(element: HTMLElement): boolean {
  if (!TEXT_TAGS.has(element.tagName)) {
    return false;
  }

  if (element.tagName === 'DIV' && element.childElementCount > 0) {
    return false;
  }

  if (element.matches('a,button,label,summary')) {
    return false;
  }

  if (element.querySelector('img,svg,video,iframe,a,button,input,textarea,select')) {
    return false;
  }

  if (hasSharedEditableDescendant(element)) {
    return false;
  }

  return Boolean(element.textContent?.trim());
}

export function findEditableTextElement(target: Element): HTMLElement | null {
  const sharedElement = target.closest<HTMLElement>('[data-cms-shared-doc="packages"]');
  if (sharedElement?.closest('main')) {
    return sharedElement;
  }

  // Prefer the authored/keyed text field when the click lands inside one, so a
  // click on inline markup (e.g. a <strong> inside the field) edits the whole
  // field rather than minting a field for the fragment.
  const keyedElement = target.closest<HTMLElement>('main [data-cms-field="text"][data-cms-id]');
  if (keyedElement && isTextCandidate(keyedElement)) {
    return keyedElement;
  }

  const textElement = target.closest<HTMLElement>('main *');
  if (textElement && isTextCandidate(textElement)) {
    return textElement;
  }

  return null;
}
