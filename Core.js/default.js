const __VERSION__ = 1,
  device = {
    type: $device.isIpad ? "ipad" : "iphone",
    ios: $device.info.version
  },
  corejs = {
    title: "Core.js",
    version: "0.0.2"
  },
  http = {
    user_agent: `${corejs.title}/${corejs.version} (${device.type}; iOS ${device.ios}; Scale/2.00)`
  };
module.exports = {
  __VERSION__,
  device,
  http
};
