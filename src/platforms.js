export const platforms = {
  universal: {
    label: "Agent Skills standard",
    local: [".agents", "skills"],
    global: [".agents", "skills"],
  },
  claude: {
    label: "Claude Code",
    local: [".claude", "skills"],
    global: [".claude", "skills"],
  },
  codex: {
    label: "Codex",
    local: [".agents", "skills"],
    global: [".agents", "skills"],
  },
  copilot: {
    label: "GitHub Copilot",
    local: [".github", "skills"],
    global: [".copilot", "skills"],
  },
  cursor: {
    label: "Cursor",
    local: [".cursor", "skills"],
    global: [".cursor", "skills"],
  },
  gemini: {
    label: "Gemini CLI",
    local: [".gemini", "skills"],
    global: [".gemini", "skills"],
  },
};

export function resolvePlatformNames(value = "universal") {
  // The shared Agent Skills path covers Codex, Copilot, Cursor, and Gemini.
  // Claude uses its own discovery path, so "all" needs only these two copies.
  if (value === "all") return ["universal", "claude"];
  const names = value.split(",").map((name) => name.trim()).filter(Boolean);
  const unknown = names.filter((name) => !platforms[name]);
  if (unknown.length) {
    throw new Error(
      `Unknown agent: ${unknown.join(", ")}. Choose ${Object.keys(platforms).join(", ")}, or all.`,
    );
  }
  return [...new Set(names)];
}
