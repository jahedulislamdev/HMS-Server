import cors from "cors";
import { indexRoutes } from "./app/routes";
import express, { Application, Request, Response } from "express";
import { errorHandler } from "./app/middleware/globalErrorhandler";
import notFoundHandler from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "node:path";
import { envVars } from "./config/env";

const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));
app.use("/api/auth", toNodeHandler(auth));

//* cors check
app.use(
    cors({
        origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "authorization"],
    }),
);
app.use(cookieParser());

//* Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

//* Middleware to parse JSON bodies
app.use(express.json());

//* main root route
app.use("/api/v1/", indexRoutes);

//* Basic route for test application
app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Hello! from helthcare management system (HMS)",
    });
});
//* Global Error and Route Not Found handler
app.use(errorHandler);
app.use(notFoundHandler);
export default app;
