// Single source of truth. Every value comes from the résumé or was confirmed by Anjali.
export const profile = {
  name: "Anjali Keshri",
  headline: "Aspiring AI/ML Engineer",
  screen: {
    title: "HELLO, I'M ANJALI KESHRI",
    subtitle: "Computer Science Engineer | AI/ML & Data Science Enthusiast",
    tagline: "Explore my world of technology, intelligence and innovation.",
    cta: "CLICK HERE TO ENTER",
  },
  character: "robot" as "robot" | "avatar" | "procedural", // intro figure
  avatar: "/assets/avatar.webp",
  illustration: "/assets/illustration.jpg", // reserved for the About chapter
  photo: "/assets/self-portrait.jpg", // temporary selfie (side bars cropped); replace the file, keep the path
  links: {
    email: "anjalike16@gmail.com",
    linkedin: "https://www.linkedin.com/in/anjali-keshri-14g122014",
    github: "https://github.com/anjalikeshri26",
  },
};
