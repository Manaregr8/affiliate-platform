import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const config = [
  nextVitals,
  nextTs,
  {
    name: "affiliate-platform/custom-ignores",
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default config;
