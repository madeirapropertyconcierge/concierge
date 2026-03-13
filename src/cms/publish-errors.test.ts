import { describe, expect, test } from 'bun:test';
import {
  getPublishErrorResponse,
  GithubRequestError,
  MissingGithubConfigError,
} from './publish-errors';

describe('publish errors', () => {
  test('maps missing GitHub configuration to a helpful message', () => {
    expect(getPublishErrorResponse(new MissingGithubConfigError())).toEqual({
      status: 500,
      message:
        'Publishing is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, and GITHUB_BRANCH in Vercel environment variables.',
    });
  });

  test('maps GitHub auth failures to a token guidance message', () => {
    expect(getPublishErrorResponse(new GithubRequestError(403, 'forbidden'))).toEqual({
      status: 502,
      message: 'GitHub rejected the publish request. Check the token permissions and repository access.',
    });
  });

  test('maps GitHub repository lookup failures to repo guidance', () => {
    expect(getPublishErrorResponse(new GithubRequestError(404, 'missing'))).toEqual({
      status: 502,
      message:
        'GitHub could not find the configured repository or branch. Check GITHUB_OWNER, GITHUB_REPO, and GITHUB_BRANCH.',
    });
  });
});
