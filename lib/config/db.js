import { mongoose } from "mongoose"

export const ConnectDB = async () => {
    const dbUri = process.env.MONGODB_URI;  // Get URI from environment variable
    if (!dbUri) {
        console.error("MongoDB URI not found. Please check your .env.local file.");
        return;
    }
    await mongoose.connect(dbUri);
    console.log("DB Connected");
}