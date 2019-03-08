var open = true;

function toggleNav() {
  document.getElementById("Sidenav").style.width = open * 300 + "px";
  document.getElementById("menu-btn").style.marginLeft = 10 + open * 300 + "px";
  open = !open;
}