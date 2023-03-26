import { expect, it, describe } from "vitest";

import { app } from "./app";

describe("app", () => {
  describe("ping", () => {
    it("should return the correct response for ping", () => {
      expect(app.ping().message).toBe("pong!");
    });
  });
});
