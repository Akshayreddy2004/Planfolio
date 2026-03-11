require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("SUCCESS");
        mongoose.disconnect();
    } catch (e) {
        console.log("ERROR_MESSAGE:", e.message);
        console.log("ERROR_CODE:", e.code);
    }
}
test();
