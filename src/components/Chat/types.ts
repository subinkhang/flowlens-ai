export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

export const TAG_SUGGESTIONS = ["@diagram", "@ask", "@improve"];
