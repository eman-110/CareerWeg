import test from "node:test";
import assert from "node:assert/strict";
import handler from "../netlify/function-source/api.mjs";

test("rejects cross-site state-changing requests", async () => {
  const response = await handler(
    new Request("https://careerweg.example/api/users/login", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "email=test%40example.com&password=not-a-real-password",
    }),
  );

  assert.equal(response.status, 403);
});

test("protects the current profile endpoint when no session exists", async () => {
  const response = await handler(
    new Request("https://careerweg.example/api/users/full-profile"),
  );

  assert.equal(response.status, 401);
});

test("fails authentication clearly when session signing is not configured", async (t) => {
  const previousSecret = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;
  t.after(() => {
    if (previousSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previousSecret;
  });

  const response = await handler(
    new Request("https://careerweg.example/api/users/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "email=test%40example.com&password=test",
    }),
  );

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    error: "The request could not be completed",
  });
});
