import { CHARACTERS } from "./src/lib/characters";
import { findHskWord } from "./src/lib/hskSearch";
const missing: string[] = [];
for (const c of CHARACTERS) {
  if (!findHskWord(c.hanzi)) missing.push(c.hanzi);
}
console.log("total:", CHARACTERS.length, "| missing from HSK dict:", missing.length, missing.join(" "));
