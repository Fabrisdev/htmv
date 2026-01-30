import fs from "node:fs/promises";
import path from "node:path";
import type { Elysia } from "elysia";
import { registerModuleRoutes } from "./modules-handler.js";

export async function registerRoutes(
	app: Elysia,
	baseDir: string,
	prefix = "",
) {
	const entries = await fs.readdir(baseDir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(baseDir, entry.name).replaceAll("\\", "/");
		if (entry.isDirectory()) {
			await registerRoutes(app, fullPath, [prefix, entry.name].join('/'));
			continue;
		}
		if (entry.name !== "index.js" && entry.name !== "index.ts") continue;
		await registerModuleRoutes(app, prefix, fullPath);
	}
}
