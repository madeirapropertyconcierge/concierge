export class MissingGithubConfigError extends Error {
  constructor() {
    super(
      'Publishing is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, and GITHUB_BRANCH in Vercel environment variables.',
    );
  }
}

export class GithubRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getPublishErrorResponse(error: unknown): { status: number; message: string } | null {
  if (error instanceof MissingGithubConfigError) {
    return {
      status: 500,
      message: error.message,
    };
  }

  if (error instanceof GithubRequestError) {
    if (error.status === 401 || error.status === 403) {
      return {
        status: 502,
        message: 'GitHub rejected the publish request. Check the token permissions and repository access.',
      };
    }

    if (error.status === 404) {
      return {
        status: 502,
        message: 'GitHub could not find the configured repository or branch. Check GITHUB_OWNER, GITHUB_REPO, and GITHUB_BRANCH.',
      };
    }

    return {
      status: 502,
      message: 'GitHub publish failed. Check the repository settings and token, then try again.',
    };
  }

  return null;
}
