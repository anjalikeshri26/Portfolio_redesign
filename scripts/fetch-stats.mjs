// Runs on GitHub Actions (Node 20). Writes public/stats.json.
import { writeFileSync } from 'node:fs';
const LC = 'Anjali_keshri_260906', GFG = 'anjali3g3v';
const j = async (u, o) => { const r = await fetch(u, o); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
const out = { updated: new Date().toISOString() };

try { // LeetCode official GraphQL (works server-side, no CORS issue)
  const query = `query($u:String!){allQuestionsCount{difficulty count} matchedUser(username:$u){profile{ranking}
    submitStatsGlobal{acSubmissionNum{difficulty count}} submitStats{totalSubmissionNum{count} acSubmissionNum{count}}}}`;
  const r = await j('https://leetcode.com/graphql', { method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query, variables: { u: LC } }) });
  const d = r.data, ac = k => d.matchedUser.submitStatsGlobal.acSubmissionNum.find(x => x.difficulty === k)?.count ?? 0;
  const tot = k => d.allQuestionsCount.find(x => x.difficulty === k)?.count;
  const sub = d.matchedUser.submitStats;
  out.leetcode = { total: ac('All'), e: ac('Easy'), m: ac('Medium'), h: ac('Hard'), te: tot('Easy'), tm: tot('Medium'), th: tot('Hard'),
    rank: d.matchedUser.profile.ranking, acc: +(sub.acSubmissionNum[0].count / sub.totalSubmissionNum[0].count * 100).toFixed(1) };
} catch (e) { console.warn('LeetCode failed', e.message); }

try { // GeeksforGeeks via community API
  const r = await j(`https://geeks-for-geeks-stats-api.vercel.app/?raw=y&userName=${GFG}`);
  const s = r.solvedStats || {}, c = k => s[k]?.count || 0;
  out.gfg = { total: r.info.totalProblemsSolved, score: r.info.codingScore, streak: r.info.currentStreak,
    e: c('easy') + c('basic') + c('school'), m: c('medium'), h: c('hard') };
} catch (e) { console.warn('GFG failed', e.message); }

writeFileSync('public/stats.json', JSON.stringify(out, null, 1));
console.log(out);
