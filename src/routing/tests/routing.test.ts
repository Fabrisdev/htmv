import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";
import Elysia from "elysia";
import { registerRoutes } from "../routing";

const entries = await fs.readdir(import.meta.dir);
const projects = (
	await Promise.all(
		entries.map(async (entry) => {
			const fullPath = path.join(import.meta.dir, entry);
			return (await isFolder(fullPath)) ? fullPath : null;
		}),
	)
).filter((project) => project !== null);

describe("Routing tests", () => {
	projects.forEach((project) => {
		test(path.basename(project), async () => {
			const expectedOutput = JSON.parse(
				await fs.readFile(path.join(project, "expected_output.json"), "utf-8"),
			);
			const app = new Elysia();
			await registerRoutes(app, project);
			expect(
				app.routes.map((route) => ({ method: route.method, path: route.path })),
			).toEqual(expect.arrayContaining(expectedOutput));
		});
	});
});

async function isFolder(path: string) {
	const stats = await fs.stat(path);
	return stats.isDirectory();
}
