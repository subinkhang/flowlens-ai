// Một cách đơn giản để tạo ID duy nhất cho mục đích demo
export const generateSessionId = (): string => {
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;
};