export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size: number;
  updated_at: string;
  private: boolean;
};

export type RepoFile = {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
};

export type Project = {
  id: string;
  name: string;
  root: string;
  files: RepoFile[];
  language: string;
  commits: number;
  stars: number;
  color: string;
};

export type Mission = {
  id: string;
  prompt: string;
  projectName: string;
  createdAt: string;
  status: "Draft" | "Queued";
};
