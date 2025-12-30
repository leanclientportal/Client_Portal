'use client';

import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailNotificationSettings } from "./components/EmailNotificationSettings";
import { SmtpSettings } from "./components/SmtpSettings";
import { GeneralSettings } from "./components/GeneralSettings";
import { SettingsProvider } from "@/providers/SettingsProvider";

export default function SettingsPage() {
  const { isLoading, activeProfile } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <SettingsProvider>
      <Tabs defaultValue={activeProfile === 'client' ? 'general-settings' : 'email-notification'}>
        <TabsList className={`grid w-full ${activeProfile === 'client' ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {activeProfile !== 'client' && <TabsTrigger value="email-notification">Email notification</TabsTrigger>}
          {activeProfile !== 'client' && <TabsTrigger value="smtp-settings">SMTP Settings</TabsTrigger>}
          <TabsTrigger value="general-settings">General Settings</TabsTrigger>
        </TabsList>
        {activeProfile !== 'client' && <TabsContent value="email-notification">
          <EmailNotificationSettings />
        </TabsContent>}
        {activeProfile !== 'client' && <TabsContent value="smtp-settings">
          <SmtpSettings />
        </TabsContent>}
        <TabsContent value="general-settings">
          <GeneralSettings />
        </TabsContent>
      </Tabs>
    </SettingsProvider>
  );
}
