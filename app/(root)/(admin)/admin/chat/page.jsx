
'use client'

import React, { useState } from "react";
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
    unread: 2,
  },
  {
    id: 2,
    name: "Gaston Lapierre",
    message: "How are you today?",
    time: "10:20 AM",
    online: true,
    unread: 0,
  },
  {
    id: 3,
    name: "Fantina LeBatieler",
    message: "Reminder for tomorrow's meeting...",
    time: "11:03 AM",
    online: false,
    unread: 1,
  },
];

const ChatApp = () => {
  const [activeUser, setActiveUser] = useState(users[0]);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full h-full p-4">
      <div className="bg-white rounded-3xl shadow-xl flex h-[80vh] overflow-hidden border">

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ================= SIDEBAR ================= */}
        <div
          className={`
            bg-white border-r
            w-80 shrink-0
            flex flex-col
            transition-transform duration-300
            fixed lg:relative z-50 lg:z-auto
            h-full
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          {/* Sidebar Header */}
          <div className="p-5 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Messages</h2>
              <FiX
                className="cursor-pointer lg:hidden text-lg"
                onClick={() => setSidebarOpen(false)}
              />
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <FiSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setActiveUser(user);
                  setSidebarOpen(false);
                }}
                className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all ${
                  activeUser.id === user.id
                    ? "bg-orange-50 border-l-4 border-orange-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={`https://i.pravatar.cc/100?img=${user.id + 20}`}
                      className="w-11 h-11 rounded-full object-cover"
                      alt=""
                    />
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-sm">
                      {user.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate w-40">
                      {user.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">
                    {user.time}
                  </span>

                  {user.unread > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {user.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= MAIN CHAT ================= */}
        <div className="flex-1 flex flex-col bg-gray-50">

          {/* Chat Header */}
          <div className="p-5 border-b flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center gap-4">

              <FiMenu
                className="text-xl cursor-pointer lg:hidden"
                onClick={() => setSidebarOpen(true)}
              />

              <div className="relative">
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  className="w-11 h-11 rounded-full object-cover"
                  alt=""
                />
                {activeUser.online && (
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-base">
                  {activeUser.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeUser.online ? "Online" : "Last seen 2h ago"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 text-gray-600 text-lg">
              <FiVideo className="cursor-pointer hover:text-orange-500 transition" />
              <FiPhone className="cursor-pointer hover:text-orange-500 transition" />
              <FiUser className="cursor-pointer hover:text-orange-500 transition hidden sm:block" />
              <FiMoreVertical className="cursor-pointer hover:text-orange-500 transition" />
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="flex">
              <div className="bg-white px-5 py-3 rounded-2xl max-w-xs text-sm shadow-md">
                Hi, thanks for joining the meeting.
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-orange-500 text-white px-5 py-3 rounded-2xl max-w-xs text-sm shadow-md">
                Thanks for having me. I'm ready to discuss.
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-5 border-t flex items-center gap-4 bg-white">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-gray-50"
            />

            <FiPaperclip className="cursor-pointer text-gray-500 hover:text-orange-500 transition text-lg" />
            <FiVideo className="cursor-pointer text-gray-500 hover:text-orange-500 transition hidden sm:block text-lg" />

            <button className="bg-orange-500 p-3 rounded-xl text-white hover:bg-orange-600 transition shadow-md">
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
