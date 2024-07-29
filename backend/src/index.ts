require("module-alias/register")

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { trimTrailingSlash } from 'hono/trailing-slash';
import { logger } from 'hono/logger';

import { environment } from "modules/environment";
import fs from "fs";
import path from "path";

const app = new Hono();
app.use(trimTrailingSlash());

if (environment.get("ENVIRONMENT") == "development") {
	app.use(logger());
}

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
			const requiredRoutes = require(filePath);
			const { routes } = requiredRoutes

			const routeName = file === "index.js" ? "" : path.parse(file).name;
			const fullRoute = path.join(baseRoute, routeName);
			app.route(fullRoute, routes);
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
