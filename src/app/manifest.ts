import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fretwise — your daily guitar studio",
    short_name: "Fretwise",
    description: "Lessons, practice rounds, a metronome, an interactive fretboard, and a practice tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#16130f",
    theme_color: "#16130f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
