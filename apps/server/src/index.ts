import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { authMiddleware } from "./middleware/auth";
import { corsMiddleware } from "./middleware/cors";
import { logging } from "./middleware/logging";
import { acquisitionRouter } from "./routes/acquisition";
import { authRouter } from "./routes/auth";
import { managementRouter } from "./routes/management";
import { errorHandler, handle404 } from "./storage/error";
import type { Env } from "./types/env";

// Create Hono app
const app = new OpenAPIHono<Env>();

// Global middleware
app.use("*", logging());
app.use("*", prettyJSON());
app.use("*", secureHeaders());
app.use("*", (c, next) => corsMiddleware(c)(c, next));

// Mount routers
app.route("/auth", authRouter);
app.route("/acquisition", acquisitionRouter);
app.route("/management", managementRouter);

// Global error handling
app.notFound(handle404);
app.onError(errorHandler);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

app.doc("/docs", {
  openapi: "3.0.0",
  info: {
    title: "CodePush API",
    version: "1.0.0",
  },
});

export default app;
