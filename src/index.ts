import { createApp } from "./app.js";
import { registerRoutes } from "./routing/routing.js";
import type { Paths } from "./types.js";
import { setViewsPath } from "./views.js";
import { registerViews } from "./views-registry.js";

export type { RouteParams } from "./types.js";
export { view } from "./views.js";

export async function setup(paths: Paths) {
	setViewsPath(paths.views);
	await registerViews();
	const app = createApp(paths.public);
	await registerRoutes(app, paths.routes);
	app.compile();
	app.listen(paths.port);
	console.log("");
	console.log(`HTMV running on port ${paths.port}! 🎉`);
	console.log(`http://localhost:${paths.port}`);
}
