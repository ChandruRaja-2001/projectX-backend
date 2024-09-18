import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("GET /", () => {
  it("Should return LYA Properties Text", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toContain("text/html");

    const titleMatch = /<title>(.*?)<\/title>/.exec(response.text);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1]).contain("LYA Properties");

    expect(response.text).toContain("LYA Properties");
  });
});
