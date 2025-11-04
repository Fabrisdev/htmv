import { render } from ".";

export default async function TestPage() {
	return await render("example", {
		title: "My page",
		description: "Blablabla",
	});
}
