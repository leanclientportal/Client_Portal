'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getGeneralSettings, updateGeneralSettings } from '@/lib/api';
import type { GeneralSettings as GeneralSettingsData } from '@/lib/api';
import { uploadLogo } from '@/lib/storage';
import { useSettings } from '@/providers/SettingsContext'; // Import the useSettings hook

export function GeneralSettings() {
  const { activeProfileId, activeProfile, token } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<GeneralSettingsData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const { reloadSettings } = useSettings(); // Get the reloadSettings function

  useEffect(() => {
    if (!activeProfileId || !activeProfile || !token) return;

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await getGeneralSettings(activeProfileId, activeProfile, token);
        if (response.success && response.data) {
          setSettings(response.data);
        } else {
          toast({ variant: "destructive", title: "Error", description: "Failed to fetch settings." });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch settings." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [activeProfileId, token, toast]);

  const handleSelectChange = (id: keyof GeneralSettingsData) => (value: string) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && activeProfileId) {
      setIsUploadingLogo(true);
      try {
        const downloadURL = await uploadLogo(activeProfileId, file);
        console.log('Logo uploaded successfully:', downloadURL);
        setSettings(prev => ({ ...prev, logoUrl: downloadURL }));
        toast({
          title: "Success",
          description: "Logo uploaded. Click save to apply changes.",
        });
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast({ variant: "destructive", title: "Error", description: "Failed to upload logo." });
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleSave = async () => {
    if (!activeProfileId || !activeProfile || !token) return;

    setIsSaving(true);
    try {
      const response = await updateGeneralSettings(activeProfileId, activeProfile, token, settings);
      if (response.success && response.data) {
        setSettings(response.data);
        reloadSettings(); // Reload settings after saving
        toast({
          title: "Success",
          description: response.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to save settings. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
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
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your general settings.</CardDescription>
            </CardHeader>
          </div>
        </div>
        <CardContent className="space-y-4 p-0">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={handleSelectChange('dateFormat')}>
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select a date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy/MM/dd">YYYY/MM/DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount-format">Amount Format</Label>
                <Select value={settings.amountFormat} onValueChange={handleSelectChange('amountFormat')}>
                  <SelectTrigger id="amount-format">
                    <SelectValue placeholder="Select an amount format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1,234.56">1,234.56</SelectItem>
                    <SelectItem value="1.234,56">1.234,56</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {activeProfile !== 'client' && (
                <div className="space-y-2 mt-5">
                  <div className="flex items-center gap-4">
                    {settings.logoUrl && (
                      <img src={settings.logoUrl} alt="Logo Preview" className="h-20 w-20 rounded-full object-cover" />
                    )}
                    <div>
                      <Label htmlFor="logoUrl">Logo</Label>
                      <Input className='mt-3' id="logoUrl" type="file" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        <div className="flex justify-end p-6">
          <Button onClick={handleSave} disabled={isSaving || isUploadingLogo}>
            {isSaving ? 'Saving...' : isUploadingLogo ? 'Uploading Logo...' : 'Save'}
          </Button>
        </div>
      </>
  );
}
