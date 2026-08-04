import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedDefinitions: Record<string, string> | null = null;

function loadDefinitions(): Record<string, string> {
  const filePath = join(process.cwd(), "data", "definitions.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as { definitions: Record<string, string> };
  return parsed.definitions;
}

export function getWordDefinition(word: string): string {
  if (!cachedDefinitions) {
    cachedDefinitions = loadDefinitions();
  }

  const normalized = word.toUpperCase();
  return (
    cachedDefinitions[normalized] ??
    "A five-letter English word from today's puzzle list."
  );
}
