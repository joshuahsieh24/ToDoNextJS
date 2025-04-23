"use client"
// Required for client-side functionality in Next.js 13+

import React, { useState } from "react";
import { auth } from "@/lib/config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut, updateProfile } from "firebase/auth";
import { toast } from 'react-toastify';

const Navbar = () => {
    // Use Firebase hook to get current user state
    const [user] = useAuthState(auth);
    // State to control the visibility of the profile dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // State to store the new display name input value
    const [newDisplayName, setNewDisplayName] = useState("");

    // Handler for signing out the user
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Handler for updating the user's display name
    const handleUpdateDisplayName = async () => {
        // Validate that the new display name is not empty
        if (!newDisplayName.trim()) {
            toast.error("Display name cannot be empty");
            return;
        }

        try {
            // Update the user's profile with the new display name
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName
            });
            toast.success("Display name updated successfully");
            // Reset the input field and close the dropdown
            setNewDisplayName("");
            setIsDropdownOpen(false);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        // Main navbar container with flexbox layout
        <div className='flex py-3 flex-wrap justify-around items-center'>
            {/* App title */}
            <h1 className='text-lg font-semibold'>Todo APP</h1>
            
            {/* Navigation items container */}
            <ul className="flex gap-[40px] text-m items-center">
                {/* Profile dropdown container */}
                <li className="relative">
                    {/* Profile button that toggles the dropdown */}
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="hover:text-blue-600"
                    >
                        {/* Display user's name or email if logged in, otherwise show 'Profile' */}
                        {user ? `Hello, ${user.displayName || user.email?.split('@')[0]}` : 'Profile'}
                    </button>

                    {/* Dropdown menu - only shown when isDropdownOpen is true and user is logged in */}
                    {isDropdownOpen && user && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                            <div className="px-4 py-2">
                                {/* Input field for new display name */}
                                <input
                                    type="text"
                                    value={newDisplayName}
                                    onChange={(e) => setNewDisplayName(e.target.value)}
                                    // Allow submitting with Enter key
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleUpdateDisplayName();
                                        }
                                    }}
                                    placeholder="New display name"
                                    className="w-full px-2 py-1 border rounded"
                                />
                                {/* Update display name button */}
                                <button
                                    onClick={handleUpdateDisplayName}
                                    className="mt-2 w-full px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Update Name
                                </button>
                            </div>
                        </div>
                    )}
                </li>

                {/* Sign out button - only shown when user is logged in */}
                {user && (
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                    >
                        Sign Out
                    </button>
                )}
            </ul>
        </div>
    )
}

export default Navbar;