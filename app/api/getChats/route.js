// app/api/getChats/route.js
import { getChats } from "@/models/Chat.model";

export async function GET() {
  try {
    const chats = await getChats();
    return new Response(JSON.stringify(chats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}