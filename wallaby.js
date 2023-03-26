module.exports = function () {
  return {
    autoDetect: true,
    files: ["src/**/*.ts", { pattern: "src/**/*.spec.ts", ignore: true }],

    tests: ["src/**/*.spec.ts"],

    env: {
      type: "node",
      runner: "node",
    },
  };
};
