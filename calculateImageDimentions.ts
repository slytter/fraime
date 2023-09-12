
// Calculate the dimensions of an image based on the aspect ratio and the width
// The height and width **must be divisible by 64**
export function calculateImageDimensions(inputWidth: number, aspectRatio: number): { width: number, height: number } {
	// Calculate the raw height using the aspect ratio
	let rawHeight = Math.round(inputWidth / aspectRatio);

	// Round to the nearest value that's divisible by 64
	let height = Math.floor(rawHeight / 64) * 64;

	// If the height is not divisible by 64, round it up to the next closest number that is
	if (rawHeight % 64 !== 0) {
		height += 64;
	}

	// Adjust the width to closely match the aspect ratio while being divisible by 64
	let width = Math.round(height * aspectRatio);
	width = Math.floor(width / 64) * 64;

	// If the width is not divisible by 64, round it up to the next closest number that is
	if (width % 64 !== 0) {
		width += 64;
	}

	return { width, height };
}
