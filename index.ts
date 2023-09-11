var ffmpeg = require('ffmpeg');

try {
	var process = new ffmpeg('./video.mp4');
	process.then(function (video) {
		video.addCommand('-ss', '00:01:30')
		video.addCommand('-vframes', '1')
		video.save('./test.jpg', function (error, file) {
			if (!error)
				console.log('Video file: ' + file);
		});
	}, function (err) {
		console.log('Error: ' + err);
	});
} catch (e) {
	console.log(e.code);
	console.log(e.msg);
}
