import path from "node:path";
import { Elysia } from "elysia";

let viewsPath = "";

export async function render(view: string, props: Record<string, unknown>) {
	if (viewsPath === "")
		throw new Error(
			"Views folder path not yet configured. Use `Htmv.setup` before rendering",
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

export type RouteParams = {};

type Setup = {
	routes: string;
	views: string;
	port: number;
};
export async function setup({ routes, views, port }: Setup) {
	viewsPath = views;
	const module = await import(path.join(routes, "index.ts"));
	const fn = module.default;
	new Elysia()
		.get("/", () => {
			return fn();
		})
		.listen(port);
	console.log(`HTMV running on port ${port}! 🎉`);
	console.log(`http://localhost:${port}`);
}
