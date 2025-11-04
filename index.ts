import fs from "node:fs/promises";
import path from "node:path";
import html from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";
import { isValidElement } from "react";
import { renderToString } from "react-dom/server";

let viewsPath = "";

export async function view(view: string, props: Record<string, unknown>) {
	if (viewsPath === "")
		throw new Error(
			"Views folder path not yet configured. Use `Htmv.setup` before rendering a view.",
		);
	const file = Bun.file(path.join(viewsPath, `${view}.html`));
	const code = await file.text();
	const replacedCode = code.replace(/{(.+)}/g, (_, propName) => {
		return props[propName] as string;
	});
	return new Response(replacedCode, {
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}

export type RouteParams = {
	query: Record<string, string>;
	request: Request;
	params: Record<string, string>;
};

type Paths = {
	routes: string;
	views: string;
	public: string;
	port: number;
};
export async function setup(paths: Paths) {
	viewsPath = paths.views;
	const app = new Elysia().use(
		staticPlugin({
			assets: paths.public,
		}),
	);

	await registerRoutes(app, paths.routes);
	app.listen(paths.port);
	console.log("");
	console.log(`HTMV running on port ${paths.port}! 🎉`);
	console.log(`http://localhost:${paths.port}`);
}

async function registerRoutes(app: Elysia, baseDir: string, prefix = "/") {
	const entries = await fs.readdir(baseDir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(baseDir, entry.name);
		if (entry.isDirectory()) {
			await registerRoutes(app, fullPath, path.join(prefix, entry.name));
			continue;
		}
		if (entry.name !== "index.ts" && entry.name !== "index.tsx") continue;
		const module = (await import(fullPath)) as Record<string, unknown>;
		const defaultFn = module.default;
		if (defaultFn && typeof defaultFn === "function") {
			app.all(prefix, async ({ request, query, params }) => {
				const result = await defaultFn({ request, query, params });
				if (isValidElement(result)) {
					return new Response(renderToString(result), {
						headers: { "Content-Type": "text/html; charset=utf-8" },
					});
				}
				return result;
			});
			console.log(`Registered ${fullPath} on ${prefix} route with method all`);
		}
		for (const propName in module) {
			const prop = module[propName];
			if (typeof prop !== "function") continue;
			const fn = prop as RouteFn;
			const name = fn.name.toLowerCase();
			if (!["get", "post", "put", "patch", "delete"].includes(name)) continue;
			app[name as "get"](prefix, async ({ request, query, params }) => {
				const result = await fn({ request, query, params });
				if (isValidElement(result)) {
					return new Response(renderToString(result), {
						headers: { "Content-Type": "text/html; charset=utf-8" },
					});
				}
				return result;
			});
			console.log(
				`Registered ${fullPath} on ${prefix} route with method ${name}`,
			);
		}
	}
}

type RouteFn = (
	_: RouteParams,
) => Promise<Response> | Response | Promise<string> | string;
