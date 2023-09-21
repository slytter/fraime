import stream from "stream";
import ffmpeg from "fluent-ffmpeg";
import path from 'path';
import fs from 'fs';


// Real hacky chat gpt video merger  (refactor for scale)
export const createVideoFromBuffers = async (buffers: Buffer[]) => {
	try {
		// Create an array to store the paths of temporary image files
		const tempFiles = [];

		// Create a text file for FFmpeg's concat demuxer
		const concatFilePath = path.join(__dirname, 'concat.txt');
		const concatFile = fs.createWriteStream(concatFilePath);

		// Convert Base64 strings to image files and write to the concat file
		for (let i = 0; i < buffers.length; i++) {
			const buffer = buffers[i];
			const tempFilePath = path.join(__dirname, `temp_image_${i}.png`);
			fs.writeFileSync(tempFilePath, buffer);
			tempFiles.push(tempFilePath);
			concatFile.write(`file '${tempFilePath}'\n`);
		}

		// Close the concat file
		concatFile.end();

		const time = String(new Date().getUTCDate())

		// Run FFmpeg command to create a video
		await new Promise((resolve, reject) => {
			ffmpeg()
				.input(concatFilePath)
				.inputOptions([
					'-f', 'concat',
					'-safe', '0'
				])
				.videoCodec('libx264')
				.outputOptions([
					'-framerate', '1'
				])
				.output(`output_video${time}.mp4`)
				.on('end', resolve)
				.on('error', reject)
				.run();
		});

		// Delete temporary image files and the concat file
		for (const tempFilePath of tempFiles) {
			fs.unlinkSync(tempFilePath);
		}
		fs.unlinkSync(concatFilePath);

	} catch (err) {
		console.log('Error creating video:', err);
	}
};
