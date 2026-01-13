'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateTemplate, getTemplateVariables, getTemplateById } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Template, NewTemplate, EmailTemplateType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useRouter } from 'next/navigation';

interface EditTemplateFormProps {
  templateId: string;
}

export function EditTemplateForm({ templateId }: EditTemplateFormProps) {
  const { activeProfileId, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateTypes, setTemplateTypes] = useState<EmailTemplateType[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (activeProfileId && token) {
        try {
          const response = await getTemplateById(activeProfileId, templateId, token);
          if (response.success && response.data) {
            const template = response.data;
            setName(template.name);
            setSubject(template.subject);
            setBody(template.body);
            setSelectedTemplateId(template.templateId ? template.templateId.toString() : '');
          }
        } catch (error) {
          console.error("Failed to fetch template", error);
        }
      }
    };

    fetchTemplate();
  }, [activeProfileId, token, templateId]);

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

  const handleSubmit = async () => {
    if (!activeProfileId || !token) return;

    if (!selectedTemplateId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a template type.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedTemplate: Partial<NewTemplate> = {
        name,
        subject,
        body,
        templateId: parseInt(selectedTemplateId)
      };
      const response = await updateTemplate(activeProfileId, templateId, token, updatedTemplate);
      if (response.success) {

        toast({ title: 'Success', description: response.message || 'Template updated successfully.' });
        router.push('/dashboard/templates');
      }
      else {
        toast({ title: 'Error', description: response.message || 'Template not updated successfully.' });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update template.',
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
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
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
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </div>
    </div>
  );
}
