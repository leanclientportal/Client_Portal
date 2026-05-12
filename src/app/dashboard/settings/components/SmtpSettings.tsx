'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSmtpSettings, updateSmtpSettings, EmailSmtpSettings } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function SmtpSettings() {
  const { activeProfileId: tenantId, token } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<EmailSmtpSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tenantId && token) {
      setIsLoading(true);
      getSmtpSettings(tenantId, token)
        .then(response => {
          if (response.data) {
            setSettings(response.data);
          }
        })
        .catch(error => {
          console.error("Failed to fetch SMTP settings:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error?.response?.data?.message || "Failed to load SMTP settings.",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [tenantId, token, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!tenantId || !token) return;

    setIsSaving(true);
    try {
      const response = await updateSmtpSettings(tenantId, token, settings);
      toast({
        title: "Success",
        description: response.message,
      });
    } catch (error: any) {
      console.error("Failed to save SMTP settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to save SMTP settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mt-15">
        {/* Left side: Search + Filter */}
        <div className="flex items-center gap-2">
          <CardHeader className='p-0'>
            <CardTitle>SMTP Settings</CardTitle>
            <CardDescription>
              Configure your SMTP settings for sending emails.
            </CardDescription>
          </CardHeader>
        </div> </div>
      <CardContent className="space-y-4 p-0">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input id="user" value={settings.user || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Password</Label>
              <Input id="pass" type="password" value={settings.pass || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Input id="service" value={settings.service || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" value={settings.from || ''} onChange={handleInputChange} />
            </div>
          </>
        )}
      </CardContent>
      <div className="flex justify-end p-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </>
  );
}
