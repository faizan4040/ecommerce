'use client'

import { MessageCircle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import ChatWidget from './ChatWidget'
import { useChat } from './ChatProvider'

export default function ChatButton() {
  const { open, setOpen, showButton } = useChat()

  // If chat button should not show, render nothing
  if (!showButton) return null

  return (
    <>
      {/* FLOATING CHAT ICON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:scale-105 transition z-50"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* CHAT WIDGET */}
      <AnimatePresence>
        {open && <ChatWidget onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}






// 'use client'

// import { useState } from 'react'
// import { MessageCircle } from 'lucide-react'
// import ChatWidget from './ChatWidget'
// import { AnimatePresence } from 'framer-motion'

// export default function ChatButton() {
//   const [open, setOpen] = useState(false)

//   return (
//     <>
//       {/* FLOATING CHAT ICON */}
//       {!open && (
//         <button
//           onClick={() => setOpen(true)}
//           className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:scale-105 transition z-9999"
//         >
//           <MessageCircle size={26} />
//         </button>
//       )}

//       {/* CHAT WIDGET */}
//       <AnimatePresence>
//         {open && <ChatWidget onClose={() => setOpen(false)} />}
//       </AnimatePresence>
//     </>
//   )
// }
