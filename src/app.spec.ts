import { expect, it, describe } from "vitest";

import { app } from "./app";

describe("app", () => {
  describe("ping", () => {
    it("should return the correct response for ping", () => {
      expect(app.ping().message).toBe("pong!");
    });
  });

  describe("version", () => {
    it("should return the correct response shape for version", () => {
      expect(app.version().message).toMatchObject({
        node: expect.any(String), // 19.6.0
        branch: expect.any(String), // main
        commitHash: expect.any(String), // 40 characters commit hash
        commitTimestamp: expect.any(String), // ISO timestamp of last commit
        startTimestamp: expect.any(String), // ISO timestamp of server start
      });
    });
  });
});
