import { flagsToBraille, toSyllables, vowels } from "../src/braille";

describe("flagsToBraille", () => {
  test.concurrent.each([
    [1, "⠁"],
    [2, "⠂"],
    [3, "⠄"],
    [4, "⠈"],
    [5, "⠐"],
    [6, "⠠"],
    [7, "⡀"],
    [8, "⢀"],
  ])("BRAILLE PATTERN DOTS-%d", (dot, braille) => {
    expect(flagsToBraille(1 << (dot - 1))).toBe(braille);
  });
});

describe("toSyllables", () => {
  test.concurrent.each([
    ["a", ["A"]],
    ["toki", ["TO", "KI"]],
    ["pona", ["PO", "NA"]],
    ["jan", ["JA", "N"]],
    ["sinpin", ["SI", "N", "PI", "N"]],
    ["Tomosewi", ["TO", "MO", "SE", "WI"]],
  ])("'%s' is to be '%s'", (char, syllable) => {
    expect(toSyllables(char)).toEqual(syllable);
  });
});
