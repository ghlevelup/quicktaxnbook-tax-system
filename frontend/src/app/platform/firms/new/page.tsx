'use client';

import { Icon } from '@/components/icons/app-icons';
import { CopyReveal } from '@/components/shared/copy-reveal';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import {
  onboardFirmSchema,
  type OnboardFirmInput,
} from '@/features/platform/schemas/onboard-firm';
import { useOnboardFirm } from '@/features/platform/hooks/use-platform';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface OnboardResult {
  firmId: string;
  firmName: string;
  adminEmail: string;
  temporaryPassword: string;
}

export default function NewFirmPage() {
  const [result, setResult] = useState<OnboardResult | null>(null);

  const form = useForm<OnboardFirmInput>({
    resolver: zodResolver(onboardFirmSchema),
    defaultValues: {
      firm: {
        legalName: '',
        displayName: '',
        ein: '',
        licenseNumber: '',
        licenseType: '',
        website: '',
        domain: '',
        email: '',
        phone: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US',
        },
      },
      owner: { firstName: '', lastName: '', email: '', phone: '', ssn: '' },
    },
  });

  const onboardFirm = useOnboardFirm(form);
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => {
    onboardFirm.mutate(values, {
      onSuccess: ({ data }) => {
        setResult({
          firmId: data.firm.id,
          firmName: data.firm.name,
          adminEmail: data.admin.email,
          temporaryPassword: data.temporaryPassword,
        });
      },
    });
  });

  if (result) {
    return (
      <PageLayout className="mx-auto max-w-2xl">
        <PageHeader
          title="Firm onboarded"
          subtitle={`${result.firmName} is ready to go.`}
        />
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-success">
              <Icon name="checkCircle" weight="fill" className="h-5 w-5" />
              <p className="text-sm font-medium">
                Firm admin account created for {result.adminEmail}
              </p>
            </div>
            <CopyReveal
              label="Temporary password"
              value={result.temporaryPassword}
              description="Share this with the firm admin however you prefer."
            />
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/platform/firms/${result.firmId}`}>View firm</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  form.reset();
                }}
              >
                Onboard another firm
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="mx-auto max-w-3xl">
      <PageHeader
        title="Onboard a firm"
        subtitle="Provide the firm's business info and its owner's details. At least the EIN or the owner's SSN is required to uniquely identify this firm."
      />

      <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Business information</CardTitle>
            <CardDescription>
              The firm's legal and public-facing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="firm.legalName">Legal business name *</Label>
              <Input id="firm.legalName" {...form.register('firm.legalName')} />
              <InputError message={errors.firm?.legalName?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.displayName">Display name</Label>
              <Input
                id="firm.displayName"
                placeholder="Defaults to legal name"
                {...form.register('firm.displayName')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.ein">EIN</Label>
              <Input
                id="firm.ein"
                placeholder="12-3456789"
                {...form.register('firm.ein')}
              />
              <InputError message={errors.firm?.ein?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.licenseType">License type</Label>
              <Input
                id="firm.licenseType"
                placeholder="CTEC, EA, CPA..."
                {...form.register('firm.licenseType')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.licenseNumber">License number</Label>
              <Input
                id="firm.licenseNumber"
                {...form.register('firm.licenseNumber')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.website">Website</Label>
              <Input
                id="firm.website"
                placeholder="https://"
                {...form.register('firm.website')}
              />
              <InputError message={errors.firm?.website?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.domain">Domain</Label>
              <Input
                id="firm.domain"
                placeholder="firm.example.com"
                {...form.register('firm.domain')}
              />
              <InputError message={errors.firm?.domain?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.email">Business email</Label>
              <Input
                id="firm.email"
                type="email"
                {...form.register('firm.email')}
              />
              <InputError message={errors.firm?.email?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.phone">Business phone</Label>
              <Input
                id="firm.phone"
                type="tel"
                {...form.register('firm.phone')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business office location</CardTitle>
            <CardDescription>Optional, but recommended.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="firm.address.line1">Address line 1</Label>
              <Input
                id="firm.address.line1"
                {...form.register('firm.address.line1')}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="firm.address.line2">Address line 2</Label>
              <Input
                id="firm.address.line2"
                {...form.register('firm.address.line2')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.address.city">City</Label>
              <Input
                id="firm.address.city"
                {...form.register('firm.address.city')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.address.state">State</Label>
              <Input
                id="firm.address.state"
                placeholder="CA"
                {...form.register('firm.address.state')}
              />
              <InputError message={errors.firm?.address?.state?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.address.postalCode">Postal code</Label>
              <Input
                id="firm.address.postalCode"
                placeholder="12345"
                {...form.register('firm.address.postalCode')}
              />
              <InputError message={errors.firm?.address?.postalCode?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="firm.address.country">Country</Label>
              <Input
                id="firm.address.country"
                {...form.register('firm.address.country')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firm owner (personal info)</CardTitle>
            <CardDescription>
              Becomes the Firm Admin login. Their password is generated and
              shown once after submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="owner.firstName">First name *</Label>
              <Input
                id="owner.firstName"
                {...form.register('owner.firstName')}
              />
              <InputError message={errors.owner?.firstName?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner.lastName">Last name *</Label>
              <Input id="owner.lastName" {...form.register('owner.lastName')} />
              <InputError message={errors.owner?.lastName?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner.email">Login email *</Label>
              <Input
                id="owner.email"
                type="email"
                {...form.register('owner.email')}
              />
              <InputError message={errors.owner?.email?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner.phone">Phone</Label>
              <Input
                id="owner.phone"
                type="tel"
                {...form.register('owner.phone')}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="owner.ssn">Social Security Number</Label>
              <Input
                id="owner.ssn"
                placeholder="123-45-6789"
                {...form.register('owner.ssn')}
              />
              <InputError message={errors.owner?.ssn?.message} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" loading={onboardFirm.isPending}>
            Onboard firm
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
