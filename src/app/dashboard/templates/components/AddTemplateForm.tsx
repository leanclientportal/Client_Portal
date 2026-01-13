'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTemplate, getTemplateVariables, preloadTemplate } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { NewTemplate, EmailTemplateType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useRouter } from 'next/navigation';

export function AddTemplateForm() {
  const { activeProfileId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateTypes, setTemplateTypes] = useState<EmailTemplateType[]>([]);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplateTypes = async () => {
      if (activeProfileId && token) {
        try {
          const res = await getTemplateVariables(token);
          if (res.success && res.data) {
            setTemplateTypes(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch template types", error);
        }
      }
    };

    fetchTemplateTypes();
  }, [activeProfileId, token]);

  useEffect(() => {
    const preload = async () => {
      if (selectedTemplateType && activeProfileId && token) {
        try {
          const res = await preloadTemplate(activeProfileId, selectedTemplateType, token);
          if (res.success && res.data) {
            setName(res.data.name);
            setSubject(res.data.subject);
            setBody(res.data.body);
          }
        } catch (error) {
          console.error("Failed to preload template", error);
        }
      }
    };

    preload();
  }, [selectedTemplateType, activeProfileId, token]);

  const handleSubmit = async () => {
    if (!activeProfileId || !token) return;

    if (!selectedTemplateType) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a template type.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newTemplate: NewTemplate = {
        name,
        subject,
        body,
        templateId: parseInt(selectedTemplateType)
      };
      const response = await createTemplate(activeProfileId, token, newTemplate);
      if (response.success) {
        toast({ title: 'Success', description: response.message || 'Template created successfully.' });
        router.push('/dashboard/templates');
      }
      else {
        toast({ title: 'Error', description: response.message || 'Template not created successfully.' });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create template.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="rounded-3xl dark:shadow-dark-md shadow-md bg-background p-6 relative w-full break-words">
      <div className="flex flex-col sm:items-center sm:justify-between gap-4 mb-6 mt-5">
        <div className="grid grid-cols-1 gap-y-8 gap-x-10 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" placeholder="Template Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="templateType">Template Type</Label>
            <Select value={selectedTemplateType} onValueChange={setSelectedTemplateType}>
              <SelectTrigger id="templateType">
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                {templateTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code.toString()}>
                    {type.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="body">Body</Label>
            <RichTextEditor value={body} onChange={setBody} />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={() => router.back()} variant="outline">Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </div>
  );
}
