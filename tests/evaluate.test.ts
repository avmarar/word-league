import assert from "node:assert/strict";
import {
  buildShareGrid,
  evaluateGuess,
  evaluationToEmoji,
} from "../src/lib/game/evaluate";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("marks exact match as all correct", () => {
  assert.deepEqual(evaluateGuess("CRANE", "CRANE"), [
    "correct",
    "correct",
    "correct",
    "correct",
    "correct",
  ]);
});

test("marks absent letters", () => {
  assert.deepEqual(evaluateGuess("CRANE", "PLANT"), [
    "absent",
    "absent",
    "correct",
    "correct",
    "absent",
  ]);
});

test("handles duplicate letters when only one exists in answer", () => {
  assert.deepEqual(evaluateGuess("ROBOT", "BOOST"), [
    "present",
    "correct",
    "present",
    "absent",
    "correct",
  ]);
});

test("does not over-mark duplicate present letters", () => {
  assert.deepEqual(evaluateGuess("AABBB", "AAAAB"), [
    "correct",
    "correct",
    "absent",
    "absent",
    "correct",
  ]);
});

test("prioritizes correct over present for duplicates", () => {
  assert.deepEqual(evaluateGuess("EERIE", "LEVEL"), [
    "absent",
    "correct",
    "absent",
    "present",
    "absent",
  ]);
});

test("builds emoji share grid", () => {
  const grid = buildShareGrid(
    42,
    [{ evaluation: evaluateGuess("CRANE", "CRANE") }],
    true
  );
  assert.match(grid, /Word League #42 1\/6/);
  assert.match(grid, /🟩🟩🟩🟩🟩/);
});

test("maps evaluation to emoji", () => {
  assert.equal(
    evaluationToEmoji(["correct", "present", "absent"]),
    "🟩🟨⬛"
  );
});

console.log("All evaluate tests passed.");
