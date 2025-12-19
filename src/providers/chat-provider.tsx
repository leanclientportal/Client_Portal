'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ChatUser {
  id: string;
  name: string;
  image?: string;
  type: 'client' | 'tenant';
}

interface ChatContextType {
  isOpen: boolean;
  isMinimized: boolean;
  activeUser: ChatUser | null;
  openChat: (user: ChatUser) => void;
  closeChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);

  const openChat = useCallback((user: ChatUser) => {
    setActiveUser(user);
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveUser(null);
  }, []);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeChat = useCallback(() => {
    setIsMinimized(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        isMinimized,
        activeUser,
        openChat,
        closeChat,
        minimizeChat,
        maximizeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
