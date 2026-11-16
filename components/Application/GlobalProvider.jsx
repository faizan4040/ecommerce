'use client'

import { persistor, store } from '@/store/store'
import React from 'react'
import { Provider, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import Loading from './Loading'
import { ChatProvider } from '../Chat/ChatProvider'
import ChatWidget from '../Chat/ChatWidget'

const queryClient = new QueryClient()

function ChatWrapper({ children }) {
  const auth = useSelector((state) => state.authStore?.auth ?? null)
  const pathname = usePathname()

  // Website chat widget everywhere except the admin panel & auth screens
  const showWidget = !pathname?.startsWith("/admin") && !pathname?.startsWith("/auth")

  return (
    <ChatProvider user={auth}>
      {children}
      {showWidget && <ChatWidget />}
    </ChatProvider>
  )
}

const GlobalProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={<Loading />}>
          <ChatWrapper>
            {children}
          </ChatWrapper>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  )
}

export default GlobalProvider






// 'use client'
// import { persistor, store } from '@/store/store'
// import React, { Suspense } from 'react'
// import { Provider } from 'react-redux'
// import { PersistGate } from 'redux-persist/integration/react'
// import Loading from './Loading'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'



// const queryClient = new QueryClient()

// const GlobalProvider = ({ children }) => {
//   return (
//     <QueryClientProvider client={queryClient}>
//         <Provider store={store}>
//             <PersistGate persistor={persistor} loading={<Loading/>}>
//               {children}
//             </PersistGate>
//         </Provider>
//     </QueryClientProvider>
//   )
// }

// export default GlobalProvider