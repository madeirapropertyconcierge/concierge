import { marked } from 'marked';
import { discardDraft, loadDraft, saveDraft, type PageDraftState } from '../cms/editor-state';

type Locale = 'en' | 'pt';

type LocaleText = Record<Locale, string>;

interface CmsTextField {
  id: string;
  selector: string;
  kind: 'inline' | 'block';
  value: LocaleText;
}

interface CmsLinkField {
  id: string;
  selector: string;
  label: LocaleText;
  href: LocaleText;
}

interface CmsImageField {
  id: string;
  selector: string;
  src: string;
  alt: LocaleText;
  attributionName: string;
  attributionUrl: string;
  licenseUrl: string;
  caption?: LocaleText;
}

interface CmsSeoLocale {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

interface CmsPageDocument {
  pageId: string;
  updatedAt: string;
  seo: Record<Locale, CmsSeoLocale>;
  texts: CmsTextField[];
  links: CmsLinkField[];
  images: CmsImageField[];
}

interface CmsMediaItem {
  id: string;
  src: string;
  alt: LocaleText;
  attributionName: string;
  attributionUrl: string;
  licenseUrl: string;
  caption?: LocaleText;
}

interface CmsMediaLibrary {
  updatedAt: string;
  items: CmsMediaItem[];
}

interface CmsBlogLocale {
  title: string;
  excerpt: string;
  body: string;
  coverAlt: string;
}

interface CmsBlogSeo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

interface CmsBlogPost {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  readingMinutes: number;
  coverImage: string;
  locales: Record<Locale, CmsBlogLocale>;
  seoByLocale: Record<Locale, CmsBlogSeo>;
}

interface ContentResponse {
  page: CmsPageDocument;
  mediaLibrary: CmsMediaLibrary;
  blogPosts: CmsBlogPost[];
  branchSha: string | null;
  authenticated: boolean;
}

interface WorkingState {
  page: CmsPageDocument;
  mediaLibrary: CmsMediaLibrary;
  blogPosts: CmsBlogPost[];
  baseSha: string | null;
}

interface SelectedImageTarget {
  selector: string;
  id: string;
}

const root = document.querySelector<HTMLDivElement>('#cms-admin-root');
if (!root) {
  throw new Error('CMS admin root not found');
}

const pageId = root.dataset.pageId ?? 'en-home';
const locale = (root.dataset.locale ?? 'en') as Locale;
const isBlogPage = root.dataset.isBlogPage === 'true';

const loginModal = document.querySelector<HTMLElement>('#cms-login-modal');
const loginForm = document.querySelector<HTMLFormElement>('#cms-login-form');
const loginError = document.querySelector<HTMLElement>('#cms-login-error');
const loginCancel = document.querySelector<HTMLButtonElement>('#cms-login-cancel');

const banner = document.querySelector<HTMLElement>('#cms-admin-banner');
const modeLabel = document.querySelector<HTMLElement>('#cms-mode-label');
const statusEl = document.querySelector<HTMLElement>('#cms-status');
const fallbackWarning = document.querySelector<HTMLElement>('#cms-fallback-warning');

const toggleModeButton = document.querySelector<HTMLButtonElement>('#cms-toggle-mode');
const saveDraftButton = document.querySelector<HTMLButtonElement>('#cms-save-draft');
const discardDraftButton = document.querySelector<HTMLButtonElement>('#cms-discard-draft');
const editSeoButton = document.querySelector<HTMLButtonElement>('#cms-edit-seo');
const publishButton = document.querySelector<HTMLButtonElement>('#cms-publish');
const logoutButton = document.querySelector<HTMLButtonElement>('#cms-logout');
const openImageLibraryButton = document.querySelector<HTMLButtonElement>('#cms-open-image-library');
const openBlogManagerButton = document.querySelector<HTMLButtonElement>('#cms-open-blog-manager');

const imageLibraryPanel = document.querySelector<HTMLElement>('#cms-image-library');
const imageLibraryClose = document.querySelector<HTMLButtonElement>('#cms-image-library-close');
const imageLibraryList = document.querySelector<HTMLElement>('#cms-image-library-list');
const imageUploadForm = document.querySelector<HTMLFormElement>('#cms-image-upload-form');

const blogManagerPanel = document.querySelector<HTMLElement>('#cms-blog-manager');
const blogManagerClose = document.querySelector<HTMLButtonElement>('#cms-blog-manager-close');
const blogSelect = document.querySelector<HTMLSelectElement>('#cms-blog-select');
const blogForm = document.querySelector<HTMLFormElement>('#cms-blog-form');
const blogNewButton = document.querySelector<HTMLButtonElement>('#cms-blog-new');
const blogDuplicateButton = document.querySelector<HTMLButtonElement>('#cms-blog-duplicate');
const blogDeleteButton = document.querySelector<HTMLButtonElement>('#cms-blog-delete');

if (!isBlogPage && openBlogManagerButton) {
  openBlogManagerButton.classList.add('cms-hidden');
}

let authenticated = false;
let editMode = false;
let publishedState: WorkingState | null = null;
let workingState: WorkingState | null = null;
let selectedImageTarget: SelectedImageTarget | null = null;
let activeEditableElement: HTMLElement | null = null;

const MARKDOWN_BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'BLOCKQUOTE']);
const TEXT_TAGS = new Set([
  'P',
  'SPAN',
  'DIV',
  'LI',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'STRONG',
  'EM',
]);

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso(): string {
  return new Date().toISOString();
}

