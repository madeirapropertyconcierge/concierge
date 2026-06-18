import { describe, expect, it } from 'bun:test';
import { acceptPublishedWorkingState } from './publish-state';
import type { WorkingState } from './types';

// Mirror the slice acceptPublishedWorkingState mutates. Without this, a literal
// `publishedState: null` infers as `null`, so the post-call assertions read
// properties off `never`.
type PublishStateSlice = {
  workingState: WorkingState | null;
  publishedState: WorkingState | null;
};

function createWorkingState(baseSha: string): WorkingState {
  return {
    page: {
      pageId: 'home',
      updatedAt: '2026-06-18T00:00:00.000Z',
      seo: {
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
      texts: [
        {
          id: 'text:hero',
          selector: '[data-cms-id="text:hero"]',
          kind: 'inline',
          value: { en: 'Draft hero', pt: '' },
        },
      ],
      links: [],
      images: [],
    },
    packages: {
      updatedAt: '2026-06-18T00:00:00.000Z',
      packages: [],
    },
    blogPosts: [],
    baseSha,
  };
}

describe('acceptPublishedWorkingState', () => {
  it('promotes the current working state to the published snapshot', () => {
    const cmsState: PublishStateSlice = {
      workingState: createWorkingState('old-sha'),
      publishedState: null,
    };

    const accepted = acceptPublishedWorkingState(cmsState, 'new-sha');

    expect(accepted?.baseSha).toBe('new-sha');
    expect(cmsState.workingState?.baseSha).toBe('new-sha');
    expect(cmsState.publishedState?.baseSha).toBe('new-sha');
    expect(cmsState.publishedState?.page.texts[0]?.value.en).toBe('Draft hero');
  });

  it('keeps the saved snapshot independent from future draft edits', () => {
    const cmsState: PublishStateSlice = {
      workingState: createWorkingState('old-sha'),
      publishedState: null,
    };

    acceptPublishedWorkingState(cmsState, 'new-sha');
    cmsState.workingState?.page.texts.push({
      id: 'text:later',
      selector: '[data-cms-id="text:later"]',
      kind: 'inline',
      value: { en: 'Later draft', pt: '' },
    });

    expect(cmsState.workingState?.page.texts).toHaveLength(2);
    expect(cmsState.publishedState?.page.texts).toHaveLength(1);
  });

  it('does nothing when there is no working state', () => {
    const cmsState: PublishStateSlice = {
      workingState: null,
      publishedState: null,
    };

    expect(acceptPublishedWorkingState(cmsState, 'new-sha')).toBeNull();
    expect(cmsState.publishedState).toBeNull();
  });
});
