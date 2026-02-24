import { insertChat } from "@/models/Chat.model";

export async function POST(req) {
  try {
    const { message, visitor } = await req.json();
    
    if (!message || !visitor?.id) {
      return new Response(JSON.stringify({ error: "Message and visitor are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await insertChat({
      userId: visitor.id,
      visitorName: visitor.name,
      message,
      from: "user",
      timestamp: new Date(),
    });

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