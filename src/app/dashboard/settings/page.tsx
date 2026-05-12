'use client';

import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailNotificationSettings } from "./components/EmailNotificationSettings";
import { SmtpSettings } from "./components/SmtpSettings";
import { GeneralSettings } from "./components/GeneralSettings";
import { SettingsProvider } from "@/providers/SettingsProvider";
import CardBox from "@/components/ui/CardBox";
import BreadcrumbComp from "../layout/shared/breadcrumb/BreadcrumbComp";

export default function SettingsPage() {
  const { isLoading, activeProfile } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "Settings" },
  ];

  return (
    <>
      <BreadcrumbComp title="Settings" items={BCrumb} />
      <SettingsProvider>
        <div className="bg-background relative w-full break-words py-3 px-3 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm sm:shadow-md dark:shadow-none dark:sm:shadow-dark-md">
          <Tabs defaultValue={activeProfile === 'client' ? 'general-settings' : 'email-notification'}>
            <div className="flex items-center mb-2">
              <TabsList
                className="w-full sm:w-auto flex flex-row gap-2 bg-lightprimary rounded-lg overflow-x-auto overflow-y-hidden whitespace-nowrap px-1 py-1 scroll-pl-2 sm:overflow-visible">
                {activeProfile !== 'client' && (
                  <TabsTrigger
                    className="min-w-max ml-40 sm:ml-0 data-[state=active]:bg-primary data-[state=active]:text-white"
                    value="email-notification">
                    Email notification
                  </TabsTrigger>
                )}

                {activeProfile !== 'client' && (
                  <TabsTrigger
                    className="min-w-max data-[state=active]:bg-primary data-[state=active]:text-white"
                    value="smtp-settings"
                  >
                    SMTP Settings
                  </TabsTrigger>
                )}

                <TabsTrigger
                  className="min-w-max data-[state=active]:bg-primary data-[state=active]:text-white"
                  value="general-settings"
                >
                  General Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {activeProfile !== 'client' && <TabsContent value="email-notification" className="mt-4">
              <EmailNotificationSettings />
            </TabsContent>}
            {activeProfile !== 'client' && <TabsContent value="smtp-settings" className="mt-4">
              <SmtpSettings />
            </TabsContent>}
            <TabsContent value="general-settings" className="mt-4">
              <GeneralSettings />
            </TabsContent>
          </Tabs>
        </div>
      </SettingsProvider>
    </>
  );
}
