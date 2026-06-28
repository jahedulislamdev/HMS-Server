import cors from "cors";
import { indexRoutes } from "./app/routes";
import express, { Application, Request, Response } from "express";
import { errorHandler } from "./app/middleware/globalErrorhandler";
import notFoundHandler from "./app/middleware/notFound";

const app: Application = express();
//* cors check
app.use(cors({}));

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
