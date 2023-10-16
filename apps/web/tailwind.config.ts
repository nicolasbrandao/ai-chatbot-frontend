import type { Config } from "tailwindcss";
import daisy from "daisyui";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      height: {
        "chat-height": "calc(100vh - 136px)",
      },
    },
  },
  daisyui: {
    themes: ["light", "dark"],
  },
  plugins: [daisy],
};
export default config;
