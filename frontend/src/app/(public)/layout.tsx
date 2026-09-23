import type { ReactNode } from 'react';

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full min-w-0 flex-1 flex-col">
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
