import { useEffect, useState } from "react";
import { profiles } from "../content/data";

interface Diff { total: number; e?: number; m?: number; h?: number; te?: number; tm?: number; th?: number; rank?: number; acc?: number; score?: number; streak?: number }
interface GH { repos: number; stars: number; followers: number; last: string; langs: [string, number][] }
const get = async (u: string, ms = 9000) => { const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(u, { signal: c.signal }); if (!r.ok) throw new Error(String(r.status)); return await r.json(); } finally { clearTimeout(t); } };
const first = async <T,>(fns: (() => Promise<T>)[]) => { let e: unknown; for (const f of fns) { try { return await f(); } catch (x) { e = x; } } throw e; };
const Num = ({ v, l }: { v: string | number | undefined; l: string }) => <div className="sn"><b>{v ?? "–"}</b><small>{l}</small></div>;
const Bar = ({ l, v, max, c }: { l: string; v: number; max: number; c: string }) => (
  <div className="br"><span>{l}</span><div className="bar"><i style={{ width: `${max ? Math.round((v / max) * 100) : 0}%`, background: c }} /></div><span>{v}</span></div>);
const Card = ({ title, url, handle, children }: { title: string; url: string; handle: string; children: React.ReactNode }) => (
  <div className="sc"><div className="sh"><h3>{title}</h3><a href={url} target="_blank" rel="noreferrer">@{handle}</a></div>{children}</div>);

export default function Stats() {
  const [lc, setLc] = useState<Diff | null | "fail">(null), [gfg, setGfg] = useState<Diff | null | "fail">(null), [gh, setGh] = useState<GH | null | "fail">(null);
  useEffect(() => {
    const snap = get(`${import.meta.env.BASE_URL}stats.json?v=${Date.now()}`, 5000).catch(() => null);
    const q = encodeURIComponent;
    (async () => { const s = await snap; try { setLc(await first<Diff>([
      async () => { if (!s?.leetcode) throw 0; return s.leetcode; },
      async () => { const r = await get(`https://leetcode-api-faisalshohag.vercel.app/${q(profiles.leetcode)}`, 15000); if (!r.totalSolved) throw 0;
        return { total: r.totalSolved, e: r.easySolved, m: r.mediumSolved, h: r.hardSolved, te: r.totalEasy, tm: r.totalMedium, th: r.totalHard, rank: r.ranking, acc: r.acceptanceRate }; },
    ])); } catch { setLc("fail"); }
    try { setGfg(await first<Diff>([
      async () => { if (!s?.gfg) throw 0; return s.gfg; },
      async () => { const r = await get(`https://geeks-for-geeks-stats-api.vercel.app/?raw=y&userName=${q(profiles.gfg)}`, 20000); if (!r.info) throw 0;
        const st = r.solvedStats || {}, c = (k: string) => st[k]?.count || 0;
        return { total: r.info.totalProblemsSolved, score: r.info.codingScore, streak: r.info.currentStreak, e: c("easy") + c("basic") + c("school"), m: c("medium"), h: c("hard") }; },
    ])); } catch { setGfg("fail"); } })();
    (async () => { try { const u = profiles.github;
      const [p, repos] = await Promise.all([get(`https://api.github.com/users/${u}`), get(`https://api.github.com/users/${u}/repos?per_page=100&sort=pushed`)]);
      const own = repos.filter((r: { fork: boolean }) => !r.fork), langs: Record<string, number> = {};
      own.forEach((r: { language?: string }) => r.language && (langs[r.language] = (langs[r.language] || 0) + 1));
      setGh({ repos: p.public_repos, followers: p.followers, stars: own.reduce((a: number, r: { stargazers_count: number }) => a + r.stargazers_count, 0),
        last: repos[0] ? new Date(repos[0].pushed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "–",
        langs: Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 5) });
    } catch { setGh("fail"); } })();
  }, []);
  const note = (s: unknown, fb: string) => s === null ? <p className="sub">Loading…</p> : <p className="sub">{fb}</p>;
  const diff = (d: Diff, g: boolean) => (<>
    <div className="sns"><Num v={d.total} l="Solved" />{g ? <Num v={d.score} l="Coding score" /> : <Num v={d.rank?.toLocaleString("en-IN")} l="Global rank" />}{g ? (d.streak != null && <Num v={d.streak} l="Streak" />) : (d.acc != null && <Num v={`${Number(d.acc).toFixed(1)}%`} l="Acceptance" />)}</div>
    {(d.e ?? 0) + (d.m ?? 0) + (d.h ?? 0) > 0 && <><Bar l="Easy" v={d.e ?? 0} max={d.te || d.total} c="#3ddc97" /><Bar l="Medium" v={d.m ?? 0} max={d.tm || d.total} c="#ff9f43" /><Bar l="Hard" v={d.h ?? 0} max={d.th || d.total} c="#ff7a90" /></>}</>);
  return (
    <div className="stats-grid">
      <Card title="LeetCode" url={`https://leetcode.com/u/${profiles.leetcode}`} handle={profiles.leetcode}>
        {lc && lc !== "fail" ? diff(lc, false) : note(lc, `Live stats couldn't load. Résumé count: ${profiles.lcFallback} solved.`)}</Card>
      <Card title="GeeksforGeeks" url={`https://www.geeksforgeeks.org/profile/${profiles.gfg}`} handle={profiles.gfg}>
        {gfg && gfg !== "fail" ? diff(gfg, true) : note(gfg, `Live stats couldn't load. Résumé count: ${profiles.gfgFallback} solved.`)}</Card>
      <Card title="GitHub" url={`https://github.com/${profiles.github}`} handle={profiles.github}>
        {gh && gh !== "fail" ? (<><div className="sns"><Num v={gh.repos} l="Repositories" /><Num v={gh.stars} l="Stars earned" /><Num v={gh.followers} l="Followers" /><Num v={gh.last} l="Last push" /></div>
          {gh.langs.map(([l, n]) => <Bar key={l} l={l} v={n} max={gh.langs[0][1]} c="#4fe3ff" />)}
          <img className="heat" alt={`GitHub contribution graph for ${profiles.github}`} loading="lazy" src={`https://ghchart.rshah.org/72f2dc/${profiles.github}`} onError={(e) => e.currentTarget.remove()} /></>)
          : note(gh, "Live stats couldn't load right now. Use the profile link above.")}</Card>
    </div>
  );
}
