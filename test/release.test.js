import assert from "node:assert/strict";
import test from "node:test";
import { releaseNotesFor } from "../scripts/release-notes.mjs";

test("release notes contain only the requested changelog section", () => {
  const changelog = `# Changelog\n\n## 1.2.3 — Current\n\n- First.\n- Second.\n\n## 1.2.2 — Previous\n\n- Old.\n`;
  assert.equal(
    releaseNotesFor(changelog, "1.2.3"),
    "## 1.2.3 — Current\n\n- First.\n- Second.\n",
  );
  assert.throws(
    () => releaseNotesFor("## 1.2.30 — Different\n\n- Not this version.\n", "1.2.3"),
    /no 1\.2\.3 section/,
  );
  assert.throws(() => releaseNotesFor(changelog, "9.9.9"), /no 9\.9\.9 section/);
});
