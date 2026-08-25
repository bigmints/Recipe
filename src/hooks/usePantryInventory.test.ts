import { describe, expect, it } from "vitest";
import { toggleInventoryKey } from "./usePantryInventory";

describe("pantry inventory", () => {
  it("adds an ingredient key when it is not already on hand", () => {
    expect(toggleInventoryKey([], "tomato")).toEqual(["tomato"]);
  });

  it("removes an ingredient key when it is already on hand", () => {
    expect(toggleInventoryKey(["tomato", "pasta"], "tomato")).toEqual(["pasta"]);
  });
});
