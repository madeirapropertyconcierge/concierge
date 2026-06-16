/** Promise-based modal for editing a CMS link's label and target together. */

export interface LinkEditorOptions {
  label: string;
  href: string;
  /** When false, only the target URL is editable (link wraps custom markup). */
  allowLabel: boolean;
}

export interface LinkEditorResult {
  label: string;
  href: string;
}

function field(labelText: string, input: HTMLElement): HTMLLabelElement {
  const wrapper = document.createElement('label');
  wrapper.className = 'cms-field';
  wrapper.setAttribute('data-admin-allow', '');

  const span = document.createElement('span');
  span.textContent = labelText;

  wrapper.append(span, input);
  return wrapper;
}

export function openLinkEditor(options: LinkEditorOptions): Promise<LinkEditorResult | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'cms-fixed cms-inset-0 cms-z-max cms-bg-slate-900/70';
    overlay.setAttribute('data-admin-allow', '');

    const wrap = document.createElement('div');
    wrap.className = 'cms-flex cms-min-h-full cms-items-center cms-justify-center cms-p-4';

    const form = document.createElement('form');
    form.className = 'cms-card cms-w-full cms-max-w-sm cms-space-y-4';

    const header = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'cms-title';
    title.textContent = options.allowLabel ? 'Edit link' : 'Edit link target';
    const subtitle = document.createElement('p');
    subtitle.className = 'cms-subtitle';
    subtitle.textContent = options.allowLabel
      ? 'Update the button label and where it points.'
      : 'This link wraps custom content — edit its text directly on the page.';
    header.append(title, subtitle);
    form.append(header);

    let labelInput: HTMLInputElement | null = null;
    if (options.allowLabel) {
      labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.value = options.label;
      labelInput.setAttribute('data-admin-allow', '');
      form.append(field('Label', labelInput));
    }

    const hrefInput = document.createElement('input');
    hrefInput.type = 'text';
    hrefInput.value = options.href;
    hrefInput.placeholder = 'https://… or /relative';
    hrefInput.setAttribute('data-admin-allow', '');
    form.append(field('Target URL (absolute https:// or /relative)', hrefInput));

    const row = document.createElement('div');
    row.className = 'cms-row';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'cms-btn cms-btn-muted';
    cancel.textContent = 'Cancel';
    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'cms-btn cms-btn-primary';
    save.textContent = 'Save';
    row.append(cancel, save);
    form.append(row);

    wrap.append(form);
    overlay.append(wrap);
    document.body.append(overlay);

    const close = (result: LinkEditorResult | null): void => {
      document.removeEventListener('keydown', onKeyDown, true);
      overlay.remove();
      resolve(result);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(null);
      }
    };

    overlay.addEventListener('mousedown', (event) => {
      if (!form.contains(event.target as Node)) {
        close(null);
      }
    });
    cancel.addEventListener('click', () => close(null));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      close({
        label: labelInput ? labelInput.value : options.label,
        href: hrefInput.value,
      });
    });
    document.addEventListener('keydown', onKeyDown, true);

    const focusTarget = labelInput ?? hrefInput;
    focusTarget.focus();
    focusTarget.select();
  });
}
