import * as fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import {postBase64} from "./postBase64.ts";
import {writeFrame} from "./writeFrame.ts";
import {createVideoFromBuffers} from "./createVideo.ts";

async function imageToBase64(filename: string) {
	const buffer = await fs.readFile(filename);
	const base64Image = buffer.toString('base64');
	// // Remove the temporary file
	// await fs.unlink(filename);
	return base64Image;
}


let frameCount = 0;


ffmpeg('movie.MOV')
	.outputOptions(['-vf', 'fps=30,scale=200:-1'])
	.output('temp_frames/frame_%04d.png')  // Output to individual files
	.on('stderr', (stderrLine) => {
		// FFmpeg will output progress information to stderr.
		const frameMatch = stderrLine.match(/frame=\s+(\d+)/);
		if (frameMatch) {
			frameCount = parseInt(frameMatch[1], 10);
		}
	})
	.on('end', async () => {
		console.log('Temp frames created', frameCount + ' total');

		const buffers: Buffer[] = [];

		console.log('Processing frames...');
		// Now read each frame file, process it, and remove it
		for (let i = 1; i <= frameCount; i++) {

			console.log('Processing frame ' + i + ' of ' + frameCount);
			const filename = `temp_frames/frame_${String(i).padStart(4, '0')}.png`;
			const base64Image = await imageToBase64(filename);
			const base64AlteredImage = await postBase64(base64Image);
			console.log('Done');

			if (!base64AlteredImage) {
				continue;
			}
			console.log('Writing frame ' + i + ' of ' + frameCount)
			buffers.push(base64AlteredImage);
			await writeFrame(i, base64AlteredImage);
		}

		console.log('Creating video...');
		// createVideo(buffers)
		createVideoFromBuffers

		console.log('Frames have been processed');
	})
	.on('error', (err) => {
		console.log('An error occurred: ' + err.message);
	})
	// .run();






const imagesToVideo = async () => {

	const buffers: Buffer[] = [];
	const base64Images: string[] = [];

	const frameCount = 74

	for (let i = 1; i <= frameCount; i++) {

		console.log('Processing frame ' + i + ' of ' + frameCount);
		const filename = `frames/frame_${i}.png`;
		const base64Image = await imageToBase64(filename);
		base64Images.push(base64Image);
		const buffer = Buffer.from(base64Image, 'base64');  // Assuming the API returns a base64 image
		console.log('Done');

		if (!buffer) {
			continue;
		}

		console.log('Pushing frame ' + i + ' of ' + frameCount)
		buffers.push(buffer);
	}

	console.log('Creating video...');
	createVideoFromBuffers(buffers).then(() => {
		console.log('Video created');
	}).catch((error) => {
		console.log('Error creating video', error);
	})
}



imagesToVideo();
