// E2E workflow smoke: citizen reports → admin reviews & assigns → worker
// uploads evidence & resolves. Includes negative authz checks.
// Run: node scripts/verify-workflow.mjs
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env
  .split("\n")
  .map((line) => line.trim())
  .find((line) => line.startsWith("NEXT_PUBLIC_CONVEX_URL="))
  ?.slice("NEXT_PUBLIC_CONVEX_URL=".length);
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not found in .env.local");

const stamp = Date.now();
const citizenEmail = `citizen-${stamp}@example.com`;
const workerEmail = `worker-${stamp}@example.com`;
const password = "s3curePass!";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
}
async function expectError(name, fn, match) {
  try {
    await fn();
    check(name, false, "expected rejection, call succeeded");
  } catch (error) {
    const message = String(error.message ?? error);
    check(name, match ? message.includes(match) : true, message.slice(0, 140));
  }
}
function setUserRole(email, role, departmentId) {
  execFileSync(
    process.execPath,
    [
      "node_modules/convex/bin/main.js",
      "run",
      "admin:setUserRole",
      JSON.stringify({ email, role, ...(departmentId ? { departmentId } : {}) }),
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}
async function uploadImage(client, bytes, mime = "image/png") {
  const uploadUrl = await client.mutation(api.issues.generateUploadUrl, {});
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": mime },
    body: new Blob([bytes], { type: mime }),
  });
  if (!response.ok) throw new Error(`upload HTTP ${response.status}`);
  const { storageId } = await response.json();
  return storageId;
}

// --- accounts ------------------------------------------------------------
const citizen = new ConvexHttpClient(url);
const citizenSignup = await citizen.action(api.auth.signIn, {
  provider: "password",
  params: { flow: "signUp", email: citizenEmail, password, name: "E2E Citizen" },
});
citizen.setAuth(citizenSignup.tokens.token);
check("citizen signed up", Boolean(citizenSignup?.tokens?.token), citizenEmail);

const worker = new ConvexHttpClient(url);
const workerSignup = await worker.action(api.auth.signIn, {
  provider: "password",
  params: { flow: "signUp", email: workerEmail, password, name: "E2E Worker" },
});
worker.setAuth(workerSignup.tokens.token);
check("worker signed up", Boolean(workerSignup?.tokens?.token), workerEmail);

// --- role promotion (internal, via CLI) ----------------------------------
const categories = await citizen.query(api.categories.list, {});
const departments = await citizen.query(api.departments.list, {});
check("seed categories available", categories.length > 0, `${categories.length}`);
check("seed departments available", departments.length > 0, `${departments.length}`);
const departmentId = departments[0]._id;

setUserRole(citizenEmail, "ADMIN");
setUserRole(workerEmail, "FIELD_WORKER", departmentId);
const adminMe = await citizen.query(api.users.getCurrent, {});
const workerMe = await worker.query(api.users.getCurrent, {});
check("citizen promoted to ADMIN", adminMe?.role === "ADMIN");
check("worker role FIELD_WORKER", workerMe?.role === "FIELD_WORKER");
check(
  "worker bound to department",
  workerMe?.departmentId === departmentId,
  workerMe?.departmentId ?? "null",
);

// --- negative authz: citizen (now admin) has no issue yet, so first ------
// report as a fresh citizen, then probe addEvidence before assignment
const reporter = new ConvexHttpClient(url);
const reporterSignup = await reporter.action(api.auth.signIn, {
  provider: "password",
  params: { flow: "signUp", email: `reporter-${stamp}@example.com`, password, name: "E2E Reporter" },
});
reporter.setAuth(reporterSignup.tokens.token);

const category = categories.find((c) => c.name) ?? categories[0];
const { issueId } = await reporter.mutation(api.issues.create, {
  title: "E2E broken streetlight near gate",
  description: "Automated workflow test report — streetlight is out.",
  categoryId: category._id,
  priority: "high",
  address: "Main gate, north side",
  imageStorageIds: [],
});
check("reporter created issue", Boolean(issueId), issueId);

await expectError(
  "worker addEvidence blocked before assignment",
  () => worker.mutation(api.issues.addEvidence, { issueId, imageStorageIds: [] }),
  "Evidence can only be added",
);
await expectError(
  "worker cannot start review (admin transition)",
  () => worker.mutation(api.issues.setStatus, { issueId, toStatus: "UNDER_REVIEW" }),
  "Cannot move",
);
await expectError(
  "citizen reporter cannot assign",
  () => reporter.mutation(api.issues.assign, { issueId, departmentId }),
  "Not authorized",
);

// --- admin review flow ---------------------------------------------------
const admin = citizen;
await admin.mutation(api.issues.setStatus, { issueId, toStatus: "UNDER_REVIEW", note: "Checking now" });
await admin.mutation(api.issues.setStatus, { issueId, toStatus: "ACCEPTED" });
await admin.mutation(api.issues.assign, { issueId, departmentId, workerId: workerMe._id });
const assigned = await admin.query(api.issues.get, { issueId });
check("issue ASSIGNED after assign", assigned?.status === "ASSIGNED", assigned?.status);
check(
  "active assignment names worker",
  assigned?.activeAssignment?.workerId === workerMe._id,
  assigned?.activeAssignment?.workerName ?? "null",
);

// --- worker flow ---------------------------------------------------------
const workerList = await worker.query(api.issues.listAssigned, {});
check(
  "worker sees assignment in listAssigned",
  workerList.some((i) => i._id === issueId),
  `${workerList.length} items`,
);
await worker.mutation(api.issues.setStatus, { issueId, toStatus: "IN_PROGRESS", note: "Heading to site" });

const fakePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const evidenceId = await uploadImage(worker, fakePng);
await worker.mutation(api.issues.addEvidence, { issueId, imageStorageIds: [evidenceId] });
check("worker uploaded evidence", true);

await expectError(
  "empty addEvidence rejected",
  () => worker.mutation(api.issues.addEvidence, { issueId, imageStorageIds: [] }),
  "at least one",
);

await worker.mutation(api.issues.setStatus, { issueId, toStatus: "RESOLVED", note: "Lamp replaced" });

// --- reporter view -------------------------------------------------------
const finalState = await reporter.query(api.issues.get, { issueId });
check("issue RESOLVED", finalState?.status === "RESOLVED", finalState?.status);
check("resolvedAt set", typeof finalState?.resolvedAt === "number");
check(
  "evidence image flagged",
  finalState?.images?.some((image) => image.isEvidence === true) === true,
  `${finalState?.images?.length} images`,
);
check(
  "update feed has full journey",
  finalState?.updates?.length >= 4,
  `${finalState?.updates?.length} updates`,
);

let failed = 0;
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}${result.detail ? `  (${result.detail})` : ""}`);
  if (!result.ok) failed++;
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed === 0 ? 0 : 1);
