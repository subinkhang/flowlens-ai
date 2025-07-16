import React from "react";
import { useParams } from "react-router-dom";
import { SessionContext } from "../contexts/SessionContext";

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    throw new Error(
      "SessionProvider must be used inside a route with :sessionId"
    );
  }

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};
