import type { CmsState } from './store';
import type { WorkingState } from './types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function acceptPublishedWorkingState(
  cmsState: Pick<CmsState, 'publishedState' | 'workingState'>,
  commitSha?: string,
): WorkingState | null {
  if (!cmsState.workingState) {
    return null;
  }

  const nextState = clone(cmsState.workingState);
  nextState.baseSha = commitSha ?? nextState.baseSha;

  cmsState.workingState = nextState;
  cmsState.publishedState = clone(nextState);

  return nextState;
}
