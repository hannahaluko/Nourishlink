import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NourishLink — dietitians, tracking and healthy food",
    short_name: "NourishLink",
    description:
      "Find a dietitian near you online, track your diet and health numbers, and order healthy food, all in one app.",
    start_url: "/app",
    display: "standalone",
    background_color: "#F4F4F4",
    theme_color: "#8CCB2E",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
