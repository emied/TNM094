/*****************
warning-symbol.js

Created an icon for the warning dashboard.
When the icon is hovered over you will get
a short review, eg. 10 warning and when the icon is
clicked a new (pop-up?)window will be opened

TODO
make it "blink" when a warning apears
*****************/

function toggleWarning() { //Open small window
	var mod = document.getElementById('warning-modal');
	mod.style.display = mod.style.display == "block" ? "none" : "block";
}
