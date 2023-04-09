import { expect, it, describe } from "vitest";

import { app } from "./app";

describe("app", () => {
  describe("ping", () => {
    it("should return the correct response for ping", async () => {
      expect((await app.ping()).body).toBe("pong!");
    });
  });

  describe("version", () => {
    it("should return the correct response shape for version", async () => {
      expect((await app.version()).body).toMatchObject({
        node: expect.any(String), // 19.6.0
        branch: expect.any(String), // main
        commitHash: expect.any(String), // 40 characters commit hash
        commitTimestamp: expect.any(String), // ISO timestamp of last commit
        startTimestamp: expect.any(String), // ISO timestamp of server start
      });
    });
  });
});
