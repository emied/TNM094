var open = true;

function toggleNav() {
  document.getElementById("Sidenav").style.width = open * 250 + "px";
  document.getElementById("menu-btn").style.marginLeft = 10 + open*250 + "px";
  open = !open;
}
