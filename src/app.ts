import { node } from "@elysiajs/node";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

export function createApp(publicPath: string) {
	const app = new Elysia({ adapter: node() }).use(
		staticPlugin({
			assets: publicPath,
		}),
	);
	app.all("/health", () => "OK");
	return app;
}
