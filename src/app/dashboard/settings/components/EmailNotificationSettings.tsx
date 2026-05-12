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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getEmailSettings, updateEmailSettings, EmailSettings } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Helper function to convert camelCase to Title Case
function toTitleCase(str: string) {
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function EmailNotificationSettings() {
  const { activeProfileId: tenantId, token } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<EmailSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tenantId && token) {
      setIsLoading(true);
      getEmailSettings(tenantId, token)
        .then(response => {
          if (response.data) {
            setSettings(response.data);
          }
        })
        .catch(error => {
          console.error("Failed to fetch email settings:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: error?.response?.data?.message || "Failed to load email settings.",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [tenantId, token, toast]);

  const handleSwitchChange = (id: keyof EmailSettings, checked: boolean) => {
    setSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    if (!tenantId || !token) return;

    setIsSaving(true);
    try {
      const response = await updateEmailSettings(tenantId, token, settings);
      toast({
        title: "Success",
        description: response.message,
      });
    } catch (error: any) {
      console.error("Failed to save email settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to save email settings. Please try again.",
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
            <CardTitle>Email notification</CardTitle>
            <CardDescription>
              Configure how you receive email notifications.
            </CardDescription>
          </CardHeader>
        </div>
      </div>
      <CardContent className="space-y-4 p-0">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          Object.keys(settings).length > 0 ? (
            Object.keys(settings).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key}>{toTitleCase(key)}</Label>
                <Switch
                  id={key}
                  checked={settings[key as keyof EmailSettings] || false}
                  onCheckedChange={(checked) => handleSwitchChange(key as keyof EmailSettings, checked)}
                />
              </div>
            ))
          ) : (
            <p>No settings available.</p>
          )
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