function setStatus(message: string): void {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
}

function showElement(element: HTMLElement | null): void {
  element?.classList.remove('cms-hidden');
}

function hideElement(element: HTMLElement | null): void {
  element?.classList.add('cms-hidden');
}

function localeValue(value: LocaleText): string {
  return value[locale] || value.en || '';
}

function setLocaleValue(value: LocaleText, nextValue: string): LocaleText {
  return {
    ...value,
    [locale]: nextValue,
  };
}

function isAdminControl(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  return Boolean(element.closest('[data-admin-allow]'));
}

function isTextCandidate(element: HTMLElement): boolean {
  if (!TEXT_TAGS.has(element.tagName)) {
    return false;
  }

  if (element.closest('a,button,label,summary')) {
    return false;
  }

  if (element.querySelector('img,svg,video,iframe,a,button,input,textarea,select')) {
    return false;
  }

  return Boolean(element.textContent?.trim());
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeRenderedHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  const anchors = template.content.querySelectorAll('a');
  for (const anchor of anchors) {
    const href = anchor.getAttribute('href') ?? '';
    const isAllowed =
      href.startsWith('/') ||
      href.startsWith('#') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:');

    if (!isAllowed) {
      anchor.setAttribute('href', '#');
    }
  }

  const images = template.content.querySelectorAll('img');
  for (const image of images) {
    image.remove();
  }

  return template.innerHTML;
}

function renderMarkdown(source: string, kind: 'inline' | 'block'): string {
  const escaped = escapeHtml(source);
  const rendered = kind === 'block'
    ? (marked.parse(escaped) as string)
    : (marked.parseInline(escaped) as string);

  return sanitizeRenderedHtml(rendered);
}

function computeSelector(element: Element): string {
  const parts: string[] = [];
  let node: Element | null = element;

  while (node && node !== document.body) {
    const tag = node.tagName.toLowerCase();
    const currentTag = node.tagName;
    const parentElement: Element | null = node.parentElement;
    if (!parentElement) {
      break;
    }

    const sameTagSiblings = Array.from(parentElement.children).filter(
      (child: Element) => child.tagName === currentTag,
    );
    const index = sameTagSiblings.indexOf(node) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);

    if (parentElement.matches('main')) {
      parts.unshift('main');
      break;
    }

    node = parentElement;
  }

  return parts.join(' > ');
}

function idForSelector(prefix: string, selector: string): string {
  return `${prefix}:${selector}`;
}

function upsertTextField(field: CmsTextField): void {
  if (!workingState) {
    return;
  }

  const index = workingState.page.texts.findIndex((entry) => entry.id === field.id);
  if (index >= 0) {
    workingState.page.texts[index] = field;
    return;
  }

  workingState.page.texts.push(field);
}

function upsertLinkField(field: CmsLinkField): void {
  if (!workingState) {
    return;
  }

  const index = workingState.page.links.findIndex((entry) => entry.id === field.id);
  if (index >= 0) {
    workingState.page.links[index] = field;
    return;
  }

  workingState.page.links.push(field);
}

function upsertImageField(field: CmsImageField): void {
  if (!workingState) {
    return;
  }

  const index = workingState.page.images.findIndex((entry) => entry.id === field.id);
  if (index >= 0) {
    workingState.page.images[index] = field;
    return;
  }

  workingState.page.images.push(field);
}

