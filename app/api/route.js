import { NextResponse } from "next/server";
import { ConnectDB } from "@/lib/config/db";
import TodoModel from "@/lib/config/models/TodoModel";
import { adminAuth } from "@/lib/config/firebase-admin";

// Connect to MongoDB when the API starts
const LoadDB = async () => {
    await ConnectDB();
}

LoadDB();

// Check if the user is logged in by verifying their Firebase login token
// A token is like a temporary pass that Firebase gives users when they log in
async function verifyToken(token) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Get all todos for a logged-in user
export async function GET(request) {
    try {
        // Get the user's login token from the request
        // The token comes in the format: "Bearer eyJhbGciOiJSUzI1..."
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
        }

        // Check if the login token is valid
        const userId = await verifyToken(token);

        // Get all todos that belong to this user
        const todos = await TodoModel.find({ userId });
        return NextResponse.json({ todos });

    } catch (error) {
        if (error.message === 'Invalid token') {
            return NextResponse.json({ error: "Your login has expired. Please log in again" }, { status: 401 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

// Create a new todo for a logged-in user
export async function POST(request) {
    try {
        // Get the user's login token from the request
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
        }

        // Check if the login token is valid
        const userId = await verifyToken(token);

        // Get the todo details from the request
        const { title, description } = await request.json();

        // Make sure title and description are provided
        if (!title || !description) {
            return NextResponse.json({ error: "Please provide both title and description" }, { status: 400 });
        }

        // Save the new todo to the database
        const newTodo = await TodoModel.create({
            title,
            description,
            userId,
            isCompleted: false
        });

        return NextResponse.json({
            msg: "Todo created successfully",
            todo: newTodo
        }, { status: 201 });

    } catch (error) {
        if (error.message === 'Invalid token') {
            return NextResponse.json({ error: "Your login has expired. Please log in again" }, { status: 401 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

// Delete a todo
export async function DELETE(request) {
    try {
        // Get the user's login token from the request
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
        }

        // Check if the login token is valid
        const userId = await verifyToken(token);

        // Get the ID of the todo to delete
        const searchParams = request.nextUrl.searchParams;
        const mongoId = searchParams.get('mongoId');

        if (!mongoId) {
            return NextResponse.json({ error: "Please specify which todo to delete" }, { status: 400 });
        }

        // Delete the todo if it belongs to this user
        const deletedTodo = await TodoModel.findOneAndDelete({
            _id: mongoId,
            userId
        });

        if (!deletedTodo) {
            return NextResponse.json({ error: "Todo not found or belongs to another user" }, { status: 404 });
        }

        return NextResponse.json({
            msg: "Todo deleted successfully",
            todo: deletedTodo
        });

    } catch (error) {
        if (error.message === 'Invalid token') {
            return NextResponse.json({ error: "Your login has expired. Please log in again" }, { status: 401 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

// Mark a todo as complete/incomplete
export async function PUT(request) {
    try {
        // Get the user's login token from the request
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
        }

        // Check if the login token is valid
        const userId = await verifyToken(token);

        // Get the ID of the todo to update
        const searchParams = request.nextUrl.searchParams;
        const mongoId = searchParams.get('mongoId');

        if (!mongoId) {
            return NextResponse.json({ error: "Please specify which todo to update" }, { status: 400 });
        }

        // Find the todo if it belongs to this user
        const todo = await TodoModel.findOne({
            _id: mongoId,
            userId
        });

        if (!todo) {
            return NextResponse.json({ error: "Todo not found or belongs to another user" }, { status: 404 });
        }

        // Switch the todo between complete and incomplete
        todo.isCompleted = !todo.isCompleted;
        await todo.save();

        return NextResponse.json({
            msg: "Todo updated successfully",
            todo
        });

    } catch (error) {
        if (error.message === 'Invalid token') {
            return NextResponse.json({ error: "Your login has expired. Please log in again" }, { status: 401 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
