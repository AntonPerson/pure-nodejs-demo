import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const gitPath = resolve(".git");

/**
 * Read the current Git branch from the .git/HEAD file.
 * @returns The current Git branch as a string, or "unknown" if the branch cannot be determined.
 */
export async function readGitBranch(): Promise<string> {
  const headPath = resolve(gitPath, "HEAD");
  const headContent = await fs.readFile(headPath, "utf8");
  const match = headContent.match(/ref: refs\/heads\/(.+)/);

  return match ? match[1].trim() : "unknown";
}

/**
 * Read the latest commit hash for the specified Git branch.
 * @param branch - The Git branch to read the commit hash from.
 * @returns The commit hash as a string.
 */
export async function readGitCommit(branch: string): Promise<string> {
  const commitPath = resolve(gitPath, "refs", "heads", branch);
  const commitHash = await fs.readFile(commitPath, "utf8");

  return commitHash.trim();
}

/**
 * Read the timestamp of the specified commit hash in ISO format.
 * @param commitHash - The commit hash to read the timestamp from.
 * @returns The commit timestamp in ISO format as a string.
 */
export function readGitTimestamp(commitHash: string): string {
  const timestamp = execSync(`git log -1 --format=%cI ${commitHash}`, {
    encoding: "utf8",
  });

  return timestamp.trim();
}

/**
 * Generate the version.generated.json file containing the current Git branch, latest commit hash, commit timestamp and start timestamp.
 */
if (require.main === module) {
  // Only run if this file is called directly, not when its imported in a test
  (async () => {
    try {
      const branch = await readGitBranch();
      const commitHash = await readGitCommit(branch);
      const commitTimestamp = readGitTimestamp(commitHash);

      const versionContent = {
        branch,
        commitHash,
        commitTimestamp: new Date(commitTimestamp).toISOString(),
        startTimestamp: new Date().toISOString(),
      };
      await fs.writeFile(
        "src/version.generated.json",
        JSON.stringify(versionContent),
        "utf8"
      );
    } catch (error) {
      console.error("Error generating Git info:", error);
    }
  })();
}
