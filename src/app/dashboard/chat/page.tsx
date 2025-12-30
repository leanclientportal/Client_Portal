'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  getConversations,
  getMessages,
  sendMessage,
  ChatConversation,
  ChatMessage,
} from '@/lib/api/chat';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { token, activeProfileId, activeProfile, profileName } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  const fetchConversations = async () => {
    if (!token || !activeProfileId) return;
    try {
      const response = await getConversations(token, activeProfileId as string, activeProfile as string);
      if (response.success && response.data) {
        setConversations(response.data.conversations);
        const record = response.data.conversations.find(
          con => con.id === conversationId
        );

        if (!record) return;

        // New model
        const chatConversation: ChatConversation = {
          id: record.id,
          name: record.name,
          lastMessage: record.lastMessage,
          profileImageUrl: record.profileImageUrl,
          type: record.type,
          lastMessageDate: record.lastMessageDate,
          unreadCount: record.unreadCount,
        };
        setSelectedConversation(chatConversation);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversation: ChatConversation) => {
    if (!token || !activeProfileId) return;
    setIsLoadingMessages(true);
    try {
      const response = await getMessages(token, activeProfileId, activeProfile as string, conversation.id, conversation.type);
      if (response.success && response.data) {
        setMessages(response.data.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !token || !activeProfileId) return;

    setIsSending(true);
    try {
      const payload = {
        senderId: activeProfileId,
        senderType: activeProfile,
        receiverId: selectedConversation.id,
        receiverType: selectedConversation.type,
        message: newMessage,
      };

      const response = await sendMessage(token, payload);
      if (response.success && response.data) {
        setMessages((prev) => [...prev, response.data!]);
        setNewMessage('');
        scrollToBottom();
        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, lastMessage: newMessage, lastMessageDate: new Date().toISOString() }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations/updates every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [token, activeProfileId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      // Poll for new messages in selected conversation every 5 seconds
      const interval = setInterval(() => {
        // We could implement a lighter check here (e.g. check for new messages only)
        // For simplicity, we just re-fetch. In production, use WebSockets/Socket.io.
        getMessages(token!, activeProfileId!, activeProfile as string, selectedConversation.id, selectedConversation.type).then((res) => {
          if (res.success && res.data) {
            // Simple diff check or just replace. Replacing for simplicity but ideally append new ones.
            // A simple way to avoid full re-render jumpiness is to only set if length changed
            setMessages(prev => {
              if (res.data!.messages.length !== prev.length) {
                setTimeout(scrollToBottom, 100); // Scroll if new message
                return res.data!.messages;
              }
              return prev;
            });
          }
        });
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, token, activeProfileId]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatMessageDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'p'); // 12:00 PM
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations Sidebar */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="py-4 px-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          {isLoadingConversations ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground p-4 text-center">
              <p>No conversations yet.</p>
              <p className="text-sm">Start a project or invite a client to begin chatting.</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b last:border-0",
                      selectedConversation?.id === conv.id && "bg-muted"
                    )}
                  >
                    <Avatar>
                      <AvatarImage src={conv.profileImageUrl} />
                      <AvatarFallback>{getInitials(conv.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold truncate">{conv.name}</span>
                        {conv.lastMessageDate && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {format(new Date(conv.lastMessageDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-medium">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="py-3 px-4 border-b flex flex-row items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.profileImageUrl} />
                <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                <CardDescription className="text-xs">
                  {selectedConversation.type === 'client' ? 'Client' : 'Tenant'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden relative bg-muted/20">
              <ScrollArea className="h-full p-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground mt-10">
                        <p>This is the beginning of your conversation with {selectedConversation.name}.</p>
                      </div>
                    )}
                    {messages.map((msg, index) => {
                      const isMe = msg.senderId === activeProfileId;
                      return (
                        <div
                          key={msg._id || index}
                          className={cn(
                            "flex max-w-[80%] flex-col gap-1",
                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2 text-sm",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted text-foreground rounded-tl-none border"
                            )}
                          >
                            {msg.message}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {formatMessageDate(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a person from the list to start chatting.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
