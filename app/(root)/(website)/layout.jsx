'use client'

import ChatButton from '@/components/Chat/ChatButton'
import ChatWidget from '@/components/Chat/ChatWidget'
import { ChatProvider } from '@/components/Chat/ChatProvider'
import Footer from '@/components/Website/Footer'
import Header from '@/components/Website/Header'
import TawkWidget from '@/components/Chat/TawkWidget'

const Layout = ({ children }) => {
  return (
    <ChatProvider>
       <Header />

          <main>
           {children}
          </main>

       <Footer />


      <ChatButton />
      {/* <ChatWidget /> */}
      <TawkWidget/>
    </ChatProvider>
  )
}

export default Layout



