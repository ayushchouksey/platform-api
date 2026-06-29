const app = require("./src/app");
const dotenv = require("dotenv");
const connectDb = require("./src/config/databse");

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`server running on port ${PORT}`);
        })
    }
    catch (err) {
        console.log(`Error:${err}`);
        process.exit(1);
    }
}

startServer();
