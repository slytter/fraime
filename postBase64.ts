import {calculateImageDimensions} from "./calculateImageDimentions.ts";

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let frameCount = 0;

const ACCESS_TOKEN = process.env.GETIMG_ACCESS_TOKEN

export const postBase64 = async (base64Image: string, prompt: string) => {
	const {width, height} = calculateImageDimensions(512, 1080 / 1920);

	const payload = {
		model: "stable-diffusion-v1-5",
		controlnet: "softedge-1.1",
		prompt: prompt,
		negative_prompt: "Disfigured, blurry, distorted, or otherwise altered faces",
		image: base64Image,
		strength: 0.05,
		steps: 10,
		guidance: 10,// Higer guidance forces the model to better follow the prompt, but result in lower quality output : Minimum value is 0, maximum value is 20. Default value is 7.5.
		seed: 42,
		width,
		height,
		scheduler: "dpmsolver++",
		output_format: "jpeg"
	};

	const headers = {
		'Authorization': `Bearer ${ACCESS_TOKEN}`,
		'Content-Type': 'application/json'
	};

	try {
		const payloadString = JSON.stringify(payload);

		console.time('fetch');
		const response = await fetch('https://api.getimg.ai/v1/stable-diffusion/controlnet', {
			method: 'POST',
			headers: headers,
			body: payloadString
		});
		console.timeEnd('fetch');

		if (response.ok) {
			const data = await response.json();
			const buffer = Buffer.from(data.image, 'base64');  // Assuming the API returns a base64 image
			return buffer;
		} else {
			const errorData = await response.json();
			console.error(`Error posting frame: ${JSON.stringify(errorData)}`);
		}
	} catch (error) {
		console.error(`Fetch error: ${error}`);
	}
};


