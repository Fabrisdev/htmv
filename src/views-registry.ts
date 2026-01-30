import fs from "node:fs/promises";
import path from "node:path";
import { viewsPath } from "./views.js";

export const viewRegistry: Record<string, string> = {};

/**
 * Placing .HTMV last gives it priority
 * This means, if there is both example.html and example.htmv in same subdir,
 * example.htmv will take priority.
 */
const SUPPORTED_FILE_EXTENSIONS = ["html", "htmv"];

function addToViewRegistry(name: string, code: string) {
	viewRegistry[name] = code;
}

export async function registerViews() {
	const files = await deepReadDir(viewsPath);
	for (const file of files) {
		for (const extension of SUPPORTED_FILE_EXTENSIONS) {
			if (file.endsWith(`.${extension}`)) {
				const relativePath = path.relative(viewsPath, file);
				const name = relativePath.slice(0, -`.${extension}`.length);
				const code = await fs.readFile(file, "utf-8");
				addToViewRegistry(name, code);
			}
		}
	}
}

async function deepReadDir(dir: string): Promise<string[]> {
	const entries = await fs.readdir(dir, { withFileTypes: true });

	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await deepReadDir(fullPath)));
		} else if (entry.isFile()) {
			files.push(fullPath);
		}
	}

	return files;
}
