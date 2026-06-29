const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}`, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        })
        console.log(`MongoDB connected: ${connection.connection.host}`)

        mongoose.connection.on("error", (err) => {
            console.log(`Mongo error:${err}`)
        })

        mongoose.connection.on("disconnected", () => {
            console.log("db disconnected")
        })
    } catch (error) {
        console.log(`Error:${error}`)
        process.exit(1)
    }
}

module.exports = connectDb;