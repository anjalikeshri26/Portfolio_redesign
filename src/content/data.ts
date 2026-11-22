// Merged from the résumé and the previous portfolio. Nothing here is invented.
export const hero = {
  availability: "CSE (AI & ML) · Heritage Institute of Technology",
  eyebrow: "Curiosity → Code → Impact",
  headline: "Building ideas into experiences.",
  lead: "I'm Anjali Keshri, a second-year Computer Science & Engineering (AI & ML) student at Heritage Institute of Technology, Kolkata, building web applications and exploring AI-driven solutions.",
  roles: ["Python & AI-powered applications", "Full-stack product development", "Java & algorithmic problem solving", "Interfaces with purpose"],
  note: "Kolkata, India · Open to internships & collaborations",
  chips: ["Build with purpose", "Python · Java · AI/ML", "Always learning"],
  card: { top: "Personal portfolio / 2026", mono: "AK.", name: "Anjali Keshri", sub: "AI / ML · Software · Web" },
};
export const about = {
  eyebrow: "A little about me", title: "Engineer by learning. Builder by instinct.",
  sub: "I enjoy turning a rough idea into something people can actually use, then improving it through feedback, iteration and curiosity.",
  statement: "I care about the details behind the interface: the logic, data and decisions that make a product useful.",
  paras: [
    "I'm a second-year B.Tech student in Computer Science & Engineering (Artificial Intelligence and Machine Learning) at Heritage Institute of Technology, Kolkata, with a 9.88 CGPA. I have hands-on experience developing and deploying full-stack web applications, and I'm interested in Data Analytics, Machine Learning and AI-driven application development.",
    "I enjoy combining programming, analytical thinking and problem-solving to create useful technology solutions. I'm eager to keep strengthening my engineering foundations while contributing to meaningful projects.",
  ],
  facts: ["B.Tech · 2025–2029", "Kolkata, India", "AI & ML", "Software development"],
};
export type Cat = "ai" | "web" | "problem";
export interface Project { id: string; cat: Cat; status: string; type: string; name: string; desc: string; points: string[]; stack: string[]; links: [string, string][]; metrics?: [string, string][]; accent: string }
export const projects: Project[] = [
  { id: "skillpath", cat: "ai", accent: "#7b5cff", status: "In development", type: "AI · Full-stack platform", name: "SkillPath Navigator",
    desc: "An AI-powered placement-preparation platform, designed to help college students prepare for target roles through personalized learning paths, practice and interview preparation.",
    points: ["Resume analysis that identifies skill gaps and generates targeted learning recommendations.", "Personalized, career-oriented learning roadmaps.", "Adaptive mock assessments with topic-wise performance evaluation and progress tracking.", "AI-powered mock interviews, interactive tutoring and study-note generation using the Groq API.", "Modular backend with structured API routes, database operations and AI-powered services."],
    stack: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "JavaScript", "JWT", "Generative AI", "Groq API", "Docker"],
    links: [["Source code", "https://github.com/anjalikeshri26/Skillpath-Navigator"], ["Discuss the project", "mailto:anjalike16@gmail.com?subject=SkillPath%20Navigator%20demo"]] },
  { id: "safewalk", cat: "ai", accent: "#4fe3ff", status: "Repository available", type: "Python · Mapping", name: "SafeWalk",
    desc: "A pedestrian-safety navigation application that scores real streets using OpenStreetMap context such as lighting, activity and open shops, then compares safer and faster walking routes.",
    points: ["Safest-versus-fastest routing with time-of-day and route-priority controls.", "Nearby safe spots, crowd reports with verification and a safety timeline (documented in the README).", "Live walk tracking and live location sharing.", "Safety workflows: share-my-walk, SOS and Guardian safe-arrival alerts. SMS integration is optional and requires Twilio configuration."],
    stack: ["Python", "Flask", "OpenStreetMap", "JavaScript", "HTML/CSS", "Mapping"],
    links: [["Source code", "https://github.com/anjalikeshri26/SafeWalk"], ["Project details", "https://github.com/anjalikeshri26/SafeWalk#readme"]] },
  { id: "mytaste", cat: "web", accent: "#ff7a59", status: "Repository available", type: "Python · Django web application", name: "My-Taste",
    desc: "A full-stack recipe discovery and cooking community platform built with Python and Django, with personalized recipe recommendations, ingredient-based discovery, meal planning, shopping lists, social interactions and nutrition tracking.",
    points: ["Recipe publishing with ingredients, quantities, images and drafts, plus search and filters by category, cuisine, diet, difficulty, time, calories and rating.", "A \"What's in your kitchen?\" finder that matches recipes to the ingredients you already have, with match percentages and have/missing lists.", "A weekly meal planner, and shopping lists built from the plan or from a single recipe.", "Ratings and reviews, favorites, collections, likes, comments, follows and in-app notifications.", "Rule-based, explainable recommendations: recommended for you, trending, popular this week and similar recipes.", "Reporting and moderation tools, including a staff dashboard and Django admin actions."],
    stack: ["Python", "Django", "SQLite", "PostgreSQL", "JavaScript", "CSS"],
    links: [["Source code", "https://github.com/anjalikeshri26/My-taste"], ["Project details", "https://github.com/anjalikeshri26/My-taste#readme"]] },
  { id: "sentinel", cat: "ai", accent: "#2f6bff", status: "Repository available", type: "NLP · REST API", name: "SENTINEL",
    desc: "An AI-powered live chat moderation system that identifies potentially toxic messages.",
    points: ["NLP classifier using TF-IDF features and Logistic Regression.", "Flask REST API supporting individual and batch toxicity predictions."],
    stack: ["Python", "NLP", "Scikit-learn", "Flask", "REST API"], metrics: [["95.66%", "accuracy"], ["0.9859", "ROC-AUC"]],
    links: [["Source code", "https://github.com/anjalikeshri26/SENTINEL-AI-Moderation"]] },
  { id: "nexus", cat: "web", accent: "#3ddc97", status: "Live project", type: "Interactive web application", name: "Nexus-Gaming",
    desc: "A browser-based gaming hub bringing classic mini-games together in one interactive experience.",
    points: ["Five playable games: Snake, Tetris, Pong, Minesweeper and Slide Puzzle.", "Score tracking, responsive layouts, animations and a gaming-inspired interface."],
    stack: ["HTML", "CSS", "JavaScript", "Vercel"], links: [["Live demo", "https://nexus-gaming-puce.vercel.app"], ["Source code", "https://github.com/anjalikeshri26/Nexus-Gaming"]] },
  { id: "quiz", cat: "web", accent: "#ff9f43", status: "Live project", type: "Interactive web application", name: "QuizBlitz",
    desc: "An interactive quiz application focused on a clear assessment flow and immediate feedback.",
    points: ["Dynamic quiz flow with answer validation and instant score calculation.", "Designed to make short assessments engaging and easy to navigate."],
    stack: ["HTML", "CSS", "JavaScript", "Vercel"], links: [["Live demo", "https://quiz-blitz-sigma.vercel.app/"], ["Source code", "https://github.com/anjalikeshri26/QuizBlitz"]] },
  { id: "typist", cat: "web", accent: "#e0559c", status: "Live project", type: "Browser utility", name: "Typist",
    desc: "A typing-speed trainer that turns practice into a measurable, feedback-driven activity.",
    points: ["Tracks words per minute and typing accuracy in real time.", "A lightweight interface for users to benchmark their typing practice."],
    stack: ["HTML", "CSS", "JavaScript", "Vercel"], links: [["Live demo", "https://typist-five.vercel.app/"], ["Source code", "https://github.com/anjalikeshri26/Typist"]] },
  { id: "leetcode", cat: "problem", accent: "#f2c94c", status: "Public repository", type: "DSA · Java", name: "LeetCode Solutions: Java",
    desc: "A topic-organized collection of coding-practice solutions documenting algorithmic learning and interview preparation.",
    points: ["Topics include arrays, strings, two pointers, recursion, bit manipulation and binary search.", "A browsable record of problem-solving practice in Java."],
    stack: ["Java", "DSA", "Algorithms", "Problem solving"], links: [["Explore repository", "https://github.com/anjalikeshri26/Leetcode-Solutions-Java"]] },
];
export const filters: [string, string][] = [["all", "All work"], ["ai", "AI & Python"], ["web", "Web experiences"], ["problem", "Problem solving"]];
export const skills: { group: string; items: string[]; note: string }[] = [
  { group: "Programming languages", items: ["Python", "Java", "C", "SQL"], note: "Programming foundations and problem-solving." },
  { group: "Data analysis", items: ["NumPy", "Pandas", "Matplotlib", "Seaborn"], note: "Data manipulation, analysis and visualization tools." },
  { group: "AI & machine learning", items: ["Machine Learning", "Prompt Engineering"], note: "Areas of interest and applied learning." },
  { group: "Core computer science", items: ["Data Structures & Algorithms"], note: "Practised through LeetCode and GeeksforGeeks." },
  { group: "Database, web & tools", items: ["PostgreSQL", "HTML", "CSS", "JavaScript", "React.js", "Node.js", "Git", "GitHub"], note: "Web technologies, database fundamentals and version control." },
];
export const skillsFoot = "Project-specific technologies also include Flask (SafeWalk) and FastAPI, SQLAlchemy and JWT (SkillPath Navigator architecture).";
export const education = [
  ["9.88 / 10", "Heritage Institute of Technology", "B.Tech · CSE (AI & ML) · 2025–2029"],
  ["91.4%", "CBSE · Class XII", "Explore International School, Hooghly · 2023–2025"],
  ["97.0%", "CISCE · Class X", "Oxford High School, Howrah · 2023"],
];
export const recognition = [
  ["Dakshh ’26", "1st Runner-Up · Sci-Charades", "Recognized in an inter-college technical-fest competition."],
  ["Srijan ’26", "Finalist · Ace the Case", "Reached the final round of a case-study competition focused on OpenAI and Anthropic."],
  ["Ongoing", "Building beyond the classroom", "Developing projects, strengthening DSA fundamentals and exploring practical AI applications."],
];
export const certs = ["Machine Learning Using Python, Simplilearn (SkillUp)", "Python for Data Science, IBM (Cognitive Class)", "Prompt Engineering, IBM (Cognitive Class)"];
export const profiles = { github: "anjalikeshri26", leetcode: "Anjali_keshri_260906", gfg: "anjali3g3v", lcFallback: 120, gfgFallback: 347 };
export const contact = {
  eyebrow: "Start a conversation", title: "Let's build something intelligent.", sub: "Have a good problem? Let's build a solution.",
  body: "I'm open to internship opportunities, collaborative projects and conversations about AI, software engineering and product development.",
  phone: "+919836243935", resume: "/assets/Anjali_Keshri_Resume.docx",
};

/**
 * Technologies Anjali is currently learning. Left empty on purpose: nothing here may be guessed.
 * Add strings and a "Currently learning" column appears in the Engineering chapter automatically.
 */
export const learning: string[] = [];
