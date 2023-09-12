const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let frameCount = 0;

const ACCESS_TOKEN = process.env.GETIMG_ACCESS_TOKEN

export const postBase64 = async (base64Image: string) => {

	console.time("postBase64");
	const payload = {
		model: "stable-diffusion-v1-5",
		controlnet: "softedge-1.1",
		prompt: "A realistic drawing in style by Albrecht Dürer. Paper background",
		negative_prompt: "Disfigured, blurry, distorted, or otherwise altered faces",
		image: base64Image,
		strength: 1,
		steps: 20,
		guidance: 7.5,// Higer guidance forces the model to better follow the prompt, but result in lower quality output : Minimum value is 0, maximum value is 20. Default value is 7.5.
		seed: 42,
		// scheduler: "dpmsolver++",
		output_format: "jpeg"
	};

	const headers = {
		'Authorization': `Bearer ${ACCESS_TOKEN}`,
		'Content-Type': 'application/json'
	};

	try {
		console.time("fetch");
		const response = await fetch('https://api.getimg.ai/v1/stable-diffusion/controlnet', {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(payload)
		});
		console.timeEnd("fetch");

		// await timeout(1000)

		if (response.ok) {
			const data = await response.json();
			console.log(data.image.length)
			const buffer = Buffer.from(data.image, 'base64');  // Assuming the API returns a base64 image
			// imageBuffers.push(buffer);
			console.timeEnd("postBase64");
			return buffer;

			// Save the frame to disk
		} else {
			const errorData = await response.json();
			console.error(`Error posting frame: ${JSON.stringify(errorData)}`);
		}
	} catch (error) {
		console.error(`Fetch error: ${error}`);
	}
};


