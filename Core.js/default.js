const device = {
    type: $device.isIpad ? "ipad" : "iphone",
    ios: $device.info.version
  },
  corejs = {
    title: "Core.js",
    version: "0.0.1"
  },
  http = {
    user_agent: `${corejs.title}/${corejs.version} (${device.type}; iOS ${device.ios}; Scale/2.00)`
  };
module.exports = {
  device,
  http
};
