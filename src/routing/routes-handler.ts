import type { Elysia } from "elysia";
import { resolveResponse } from "../http/response.js";
import type { Method, RouteFn } from "./types.js";

type RegisterRouteParams = {
	app: Elysia;
	method: Method;
	path: string;
	fn: RouteFn;
};

export function registerRoute({ app, method, path, fn }: RegisterRouteParams) {
	let servePath = path;
	if (servePath.includes("[")) {
		// Handle dynamic route parameters.
		// E.g. /user/[id] -> /user/:id
		// Folders in Windows cannot contain ":" so we use "[" and "]" instead.
		servePath = servePath.replaceAll("[", ":").replaceAll("]", "");
	}
	app[method as "get"](servePath, async ({ request, query, params }) => {
		const result = await fn({ request, query, params });
		return resolveResponse(result);
	});
}
