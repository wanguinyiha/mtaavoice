// Smoke test: sign-up, sign-in, wrong-password rejection, authenticated query.
// Run: node scripts/verify-auth.mjs
import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env
  .split("\n")
  .map((line) => line.trim())
  .find((line) => line.startsWith("NEXT_PUBLIC_CONVEX_URL="))
  ?.slice("NEXT_PUBLIC_CONVEX_URL=".length);

if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not found in .env.local");

const email = `smoke-${Date.now()}@example.com`;
const password = "s3curePass!";
const client = new ConvexHttpClient(url);

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
}

// 1. Sign up
const signup = await client.action(api.auth.signIn, {
  provider: "password",
  params: { flow: "signUp", email, password, name: "Smoke Test" },
});
check(
  "sign-up returns tokens",
  Boolean(signup?.tokens?.token),
  `email=${email}`,
);

// 2. Authenticated query sees the new profile
client.setAuth(signup.tokens.token);
const me = await client.query(api.users.getCurrent, {});
check(
  "getCurrent returns profile",
  me !== null && me.email === email && me.role === "CITIZEN",
  JSON.stringify(me),
);

// 3. Sign in with correct password
const signin = await client.action(api.auth.signIn, {
  provider: "password",
  params: { flow: "signIn", email, password },
});
check("sign-in returns tokens", Boolean(signin?.tokens?.token));

// 4. Wrong password must fail
let rejected = false;
try {
  await client.action(api.auth.signIn, {
    provider: "password",
    params: { flow: "signIn", email, password: "wrong-password" },
  });
} catch {
  rejected = true;
}
check("wrong password rejected", rejected);

// 5. Unauthenticated protected query returns null (not someone else's data)
const anon = new ConvexHttpClient(url);
const anonMe = await anon.query(api.users.getCurrent, {});
check("unauthenticated getCurrent is null", anonMe === null);

let failed = 0;
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name} ${result.detail}`);
  if (!result.ok) failed++;
}
process.exit(failed === 0 ? 0 : 1);
