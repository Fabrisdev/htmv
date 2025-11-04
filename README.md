# HTMV
Welcome to HTMV. A simple yet fast web framework currently in work in progress. Installation and usage guide can be found below.

# Precautions
HTMV was made to be used with [Bun](https://bun.com/). It has not been tested and is not guaranted to work on Node.js. Please ensure you have Bun installed before continuing reading.

# Installation
## Linking the library
It's not yet uploaded on NPM so you'll have to link it yourself to your project.
1. Get the repo
```bash
$ git clone https://github.com/Fabrisdev/htmv.git
```
2. cd into it
```bash
$ cd htmv
```
3. Add it to your local registry of packages
```bash
$ bun link
```
Setup of the library is finished! 🎉 Now onto creating your first **HTMV** project!
## Creating your first project
1. Leave that folder and create a new folder for your project
```bash
$ cd .. # or cd into wherever you'd like to make your project's folder
$ mkdir my-first-htmv-project
```
2. Create an empty bun project and add HTMV as a dependency
```bash
bun init # when prompted for the type, choose EMPTY
bun link htmv # Adds HTMV dependency
```
3. Create two folders. One for routes and the other for views (You can choose any name)
4. Now in the `index.ts` add this
```ts
import path from "node:path";
import { setup } from "htmv";

const dirPath = import.meta.dir;
setup({
	routes: path.join(dirPath, "routes"), // Change to your routes folder name
	views: path.join(dirPath, "views"), // Change to your views folder name
	port: 3000,
});
```
5. Let's create your first view! Inside the views folder add a new `example.html` with the contents
```html
<h1>Welcome to my blog!</h1>
<p>{description}</p>
```
6. Finally, let's create a route for it. HTMV has file based routing. Every folder inside your `routes` folder indicates a nested route and every `index.ts` is it's entry point. For now, let's keep it simple with just one `index.ts` in it. Create the file and add the next contents
```ts
import { type RouteParams, render } from "htmv";

export default async function MyRoute(_params: RouteParams) {
	return await render("example", {
		description: "This is my first time using HTMV ❤️",
	});
}
```

## And that's it! We're done. 
Now let's try it! You can simply start it with `bun run index.ts`. After that, you should now be able to see your page in `http://localhost:3000`.

## Final note
Did you see how the `{description}` value on our view changed to the one we gave it on our route? Now that's where HTMV gets fun! Just as we now did you could also do more complex stuff like access your DB's data and show it in a nicely form.

## Recommendations
Creating a run script is advised. You can easily add it to your `package.json` like this
```json
{
  //...
  "scripts": {
    "dev": "bun run index.ts"
  }
  //...
}
```
Now you can start your server by running `bun dev`.