export interface Conversation {
  conversationId: string;
  createdAt: number;
  userId: string;
  title: string;
}

export const createConversation = async (): Promise<Conversation> => {
  const res = await fetch("/api/v1/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error("Không thể tạo session");
  }

  const data = await res.json();
  return data;
};
