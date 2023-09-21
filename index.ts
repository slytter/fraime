import ffmpeg from 'fluent-ffmpeg';
import {postBase64} from "./postBase64.ts";
import {writeFrame} from "./writeFrame.ts";
import {createVideoFromBuffers} from "./createVideo.ts";
import {imageToBase64} from "./src/imageToBase64.ts";
import pLimit from 'p-limit';


let frameCount = 0;

const prompt = "A lego man with sunglasses, in style of LEGOs. Everything must be made of lego bricks, cinematic, ultra realistic, octane render, sparkles, lightfull, strong vivid color, goddess, concept art, dreamy, render by octane and blender, hyper realistic, cinematic lighting, unreal engin 5, by dominic mayer, 8 k, vray render, artstation, deviantart"
const promptDali = "In style of paintingsSalvador Dalí, surrealistic, abstract, lightfull"

//  Face should be as close to image as possible, no animals, Paper background, few colors, few background details, no reflections"


const limit = pLimit(5);


ffmpeg('movie.MOV')
	.outputOptions(['-vf', 'fps=30,scale=512:-1'])
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
		// const buffers: (Buffer)[] = [];
		const promises: Promise<Buffer | undefined>[] = [];

		console.log('Processing frames...');
		// Now read each frame file, process it, and remove it
		for (let i = 1; i <= frameCount; i++) {

			console.log('Adding frame ' + i + ' of ' + frameCount);
			const filename = `temp_frames/frame_${String(i).padStart(4, '0')}.png`;
			const base64Image = await imageToBase64(filename);
			const base64AlteredImage = limit(async () => {
				const buffer = await postBase64(base64Image, promptDali)
				if(!buffer) {
					console.log('No buffer returned for frame ' + i)
					return undefined
				}
				console.log('Buffer returned for frame ' + i)
				await writeFrame(i, buffer);
				return buffer;
			})

			promises.push(base64AlteredImage);

			if (!base64AlteredImage) {
				continue;
			}

			// console.log('Writing frame ' + i + ' of ' + frameCount)
			// buffers.push(base64AlteredImage);
			// await writeFrame(i, base64AlteredImage);
		}

		const buffers = (await Promise.all(promises)).filter((buffer) => buffer !== undefined) as Buffer[];



		console.log('Creating video...');
		await createVideoFromBuffers(buffers)

		console.log('Frames have been processed');
	})
	.on('error', (err) => {
		console.log('An error occurred: ' + err.message);
	})
	.run();






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



// imagesToVideo()
