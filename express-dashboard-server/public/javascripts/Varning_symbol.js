/*****************
varning_symbol.js

Created an icon for the warning dashboard.

*****************/
var open = true;

function toggleWar() {
  document.getElementById("Warning_nav").style.width = open * 300 + "px";
  document.getElementById("warning").style.marginLeft = 10 + open * 300 + "px";
  open = !open;
}
