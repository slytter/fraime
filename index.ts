import * as fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import {postBase64} from "./postBase64.ts";
import {writeFrame} from "./writeFrame.ts";

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
		console.log('Frames have been created', frameCount + ' total');

		// Now read each frame file, process it, and remove it
		for (let i = 1; i <= frameCount; i++) {
			console.log('Processing frame ' + i);
			const filename = `temp_frames/frame_${String(i).padStart(4, '0')}.png`;
			const base64Image = await imageToBase64(filename);
			console.log({base64ImageLen: base64Image.length})
			const base64AlteredImage = await postBase64(base64Image);
			if (!base64AlteredImage) {
				console.log('Frame nullish, skipping ' + i);
				continue;
			}

			console.time('writeFrame');
			await writeFrame(i, base64AlteredImage);
			console.timeEnd('writeFrame');
		}

		console.log('Frames have been processed');
	})
	.on('error', (err) => {
		console.log('An error occurred: ' + err.message);
	})
	.run();



