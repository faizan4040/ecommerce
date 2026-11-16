import { jwtVerify } from "jose"
import { cookies } from "next/headers"

/**
 * Who is calling a chat API? Works for both customers and admins.
 * Returns { id, role } or null when not logged in.
 */
export async function getChatSession() {
  try {
    const store = await cookies()
    const token = store.get("access_token")?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SECRET_KEY))
    const id = payload._id || payload.userId
    if (!id || !["user", "admin"].includes(payload.role)) return null
    return { id: String(id), role: payload.role }
  } catch {
    return null
  }
}
