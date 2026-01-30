import { view } from "../views.js";

export type Node =
	| RootNode
	| TextNode
	| InterpolationNode
	| IssetNode
	| ForNode
	| AttributeBindingNode
	| ComponentNode;

export interface ComponentNode {
	type: "component";
	path: string;
	props: Record<string, unknown>;
	children: Node[];
}

export interface RootNode {
	type: "root";
	children: Node[];
}

interface TextNode {
	type: "text";
	text: string;
}

interface InterpolationNode {
	type: "interpolation";
	value: string;
}

interface IssetNode {
	type: "isset";
	itemName: string;
	children: Node[];
}

interface ForNode {
	type: "for";
	listName: string;
	itemName: string;
	children: Node[];
}

interface AttributeBindingNode {
	type: "attr-binding";
	name: string;
	expr: string;
}

export function render(node: Node, context: Record<string, unknown>): string {
	if (node.type === "attr-binding") {
		const prop = resolvePropertyPath(node.expr);
		const exists = isset(prop);
		return exists ? node.name : "";
	}

	if (node.type === "text") {
		return node.text;
	}
	if (node.type === "for") {
		const list = context[node.listName];
		if (Array.isArray(list)) {
			const output = list.map((item) => {
				return node.children
					.map((childrenNode) =>
						render(childrenNode, { ...context, [node.itemName]: item }),
					)
					.join("");
			});
			return output.join("");
		}
		throw new Error("La lista pasada no es un array");
	}
	if (node.type === "interpolation") {
		return String(resolvePropertyPath(node.value));
	}
	if (node.type === "isset") {
		const isNegated = node.itemName.startsWith("!");
		const propName = isNegated ? node.itemName.slice(1) : node.itemName;
		const prop = resolvePropertyPath(propName);
		const exists = isset(prop);
		if (isNegated ? !exists : exists) {
			return node.children.map((node) => render(node, context)).join("");
		}
		return "";
	}
	if (node.type === "component") {
		const renderedView = view(node.path, {
			...node.props,
			children: node.children.map((node) => render(node, context)).join(""),
			...context,
		}).body;
		return renderedView ?? "";
	}
	const output = node.children.map((node) => render(node, context));
	return output.join("");

	function resolvePropertyPath(path: string) {
		const [variable, ...properties] = path.split(".");
		if (variable === undefined)
			throw new Error("Missing variable name on interpolation");
		let result = context[variable];
		for (const property of properties) {
			if (typeof result !== "object" || result === null)
				throw new Error("Property access attempt on non-object.");
			result = (result as Record<string, unknown>)[property];
		}
		return result;
	}
}

function isset(prop: unknown) {
	if (Array.isArray(prop)) {
		return prop.length > 0;
	}

	return prop !== undefined && prop !== null && prop !== false;
}
