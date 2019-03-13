/*****************
varning_symbol.js

Created an icon for the warning dashboard.
When the icon is hovered over you will get
a short review, eg. 10 warning and when the icon is
clicked a new (pop-up?)window will be opened

TODO
make it "blink" when a warning apears
*****************/
var open = true;
var modal = document.getElementById('warModal');

function toggleWar() { //Open small window
    modal.style.display = "block";
    open = !open;
}

function closeWar() {
  modal.style.display = "none";

}
