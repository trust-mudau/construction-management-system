const test = require("node:test");
const assert = require("node:assert/strict");

const { validTaskInput } = require("../utils/taskValidation");

test("accepts a complete valid task", () => {
  assert.equal(validTaskInput({ name: "Pour foundation", cost: 2500, deadline: "2026-09-10" }), true);
});

test("rejects negative and non-numeric costs", () => {
  assert.equal(validTaskInput({ name: "Task", cost: -1, deadline: "2026-09-10" }), false);
  assert.equal(validTaskInput({ name: "Task", cost: "unknown", deadline: "2026-09-10" }), false);
});

test("rejects missing or invalid required fields", () => {
  assert.equal(validTaskInput({ name: "", cost: 1, deadline: "2026-09-10" }), false);
  assert.equal(validTaskInput({ name: "Task", cost: 1, deadline: "not-a-date" }), false);
});

test("allows valid partial updates", () => {
  assert.equal(validTaskInput({ cost: 75 }, true), true);
  assert.equal(validTaskInput({ name: " " }, true), false);
});
