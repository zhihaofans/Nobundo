function getColor(light, dark) {
  return dark
    ? $color({
        light,
        dark
      })
    : $color(light);
}
const COLOR = {
  BLACK_WHITE: getColor("black", "white"),
  GRAY: getColor("gray")
};
const colorData = {
  titleTextColor: $color({
    light: "white",
    dark: "black"
  }),
  videoItemBgcolor: COLOR.GRAY,
  navSelectedTextColor: COLOR.BLACK_WHITE,
  navTextColor: COLOR.GRAY,
  navSelectedIconColor: COLOR.BLACK_WHITE,
  navIconColor: COLOR.GRAY
};
module.exports = colorData;
