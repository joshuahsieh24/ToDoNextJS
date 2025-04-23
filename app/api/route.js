import { NextResponse } from "next/server";
import { ConnectDB } from "@/lib/config/db";
import TodoModel from "@/lib/config/models/TodoModel";
import { adminAuth } from "@/lib/config/firebase-admin";

const LoadDB = async () => {
    await ConnectDB();
}

LoadDB();

// Helper function to verify token and get user ID
async function verifyToken(token) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

export async function GET(request) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const userId = await verifyToken(token);
        const todos = await TodoModel.find({ userId });
        return NextResponse.json({ todos });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export async function POST(request) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const userId = await verifyToken(token);
        const { title, description } = await request.json();

        await TodoModel.create({
            title,
            description,
            userId
        });

        return NextResponse.json({ msg: "Todo Created" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export async function DELETE(request) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const userId = await verifyToken(token);
        const mongoId = request.nextUrl.searchParams.get('mongoId');

        // Verify the todo belongs to the user
        const todo = await TodoModel.findOne({ _id: mongoId, userId });
        if (!todo) {
            return NextResponse.json({ error: 'Todo not found or unauthorized' }, { status: 404 });
        }

        await TodoModel.findByIdAndDelete(mongoId);
        return NextResponse.json({ msg: "Todo Deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export async function PUT(request) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const userId = await verifyToken(token);
        const mongoId = request.nextUrl.searchParams.get('mongoId');

        // Verify the todo belongs to the user
        const todo = await TodoModel.findOne({ _id: mongoId, userId });
        if (!todo) {
            return NextResponse.json({ error: 'Todo not found or unauthorized' }, { status: 404 });
        }

        await TodoModel.findByIdAndUpdate(mongoId, {
            $set: {
                isCompleted: true
            }
        });

        return NextResponse.json({ msg: "Todo Completed" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
