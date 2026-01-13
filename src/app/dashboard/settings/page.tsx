'use client';

import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailNotificationSettings } from "./components/EmailNotificationSettings";
import { SmtpSettings } from "./components/SmtpSettings";
import { GeneralSettings } from "./components/GeneralSettings";
import { SettingsProvider } from "@/providers/SettingsProvider";
import CardBox from "@/components/ui/CardBox";

export default function SettingsPage() {
  const { isLoading, activeProfile } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <>
      <SettingsProvider>
        <Tabs defaultValue={activeProfile === 'client' ? 'general-settings' : 'email-notification'}>
          <CardBox
            className={`mb-6 py-4 bg-lightinfo dark:bg-darkinfo overflow-hidden rounded-3xl border-none !shadow-none dark:!shadow-none`}>
            <TabsList className={`w-full grid ${activeProfile === 'client' ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <div className=' items-center grid grid-cols-12 gap-6'>
                <div className='col-span-10'>
                  <h4 className='font-semibold text-xl text-customdark mb-4'>
                    {activeProfile !== 'client' && <TabsTrigger value="email-notification">Email notification</TabsTrigger>}
                  </h4>
                </div>
              </div>
              <div className=' items-center grid grid-cols-12 gap-6'>
                <div className='col-span-10'>
                  <h4 className='font-semibold text-xl text-customdark mb-4'>
                    {activeProfile !== 'client' && <TabsTrigger value="smtp-settings">SMTP Settings</TabsTrigger>}
                  </h4>
                </div>
              </div>
              <div className=' items-center grid grid-cols-12 gap-6'>
                <div className='col-span-10'>
                  <h4 className='font-semibold text-xl text-customdark mb-4'>
                    <TabsTrigger value="general-settings">General Settings</TabsTrigger>
                  </h4>
                </div>
              </div>
            </TabsList>
          </CardBox>
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
    </>
  );
}
