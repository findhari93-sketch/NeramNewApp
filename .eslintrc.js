module.exports = {
  root: true,
  extends: [
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    // allow async client components rule to be configurable in codebase
    "@next/next/no-async-client-component": "off",
    // forbid importing client-only navigation hooks from server components
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["next/navigation"],
            message:
              "Don't use useSearchParams/useRouter in server components. Move to a client component or wrap in Suspense.",
          },
        ],
      },
    ],
  },
};
