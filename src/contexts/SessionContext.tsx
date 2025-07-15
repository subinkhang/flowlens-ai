import { createContext } from "react";

export interface SessionContextType {
  sessionId: string;
}

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);
