import { insertChat } from "@/models/Chat.model";


export async function POST(req, res) {
  const body = await req.json();
  const { message, visitor, timestamp } = body;

  await insertChat({
    visitorId: visitor.id,
    visitorName: visitor.name,
    message,
    from: "user",
    timestamp: timestamp || new Date(),
  });

  return res.status(200).json({ success: true });
}