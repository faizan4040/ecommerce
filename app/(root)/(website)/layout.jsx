import Footer from '@/components/Website/Footer'
import Header from '@/components/Website/Header'
import React from 'react'


const layout = ({ children }) => {
  return (
      <div>
        <Header/>
          <main>
            {children}
          </main>
        <Footer/>
      </div>

  )
}

export default layout