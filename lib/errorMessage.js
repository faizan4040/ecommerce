/*
 * Turn any error (axios, fetch, zod, plain Error, string) into a clear, human message.
 * Used by the toast system and the global axios interceptor.
 */

const STATUS_MESSAGES = {
  400: "Some details are missing or incorrect. Please check and try again.",
  401: "Please log in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  408: "The request took too long. Please try again.",
  409: "This already exists. Please use a different value.",
  413: "That file is too large.",
  422: "Some details are not valid. Please check and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
  502: "The server is not responding right now. Please try again.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
}

const GENERIC = "Something went wrong. Please try again."

// messages that are technical and should be replaced with a friendly one
const isTechnical = (m) =>
  !m ||
  /^request failed with status code \d+$/i.test(m) ||
  /^network error$/i.test(m) ||
  /^timeout of \d+ms exceeded$/i.test(m) ||
  /^internal server error\.?$/i.test(m) ||
  /cast to objectid failed/i.test(m) ||
  /^\[object object\]$/i.test(m)

const firstZodIssue = (obj) =>
  obj?.issues?.[0]?.message || obj?.error?.issues?.[0]?.message || obj?.data?.issues?.[0]?.message

const friendlyDuplicate = (m) => {
  const field = m.match(/Duplicate field: ([\w,]+)/i)?.[1]
  return field ? `This ${field.replace(/,/g, " / ")} is already in use. Please use a different one.` : null
}

export function getErrorMessage(err, fallback = GENERIC) {
  if (!err) return fallback
  if (typeof err === "string") {
    if (/Duplicate field/i.test(err)) return friendlyDuplicate(err) || err
    return isTechnical(err) ? fallback : err
  }

  // Offline / server unreachable
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You're offline. Please check your internet connection."
  }
  if (err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")) {
    return STATUS_MESSAGES[408]
  }
  if (err.isAxiosError && !err.response) {
    return "Can't reach the server. Please check your connection and try again."
  }

  // Server response
  const status = err.response?.status
  const data = err.response?.data
  let message =
    firstZodIssue(data) ||
    (typeof data?.message === "string" ? data.message : null) ||
    (typeof data === "string" && data.length < 200 && !/[<>{}]/.test(data) ? data : null)

  // Our API sometimes returns a generic "Invalid or missing fields." – prefer the first field error
  if (/invalid or missing fields/i.test(message || "")) message = firstZodIssue(data?.data) || message

  if (message && /Duplicate field/i.test(message)) message = friendlyDuplicate(message) || message
  if (message && !isTechnical(message)) return message
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]
  if (status >= 500) return STATUS_MESSAGES[500]

  // Plain Error / zod error
  const own = firstZodIssue(err) || err.message
  if (own && /Duplicate field/i.test(own)) return friendlyDuplicate(own) || own
  return own && !isTechnical(own) ? own : fallback
}
