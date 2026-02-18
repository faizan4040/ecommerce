'use client'

import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiSend,
  FiPaperclip,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

const users = [
  {
    id: 1,
    name: "Gilbert Chicoine",
    message: "typing...",
    time: "now",
    online: true,
  },
  {
    id: 2,
    name: "Gaston Lapierre",
    message: "How are you today?",
    time: "10:20 AM",
    online: true,
  },
  {
    id: 3,
    name: "Fantina LeBatieler",
    message: "Reminder for tomorrow's meeting...",
    time: "11:03 AM",
    online: false,
  },
];

const ChatApp = () => {
  const [activeUser, setActiveUser] = useState(users[0]);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Auto close sidebar on resize (desktop view)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-100px)] p-3 sm:p-4">
      <div className="h-full w-full bg-white rounded-xl shadow-lg flex overflow-hidden relative">

        {/* ===== Overlay for Mobile ===== */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ================= SIDEBAR ================= */}
        <div
          className={`
            fixed lg:relative z-50 lg:z-auto
            h-full w-72 sm:w-80 lg:w-1/3
            bg-gray-50 border-r
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Chat</h2>
              <FiX
                className="cursor-pointer lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            </div>

            {/* Search */}
            <div className="mt-3 relative">
              <FiSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
            </div>
          </div>

          {/* User List */}
          <div className="overflow-y-auto h-[calc(100%-110px)]">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setActiveUser(user);
                  setSidebarOpen(false); // auto close on mobile
                }}
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 ${
                  activeUser.id === user.id ? "bg-gray-200" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={`https://i.pravatar.cc/100?img=${user.id + 20}`}
                      className="w-9 h-9 rounded-full"
                      alt=""
                    />
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{user.name}</h4>
                    <p className="text-xs text-gray-500">{user.message}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{user.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= MAIN CHAT ================= */}
        <div className="flex-1 flex flex-col h-full">

          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">

              {/* Toggle Button (Visible on Mobile) */}
              <FiMenu
                className="text-xl cursor-pointer lg:hidden"
                onClick={() => setSidebarOpen(true)}
              />

              <div className="relative">
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  className="w-10 h-10 rounded-full"
                  alt=""
                />
                {activeUser.online && (
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-base">
                  {activeUser.name}
                </h3>
                <p className="text-xs text-green-500">
                  {activeUser.message === "typing..."
                    ? "Typing..."
                    : activeUser.online
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-600">
              <FiVideo className="cursor-pointer hover:text-orange-500" />
              <FiPhone className="cursor-pointer hover:text-orange-500" />
              <FiUser className="cursor-pointer hover:text-orange-500 hidden sm:block" />
              <FiMoreVertical className="cursor-pointer hover:text-orange-500" />
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            <div className="flex">
              <div className="bg-gray-200 px-3 py-2 rounded-xl max-w-[75%] text-sm">
                Hi, thanks for joining the meeting.
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-orange-500 text-white px-3 py-2 rounded-xl max-w-[75%] text-sm">
                Thanks for having me. I'm ready to discuss.
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-3 border-t flex items-center gap-3 bg-white">
            <input
              type="text"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            />

            <FiPaperclip className="cursor-pointer text-gray-500 hover:text-orange-500" />
            <FiVideo className="cursor-pointer text-gray-500 hover:text-orange-500 hidden sm:block" />

            <button className="bg-orange-500 p-2 rounded-lg text-white hover:bg-orange-600 transition">
              <FiSend />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatApp;
