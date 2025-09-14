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
  },
};
