"use client"
import { useState } from "react";
import React from "react";
import Todo from "@/Components/Todo";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useEffect } from "react";

export default function Home() {


  const [formData, setFormData] = useState({ //form data state
    title: "",
    description: "",
  })

  const [todoData, setTodoData] = useState([]); //todo data state

  const fetchTodos = async () => {
    const response = await axios.get('/api'); //fetch all todos from api, automatically uses get method
    setTodoData(response.data.todos) //set todo data to response data
  }

  const deleteTodo = async (mongoId) => {
    const response = await axios.delete('/api', {
      params: {
        mongoId: mongoId //pass mongoId as query parameter
      }
    })
    toast.success(response.data.msg); //show success message
    await fetchTodos();
  }

  const completeTodo = async (id) => {
    const response = await axios.put('/api', {}, {
      params: {
        mongoId: id
      }
    })
    toast.success(response.data.msg); //show success message
    fetchTodos();
  }

  useEffect(() => {
    fetchTodos();
  }, []) //executes only first time

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(form => ({...form, [name]: value})); //update form data using spread operator
    console.log(formData);
  }


  const onSubmitHandler = async (e) => {
    e.preventDefault(); //prevent page from refreshing
    try {
      // api code
      const response = await axios.post('/api', formData) //send form data to api
      toast.success(response.data.msg); //show success message
      setFormData({ //reset input box after clicking add todo
        title: "",
        description: "",
      })
      await fetchTodos(); //fetch todos again to show the new todo
    }
    catch (error){
      toast.error("Error")
    }
  }

  return (
    <div>
      <ToastContainer theme="dark" />
      <form onSubmit={onSubmitHandler} className="flex items-start flex-col gap-2 w-[80%] max-w-[600px] mt-24 px-2 mx-auto">
        <input value={formData.title} onChange={onChangeHandler} type="text" name="title" placeholder="Enter Title" className="px-3 py-2 border-2 w-full" />
        <textarea value={formData.description} onChange={onChangeHandler} name="description" placeholder="Enter Description" className="px-3 py-2 border-2 w-full" />
        <button type="submit" className="bg-orange-600 py-3 px-11 text-white">Add Todo</button>
      </form>



      <div className="relative overflow-x-auto mt-24 w-[60%] mx-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                ID
              </th>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>

            {todoData.map((item, index)=>  {
              return <Todo key={index} id={index} title={item.title} description={item.description} complete={item.isCompleted} mongoId={item._id} deleteTodo={deleteTodo} completeTodo={completeTodo} />
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}


