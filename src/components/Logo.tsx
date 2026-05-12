import { Briefcase } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-primary">
      <Briefcase className="h-6 w-6" />
      <span className="font-headline">Udyami Hub</span>
    </div>
  );
}
