import {calculateImageDimensions} from "./calculateImageDimentions.ts";

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let frameCount = 0;

const ACCESS_TOKEN = process.env.GETIMG_ACCESS_TOKEN

export const postBase64 = async (base64Image: string) => {
	const {width, height} = calculateImageDimensions(512, 1080 / 1920);

	const payload = {
		model: "stable-diffusion-v1-5",
		controlnet: "softedge-1.1",
		prompt: "A realistic drawing on a young good looking man with sunglasses, in style by Albrecht Dürer. no animals, Paper background, few colors, few background details, no reflections, no background objects, no background people, no background text, no background logos, no background patterns, no background colors, no background shapes, no background textures, no background buildings, no background vehicles, no background plants, no background food, no background furniture, no background clothes, no background accessories, no background body parts, no background hair, no background makeup, no background jewelry, no background tattoos, no background piercings, no background glasses",
		negative_prompt: "Disfigured, blurry, distorted, or otherwise altered faces",
		image: base64Image,
		strength: 0.1,
		steps: 20,
		guidance: 7.5,// Higer guidance forces the model to better follow the prompt, but result in lower quality output : Minimum value is 0, maximum value is 20. Default value is 7.5.
		seed: 42,
		width,
		height,
		// scheduler: "dpmsolver++",
		output_format: "jpeg"
	};

	const headers = {
		'Authorization': `Bearer ${ACCESS_TOKEN}`,
		'Content-Type': 'application/json'
	};

	try {
		const payloadString = JSON.stringify(payload);

		const response = await fetch('https://api.getimg.ai/v1/stable-diffusion/controlnet', {
			method: 'POST',
			headers: headers,
			body: payloadString
		});

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


