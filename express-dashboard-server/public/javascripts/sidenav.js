$(document).ready(function () {
	$('#toggle-sidenav').on('click', function () {
		$('#sidenav').toggleClass('active');
		$('#topnav').toggleClass('active');
	});
});