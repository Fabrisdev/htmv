import { parse } from "./compiler/parser.js";
import { render } from "./compiler/renderer.js";
import { tokenize } from "./compiler/tokenizer.js";
import type { HttpResponse } from "./http/response.js";
import { viewRegistry } from "./views-registry.js";

export let viewsPath = "";

export function setViewsPath(path: string) {
	viewsPath = path;
}

export function view(
	view: string,
	props?: Record<string, unknown>,
): HttpResponse {
	if (viewsPath === "")
		throw new Error(
			"Views folder path not yet configured. Use `Htmv.setup` before rendering a view.",
		);
	const code = viewRegistry[view];
	if (code === undefined)
		throw new Error(`View ${view} not found. Did you use the correct name?`);

	const tokens = tokenize(code);
	const root = parse(tokens);
	const rendered = render(root, props ? props : {});
	return {
		status: 200,
		body: rendered,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	};
}
