import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("ApiController", () => {
  it("Should return a valid response in the correct format", async () => {
    const response = await request(app).get("/server");

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );

    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty("success");
    expect(typeof response.body.success).toBe("boolean");

    expect(response.body).toHaveProperty("message");
    expect(
      ["string", "number", "object"].includes(typeof response.body.message)
    ).toBe(true);

    expect(response.body).toHaveProperty("data");
    expect(
      response.body.data === null || typeof response.body.data === "object"
    ).toBe(true);
  });
});
