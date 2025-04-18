import { mongoose } from "mongoose"

export const ConnectDB = async () => {
    await mongoose.connect('mongodb+srv://greatstack:Paperpensbooks1*@cluster0.2jpbpap.mongodb.net/todo-app');
    console.log("DB Connected");
}