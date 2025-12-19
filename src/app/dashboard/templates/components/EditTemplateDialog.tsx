'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateTemplate, getTemplateVariables } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Template, NewTemplate, EmailTemplateType } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EditTemplateDialogProps {
  isOpen: boolean;
  template: Template;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function EditTemplateDialog({ isOpen, template, onOpenChange, onSuccess }: EditTemplateDialogProps) {
  const { activeProfileId, token } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateTypes, setTemplateTypes] = useState<EmailTemplateType[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
      setSelectedTemplateId(template.templateId ? template.templateId.toString() : '');
    }
  }, [template]);

  useEffect(() => {
    const fetchTemplateTypes = async () => {
      if (isOpen && activeProfileId && token) {
        try {
          // Reusing getTemplateVariables to fetch template types based on previous context
          const res = await getTemplateVariables(activeProfileId, token);
          if (res.success && res.data) {
            setTemplateTypes(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch template types", error);
        }
      }
    };

    fetchTemplateTypes();
  }, [isOpen, activeProfileId, token]);

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
      const response = await updateTemplate(activeProfileId, template._id, token, updatedTemplate);
      if (response.success) {

        toast({ title: 'Success', description: response.message || 'Template updated successfully.' });
        onSuccess();
        onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>Template Name</Label>
          <Input placeholder="Template Name" value={name} onChange={(e) => setName(e.target.value)} />

          <div className="space-y-2">
            <Label>Template Type</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
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

          <Label>Subject</Label>
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Label>Body</Label>
          <Textarea ref={bodyRef} placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
