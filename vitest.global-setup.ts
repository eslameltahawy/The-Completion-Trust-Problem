import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export default function setup() {
  const databasePath = path.join(os.tmpdir(), "career180-completion-trust-test.db");
  fs.rmSync(databasePath, { force: true });
  fs.rmSync(`${databasePath}-journal`, { force: true });
  const databaseUrl = `file:${databasePath.replace(/\\/g, "/")}`;
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
}
