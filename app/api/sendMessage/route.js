import { sendAdminMessage } from "@/models/Chat.model";

export async function POST(req) {
  try {
    const { message, userId } = await req.json();
    
    if (!message || !userId) {
      return new Response(JSON.stringify({ error: "Message and userId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await sendAdminMessage({ userId, message });

    return new Response(JSON.stringify({ success: true }), {
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