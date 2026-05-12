'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
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
import { Loader2, Send, MessageSquare, Search, MoreVertical, ChevronDown, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import BreadcrumbComp from '../layout/shared/breadcrumb/BreadcrumbComp';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function Chat() {
  const { token, activeProfileId, activeProfile, profileName, activeProfileImage } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);
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
        if (conversationId) {
          const record = response.data.conversations.find(
            con => con.id === conversationId
          );

          if (record) {
            handleConversationSelect(record);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
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
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [token, activeProfileId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      const interval = setInterval(() => {
        getMessages(token!, activeProfileId!, activeProfile as string, selectedConversation.id, selectedConversation.type).then((res) => {
          if (res.success && res.data) {
            setMessages(prev => {
              if (res.data!.messages.length !== prev.length) {
                setTimeout(scrollToBottom, 100);
                return res.data!.messages;
              }
              return prev;
            });
          }
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, token, activeProfileId]);

  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Messages" },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (conv: ChatConversation) => {
    setSelectedConversation(conv);
    setIsChatVisible(true);
  };

  return (
    <>
      <BreadcrumbComp title="Messages" items={BCrumb} />
      <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background relative w-full break-words">
        <div className="flex h-[calc(100vh-210px)]">
          <div className={cn("w-full md:w-[380px] flex flex-col gap-0 p-0 md:flex", isChatVisible ? "hidden" : "flex")}>
            <CardHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={activeProfileImage || `https://ui-avatars.com/api/?name=${(profileName || activeProfile || '').replace(/\s/g, '+')}&background=random`} />
                    <AvatarFallback>{getInitials(profileName || activeProfile || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-base">{profileName || activeProfile}</p>
                    <p className="text-sm text-muted-foreground">{activeProfile}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search"
                  className="pl-10 h-11 bg-lightprimary! focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <div className="p-4 flex justify-between items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-semibold p-0 h-auto">
                      Recent Chats <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Sort by Time</DropdownMenuItem>
                    <DropdownMenuItem>Sort by Unread</DropdownMenuItem>
                    <DropdownMenuItem>Sort by Favourites</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {isLoadingConversations ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-muted-foreground p-4 text-center">
                  <p>No conversations found.</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100%-70px)]">
                  <div className="flex flex-col">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleConversationSelect(conv)}
                        className={cn(
                          "flex items-start gap-4 p-4 text-left transition-colors hover:bg-lightprimary!",
                          selectedConversation?.id === conv.id && "bg-muted"
                        )}
                      >
                        <Avatar className="relative h-12 w-12 shrink-0">
                          <AvatarImage src={conv.profileImageUrl} />
                          <AvatarFallback>{getInitials(conv.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-baseline mb-1">
                            <p className="font-semibold truncate">{conv.name}</p>
                            {conv.lastMessageDate && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {(() => {
                                  const date = new Date(conv.lastMessageDate);
                                  const now = new Date();
                                  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
                                  if (diffInMinutes < 1) return "now";
                                  if (diffInMinutes < 60) return `${diffInMinutes} minutes`;
                                  return format(date, 'p');
                                })()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </div>
          <Separator orientation="vertical" className={cn("mx-0", isChatVisible ? "hidden" : "md:block")}/>
          <div className={cn("flex-1 flex-col p-0", isChatVisible ? "flex" : "hidden md:flex")}>
            {selectedConversation ? (
              <>
                <CardHeader className="py-3 px-4 md:px-6 border-b flex flex-row items-center gap-4">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsChatVisible(false)}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="relative h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src={selectedConversation.profileImageUrl} />
                    <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-base">{selectedConversation.name}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden relative">
                  <ScrollArea className="h-full p-4 md:p-6">
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {messages.map((msg, index) => {
                          const isMe = msg.senderId === activeProfileId;
                          const senderName = isMe ? (profileName || 'You') : selectedConversation.name;
                          return (
                            <div key={msg._id || index} >
                              <div className={cn("flex items-end gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                                <Avatar className="h-9 w-9 shrink-0">
                                  <AvatarImage src={isMe ? activeProfileImage : selectedConversation.profileImageUrl} />
                                  <AvatarFallback>{getInitials(isMe ? profileName || '' : selectedConversation.name)}</AvatarFallback>
                                </Avatar>
                                <div className={cn("max-w-md", isMe ? "text-right" : "text-left")}>
                                  <div className={cn("rounded-lg px-4 py-2.5 text-sm inline-block", isMe ? "bg-primary text-primary-foreground" : "bg-background")}>
                                    {msg.message}
                                  </div>
                                </div>
                              </div>
                              <p className={cn("text-xs text-muted-foreground mt-1.5", isMe ? "text-right" : "text-left ml-12")}>
                                {senderName}, {format(new Date(msg.createdAt), 'h:mm a')}
                              </p>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t bg-background">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="relative"
                  >
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="pr-12 h-12 bg-lightprimary!  rounded-full border-transparent focus:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full w-9 h-9">
                      {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/20 hidden md:flex">
                <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a person from the list to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center h-full p-6">
            <Loader2 className="w-6 h-6 animate-spin" />
        </div>
    }>
      <Chat />
    </Suspense>
  )
}
