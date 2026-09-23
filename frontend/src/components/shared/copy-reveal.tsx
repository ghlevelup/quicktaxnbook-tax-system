'use client';

import { Icon } from '@/components/icons/app-icons';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface CopyRevealProps {
  label: string;
  value: string;
  description?: string;
}

export function CopyReveal({ label, value, description }: CopyRevealProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select and copy manually');
    }
  };

  return (
    <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
      <div className="flex items-center gap-2 text-warning">
        <Icon name="warning" weight="fill" className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium">{label} — shown only once</p>
      </div>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-sm select-all">
          {value}
        </code>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => void onCopy()}
          aria-label="Copy"
        >
          <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
