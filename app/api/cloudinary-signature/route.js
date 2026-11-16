import { isAuthenticated } from "@/lib/authentication"
import cloudinary from "@/lib/cloudinary"
import { catchError, response } from "@/lib/helperfunction"
import { NextResponse } from "next/server"

/*
 * Signs Cloudinary upload params so the admin browser can upload images/videos
 * straight from the device to Cloudinary (no file goes through our server).
 * Used by the Media library widget AND the new product/variant uploader.
 */
export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.")
    }

    const { paramsToSign } = await request.json()
    if (!paramsToSign || typeof paramsToSign !== "object") {
      return response(false, 400, "Missing params to sign.")
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_SECRET_KEY)

    return NextResponse.json({ signature })
  } catch (error) {
    return catchError(error)
  }
}