function applyPageDocument(page: CmsPageDocument): void {
  for (const field of page.texts) {
    const element = document.querySelector<HTMLElement>(field.selector);
    if (!element) {
      continue;
    }

    element.dataset.cmsField = 'text';
    element.dataset.cmsId = field.id;
    element.dataset.cmsSelector = field.selector;
    element.dataset.cmsKind = field.kind;
    const source = localeValue(field.value);
    element.dataset.cmsSource = source;
    element.innerHTML = renderMarkdown(source, field.kind);
  }

  for (const field of page.links) {
    const element = document.querySelector<HTMLElement>(field.selector);
    if (!element) {
      continue;
    }

    if (element instanceof HTMLAnchorElement) {
      element.href = localeValue(field.href);
      element.innerHTML = renderMarkdown(localeValue(field.label), 'inline');
    } else {
      element.textContent = localeValue(field.label);
      const targetHref = localeValue(field.href);
      element.setAttribute('data-cms-href', targetHref);

      if (element instanceof HTMLButtonElement && !element.closest('form')) {
        element.type = 'button';
        element.onclick = () => {
          const nextHref = element.getAttribute('data-cms-href') ?? '';
          if (nextHref) {
            window.location.href = nextHref;
          }
        };
      }
    }

    element.dataset.cmsField = 'link';
    element.dataset.cmsId = field.id;
    element.dataset.cmsSelector = field.selector;
  }

  for (const field of page.images) {
    const element = document.querySelector<HTMLImageElement>(field.selector);
    if (!element) {
      continue;
    }

    element.src = field.src;
    element.alt = localeValue(field.alt);
    element.dataset.cmsField = 'image';
    element.dataset.cmsId = field.id;
    element.dataset.cmsSelector = field.selector;
  }
}

function updateFallbackWarning(page: CmsPageDocument): void {
  let fallbackCount = 0;

  if (locale === 'pt') {
    for (const field of page.texts) {
      if (!field.value.pt.trim() && field.value.en.trim()) {
        fallbackCount += 1;
      }
    }

    for (const field of page.links) {
      if (!field.label.pt.trim() && field.label.en.trim()) {
        fallbackCount += 1;
      }
    }

    for (const field of page.images) {
      if (!field.alt.pt.trim() && field.alt.en.trim()) {
        fallbackCount += 1;
      }
    }
  }

  if (!fallbackWarning) {
    return;
  }

  if (fallbackCount > 0) {
    fallbackWarning.textContent = `PT fallback active (${fallbackCount})`;
    fallbackWarning.classList.remove('cms-hidden');
    return;
  }

  fallbackWarning.classList.add('cms-hidden');
}

function updateSeoPreview(page: CmsPageDocument): void {
  const seo = page.seo[locale];
  if (!seo) {
    return;
  }

  if (seo.title.trim()) {
    document.title = seo.title;
  }

  const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (descriptionMeta && seo.description.trim()) {
    descriptionMeta.content = seo.description;
  }
}

function applyCurrentState(): void {
  if (!workingState) {
    return;
  }

  applyPageDocument(workingState.page);
  updateFallbackWarning(workingState.page);
  updateSeoPreview(workingState.page);
}

function editSeo(): void {
  if (!workingState) {
    return;
  }

  const seo = workingState.page.seo[locale];

  const title = window.prompt(`SEO title (${locale.toUpperCase()})`, seo.title);
  if (title === null) {
    return;
  }

  const description = window.prompt(`SEO description (${locale.toUpperCase()})`, seo.description);
  if (description === null) {
    return;
  }

  const ogTitle = window.prompt(`OG title (${locale.toUpperCase()})`, seo.ogTitle) ?? '';
  const ogDescription = window.prompt(`OG description (${locale.toUpperCase()})`, seo.ogDescription) ?? '';
  const ogImage = window.prompt(`OG image URL (${locale.toUpperCase()})`, seo.ogImage) ?? '';
  const canonical = window.prompt(`Canonical URL (${locale.toUpperCase()})`, seo.canonical) ?? '';

  workingState.page.seo[locale] = {
    ...seo,
    title: title.trim(),
    description: description.trim(),
    ogTitle: ogTitle.trim(),
    ogDescription: ogDescription.trim(),
    ogImage: ogImage.trim(),
    canonical: canonical.trim(),
  };

  applyCurrentState();
  storeDraft();
  setStatus('SEO updated in draft');
}

function storeDraft(): void {
  if (!workingState) {
    return;
  }

  const draft: PageDraftState = {
    page: workingState.page,
    blogPosts: workingState.blogPosts,
    mediaLibrary: workingState.mediaLibrary,
    baseSha: workingState.baseSha,
    updatedAt: nowIso(),
  };

  saveDraft(pageId, draft);
}

