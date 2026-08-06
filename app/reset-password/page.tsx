import { Suspense } from 'react';
import ResetPasswordPage from '@/src/components/auth/ResetPasswordPage';

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-sm text-slate-500">Loading...</div>}>
      <ResetPasswordPage mode="reset" />
    </Suspense>
  );
}
