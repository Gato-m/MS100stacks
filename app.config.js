// Keep app config dependency-free: EAS evaluates this file before installing node_modules.

export default ({ config }) => {
  const disablePushForLocalBuild = process.env.LOCAL_NO_PUSH === "1";

  return {
    ...config,
    plugins: disablePushForLocalBuild
      ? (config.plugins || []).filter(
          (plugin) =>
            !(Array.isArray(plugin)
              ? plugin[0] === "expo-notifications"
              : plugin === "expo-notifications"),
        )
      : config.plugins,
    extra: {
      ...config.extra,
      MAPTILER_API_KEY: process.env.MAPTILER_API_KEY,
    },
  };
};
