/**
 * Case-study framing for the featured projects. Every statement is a restatement of a field in data.ts
 * (desc, points, stack, metrics); nothing is added that the project data does not already say.
 */
export interface Case { problem: string; solution: string; highlights: string[] }
export const cases: Record<string, Case> = {
  sentinel: {
    problem: "Live chat needs a way to identify potentially toxic messages.",
    solution: "An AI-powered moderation system. An NLP classifier built on TF-IDF features and Logistic Regression sits behind a Flask REST API.",
    highlights: ["Individual and batch toxicity predictions through one REST API", "Reported results: 95.66% accuracy and 0.9859 ROC-AUC"],
  },
  safewalk: {
    problem: "The fastest walking route is not always the safest one.",
    solution: "A navigation app that scores real streets from OpenStreetMap context (lighting, activity, open shops) and compares safer and faster routes.",
    highlights: ["Time-of-day and route-priority controls", "Live walk tracking, location sharing, SOS and Guardian safe-arrival alerts", "SMS alerts are optional and need Twilio configuration"],
  },
  skillpath: {
    problem: "College students need structured help preparing for the roles they are targeting.",
    solution: "A placement-preparation platform that turns resume analysis into personalised learning paths, practice and interview preparation. Currently in development.",
    highlights: ["Modular backend: structured API routes, database operations and AI services", "Groq API powers mock interviews, tutoring and study-note generation"],
  },
  mytaste: {
    problem: "Home cooks struggle to find recipes that fit their time, their diet and, most of all, the ingredients they already have.",
    solution: "A Django platform where people publish recipes, search and filter them precisely, save favorites, review what they cook, and find meals from their own pantry.",
    highlights: ["Business logic lives in a services module, so it can be unit-tested and later replaced, for example by an ML model", "Database constraints keep favorites and reviews unique per user, and recipe statistics are annotated in a single query", "Nutrition values are author-entered and labelled as not verified; none are generated"],
  },
  nexus: { problem: "Classic mini-games usually live on separate pages.", solution: "One browser-based hub with five playable games, score tracking and a gaming-inspired interface.", highlights: [] },
  quiz: { problem: "Short assessments need a clear flow and quick feedback.", solution: "A quiz app with answer validation and instant score calculation.", highlights: [] },
  typist: { problem: "Typing practice is hard to improve without measurement.", solution: "A trainer that tracks words per minute and accuracy in real time.", highlights: [] },
  leetcode: { problem: "Algorithm practice is only useful if it can be revisited.", solution: "Solutions organised by topic: arrays, strings, two pointers, recursion, bit manipulation and binary search.", highlights: [] },
};
