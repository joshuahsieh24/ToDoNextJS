"use client"
import React, { useState } from "react";
import { auth } from "@/lib/config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut, updateProfile } from "firebase/auth";
import { toast } from 'react-toastify';

const Navbar = () => {
    const [user] = useAuthState(auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState("");

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleUpdateDisplayName = async () => {
        if (!newDisplayName.trim()) {
            toast.error("Display name cannot be empty");
            return;
        }

        try {
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName
            });
            toast.success("Display name updated successfully");
            setNewDisplayName("");
            setIsDropdownOpen(false);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className='flex py-3 flex-wrap justify-around items-center'>
            <h1 className='text-lg font-semibold'>Todo APP</h1>
            <ul className="flex gap-[40px] text-m items-center">
                <li className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="hover:text-blue-600"
                    >
                        {user ? `Hello, ${user.displayName || user.email?.split('@')[0]}` : 'Profile'}
                    </button>
                    {isDropdownOpen && user && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                            <div className="px-4 py-2">
                                <input
                                    type="text"
                                    value={newDisplayName}
                                    onChange={(e) => setNewDisplayName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleUpdateDisplayName();
                                        }
                                    }}
                                    placeholder="New display name"
                                    className="w-full px-2 py-1 border rounded"
                                />
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