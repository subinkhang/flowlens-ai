// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/v1/conversations", async () => {
    const sessionId = `session-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substring(2)}`;
    return HttpResponse.json({
      conversationId: sessionId,
      createdAt: Date.now(),
      userId: "anonymous",
      title: "",
    });
  }),
];
