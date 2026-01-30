import type { Node, RootNode } from "./renderer.js";
import type { Token } from "./tokenizer.js";

export function parse(tokens: Token[]) {
	let i = 0;

	const root: RootNode = {
		type: "root",
		children: parseChildren(),
	};

	return root;

	function parseChildren(untilTag?: string): Node[] {
		const nodes: Node[] = [];
		while (i < tokens.length) {
			const token = tokens[i];
			if (
				untilTag &&
				token?.type === "close" &&
				token.tag.toLocaleLowerCase() === untilTag
			) {
				i++;
				break;
			}
			if (token?.type === "text") {
				nodes.push({
					type: "text",
					text: token.text,
				});
				i++;
				continue;
			}
			if (token?.type === "interpolation") {
				nodes.push({
					type: "interpolation",
					value: token.value,
				});
				i++;
				continue;
			}
			if (token?.type === "open") {
				const tag = token.tag.toLowerCase();
				i++;
				if (tag === "for") {
					const itemNameToken = tokens[i];
					if (itemNameToken?.type !== "arguments")
						throw new Error("Missing item name in for");
					const itemName = itemNameToken.value;
					i++;
					const inToken = tokens[i];
					if (inToken?.type !== "arguments" || inToken.value !== "in")
						throw new Error("Expected reserved word in");
					i++;
					const listNameToken = tokens[i];
					if (listNameToken?.type !== "arguments")
						throw new Error("Expected list name in for");
					const listName = listNameToken.value;
					i++;

					const children = parseChildren(tag);
					nodes.push({
						type: "for",
						children,
						itemName,
						listName,
					});
					continue;
				}
				if (tag === "isset") {
					const nextToken = tokens[i]; //should be arguments token
					i++;
					if (nextToken?.type !== "arguments")
						throw new Error("Missing arguments in isset");
					const itemName = nextToken.value;
					if (itemName === undefined) throw new Error("Expected item name");
					const children = parseChildren(tag);
					nodes.push({
						type: "isset",
						children,
						itemName,
					});
					continue;
				}
				const pathName = token.tag.split("/").at(-1);
				if (pathName !== undefined && startsWithUppercase(pathName)) {
					// component
					const rawArgs: string[] = [];
					let nextToken = tokens[i];
					while (nextToken?.type === "arguments") {
						rawArgs.push(nextToken.value);
						i++;
						nextToken = tokens[i];
					}
					if (rawArgs.at(-1) === "/") {
						// is self closing
						nodes.push({
							type: "component",
							path: token.tag,
							props: rawArgsToProps(rawArgs.slice(0, -1)),
							children: [],
						});
						continue;
					}
					nodes.push({
						type: "component",
						path: token.tag,
						props: rawArgsToProps(rawArgs),
						children: parseChildren(tag),
					});
					continue;
				}
				nodes.push({
					type: "text",
					text: `<${tag} `,
				});
				let nextToken = tokens[i];
				let isFirstAttribute = true;
				while (
					nextToken?.type === "arguments" ||
					nextToken?.type === "attr-binding"
				) {
					if (!isFirstAttribute) {
						nodes.push({
							type: "text",
							text: " ",
						});
					}
					isFirstAttribute = false;
					if (nextToken.type === "arguments") {
						parseArgs(nextToken.value);
						i++;
						nextToken = tokens[i];
						continue;
					}
					nodes.push({
						type: "attr-binding",
						name: nextToken.name,
						expr: nextToken.expression,
					});
					i++;
					nextToken = tokens[i];
				}
				nodes.push({
					type: "text",
					text: `>`,
				});
				continue;
			}
			if (token?.type === "close") {
				if (token.tag === "for" || token.tag === "isset") continue;
				const tag = token.tag;
				nodes.push({
					type: "text",
					text: `</${tag}>`,
				});
				i++;
			}
		}
		return nodes;

		function parseArgs(args: string) {
			let textBuffer = "";
			for (let i = 0; i < args.length; i++) {
				const letter = args[i];
				if (letter === "{") {
					pushBuffer();
					clearBuffer();
					continue;
				}
				if (letter === "}") {
					nodes.push({
						type: "interpolation",
						value: textBuffer,
					});
					clearBuffer();
					continue;
				}
				textBuffer += letter;
			}
			pushBuffer();

			function clearBuffer() {
				textBuffer = "";
			}
			function pushBuffer() {
				if (textBuffer.length > 0) {
					nodes.push({
						type: "text",
						text: textBuffer,
					});
				}
			}
		}
	}
}

function startsWithUppercase(text: string) {
	if (text[0] === undefined) return false;
	return /[A-Z]/.test(text[0]);
}

function rawArgsToProps(rawArgs: string[]) {
	const props: Record<string, unknown> = {};

	for (const arg of rawArgs) {
		if (arg === "/") continue;
		const eqIndex = arg.indexOf("=");

		if (eqIndex === -1) {
			// boolean prop
			props[arg] = true;
			continue;
		}

		const key = arg.slice(0, eqIndex);
		let value = arg.slice(eqIndex + 1);

		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		props[key] = value;
	}

	return props;
}
