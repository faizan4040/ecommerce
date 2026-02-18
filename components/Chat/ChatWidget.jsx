'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Paperclip } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChat } from './ChatProvider'

export default function ChatWidget() {
  const { open, setOpen } = useChat()

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "👋 Hi! I'm Bruce. How can I help you today?"
    }
  ])

  const messagesEndRef = useRef(null)

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!message.trim()) return

    const userMsg = { from: 'user', text: message }
    setMessages(prev => [...prev, userMsg])
    setMessage('')

    // Fake bot reply (replace with API)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Thanks for your message! 😊' }
      ])
    }, 800)
  }

  const handleFileUpload = e => {
    const file = e.target.files[0]
    if (!file) return

    setMessages(prev => [
      ...prev,
      {
        from: 'user',
        text: `📎 ${file.name}`
      }
    ])
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[90vw] max-w-md sm:w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <p className="font-semibold leading-tight text-sm sm:text-base">HelpBot</p>
                <span className="text-xs text-green-500">Online</span>
              </div>
            </div>

            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-2 sm:p-3 rounded-lg break-words ${
                  msg.from === 'user'
                    ? 'bg-black text-white ml-auto'
                    : 'bg-gray-100'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-2 sm:p-3 border-t flex items-center gap-2">
            {/* FILE UPLOAD */}
            <label className="cursor-pointer text-gray-600 hover:text-black">
              <Paperclip size={20} />
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <input
              type="text"
              placeholder="Enter your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 border rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-black text-white p-2 rounded-lg hover:opacity-90"
            >
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
