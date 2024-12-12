import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SainTPharma PWA",
    short_name: "SainTPharma",
    description: "Aprenda com quem sabe",
    start_url: "/",
    display: "standalone",
    background_color: "#0ea5e9",
    theme_color: "#ffff",
    icons: [
      {
        src: "/logo-192.ico",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-256.ico",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  };
}
