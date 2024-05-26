// Braille Unicode block: U+2800 - U+28FF
// ①④
// ②⑤
// ③⑥
// ⑦⑧

export function flagsToBraille(offset: number) {
  const head = 0x2800;
  return String.fromCodePoint(head + offset);
}

export function dots(dots: number[]) {
  return dots.reduce((acc, dot) => acc | (1 << (dot - 1)), 0);
}

export const vowels = new Map<string, number>([
  ["A", dots([1])],
  ["E", dots([1, 2, 4])],
  ["I", dots([1, 2])],
  ["O", dots([2, 4])],
  ["U", dots([1, 4])],
]);

export const consonants = new Map<string, number>([
  ["P", dots([6])],
  ["T", dots([3])],
  ["K", dots([5])],
  ["S", dots([3, 5, 6])],
  ["M", dots([3, 6])],
  ["N", dots([3, 5])],
  ["L", dots([5, 6])],
]);

export const syllables = new Map<string, number>([
  ...Array.from(vowels.entries()),
  ...Array.from(consonants.entries()),
  ...Array.from(consonants.entries()).flatMap(([c, cf]) =>
    Array.from(vowels.entries()).map(([v, vf]): [string, number] => [
      c + v,
      cf | vf,
    ]),
  ),
  ["W", dots([1, 4])],
  ["J", dots([1, 2])],
  ["WA", dots([3])],
  ["WE", dots([2, 3, 5])],
  ["WI", dots([2, 3])],
  ["WO", dots([2, 5])],
  ["WU", dots([3, 6])],
  ["JA", dots([3, 4])],
  ["JE", dots([2, 3, 4, 5])],
  ["JI", dots([2, 3, 4])],
  ["JO", dots([2, 4, 5])],
  ["JU", dots([3, 4, 6])],
  [".", dots([2, 5, 6])],
  [",", dots([5, 6])],
  ["?", dots([2, 6])],
  ["!", dots([2, 3, 5])],
]);

const regularWords = [
  // 1 syllable
  "a",
  "e",
  "ko",
  "la",
  "li",
  "ma",
  "mi",
  "mu",
  "ni",
  "o",
  "pi",
  "pu",
  "tu",
  // >= 2 syllables
  "anu",
  "esun",
  "ijo",
  "ilo",
  "jaki",
  "jelo",
  "kala",
  "kasi",
  "ken",
  "kepeken",
  "kili",
  "kiwen",
  "kule",
  "kulupu",
  "kute",
  "lape",
  "laso",
  "lawa",
  "len",
  "lete",
  "lili",
  "lipu",
  "loje",
  "luka",
  "lukin",
  "lupa",
  "mama",
  "mami",
  "mani",
  "mije",
  "moku",
  "moli",
  "musi",
  "mun",
  "musi",
  "nasa",
  "nasin",
  "nena",
  "nimi",
  "noka",
  "olin",
  "open",
  "pakala",
  "pali",
  "pan",
  "pana",
  "pilin",
  "pimeja",
  "pini",
  "pipi",
  "poka",
  "sama",
  "seli",
  "selo",
  "sewi",
  "sijelo",
  "sike",
  "sin",
  "sitelen",
  "sona",
  "soweli",
  "suli",
  "suno",
  "supa",
  "suwi",
  "tan",
  "telo",
  "tomo",
  "uta",
  "walo",
  "waso",
  "wawa",
];

type Syllable = string;

const irregularWords = new Map<string, Syllable[]>([
  // for avoid a collision
  ["anpa", ["A", "PA"]],
  ["ante", ["A", "TE"]],
  ["insa", ["I", "SA"]],
  ["kalama", ["KA", "SA"]],
  ["linja", ["LI", "JA"]],
  ["nanpa", ["NA", "PA"]],
  ["palisa", ["PA", "SA"]],
  ["sinpin", ["SI", "PI"]],
  ["tenpo", ["TE", "PO"]],
  ["unpa", ["U", "PA"]],
  ["utala", ["U", "LA"]],
  // for high freqency
  ["ala", ["LU"]],
  ["ike", ["KI"]],
  ["jan", ["JA"]],
  ["kama", ["KA"]],
  ["ken", ["KE"]],
  ["lon", ["LO"]],
  ["mute", ["ME"]],
  ["ona", ["NA"]],
  ["pona", ["PO"]],
  ["seme", ["SE"]],
  ["sina", ["SI"]],
  ["taso", ["SO"]],
  ["tawa", ["TA"]],
  ["tenpo", ["TE"]],
  ["toki", ["TO"]],
  ["wile", ["WI"]],
]);

