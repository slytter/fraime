import fs from "fs/promises";

export async function imageToBase64(filename: string) {
	const buffer = await fs.readFile(filename);
	const base64Image = buffer.toString('base64');
	// // Remove the temporary file
	// await fs.unlink(filename);
	return base64Image;
}
