import type { GithubEnv } from './config';
import { GithubRequestError } from './publish-errors';

export interface PublishFile {
  path: string;
  content?: string;
  encoding?: 'utf-8' | 'base64';
  delete?: boolean;
}

interface GitReferenceResponse {
  object: {
    sha: string;
  };
}

interface GitCommitResponse {
  sha: string;
  tree: {
    sha: string;
  };
}

interface GitBlobResponse {
  sha: string;
}

interface GitTreeResponse {
  sha: string;
}

interface GitCreateCommitResponse {
  sha: string;
}

export class PublishConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function githubRequest<T>(config: GithubEnv, path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new GithubRequestError(502, 'GitHub request failed');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new GithubRequestError(response.status, message);
  }

  return (await response.json()) as T;
}

export async function getBranchHeadSha(config: GithubEnv): Promise<string> {
  const encodedBranch = encodeURIComponent(config.branch);
  const ref = await githubRequest<GitReferenceResponse>(
    config,
    `/repos/${config.owner}/${config.repo}/git/ref/heads/${encodedBranch}`,
  );

  return ref.object.sha;
}

async function getCommit(config: GithubEnv, sha: string): Promise<GitCommitResponse> {
  return githubRequest<GitCommitResponse>(
    config,
    `/repos/${config.owner}/${config.repo}/git/commits/${sha}`,
  );
}

async function createBlob(config: GithubEnv, file: PublishFile): Promise<string> {
  if (!file.content || !file.encoding) {
    throw new Error(`Missing content for ${file.path}`);
  }

  const payload = {
    content: file.content,
    encoding: file.encoding,
  };

  const blob = await githubRequest<GitBlobResponse>(
    config,
    `/repos/${config.owner}/${config.repo}/git/blobs`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return blob.sha;
}

async function createTree(
  config: GithubEnv,
  baseTreeSha: string,
  entries: Array<{ path: string; sha: string | null }>,
): Promise<string> {
  const payload = {
    base_tree: baseTreeSha,
    tree: entries.map((entry) => ({
      path: entry.path,
      mode: '100644',
      type: 'blob',
      sha: entry.sha,
    })),
  };

  const tree = await githubRequest<GitTreeResponse>(
    config,
    `/repos/${config.owner}/${config.repo}/git/trees`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return tree.sha;
}

async function createCommit(
  config: GithubEnv,
  message: string,
  treeSha: string,
  parentSha: string,
): Promise<string> {
  const payload = {
    message,
    tree: treeSha,
    parents: [parentSha],
  };

  const commit = await githubRequest<GitCreateCommitResponse>(
    config,
    `/repos/${config.owner}/${config.repo}/git/commits`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return commit.sha;
}

async function updateBranchHead(config: GithubEnv, commitSha: string): Promise<void> {
  const encodedBranch = encodeURIComponent(config.branch);
  await githubRequest(
    config,
    `/repos/${config.owner}/${config.repo}/git/refs/heads/${encodedBranch}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        sha: commitSha,
        force: false,
      }),
    },
  );
}

export async function commitFiles(options: {
  config: GithubEnv;
  files: PublishFile[];
  message: string;
  expectedHeadSha?: string;
}): Promise<string> {
  const { config, files, message, expectedHeadSha } = options;

  if (files.length === 0) {
    return getBranchHeadSha(config);
  }

  const currentHeadSha = await getBranchHeadSha(config);

  if (expectedHeadSha && expectedHeadSha !== currentHeadSha) {
    throw new PublishConflictError('Branch head changed before publish');
  }

  const commit = await getCommit(config, currentHeadSha);

  const treeEntries: Array<{ path: string; sha: string | null }> = [];

  for (const file of files) {
    if (file.delete) {
      treeEntries.push({
        path: file.path,
        sha: null,
      });
      continue;
    }

    const blobSha = await createBlob(config, file);
    treeEntries.push({
      path: file.path,
      sha: blobSha,
    });
  }

  const treeSha = await createTree(config, commit.tree.sha, treeEntries);
  const nextCommitSha = await createCommit(config, message, treeSha, currentHeadSha);
  await updateBranchHead(config, nextCommitSha);

  return nextCommitSha;
}
