const mongoose = require("mongoose");

const URI = process.env.MONGO_URI;

async function connect() {
    try {
        await mongoose.connect(URI, {
            dbName: "SavageAI",
        })
    
        console.log("Connected to mongo");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connect;

