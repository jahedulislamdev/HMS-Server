import app from "./app";
import { envVars } from "./config/env";

// listen the port
async function main() {
    try {
        app.listen(envVars.PORT, () => {
            console.log(
                `Server is running on http://localhost:${envVars.PORT}`,
            );
        });
    } catch (error) {
        console.log("An unexpacted error has been occurred!", error);
    }
}
main();
