import type { Method } from "./types.js";

export function isMethod(value: string): value is Method {
	return ["get", "post", "put", "patch", "delete", "all"].includes(value);
}
