'use client';

import { Badge } from '@/components/ui/badge';
import { CreateTeamMemberDialog } from '@/components/firm/create-team-member-dialog';
import { TeamMemberActions } from '@/components/firm/team-member-actions';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTeamMembers } from '@/features/team/hooks/use-team';
import { STAFF_TYPE_LABELS } from '@/features/team/types';

export function TeamList() {
  const { data, isPending } = useTeamMembers({ enabled: true });
  const members = data?.results ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="Team"
        subtitle="Preparers, reviewers, and support staff at your firm."
        actions={<CreateTeamMemberDialog />}
      />

      <Card flat className="overflow-hidden py-0">
        {isPending ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon="users"
            title="No team members yet"
            description="Add preparers, reviewers, or support staff to your firm."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const name =
                  `${member.user.firstName ?? ''} ${member.user.lastName ?? ''}`.trim();
                const initials =
                  (member.user.firstName?.[0] ?? '') +
                    (member.user.lastName?.[0] ?? '') || 'U';
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {name || member.user.email}
                            {member.isOwner ? (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (Owner)
                              </span>
                            ) : null}
                          </div>
                          {member.title ? (
                            <div className="text-xs text-muted-foreground">
                              {member.title}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{STAFF_TYPE_LABELS[member.staffType]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>{member.user.email}</div>
                      {member.user.phone ? (
                        <div className="text-xs">{member.user.phone}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === 'ACTIVE' ? 'success' : 'destructive'
                        }
                      >
                        {member.status === 'ACTIVE' ? 'Active' : 'Banned'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.user.lastLoginAt
                        ? new Date(member.user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <TeamMemberActions member={member} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageLayout>
  );
}
