import { NextResponse } from "next/server";
import { ConnectDB } from "@/lib/config/db";
import TodoModel from "@/lib/config/models/TodoModel";


const LoadDB = async () => {
    await ConnectDB();
}

LoadDB();

export async function GET(request) {

    const todos = await TodoModel.find({}) //all todos will be stored in this todos array
    return NextResponse.json({todos:todos}) //in todos properties we are sending the todos array

}

export async function POST(request) {
    //sends title and description as request 

    const {title, description} = await request.json();

    await TodoModel.create({
        title,
        description
    })

    return NextResponse.json({msg: "Todo Created"})
}

export async function DELETE(request) {
    
    const mongoId = await request.nextUrl.searchParams.get('mongoId');

    await TodoModel.findByIdAndDelete(mongoId);

    return NextResponse.json({msg: "Todo Deleted"}) //delete the todo with the given mongoId
}

export async function PUT(request) {
    
    const mongoId = await request.nextUrl.searchParams.get('mongoId');

    await TodoModel.findByIdAndUpdate(mongoId, {
        $set: {
            isCompleted: true
        }
    });

    return NextResponse.json({msg: "Todo Completed"}) //delete the todo with the given mongoId
}
