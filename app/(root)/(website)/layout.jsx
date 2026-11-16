'use client'

import Footer from '@/components/Website/Footer'
import Header from '@/components/Website/Header'

// Chat widget + provider live in GlobalProvider (they need the logged-in user)
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default Layout
