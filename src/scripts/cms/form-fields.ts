/** Shared accessors for the admin editor's panel forms (SEO, image, blog). */

import { normalizeCmsText } from '../../cms/text-normalization';

type FormFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function resolveFormField(form: HTMLFormElement | null, name: string): FormFieldElement | null {
  const field = form?.elements.namedItem(name);
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
  ) {
    return field;
  }

  return null;
}

export function setFormFieldValue(form: HTMLFormElement | null, name: string, value: string): void {
  const field = resolveFormField(form, name);
  if (field) {
    field.value = value;
  }
}

export function getFormFieldValue(form: HTMLFormElement | null, name: string): string {
  return resolveFormField(form, name)?.value.trim() ?? '';
}

export function getFormFieldText(form: HTMLFormElement | null, name: string): string {
  return normalizeCmsText(getFormFieldValue(form, name));
}
