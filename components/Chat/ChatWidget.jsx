'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Paperclip } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChat } from './ChatProvider'
import { createSocket } from '@/lib/socket-client'

export default function ChatWidget() {
  const { open, setOpen, roomId, userId } = useChat()

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  /* auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* socket connection — FIXED */
  useEffect(() => {
    if (!open || !roomId || !userId) return

    // DO NOT recreate socket if already exists
    if (!socketRef.current) {
      console.log(' creating socket...')

      const socket = createSocket({ roomId, userId })
      socketRef.current = socket

      socket.on('connect', () => {
        console.log(' socket connected:', socket.id)
        socket.emit('join-room', roomId)
      })

      socket.on('receive-message', msg => {
        console.log(' received:', msg)
        setMessages(prev => [...prev, msg])
      })

      socket.on('connect_error', err => {
        console.error(' socket error:', err.message)
      })
    }

    // DO NOT DISCONNECT HERE
  }, [open, roomId, userId])

  /* disconnect ONLY when chat closes */
  useEffect(() => {
    if (!open && socketRef.current) {
      console.log(' socket disconnected')
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [open])

  /* send message — FIXED */
  const sendMessage = () => {
    console.log(' send clicked', socketRef.current?.connected)
    if (!message.trim() || !socketRef.current) return

    const msgData = {
      roomId,
      senderType: 'user',
      senderId: userId,
      message,
    }

    // optimistic UI (this is REQUIRED)
    setMessages(prev => [...prev, msgData])

    socketRef.current.emit('send-message', msgData)

    setMessage('')
  }

  /* file upload (UI only) */
  const handleFileUpload = e => {
    const file = e.target.files[0]
    if (!file || !socketRef.current) return

    const msgData = {
      roomId,
      senderType: 'user',
      senderId: userId,
      message: `📎 ${file.name}`,
    }

    setMessages(prev => [...prev, msgData])
    socketRef.current.emit('send-message', msgData)
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
                <p className="font-semibold text-sm">HelpBot</p>
                <span className="text-xs text-green-500">Online</span>
              </div>
            </div>

            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-2 rounded-lg ${
                  msg.senderType === 'user'
                    ? 'bg-black text-white ml-auto'
                    : 'bg-gray-100'
                }`}
              >
                {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 border-t flex items-center gap-2">
            <label className="cursor-pointer text-gray-600">
              <Paperclip size={20} />
              <input type="file" hidden onChange={handleFileUpload} />
            </label>

            <input
              type="text"
              placeholder="Enter your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={sendMessage}
              className="bg-black text-white p-2 rounded-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}





















// 'use client'

// import { motion, AnimatePresence } from 'framer-motion'
// import { X, Send, Paperclip } from 'lucide-react'
// import { useEffect, useRef, useState } from 'react'
// import { useChat } from './ChatProvider'
// import { createSocket } from '@/lib/socket-client'

// export default function ChatWidget() {
//   const { open, setOpen, roomId, userId } = useChat()

//   const socketRef = useRef(null)
//   const messagesEndRef = useRef(null)

//   const [message, setMessage] = useState('')
//   const [messages, setMessages] = useState([])

//   /* auto scroll */
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   /* socket connection */
// useEffect(() => {
//   if (!open || !roomId || !userId) {
//     console.log(' socket not started:', { open, roomId, userId })
//     return
//   }

//   console.log(' creating socket...')

//   socketRef.current = createSocket({ roomId, userId })

//   socketRef.current.on('connect', () => {
//     console.log(' socket connected:', socketRef.current.id)
//     socketRef.current.emit('join-room', roomId)
//   })

//   socketRef.current.on('receive-message', msg => {
//     console.log(' received:', msg)
//     setMessages(prev => [...prev, msg])
//   })

//   socketRef.current.on('connect_error', err => {
//     console.error(' socket error:', err.message)
//   })

//   return () => {
//     console.log(' socket disconnected')
//     socketRef.current?.disconnect()
//     socketRef.current = null
//   }
// }, [open, roomId, userId])

//   /* send message */
//   const sendMessage = () => {
//     if (!message.trim() || !socketRef.current) return

//     socketRef.current.emit('send-message', {
//       roomId,
//       senderType: 'user',
//       senderId: userId,
//       message,
//     })

//     setMessage('')
//   }

//   /* file upload (UI only for now) */
//   const handleFileUpload = e => {
//     const file = e.target.files[0]
//     if (!file || !socketRef.current) return

//     socketRef.current.emit('send-message', {
//       roomId,
//       senderType: 'user',
//       senderId: userId,
//       message: `📎 ${file.name}`,
//     })
//   }

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           initial={{ opacity: 0, y: 80 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: 80 }}
//           transition={{ duration: 0.25 }}
//           className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[90vw] max-w-md sm:w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50"
//         >
//           {/* HEADER */}
//           <div className="flex items-center justify-between px-4 py-3 border-b">
//             <div className="flex items-center gap-2">
//               <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold">
//                 B
//               </div>
//               <div>
//                 <p className="font-semibold text-sm">HelpBot</p>
//                 <span className="text-xs text-green-500">Online</span>
//               </div>
//             </div>

//             <button onClick={() => setOpen(false)}>
//               <X size={18} />
//             </button>
//           </div>

//           {/* MESSAGES */}
//           <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
//             {messages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`max-w-[80%] p-2 rounded-lg ${
//                   msg.senderType === 'user'
//                     ? 'bg-black text-white ml-auto'
//                     : 'bg-gray-100'
//                 }`}
//               >
//                 {msg.message}
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* INPUT */}
//           <div className="p-3 border-t flex items-center gap-2">
//             <label className="cursor-pointer text-gray-600">
//               <Paperclip size={20} />
//               <input type="file" hidden onChange={handleFileUpload} />
//             </label>

//             <input
//               type="text"
//               placeholder="Enter your message..."
//               value={message}
//               onChange={e => setMessage(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && sendMessage()}
//               className="flex-1 border rounded-lg px-3 py-2 text-sm"
//             />

//             <button
//               onClick={sendMessage}
//               className="bg-black text-white p-2 rounded-lg"
//             >
//               <Send size={18} />
//             </button>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   )
// }