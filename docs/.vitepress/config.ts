import { defineConfig } from "vitepress";

const { description } = require("../../package.json");

export default defineConfig({
  lang: "en-US",
  title: "The Fun Framework",
  description: description,
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#DBCAFF" }],
    ["meta", { property: "twitter:card", content: "summary_large_image" }],
    ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
    ["link", { rel: "mask-icon", href: "/logo.svg", color: "#ffffff" }],
  ],
  themeConfig: {
    socialLinks: [
      { icon: "github", link: "https://github.com/crutchcorn/the-fun-framework" },
    ],
    editLink: {
      pattern: "https://github.com/crutchcorn/the-fun-framework/edit/main/docs/:path",
    }
  },
});
