import cors from "cors";
import { indexRoutes } from "./app/routes";
import express, { Application, Request, Response } from "express";
import { errorHandler } from "./app/shared/handleError";

const app: Application = express();
// cors
app.use(cors({}));

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// main route
app.use("/api/v1/", indexRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Hello! from helthcare management system (HMS)",
    });
});

// globalerror handler
app.use(errorHandler);

// not found route
app.use((req: Request, res: Response) => {
    res.status(404).send({
        success: false,
        message: "Route Not Found!",
        method: req.method,
        path: req.originalUrl,
        date: new Date().toISOString,
    });
});

export default app;
