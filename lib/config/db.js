import { mongoose } from "mongoose"

export const ConnectDB = async () => {
    try {
        const dbUri = process.env.MONGODB_URI;  // Get URI from environment variable
        if (!dbUri) {
            throw new Error("MongoDB URI not found. Please check your environment variables.");
        }
        
        // Add connection options for better reliability
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        await mongoose.connect(dbUri, options);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        throw error; // Re-throw to handle it in the API route
    }
}