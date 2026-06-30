import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("api health", () => {
  it("returns healthy status", async () => {
    const response = await app.request("/api/health");
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
  });
});
