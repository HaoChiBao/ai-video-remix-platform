export const siteConfig = {
  name: "Cobalt Stream",
  tagline: "Discover. Watch. Remix with AI.",
  description:
    "A premium streaming community for licensed content, clips, and AI-assisted segments.",
  nav: [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/create", label: "Create" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/profile", label: "Profile" },
  ] as const,
  clipDuration: {
    minSeconds: 15,
    maxSeconds: 300,
  },
} as const;
