import { useEffect, useRef, useState } from "react";

/* ---------- Nexus-Gaming: the five games named in the project data ---------- */
const GAMES: [string, React.ReactNode][] = [
  ["Snake", <svg viewBox="0 0 60 60" key="s"><path className="g-snake" pathLength={1} d="M8 44 H34 V24 H16 V12 H48" /></svg>],
  ["Tetris", <svg viewBox="0 0 60 60" key="t"><g className="g-tet"><rect x="14" y="8" width="12" height="12" /><rect x="26" y="8" width="12" height="12" /><rect x="26" y="20" width="12" height="12" /><rect x="38" y="20" width="12" height="12" /></g><rect x="14" y="44" width="36" height="8" className="g-base" /></svg>],
  ["Pong", <svg viewBox="0 0 60 60" key="p"><rect x="6" y="20" width="4" height="20" /><rect x="50" y="20" width="4" height="20" /><circle className="g-ball" cx="30" cy="30" r="3.5" /></svg>],
  ["Minesweeper", <svg viewBox="0 0 60 60" key="m">{[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <rect key={r * 3 + c} className="g-cell" style={{ animationDelay: `${(r * 3 + c) * 70}ms` }} x={8 + c * 15} y={8 + r * 15} width="13" height="13" />))}</svg>],
  ["Slide Puzzle", <svg viewBox="0 0 60 60" key="sp">{[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (r * 3 + c < 8 ? <rect key={r * 3 + c} className={r * 3 + c === 7 ? "g-slide" : ""} x={8 + c * 15} y={8 + r * 15} width="13" height="13" /> : null)))}</svg>],
];
export function NexusDemo() {
  return <ul className="nx">{GAMES.map(([n, g]) => <li key={n} tabIndex={0}>{g}<span>{n}</span></li>)}</ul>;
}

/* ---------- QuizBlitz: an interaction sketch, not the real quiz ---------- */
const OPTS = ["Queue", "Stack", "Heap", "Graph"];
export function QuizDemo() {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="qz">
      <p className="qz-q" id="qz-q">Which data structure removes the most recently added item first?</p>
      <div role="group" aria-labelledby="qz-q">
        {OPTS.map((o, i) => (
          <button key={o} disabled={pick !== null} onClick={() => setPick(i)} className={pick === null ? "" : i === 1 ? "right" : i === pick ? "wrong" : "dim"}>{o}</button>))}
      </div>
      <p className="qz-fb" aria-live="polite">{pick === null ? "Choose an answer." : pick === 1 ? "Correct. A stack is last in, first out." : "Not quite. A stack is last in, first out."}
        {pick !== null && <button className="qz-reset" onClick={() => setPick(null)}>Try again</button>}</p>
      <p className="sw-note">Sketch of the answer-and-feedback flow. The live build has the full quiz.</p>
    </div>
  );
}

/* ---------- Typist: a working typing test (real WPM and accuracy) ---------- */
const TEXT = "the quick brown fox jumps over the lazy dog";
export function TypistDemo() {
  const [val, setVal] = useState(""), [start, setStart] = useState(0), [now, setNow] = useState(0), [keys, setKeys] = useState(0), [bad, setBad] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const done = val.length === TEXT.length;
  useEffect(() => { if (!start || done) return; const t = setInterval(() => setNow(performance.now()), 200); return () => clearInterval(t); }, [start, done]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.slice(0, TEXT.length);
    if (!start && v) { setStart(performance.now()); setNow(performance.now()); }
    if (v.length > val.length) { setKeys((k) => k + 1); if (v[v.length - 1] !== TEXT[v.length - 1]) setBad((b) => b + 1); }
    setVal(v);
  };
  const mins = start ? Math.max((now - start) / 60000, 1 / 600) : 0;
  const correct = [...val].filter((c, i) => c === TEXT[i]).length;
  const wpm = start ? Math.round(correct / 5 / mins) : 0, acc = keys ? Math.round(((keys - bad) / keys) * 100) : 100;
  const reset = () => { setVal(""); setStart(0); setNow(0); setKeys(0); setBad(0); input.current?.focus(); };
  return (
    <div className="ty" onClick={() => input.current?.focus()}>
      <p className="ty-text" aria-hidden="true">{[...TEXT].map((c, i) => <span key={i} className={i < val.length ? (val[i] === c ? "ok" : "no") : i === val.length ? "cur" : ""}>{c}</span>)}</p>
      <label className="sr" htmlFor="ty-in">Type this sentence: {TEXT}</label>
      <input id="ty-in" ref={input} value={val} onChange={onChange} disabled={done} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="Click here and start typing" />
      <p className="ty-stats" aria-live="polite"><span><b>{wpm}</b> wpm</span><span><b>{acc}%</b> accuracy</span>{done && <button onClick={reset}>Try again</button>}</p>
    </div>
  );
}

/* ---------- LeetCode Solutions: binary search, stepped one decision at a time ---------- */
const ARR = [3, 8, 14, 21, 27, 35, 42, 58, 63, 77, 91];
interface Step { lo: number; hi: number; mid: number; note: string }
function search(target: number): Step[] {
  const out: Step[] = []; let lo = 0, hi = ARR.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2), v = ARR[mid];
    if (v === target) { out.push({ lo, hi, mid, note: `${v} is the target. Found at index ${mid}.` }); return out; }
    out.push({ lo, hi, mid, note: v < target ? `${v} is less than ${target}, so discard the left half.` : `${v} is greater than ${target}, so discard the right half.` });
    if (v < target) lo = mid + 1; else hi = mid - 1;
  }
  out.push({ lo, hi, mid: -1, note: `The range is empty. ${target} is not in the array.` });
  return out;
}
export function BinaryDemo() {
  const [target, setTarget] = useState(58), [n, setN] = useState(0);
  const steps = search(target), s = steps[Math.min(n, steps.length - 1)];
  return (
    <div className="bs">
      <div className="bs-arr" aria-hidden="true">{ARR.map((v, i) => <span key={v} className={(i < s.lo || i > s.hi ? "out " : "") + (i === s.mid ? "mid" : "")}>{v}<i>{i}</i></span>)}</div>
      <p className="bs-note" aria-live="polite">Step {Math.min(n, steps.length - 1) + 1} of {steps.length}. {s.note}</p>
      <div className="bs-ctl">
        <label>Target <select value={target} onChange={(e) => { setTarget(+e.target.value); setN(0); }}>{[...ARR, 50].sort((a, b) => a - b).map((v) => <option key={v}>{v}</option>)}</select></label>
        <button onClick={() => setN((x) => Math.max(0, x - 1))} disabled={n === 0}>Back</button>
        <button onClick={() => setN((x) => Math.min(steps.length - 1, x + 1))} disabled={n >= steps.length - 1}>Next step</button>
      </div>
    </div>
  );
}
