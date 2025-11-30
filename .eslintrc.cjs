/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "prettier"],
  plugins: ["n"],
  rules: {
    "n/no-process-exit": "error",
  },
};
