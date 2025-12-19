// src/lib/api/chat.ts
import { httpClient } from './http-client';
import { CommonApiResponse } from '../types';

export interface ChatMessage {
  _id: string;
  senderId: string;
  senderType: 'client' | 'tenant';
  receiverId: string;
  receiverType: 'client' | 'tenant';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string; // Could be the ID of the other party
  name: string;
  profileImageUrl?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
  type: 'client' | 'tenant';
}

export interface GetConversationsResponse {
  conversations: ChatConversation[];
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
}

export interface SendMessagePayload {
  receiverId: string;
  receiverType: 'client' | 'tenant';
  message: string;
}

export interface StartConversationResponse {
  conversationId: string;
}

export async function getConversations(token: string, activeProfileId: string, activeProfile: string): Promise<CommonApiResponse<GetConversationsResponse>> {
  return httpClient<GetConversationsResponse>(`/messages/conversations/${activeProfileId}/${activeProfile}`, { token });
}

export async function getMessages(token: string, activeProfileId: string, activeProfile: string, otherUserId: string, otherUserType: string): Promise<CommonApiResponse<GetMessagesResponse>> {
  return httpClient<GetMessagesResponse>(`/messages/${activeProfileId}/${activeProfile}/${otherUserId}/${otherUserType}`, { token });
}

export async function sendMessage(token: string, payload: SendMessagePayload): Promise<CommonApiResponse<ChatMessage>> {
  return httpClient<ChatMessage>(`/messages`, {
    method: 'POST',
    token,
    data: payload,
  });
}

export async function startConversation(token: string, activeProfileId: string, receiverId: string): Promise<CommonApiResponse<StartConversationResponse>> {
  return httpClient<StartConversationResponse>(`/chat/start/${activeProfileId}`, {
    method: 'POST',
    token,
    data: { receiverId },
  });
}
