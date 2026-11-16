'use client'

import { useEffect } from "react"
import axios from "axios"
import { ToastContainer, cssTransition } from "react-toastify"
import { X } from "lucide-react"
import { getErrorMessage } from "@/lib/errorMessage"

// Spring-like slide in from the right, slide + fade out
const Slide = cssTransition({
  enter: "app-toast-in",
  exit: "app-toast-out",
  collapseDuration: 250,
})

let interceptorAdded = false

/**
 * Toast container for the whole app + a global axios interceptor that replaces
 * technical errors ("Request failed with status code 400") with the real server
 * message, so every existing `showToast('error', error.message)` shows something useful.
 */
export default function AppToaster() {
  useEffect(() => {
    if (interceptorAdded) return
    interceptorAdded = true
    axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (!axios.isCancel(error)) {
          try {
            error.message = getErrorMessage(error)
          } catch {}
        }
        return Promise.reject(error)
      }
    )
  }, [])

  return (
    <ToastContainer
      position="top-right"
      transition={Slide}
      newestOnTop
      limit={4}
      closeOnClick={false}
      pauseOnHover
      pauseOnFocusLoss
      draggable
      draggablePercent={40}
      hideProgressBar={false}
      closeButton={({ closeToast }) => (
        <button type="button" onClick={closeToast} aria-label="Close" className="app-toast-close">
          <X size={16} />
        </button>
      )}
    />
  )
}