async function fetchContent(): Promise<ContentResponse> {
  const response = await fetch(`/api/admin/content?pageId=${encodeURIComponent(pageId)}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to load CMS content');
  }

  return (await response.json()) as ContentResponse;
}

async function checkSession(): Promise<boolean> {
  const response = await fetch('/api/admin/session', {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { authenticated?: boolean };
  return Boolean(payload.authenticated);
}

function hydrateStateFromResponse(response: ContentResponse): void {
  const baseState: WorkingState = {
    page: response.page,
    mediaLibrary: response.mediaLibrary,
    blogPosts: response.blogPosts,
    baseSha: response.branchSha,
  };

  const savedDraft = loadDraft(pageId);
  if (savedDraft) {
    workingState = {
      page: savedDraft.page,
      mediaLibrary: savedDraft.mediaLibrary,
      blogPosts: savedDraft.blogPosts,
      baseSha: savedDraft.baseSha ?? response.branchSha,
    };
    setStatus('Loaded local draft');
  } else {
    workingState = deepClone(baseState);
  }

  publishedState = deepClone(baseState);
  authenticated = response.authenticated;
  applyCurrentState();
  renderImageLibrary();
  renderBlogSelect();
}

async function refreshContent(): Promise<void> {
  const response = await fetchContent();
  hydrateStateFromResponse(response);
  setBannerVisibility();
}

function setBannerVisibility(): void {
  if (!banner) {
    return;
  }

  if (authenticated) {
    banner.classList.remove('cms-hidden');
    document.body.classList.add('cms-admin-offset');
    return;
  }

  banner.classList.add('cms-hidden');
  document.body.classList.remove('cms-admin-offset');
}

function openLoginModal(): void {
  showElement(loginModal);
  loginError?.classList.add('cms-hidden');
}

function closeLoginModal(): void {
  hideElement(loginModal);
  loginForm?.reset();
}

async function login(password: string): Promise<boolean> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    return false;
  }

  return true;
}

async function logout(): Promise<void> {
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  });

  authenticated = false;
  setBannerVisibility();
  disableEditMode();
  setStatus('Logged out');
}

function setModeLabel(): void {
  if (!modeLabel || !toggleModeButton) {
    return;
  }

  modeLabel.textContent = editMode ? 'Edit' : 'View';
  toggleModeButton.textContent = editMode ? 'View' : 'Edit';
}

function enableEditMode(): void {
  editMode = true;
  document.body.classList.add('cms-navigate-locked');
  setModeLabel();
  setStatus('Edit mode enabled');
}

function disableEditMode(): void {
  editMode = false;
  document.body.classList.remove('cms-navigate-locked');

  if (activeEditableElement) {
    activeEditableElement.removeAttribute('contenteditable');
    activeEditableElement.removeAttribute('data-cms-editing');
    activeEditableElement = null;
  }

  setModeLabel();
}

function toggleEditMode(): void {
  if (!authenticated) {
    return;
  }

  if (editMode) {
    disableEditMode();
    return;
  }

  enableEditMode();
}

function completeTextEdit(element: HTMLElement): void {
  if (!workingState) {
    return;
  }

  const selector = computeSelector(element);
  const id = idForSelector('text', selector);
  const kind = MARKDOWN_BLOCK_TAGS.has(element.tagName) ? 'block' : 'inline';

  const existing = workingState.page.texts.find((field) => field.id === id);
  const nextValue = (element.textContent ?? '').trim();

  const value = existing ? setLocaleValue(existing.value, nextValue) : { en: '', pt: '', [locale]: nextValue };

  upsertTextField({
    id,
    selector,
    kind,
    value,
  });

  element.innerHTML = renderMarkdown(nextValue, kind);
  element.dataset.cmsField = 'text';
  element.dataset.cmsId = id;
  element.dataset.cmsSelector = selector;
  element.dataset.cmsKind = kind;
  element.dataset.cmsSource = nextValue;

  storeDraft();
}

function beginTextEdit(element: HTMLElement): void {
  if (activeEditableElement && activeEditableElement !== element) {
    completeTextEdit(activeEditableElement);
    activeEditableElement.removeAttribute('contenteditable');
    activeEditableElement.removeAttribute('data-cms-editing');
  }

  activeEditableElement = element;
  const source = element.dataset.cmsSource ?? element.textContent ?? '';
  element.textContent = source;
  element.setAttribute('contenteditable', 'true');
  element.setAttribute('data-cms-editing', 'true');

  const selection = window.getSelection();
  selection?.removeAllRanges();

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.addRange(range);

  element.focus();

  const handleBlur = (): void => {
    element.removeEventListener('blur', handleBlur);
    element.removeAttribute('contenteditable');
    element.removeAttribute('data-cms-editing');
    completeTextEdit(element);
    activeEditableElement = null;
  };

  element.addEventListener('blur', handleBlur);
}

function editLink(element: HTMLElement): void {
  if (!workingState) {
    return;
  }

  const selector = computeSelector(element);
  const id = idForSelector('link', selector);
  const existing = workingState.page.links.find((field) => field.id === id);

  const currentLabel = existing ? localeValue(existing.label) : element.textContent?.trim() ?? '';
  const currentHref =
    existing?.href[locale] ??
    (element instanceof HTMLAnchorElement
      ? element.getAttribute('href') ?? ''
      : element.getAttribute('data-cms-href') ?? '');

  const label = window.prompt('Button/link text', currentLabel);
  if (label === null) {
    return;
  }

  const href = window.prompt('Target URL', currentHref);
  if (href === null) {
    return;
  }

  const nextField: CmsLinkField = {
    id,
    selector,
    label: existing ? setLocaleValue(existing.label, label) : { en: '', pt: '', [locale]: label },
    href: existing ? setLocaleValue(existing.href, href) : { en: '', pt: '', [locale]: href },
  };

  upsertLinkField(nextField);
  applyCurrentState();
  storeDraft();
  setStatus('Link updated');
}

function editImage(element: HTMLImageElement): void {
  if (!workingState) {
    return;
  }

  const selector = computeSelector(element);
  const id = idForSelector('image', selector);
  selectedImageTarget = { selector, id };

  const existing = workingState.page.images.find((field) => field.id === id);
  const currentSrc = existing?.src ?? element.currentSrc ?? element.src;
  const currentAlt = existing ? localeValue(existing.alt) : element.alt;

  const src = window.prompt('Image URL', currentSrc);
  if (src === null) {
    return;
  }

  const alt = window.prompt('Image alt text', currentAlt);
  if (alt === null) {
    return;
  }

  const attributionName = window.prompt('Attribution name', existing?.attributionName ?? '') ?? '';
  const attributionUrl = window.prompt('Attribution URL', existing?.attributionUrl ?? '') ?? '';
  const licenseUrl = window.prompt('License URL', existing?.licenseUrl ?? '') ?? '';

  const nextField: CmsImageField = {
    id,
    selector,
    src,
    alt: existing ? setLocaleValue(existing.alt, alt) : { en: '', pt: '', [locale]: alt },
    attributionName,
    attributionUrl,
    licenseUrl,
    caption: existing?.caption,
  };

  upsertImageField(nextField);
  applyCurrentState();
  storeDraft();
  setStatus('Image updated');
}

function handleEditClick(event: MouseEvent): void {
  if (!editMode) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  const image = target.closest('img');
  if (image instanceof HTMLImageElement && image.closest('main')) {
    event.preventDefault();
    event.stopPropagation();
    editImage(image);
    return;
  }

  const clickable = target.closest('a,button');
  if (clickable instanceof HTMLElement && clickable.closest('main')) {
    event.preventDefault();
    event.stopPropagation();
    editLink(clickable);
    return;
  }

  const textElement = target.closest<HTMLElement>('main *');
  if (!textElement || !isTextCandidate(textElement)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  beginTextEdit(textElement);
}

function lockNavigation(event: MouseEvent): void {
  if (!editMode) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  if (target.closest('a,button,[role="button"]')) {
    event.preventDefault();
  }
}

function lockFormSubmit(event: SubmitEvent): void {
  if (!editMode) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  event.preventDefault();
}

function renderImageLibrary(): void {
  if (!imageLibraryList || !workingState) {
    return;
  }

  imageLibraryList.innerHTML = '';

  const pageImages: Array<CmsMediaItem & { isPageImage?: boolean }> = workingState.page.images.map((item) => ({
    ...item,
    id: `page:${item.id}`,
    isPageImage: true,
  }));
  const allItems: Array<CmsMediaItem & { isPageImage?: boolean }> = [
    ...pageImages,
    ...workingState.mediaLibrary.items,
  ];

  for (const item of allItems) {
    const card = document.createElement('article');
    card.className = 'cms-library-item';

    const image = document.createElement('img');
    image.src = item.src;
    image.alt = localeValue(item.alt);

    const label = document.createElement('p');
    label.className = 'cms-subtitle';
    label.textContent = item.isPageImage ? `Page: ${item.src}` : item.src;

    const useButton = document.createElement('button');
    useButton.className = 'cms-btn cms-btn-primary';
    useButton.type = 'button';
    useButton.textContent = 'Use';
    useButton.addEventListener('click', () => {
      if (!selectedImageTarget || !workingState) {
        setStatus('Select an image on the page first');
        return;
      }

      const selector = selectedImageTarget.selector;
      const id = selectedImageTarget.id;

      const existing = workingState.page.images.find((entry) => entry.id === id);
      const nextField: CmsImageField = {
        id,
        selector,
        src: item.src,
        alt: existing ? setLocaleValue(existing.alt, localeValue(item.alt)) : item.alt,
        attributionName: item.attributionName,
        attributionUrl: item.attributionUrl,
        licenseUrl: item.licenseUrl,
        caption: item.caption,
      };

      upsertImageField(nextField);
      applyCurrentState();
      storeDraft();
      setStatus('Applied library image');
    });

    card.append(image, label, useButton);
    imageLibraryList.append(card);
  }
}

function toggleImageLibrary(open: boolean): void {
  if (!imageLibraryPanel) {
    return;
  }

  if (open) {
    imageLibraryPanel.classList.remove('cms-hidden');
    renderImageLibrary();
    return;
  }

  imageLibraryPanel.classList.add('cms-hidden');
}

function ensureBlogPostSelectValue(): string | null {
  if (!blogSelect || !workingState || workingState.blogPosts.length === 0) {
    return null;
  }

  if (!blogSelect.value) {
    blogSelect.value = workingState.blogPosts[0].id;
  }

  return blogSelect.value;
}

function findSelectedBlogPost(): CmsBlogPost | null {
  if (!blogSelect || !workingState) {
    return null;
  }

  const selectedId = ensureBlogPostSelectValue();
  if (!selectedId) {
    return null;
  }

  return workingState.blogPosts.find((post) => post.id === selectedId) ?? null;
}

function renderBlogSelect(): void {
  if (!blogSelect || !workingState) {
    return;
  }

  blogSelect.innerHTML = '';

  for (const post of workingState.blogPosts) {
    const option = document.createElement('option');
    option.value = post.id;
    option.textContent = `${post.slug} (${post.status})`;
    blogSelect.append(option);
  }

  if (workingState.blogPosts.length > 0) {
    blogSelect.value = workingState.blogPosts[0].id;
    hydrateBlogForm();
  }
}

function setBlogField(name: string, value: string): void {
  if (!blogForm) {
    return;
  }

  const field = blogForm.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    field.value = value;
  }
}

function getBlogField(name: string): string {
  if (!blogForm) {
    return '';
  }

  const field = blogForm.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    return field.value.trim();
  }

  return '';
}

function hydrateBlogForm(): void {
  const post = findSelectedBlogPost();
  if (!post) {
    return;
  }

  setBlogField('slug', post.slug);
  setBlogField('status', post.status);
  setBlogField('publishedAt', post.publishedAt);
  setBlogField('readingMinutes', String(post.readingMinutes));
  setBlogField('coverImage', post.coverImage);
  setBlogField('tags', post.tags.join(','));

  setBlogField('titleEn', post.locales.en.title);
  setBlogField('excerptEn', post.locales.en.excerpt);
  setBlogField('bodyEn', post.locales.en.body);
  setBlogField('coverAltEn', post.locales.en.coverAlt);

  setBlogField('titlePt', post.locales.pt.title);
  setBlogField('excerptPt', post.locales.pt.excerpt);
  setBlogField('bodyPt', post.locales.pt.body);
  setBlogField('coverAltPt', post.locales.pt.coverAlt);

  setBlogField('seoTitleEn', post.seoByLocale.en.title);
  setBlogField('seoDescEn', post.seoByLocale.en.description);
  setBlogField('ogTitleEn', post.seoByLocale.en.ogTitle);
  setBlogField('ogDescEn', post.seoByLocale.en.ogDescription);
  setBlogField('ogImageEn', post.seoByLocale.en.ogImage);
  setBlogField('canonicalEn', post.seoByLocale.en.canonical);

  setBlogField('seoTitlePt', post.seoByLocale.pt.title);
  setBlogField('seoDescPt', post.seoByLocale.pt.description);
  setBlogField('ogTitlePt', post.seoByLocale.pt.ogTitle);
  setBlogField('ogDescPt', post.seoByLocale.pt.ogDescription);
  setBlogField('ogImagePt', post.seoByLocale.pt.ogImage);
  setBlogField('canonicalPt', post.seoByLocale.pt.canonical);
}

function upsertBlogPost(post: CmsBlogPost): void {
  if (!workingState) {
    return;
  }

  const index = workingState.blogPosts.findIndex((entry) => entry.id === post.id);
  if (index >= 0) {
    workingState.blogPosts[index] = post;
    return;
  }

  workingState.blogPosts.push(post);
}

function createEmptyBlogPost(): CmsBlogPost {
  const id = `post-${Date.now()}`;
  return {
    id,
    slug: `new-post-${Date.now()}`,
    status: 'draft',
    publishedAt: nowIso().slice(0, 10),
    updatedAt: nowIso(),
    tags: [],
    readingMinutes: 5,
    coverImage: '',
    locales: {
      en: { title: '', excerpt: '', body: '', coverAlt: '' },
      pt: { title: '', excerpt: '', body: '', coverAlt: '' },
    },
    seoByLocale: {
      en: {
        title: '',
        description: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonical: '',
      },
      pt: {
        title: '',
        description: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonical: '',
      },
    },
  };
}

function saveBlogFormToDraft(): void {
  const selected = findSelectedBlogPost();
  if (!selected) {
    return;
  }

  const readingMinutesRaw = getBlogField('readingMinutes') || String(selected.readingMinutes);
  const readingMinutesParsed = Number.parseInt(readingMinutesRaw, 10);
  const readingMinutes = Number.isFinite(readingMinutesParsed) && readingMinutesParsed > 0
    ? readingMinutesParsed
    : selected.readingMinutes;

  const nextPost: CmsBlogPost = {
    ...selected,
    slug: getBlogField('slug'),
    status: (getBlogField('status') as 'draft' | 'published') || 'draft',
    publishedAt: getBlogField('publishedAt') || selected.publishedAt,
    readingMinutes,
    coverImage: getBlogField('coverImage'),
    updatedAt: nowIso(),
    tags: getBlogField('tags')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    locales: {
      en: {
        title: getBlogField('titleEn'),
        excerpt: getBlogField('excerptEn'),
        body: getBlogField('bodyEn'),
        coverAlt: getBlogField('coverAltEn'),
      },
      pt: {
        title: getBlogField('titlePt'),
        excerpt: getBlogField('excerptPt'),
        body: getBlogField('bodyPt'),
        coverAlt: getBlogField('coverAltPt'),
      },
    },
    seoByLocale: {
      en: {
        title: getBlogField('seoTitleEn'),
        description: getBlogField('seoDescEn'),
        ogTitle: getBlogField('ogTitleEn'),
        ogDescription: getBlogField('ogDescEn'),
        ogImage: getBlogField('ogImageEn'),
        canonical: getBlogField('canonicalEn'),
      },
      pt: {
        title: getBlogField('seoTitlePt'),
        description: getBlogField('seoDescPt'),
        ogTitle: getBlogField('ogTitlePt'),
        ogDescription: getBlogField('ogDescPt'),
        ogImage: getBlogField('ogImagePt'),
        canonical: getBlogField('canonicalPt'),
      },
    },
  };

  upsertBlogPost(nextPost);
  storeDraft();
  renderBlogSelect();

  if (blogSelect) {
    blogSelect.value = nextPost.id;
  }

  setStatus('Saved blog post to draft');
}

function toggleBlogManager(open: boolean): void {
  if (!blogManagerPanel || !isBlogPage) {
    return;
  }

  if (open) {
    blogManagerPanel.classList.remove('cms-hidden');
    renderBlogSelect();
    return;
  }

  blogManagerPanel.classList.add('cms-hidden');
}

async function publishDraft(): Promise<void> {
  if (!workingState) {
    return;
  }

  setStatus('Publishing...');

  const response = await fetch('/api/admin/publish', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pages: [workingState.page],
      blogPosts: workingState.blogPosts,
      mediaLibrary: workingState.mediaLibrary,
      baseSha: workingState.baseSha,
    }),
  });

  const payload = (await response.json()) as { commitSha?: string; error?: string };

  if (!response.ok) {
    setStatus(payload.error ?? 'Publish failed');
    return;
  }

  discardDraft(pageId);
  setStatus(`Published ${payload.commitSha ?? ''}`.trim());
  await refreshContent();
}

async function uploadImage(formData: FormData): Promise<void> {
  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    item?: CmsMediaItem;
    error?: string;
    commitSha?: string;
  };

  if (!response.ok || !payload.item || !workingState) {
    setStatus(payload.error ?? 'Image upload failed');
    return;
  }

  workingState.mediaLibrary.items.unshift(payload.item);
  workingState.mediaLibrary.updatedAt = nowIso();
  if (payload.commitSha) {
    workingState.baseSha = payload.commitSha;
  }
  storeDraft();
  renderImageLibrary();
  setStatus('Image uploaded');
}

function bindAuthUI(): void {
  document.querySelectorAll<HTMLElement>('[data-cms-open-login]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      if (authenticated) {
        setStatus('Already authenticated');
        return;
      }
      openLoginModal();
    });
  });

  loginCancel?.addEventListener('click', () => {
    closeLoginModal();
  });

  loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const password = String(formData.get('password') ?? '');
    const ok = await login(password);

    if (!ok) {
      loginError?.classList.remove('cms-hidden');
      return;
    }

    authenticated = true;
    closeLoginModal();
    setBannerVisibility();
    setStatus('Logged in');
    await refreshContent();
  });
}

function bindBannerUI(): void {
  toggleModeButton?.addEventListener('click', () => {
    toggleEditMode();
  });

  saveDraftButton?.addEventListener('click', () => {
    storeDraft();
    setStatus('Draft saved locally');
  });

  discardDraftButton?.addEventListener('click', () => {
    if (!publishedState) {
      return;
    }

    discardDraft(pageId);
    workingState = deepClone(publishedState);
    applyCurrentState();
    setStatus('Draft discarded');
  });

  editSeoButton?.addEventListener('click', () => {
    editSeo();
  });

  publishButton?.addEventListener('click', async () => {
    await publishDraft();
  });

  logoutButton?.addEventListener('click', async () => {
    await logout();
  });

  openImageLibraryButton?.addEventListener('click', () => {
    const open = imageLibraryPanel?.classList.contains('cms-hidden') ?? true;
    toggleImageLibrary(open);
  });

  openBlogManagerButton?.addEventListener('click', () => {
    const open = blogManagerPanel?.classList.contains('cms-hidden') ?? true;
    toggleBlogManager(open);
  });
}

function bindImageLibraryUI(): void {
  imageLibraryClose?.addEventListener('click', () => {
    toggleImageLibrary(false);
  });

  imageUploadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(imageUploadForm);
    await uploadImage(data);
    imageUploadForm.reset();
  });
}

function bindBlogManagerUI(): void {
  blogManagerClose?.addEventListener('click', () => {
    toggleBlogManager(false);
  });

  blogSelect?.addEventListener('change', () => {
    hydrateBlogForm();
  });

  blogForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveBlogFormToDraft();
  });

  blogNewButton?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!workingState || !blogSelect) {
      return;
    }

    const post = createEmptyBlogPost();
    workingState.blogPosts.unshift(post);
    renderBlogSelect();
    blogSelect.value = post.id;
    hydrateBlogForm();
    storeDraft();
    setStatus('Created new draft post');
  });

  blogDuplicateButton?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!workingState || !blogSelect) {
      return;
    }

    const selected = findSelectedBlogPost();
    if (!selected) {
      return;
    }

    const clone = deepClone(selected);
    clone.id = `copy-${Date.now()}`;
    clone.slug = `${selected.slug}-copy`;
    clone.status = 'draft';
    clone.updatedAt = nowIso();

    workingState.blogPosts.unshift(clone);
    renderBlogSelect();
    blogSelect.value = clone.id;
    hydrateBlogForm();
    storeDraft();
    setStatus('Duplicated post to draft');
  });

  blogDeleteButton?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!workingState || !blogSelect) {
      return;
    }

    const selected = findSelectedBlogPost();
    if (!selected) {
      return;
    }

    const shouldDelete = window.confirm(`Delete post "${selected.slug}" from draft list?`);
    if (!shouldDelete) {
      return;
    }

    workingState.blogPosts = workingState.blogPosts.filter((post) => post.id !== selected.id);
    renderBlogSelect();
    storeDraft();
    setStatus('Deleted post from draft');
  });
}

async function boot(): Promise<void> {
  bindAuthUI();
  bindBannerUI();
  bindImageLibraryUI();
  bindBlogManagerUI();

  document.addEventListener('click', lockNavigation, true);
  document.addEventListener('submit', lockFormSubmit, true);
  document.addEventListener('click', handleEditClick, true);

  authenticated = await checkSession();
  if (authenticated) {
    const content = await fetchContent();
    hydrateStateFromResponse(content);
  }

  setBannerVisibility();
  setModeLabel();

  if (!authenticated) {
    setStatus('Public view');
  }
}

void boot();