export function toSyllables(word: string): Syllable[] {
  return (
    word
      .match(/[aeiou]|[ptksmnlwj][aeiou]?/gi)
      ?.map((syllable) => syllable.toUpperCase()) || []
  );
}

const words = new Map<string, Syllable[]>([
  ...Array.from(irregularWords.entries()),
  ...regularWords.map((word): [string, Syllable[]] => [
    word,
    toSyllables(word).slice(0, 2),
  ]),
]);

type Token = {
  type: "OFFICIAL" | "UNOFFICIAL" | "PROPER_NOUN" | "PUNCTUATION" | "UNKNOWN";
  value: string;
};

export function tokenize(text: string): Token[] {
  const offical = (value: string) => words.has(value);
  const punctuation = (value: string) => value.match(/^[.,?!]$/);
  const properNoun = (value: string) => /^[A-Z][A-Za-z]+$/.test(value);
  const unoffical = (value: string) => /^[a-z]+$/.test(value);
  return text
    .split(/\s+/)
    .flatMap((x) => x.split(/([.,?!])/))
    .map((value) => {
      if (offical(value)) {
        return { type: "OFFICIAL", value };
      } else if (punctuation(value)) {
        return { type: "PUNCTUATION", value };
      } else if (properNoun(value)) {
        return { type: "PROPER_NOUN", value };
      } else if (unoffical(value)) {
        return { type: "UNOFFICIAL", value };
      } else {
        return { type: "UNKNOWN", value };
      }
    });
}

export function syllableToFlags(syllable: Syllable): number {
  return syllables.get(syllable);
}

export function tokenToBraille({ type, value }: Token): string {
  const beginOfWord = dots([7]);
  const endOfWord = dots([8]);
  const beginOfProperNoun = dots([4, 5, 6, 8]);
  const contuinuationOfProperNoun = dots([7, 8]);
  const endOfProperNoun = dots([1, 2, 3, 7]);
  const unoffical = dots([7, 8]);
  const markContuinuationOfProperNoun = (flags: number) =>
    flags | contuinuationOfProperNoun;
  const markUnofficalOneSyllable = (flags: number) => flags | unoffical;
  switch (type) {
    case "OFFICIAL": {
      const syllables = words.get(value);
      const markWordBoundaries = (flags: number, index: number) =>
        flags |
        (index == 0 ? beginOfWord : 0) |
        (index == syllables.length - 1 ? endOfWord : 0);
      return syllables.length === 1
        ? syllables.map(syllableToFlags).map(flagsToBraille).join("")
        : syllables
            .map(syllableToFlags)
            .map(markWordBoundaries)
            .map(flagsToBraille)
            .join("");
    }
    case "UNOFFICIAL": {
      const syllables = toSyllables(value);
      const markWordBoundaries = (flags: number, index: number) =>
        flags |
        (index == 0 ? beginOfWord : 0) |
        (index == syllables.length - 1 ? endOfWord : 0);
      return syllables.length === 1
        ? syllables
            .map(syllableToFlags)
            .map(markUnofficalOneSyllable)
            .map(flagsToBraille)
            .join("")
        : syllables
            .map(syllableToFlags)
            .map(markWordBoundaries)
            .map(flagsToBraille)
            .join("");
    }
    case "PROPER_NOUN":
      return [
        beginOfProperNoun,
        ...toSyllables(value)
          .map(syllableToFlags)
          .map(markContuinuationOfProperNoun),
        endOfProperNoun,
      ]
        .map(flagsToBraille)
        .join("");
    case "PUNCTUATION":
      return flagsToBraille(syllableToFlags(value)) + "\u2800";
    case "UNKNOWN":
      return value;
  }
}

export function toBrailles(text: string) {
  return tokenize(text).map(tokenToBraille).join("");
}
