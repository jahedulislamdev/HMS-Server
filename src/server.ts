import app from "./app";

// listen the port
async function main() {
    try {
        app.listen(5000, () => {
            console.log(`Server is running on http://localhost:${5000}`);
        });
    } catch (error) {
        console.log("An unexpacted error has been occurred!", error);
    }
}
main();
