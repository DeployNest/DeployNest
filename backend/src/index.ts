import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { environment } from "src/modules/environment";
import fs from "fs";
import path from "path";

const app = new Hono();

// Function to recursively import routes
function importRoutes(folderPath, baseRoute = "") {
	const files = fs.readdirSync(folderPath);

	files.forEach((file) => {
		const filePath = path.join(folderPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			// Recursively import routes from subdirectories
			importRoutes(filePath, path.join(baseRoute, file));
		} else if (file.endsWith(".js")) {
			// Import and mount JavaScript files as routes
			const route = require(filePath);
			const routeName = file === "index.js" ? "" : path.parse(file).name;
			const fullRoute = path.join(baseRoute, routeName);
			app.route(fullRoute, route);
		}
	});
}

// Import all routes from the /api folder
const apiFolder = path.join(__dirname, "api");
importRoutes(apiFolder, "/api");

if (environment.get("ENVIRONMENT") == "development") {
	app.get("/", (c) => c.text("Hello from DeployNest dev environment!"));
}

serve({
	fetch: app.fetch,
	port: 3000,
});
