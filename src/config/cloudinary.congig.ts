import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";
import AppError from "../app/helper/AppError";
import { StatusCodes } from "http-status-codes";

cloudinary.config({
    cloud_name: envVars.CLOUDINAEY.CLOUD_NAME,
    api_key: envVars.CLOUDINAEY.CLOUD_API_KEY,
    api_secret: envVars.CLOUDINAEY.CLOUD_API_SECRET,
});
export const deleteFileFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
        const match = url.match(regex);
        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
            });
            console.info(`File ${publicId} deleted form cloudinary`);
        }
    } catch (err) {
        console.error({
            message: "Failed to delete file from cloudinary",
            errorDetails: err,
        });
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to delete file from cloudinary",
        );
    }
};
export const cloudinaryUpload = cloudinary;
