import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";

cloudinary.config({
    cloud_name: envVars.CLOUDINAEY.CLOUD_NAME,
    api_key: envVars.CLOUDINAEY.CLOUD_API_KEY,
    api_secret: envVars.CLOUDINAEY.CLOUD_API_SECRET,
});

export const cloudinaryUpload = cloudinary;
