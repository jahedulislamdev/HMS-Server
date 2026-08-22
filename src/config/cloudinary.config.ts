import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../app/helper/AppError";
import { StatusCodes } from "http-status-codes";

cloudinary.config({
    cloud_name: envVars.CLOUDINAEY.CLOUD_NAME,
    api_key: envVars.CLOUDINAEY.CLOUD_API_KEY,
    api_secret: envVars.CLOUDINAEY.CLOUD_API_SECRET,
});
export const uploadFileToCloudinary = ({
    buffer,
    fileName,
}: {
    buffer: Buffer;
    fileName: string;
}): Promise<UploadApiResponse> => {
    if (!buffer || !fileName) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "File Buffer and fileName are required",
        );
    }
    const fileExtention = fileName.split(".")?.pop()?.toLocaleLowerCase();
    const fileNameWithoutExtention = fileName
        .split(".")
        .slice(0, -1)
        .join(".")
        .toLocaleLowerCase()
        .replace(/\s+/g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, "");
    const uniqueName =
        Math.random().toString(36).substring(2) +
        "-" +
        Date.now() +
        "-" +
        fileNameWithoutExtention;
    const folder = fileExtention === "pdf" ? "pdfs" : "images";

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: "auto",
                    public_id: uniqueName,
                    folder: `HMS/${folder}`,
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err: any, res) => {
                    if (err) {
                        return reject(
                            new AppError(
                                StatusCodes.INTERNAL_SERVER_ERROR,
                                "Failed to upload file to cloudinary",
                            ),
                        );
                    }
                    resolve(res as UploadApiResponse);
                },
            )
            .end(buffer);
    });
};
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
