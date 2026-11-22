/** Chapter registry: one source for the nav, the observer and the section ids. */
export const chapters = [
  { id: "mind", letter: "A", name: "The mind behind the code" },
  { id: "work", letter: "B", name: "Selected work" },
  { id: "intelligence", letter: "C", name: "Intelligence in motion" },
  { id: "engineering", letter: "D", name: "Engineering lab" },
  { id: "toolkit", letter: "E", name: "Technical toolkit" },
  { id: "journey", letter: "F", name: "Academic journey" },
  { id: "contact", letter: "G", name: "Contact" },
] as const;
export type ChapterId = typeof chapters[number]["id"];
