const { default: mongoose } = require("mongoose"); // Import mongoose for schema creation

// Define the schema structure for Todo items
const Schema = new mongoose.Schema({
    title: {
        type: String,        // Title will be stored as a string
        required: true       // Title is mandatory for each todo
    },
    description:
    {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
},{
    timeStamp: true
});

const TodoModel = mongoose.models.todo || mongoose.model('todo', Schema);

export default TodoModel;