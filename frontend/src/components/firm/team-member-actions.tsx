'use client';

import { Icon } from '@/components/icons/app-icons';
import { CopyReveal } from '@/components/shared/copy-reveal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useResetTeamMemberPassword,
  useSetTeamMemberStatus,
} from '@/features/team/hooks/use-team';
import type { TeamMember } from '@/features/team/types';
import { useState } from 'react';

type PendingAction = 'ban' | 'unban' | 'reset' | null;

export function TeamMemberActions({ member }: { member: TeamMember }) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [resetPassword, setResetPassword] = useState<string | null>(null);
  const setStatus = useSetTeamMemberStatus();
  const resetTeamMemberPassword = useResetTeamMemberPassword();

  const isActive = member.status === 'ACTIVE';

  const confirmStatusChange = () => {
    setStatus.mutate(
      { memberId: member.id, status: isActive ? 'DEACTIVATED' : 'ACTIVE' },
      { onSuccess: () => setPending(null) },
    );
  };

  const confirmReset = () => {
    resetTeamMemberPassword.mutate(
      { memberId: member.id },
      {
        onSuccess: ({ data }) => {
          setResetPassword(data.temporaryPassword);
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={member.isOwner}>
            <Icon name="moreVertical" className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPending('reset')}>
            <Icon name="key" className="h-4 w-4" /> Reset password
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              isActive ? 'text-destructive focus:text-destructive' : ''
            }
            onClick={() => setPending(isActive ? 'ban' : 'unban')}
          >
            <Icon name="ban" className="h-4 w-4" />{' '}
            {isActive ? 'Ban member' : 'Unban member'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={pending === 'ban' || pending === 'unban'}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isActive ? 'Ban this team member?' : 'Unban this team member?'}
            </DialogTitle>
            <DialogDescription>
              {isActive
                ? `${member.user.firstName} ${member.user.lastName} will be signed out and unable to log in.`
                : `${member.user.firstName} ${member.user.lastName} will be able to log in again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant={isActive ? 'destructive' : 'default'}
              size="sm"
              loading={setStatus.isPending}
              onClick={confirmStatusChange}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pending === 'reset'}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null);
            setResetPassword(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              {resetPassword
                ? 'Copy the new password now. It will not be shown again.'
                : `Generate a new password for ${member.user.firstName} ${member.user.lastName}? Their current password stops working immediately.`}
            </DialogDescription>
          </DialogHeader>
          {resetPassword ? (
            <CopyReveal label="New password" value={resetPassword} />
          ) : (
            <DialogFooter className="mt-2 flex-row justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size="sm"
                loading={resetTeamMemberPassword.isPending}
                onClick={confirmReset}
              >
                Reset password
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
