$(document).ready(function () {
	$('#toggle-sidemenu').on('click', function () {
		$('#sidebar').toggleClass('active');
		$('#topmenu').toggleClass('active');
	});
});