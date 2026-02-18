'use client'

import { createContext, useContext, useState } from 'react'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [open, setOpen] = useState(false)        
  const [showButton, setShowButton] = useState(false) 

  return (
    <ChatContext.Provider value={{ open, setOpen, showButton, setShowButton }}>
      {children}
    </ChatContext.Provider>
  )
}


export const useChat = () => useContext(ChatContext)
