'use client';

import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailNotificationSettings } from "./components/EmailNotificationSettings";
import { SmtpSettings } from "./components/SmtpSettings";
import { WhatsappNotificationSettings } from "./components/WhatsappNotificationSettings";

export default function SettingsPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <Tabs defaultValue="email-notification">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="email-notification">Email notification</TabsTrigger>
        <TabsTrigger value="smtp-settings">SMTP Settings</TabsTrigger>
        <TabsTrigger value="whatsapp-notification">Whatsapp notification</TabsTrigger>
      </TabsList>
      <TabsContent value="email-notification">
        <EmailNotificationSettings />
      </TabsContent>
      <TabsContent value="smtp-settings">
        <SmtpSettings />
      </TabsContent>
      <TabsContent value="whatsapp-notification">
        <WhatsappNotificationSettings />
      </TabsContent>
    </Tabs>
  );
}
