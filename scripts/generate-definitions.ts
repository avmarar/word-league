import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type DictionaryResponse = Array<{
  meanings?: Array<{
    definitions?: Array<{ definition?: string }>;
  }>;
}>;

async function fetchDefinition(word: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );

    if (!response.ok) {
      return `A common five-letter English word.`;
    }

    const payload = (await response.json()) as DictionaryResponse;
    const definition = payload[0]?.meanings?.[0]?.definitions?.[0]?.definition;

    if (!definition) {
      return `A common five-letter English word.`;
    }

    const sentence = definition.trim();
    return sentence.endsWith(".") ? sentence : `${sentence}.`;
  } catch {
    return `A common five-letter English word.`;
  }
}

async function main() {
  const answersPath = join(process.cwd(), "data", "answers.json");
  const parsed = JSON.parse(readFileSync(answersPath, "utf8")) as {
    words: Array<{ word: string }>;
  };

  const definitions: Record<string, string> = {};
  const definitionsPath = join(process.cwd(), "data", "definitions.json");

  try {
    const existing = JSON.parse(readFileSync(definitionsPath, "utf8")) as {
      definitions: Record<string, string>;
    };
    Object.assign(definitions, existing.definitions);
  } catch {
    // generate fresh
  }

  for (const entry of parsed.words) {
    const word = entry.word.toUpperCase();
    if (definitions[word]) {
      continue;
    }

    definitions[word] = await fetchDefinition(word);
    console.log(`${word}: ${definitions[word]}`);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  writeFileSync(
    definitionsPath,
    JSON.stringify({ definitions }, null, 2),
    "utf8"
  );

  console.log(`Saved ${Object.keys(definitions).length} definitions.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
