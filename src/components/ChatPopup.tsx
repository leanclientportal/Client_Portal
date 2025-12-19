'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Send, Loader2, Maximize2 } from 'lucide-react';
import { useChat, ChatUser } from '@/providers/chat-provider';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { getMessages, sendMessage, ChatMessage } from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ChatPopup() {
  const { isOpen, isMinimized, activeUser, closeChat, minimizeChat, maximizeChat } = useChat();
  const { token, activeProfileId, activeProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeUser && token && activeProfileId) {
      loadMessages();
      const interval = setInterval(loadMessages, 60000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeUser, token, activeProfileId]);

  useEffect(() => {
    if (!isMinimized && isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const loadMessages = async () => {
    if (!activeUser || !token || !activeProfileId) return;
    try {
      const response = await getMessages(token, activeProfileId, activeProfile, activeUser.id, activeUser.type);
      if (response.success && response.data) {
        setMessages(prev => {
          // Basic comparison to avoid unnecessary state updates if strictly needed
          // but here just replacing for simplicity
          if (response.data!.messages.length !== prev.length) {
            return response.data!.messages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeUser || !token || !activeProfileId) return;

    setIsSending(true);
    try {
      const payload = {
        senderId: activeProfileId,
        senderType: activeProfile,
        receiverId: activeUser.id,
        receiverType: activeUser.type,
        message: newMessage,
      };
      const response = await sendMessage(token, payload);
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!isOpen || !activeUser) return null;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={maximizeChat}
          className="h-14 w-14 rounded-full shadow-lg p-0 bg-primary hover:bg-primary/90 relative"
        >
          <Avatar className="h-full w-full">
            <AvatarImage src={activeUser.image} />
            <AvatarFallback>{getInitials(activeUser.name)}</AvatarFallback>
          </Avatar>
          <span className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-[500px] shadow-2xl z-50 flex flex-col border-primary/20">
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-white/20">
            <AvatarImage src={activeUser.image} />
            <AvatarFallback className="text-primary bg-white">{getInitials(activeUser.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">{activeUser.name}</span>
            <span className="text-[10px] opacity-80 capitalize">{activeUser.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={minimizeChat}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={closeChat}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden bg-background">
        <ScrollArea className="h-full p-3" ref={scrollRef}>
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === activeProfileId;
              return (
                <div
                  key={msg._id || idx}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border"
                    )}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.createdAt), 'p')}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t bg-muted/30">
        <form
          className="flex w-full items-center gap-2"
          onSubmit={handleSendMessage}
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 h-9 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
