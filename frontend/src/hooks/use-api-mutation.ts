'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from '@/libs/api-client';

type MutationResult<TData> = { message: string; data: TData };

interface UseApiMutationOptions<
  TData,
  TVariables,
  TFormValues extends FieldValues = FieldValues,
> extends Omit<
  UseMutationOptions<MutationResult<TData>, ApiError, TVariables>,
  'mutationFn'
> {
  mutationFn: (variables: TVariables) => Promise<MutationResult<TData>>;
  /** Attach the form so field-level server errors land on the right input. */
  form?: UseFormReturn<TFormValues>;
  /** Override the toast text; pass `false` to suppress the success toast entirely. */
  successMessage?: string | false;
  onSuccessData?: (data: TData, message: string) => void;
}

/**
 * Wraps useMutation with the app's standard success/error UX: a sonner toast
 * using the backend's own message, and field-level errors mapped straight
 * onto the form. Every mutation in the app should go through this.
 */
export function useApiMutation<
  TData,
  TVariables,
  TFormValues extends FieldValues = FieldValues,
>({
  mutationFn,
  form,
  successMessage,
  onSuccessData,
  onError,
  onSuccess,
  ...rest
}: UseApiMutationOptions<TData, TVariables, TFormValues>) {
  return useMutation<MutationResult<TData>, ApiError, TVariables>({
    mutationFn,
    onSuccess: (result, variables, onMutateResult, context) => {
      if (successMessage !== false) {
        toast.success(successMessage || result.message);
      }
      onSuccessData?.(result.data, result.message);
      onSuccess?.(result, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      let mappedToForm = false;
      if (form && error.errors?.length) {
        for (const fieldError of error.errors) {
          const fieldName = fieldError.path.replace(
            /^body\./,
            '',
          ) as Path<TFormValues>;
          form.setError(fieldName, {
            type: 'server',
            message: fieldError.message,
          });
          mappedToForm = true;
        }
      }
      if (!mappedToForm) {
        toast.error(error.message);
      }
      onError?.(error, variables, onMutateResult, context);
    },
    ...rest,
  });
}
