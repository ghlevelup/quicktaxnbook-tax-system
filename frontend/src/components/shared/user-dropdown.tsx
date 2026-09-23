'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/auth-provider';
import { ROLE_LABELS } from '@/features/auth/types';
import { cn } from '@/libs/utils';
import { Icon } from '@/components/icons/app-icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface UserDropdownProps {
  hideEmailOnMobile?: boolean;
  onlyAvatar?: boolean;
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  profileHref?: string;
  onLogout?: () => void;
}

const initialsFor = (name: string | null, email: string | null): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
  }
  return email?.slice(0, 2).toUpperCase() || 'U';
};

export const UserDropdown = ({
  hideEmailOnMobile = false,
  onlyAvatar = false,
  align = 'end',
  contentClassName,
  profileHref,
  onLogout,
}: UserDropdownProps) => {
  const { user, signOut } = useAuth();
  const t = useTranslations('navigation');

  if (!user) return null;

  const displayName = user.displayName || user.email || 'User';
  const initials = initialsFor(user.displayName, user.email);

  const handleSignOut = async () => {
    await signOut();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/40 bg-background/40 backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-accent/40 focus:outline-hidden',
            onlyAvatar ? 'h-8 w-8 p-0' : 'gap-2 p-1',
          )}
        >
          <Avatar
            className={cn(
              'shrink-0',
              onlyAvatar ? 'h-7 w-7' : 'size-8 h-8 w-8',
            )}
          >
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback
              className={cn(
                'bg-primary/8 font-semibold text-primary',
                onlyAvatar ? 'text-[10px]' : 'text-xs',
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {!onlyAvatar && (
            <span
              className={cn(
                'max-w-[120px] truncate pe-2 text-xs font-medium text-foreground',
                hideEmailOnMobile ? 'hidden lg:inline-block' : 'inline-block',
              )}
            >
              {displayName}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn('w-64', contentClassName)}
        align={align}
      >
        <DropdownMenuLabel className="py-3 font-normal">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-xs">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full min-w-0 flex-col items-center justify-center gap-1 px-1">
              <span className="max-w-[180px] truncate text-sm font-semibold text-foreground">
                {displayName}
              </span>
              {user.email ? (
                <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              ) : null}
              <span className="mt-1 inline-flex shrink-0 items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {ROLE_LABELS[user.accountRole]}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileHref ? (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={profileHref}>
              <Icon name="userCircle" weight="fill" className="h-4 w-4" />
              <span>{t('profile')}</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => void handleSignOut()}
        >
          <Icon name="logout" weight="fill" className="h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
