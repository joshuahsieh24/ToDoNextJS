import React from "react";

const Todo = ({id, title, description, mongoId, complete, deleteTodo, completeTodo}) => { //data structure as props, for line 9, if completed, then add line through to the todo
    return (
        <tr className="bg-white border-b border-gray-100">
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {id+1}
            </th>
            <td className={`px-6 py-4 ${complete?"line-through":""}`}>   {/*if completed, then add line through to the todo*/}
                {title} 
            </td>
            <td className={`px-6 py-4 ${complete?"line-through":""}`}>
                {description}
            </td>
            <td className="px-6 py-4">
                {complete?"Completed":"Pending"} 
                
            </td>
            <td className="px-6 py-4 flex gap-1">
                <button onClick={()=>deleteTodo(mongoId)} className='py-2 px-4 bg-red-500 text-white'>Delete</button>
                {complete?"":<button onClick={()=>completeTodo(mongoId)}className='py-2 px-4 bg-green-500 text-white'>Done</button>} {/*if completed, then don't show the done button*/}
            </td>
        </tr>
    );
};

export default Todo;