import { toast } from "react-toastify"
import { Check, Info, TriangleAlert, X } from "lucide-react"
import { getErrorMessage } from "./errorMessage"

/*
 * App-wide toast:  showToast('success' | 'error' | 'warning' | 'info', messageOrError, optionalTitle)
 * - `message` can be a string OR an error object (axios/zod/Error) – it is turned into a clear message.
 * - The same message is never stacked twice.
 */

const META = {
  success: { title: "Success", Icon: Check, autoClose: 3500 },
  error: { title: "Oops!", Icon: X, autoClose: 6000 },
  warning: { title: "Heads up", Icon: TriangleAlert, autoClose: 5000 },
  info: { title: "Info", Icon: Info, autoClose: 4000 },
}

function ToastBody({ type, title, message }) {
  const { Icon } = META[type] || META.info
  return (
    <div className="app-toast-body">
      <span className={`app-toast-icon app-toast-icon--${type}`}>
        <Icon size={22} strokeWidth={3} />
      </span>
      <div className="app-toast-text">
        <p className="app-toast-title">{title}</p>
        {message && <p className="app-toast-message">{message}</p>}
      </div>
    </div>
  )
}

export const showToast = (type = "info", message, title) => {
  const kind = META[type] ? type : "info"
  const text =
    kind === "error"
      ? getErrorMessage(message)
      : typeof message === "string"
        ? message
        : message?.message || ""

  const id = `${kind}:${text}`
  if (toast.isActive(id)) return id

  return toast(<ToastBody type={kind} title={title || META[kind].title} message={text} />, {
    toastId: id,
    type: kind,
    icon: false,
    autoClose: META[kind].autoClose,
    className: `app-toast app-toast--${kind}`,
  })
}

export default showToast
