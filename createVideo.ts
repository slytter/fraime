import stream from "stream";
import ffmpeg from "fluent-ffmpeg";

const createVideo = (imageBuffers: Buffer[]) => {
	const imageStream = new stream.PassThrough();
	ffmpeg(imageStream)
		.inputFormat('image2pipe')
		.inputOptions([
			'-framerate', '1',
			'-f', 'image2pipe',
			'-vcodec', 'png'
		])
		.output('output_video.mp4')
		.on('end', () => console.log('Video has been created'))
		.on('error', (error) => console.log(`Error creating video: ${error}`))
		.run();

	for (const buffer of imageBuffers) {
		imageStream.write(buffer);
	}
	imageStream.end();
};
