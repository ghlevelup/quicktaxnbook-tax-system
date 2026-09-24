import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/libs/utils';

interface PageLoaderProps {
  /** Fill the whole viewport (entry pages) instead of the space under the top bar. */
  fullscreen?: boolean;
  label?: string;
}

/** Centered spinner shown by every `loading.tsx` while a page is being fetched. */
export function PageLoader({ fullscreen = false, label }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3 text-muted-foreground',
        fullscreen ? 'min-h-svh bg-muted/70' : 'min-h-[60svh]',
      )}
    >
      <Spinner className="size-9 text-primary" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
