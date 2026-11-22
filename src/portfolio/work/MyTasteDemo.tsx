import { useMemo, useState } from "react";

// Sample pantry and recipes for illustration only. They are not data from the app.
const PANTRY = ["Tomato", "Onion", "Garlic", "Pasta", "Eggs", "Cheese", "Rice", "Spinach", "Chickpeas", "Lemon"];
const RECIPES: [string, string[]][] = [
  ["Tomato pasta", ["Pasta", "Tomato", "Garlic", "Onion"]],
  ["Spinach omelette", ["Eggs", "Spinach", "Cheese", "Onion"]],
  ["Chickpea rice bowl", ["Rice", "Chickpeas", "Spinach", "Lemon", "Garlic"]],
  ["Cheese pasta bake", ["Pasta", "Cheese", "Tomato", "Eggs"]],
];

export default function MyTasteDemo() {
  const [have, setHave] = useState<Set<string>>(new Set(["Tomato", "Pasta", "Garlic"]));
  const toggle = (i: string) => setHave((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  // Same idea as the app's finder: match % = ingredients you have / ingredients the recipe needs.
  const ranked = useMemo(() => RECIPES.map(([name, need]) => {
    const got = need.filter((i) => have.has(i)), missing = need.filter((i) => !have.has(i));
    return { name, got, missing, pct: Math.round((got.length / need.length) * 100) };
  }).sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name)), [have]);

  return (
    <div className="mt">
      <fieldset className="mt-pantry">
        <legend>What's in your kitchen?</legend>
        <div>{PANTRY.map((i) => <button key={i} aria-pressed={have.has(i)} onClick={() => toggle(i)}>{i}</button>)}</div>
      </fieldset>
      <ol className="mt-results" aria-live="polite" aria-label="Recipes ranked by ingredient match">
        {ranked.map((r) => (
          <li key={r.name}>
            <div className="mt-row"><b>{r.name}</b><span>{r.pct}% match</span></div>
            <span className="mt-bar" aria-hidden="true"><i style={{ width: `${r.pct}%` }} /></span>
            <p><span>Have</span> {r.got.length ? r.got.join(", ") : "none yet"}</p>
            <p><span>Missing</span> {r.missing.length ? r.missing.join(", ") : "nothing, ready to cook"}</p>
          </li>))}
      </ol>
      <p className="sw-note">Illustration of the ingredient finder with sample recipes. Not data from the app.</p>
    </div>
  );
}
