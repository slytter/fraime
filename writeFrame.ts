import fs from "fs/promises";

export const writeFrame = async (frameCount: number, buffer: Buffer) => {
	await fs.writeFile(`frames/frame_${frameCount}.png`, buffer);
}
