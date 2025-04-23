"use client"
import { useState, useEffect } from "react";
import React from "react";
import Todo from "@/Components/Todo";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { auth } from "@/lib/config/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Main component for the Todo application
export default function Home() {
  // State for managing todo form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // State for storing the list of todos
  const [todoData, setTodoData] = useState([]);
  
  // State for managing the current authenticated user
  const [user, setUser] = useState(null);
  
  // State for managing authentication form data
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  
  // State to toggle between login and signup forms
  const [isLogin, setIsLogin] = useState(true);
  
  // State for storing authentication error messages
  const [authError, setAuthError] = useState("");

  // Effect hook to handle authentication state changes
  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchTodos(); // Fetch todos when user is authenticated
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Function to fetch todos from the API
  const fetchTodos = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get('/api', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodoData(response.data.todos);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error fetching todos');
    }
  };

  // Function to delete a todo
  const deleteTodo = async (mongoId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.delete('/api', {
        params: { mongoId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      await fetchTodos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error deleting todo');
    }
  };

  // Function to mark a todo as complete
  const completeTodo = async (id) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.put('/api', {}, {
        params: { mongoId: id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      fetchTodos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error completing todo');
    }
  };

  // Handler for todo form input changes
  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(form => ({...form, [name]: value}));
  };

  // Handler for authentication form input changes
  const onAuthChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setAuthForm(form => ({...form, [name]: value}));
  };

  // Handler for todo form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post('/api', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      setFormData({
        title: "",
        description: "",
      });
      await fetchTodos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creating todo');
    }
  };

  // Handler for authentication (login/signup)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(""); // Clear any previous errors
    try {
      if (isLogin) {
        // Handle login
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        // Handle signup
        const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        if (authForm.displayName) {
          // Update user profile with display name if provided
          await updateProfile(userCredential.user, {
            displayName: authForm.displayName
          });
        }
      }
      setAuthForm({ email: "", password: "", displayName: "" });
    } catch (error) {
      // Handle different authentication errors
      let errorMessage = "An error occurred during authentication";
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/email-already-in-use":
          errorMessage = "This email is already in use";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters";
          break;
        default:
          errorMessage = error.message;
      }
      setAuthError(errorMessage);
    }
  };

  // Render login/signup form if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleAuth} className="space-y-6">
            {/* Display name input for signup only */}
            {!isLogin && (
              <div>
                <input
                  type="text"
                  name="displayName"
                  value={authForm.displayName}
                  onChange={onAuthChangeHandler}
                  placeholder="Display Name"
                  className="w-full px-3 py-2 border rounded"
                  required={!isLogin}
                />
              </div>
            )}
            {/* Email input */}
            <div>
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={onAuthChangeHandler}
                placeholder="Email"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            {/* Password input */}
            <div>
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={onAuthChangeHandler}
                placeholder="Password"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            {/* Submit button */}
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            {/* Display authentication errors */}
            {authError && (
              <p className="text-red-500 text-center">{authError}</p>
            )}
          </form>
          {/* Toggle between login and signup */}
          <p className="text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError(""); // Clear error when switching forms
              }}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Render todo application if user is authenticated
  return (
    <div>
      <ToastContainer theme="dark" />
      {/* Todo creation form */}
      <form onSubmit={onSubmitHandler} className="flex items-start flex-col gap-2 w-[80%] max-w-[600px] mt-24 px-2 mx-auto">
        <input
          value={formData.title}
          onChange={onChangeHandler}
          type="text"
          name="title"
          placeholder="Enter Title"
          className="px-3 py-2 border-2 w-full"
        />
        <textarea
          value={formData.description}
          onChange={onChangeHandler}
          name="description"
          placeholder="Enter Description"
          className="px-3 py-2 border-2 w-full"
        />
        <button type="submit" className="bg-orange-600 py-3 px-11 text-white">
          Add Todo
        </button>
      </form>

      {/* Todo list table */}
      <div className="relative overflow-x-auto mt-24 w-[60%] mx-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Description</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Render each todo item */}
            {todoData.map((item, index) => (
              <Todo
                key={index}
                id={index}
                title={item.title}
                description={item.description}
                complete={item.isCompleted}
                mongoId={item._id}
                deleteTodo={deleteTodo}
                completeTodo={completeTodo}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


