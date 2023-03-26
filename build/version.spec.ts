import { expect, it, describe } from "vitest";

import { readGitBranch, readGitCommit, readGitTimestamp } from "./version";

describe("version", () => {
  /**
   * These tests are combined into a single test as they all depend on each other anyway:
   * - readGitCommit(branch) is testing if the branch is correct
   * - readGitTimestamp(commitHash) needs a valid commit hash
   * So they are all tested in one go. Usually, you would split them up into separate tests, but here we can make an exception.
   */
  it("returns reasonable branch, commit hash and timestamp", async () => {
    const branch = await readGitBranch();
    const commitHash = await readGitCommit(branch);
    const commitTimestamp = readGitTimestamp(commitHash);

    expect(branch !== "unknown", "branch").toBeTruthy();
    expect(commitHash, "commitHash").toHaveLength(40);
    expect(new Date(commitTimestamp), "commitTimestamp").toBeInstanceOf(Date);
  });
});
