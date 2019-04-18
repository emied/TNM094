exports.formatDate = (date) => {
	const zeroPad = (n) =>  n > 9 ? n : '0' + n;

	var year = date.getFullYear(),
	month = zeroPad(date.getMonth() + 1),
	day = zeroPad(date.getDate()),
	hour = zeroPad(date.getHours()),
	minute = zeroPad(date.getMinutes()),
	second = zeroPad(date.getSeconds());

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}