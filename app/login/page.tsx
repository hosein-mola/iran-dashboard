import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="bg-background text-foreground relative isolate flex min-h-screen items-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-40 -left-40 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_68%)]" />
      <div className="pointer-events-none absolute -right-44 -bottom-44 -z-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--chart-2)_12%,transparent)_0%,transparent_70%)]" />
      <div className="mx-auto flex w-full max-w-6xl items-center">
        <LoginForm className="relative z-10" />
      </div>
    </div>
  )
}
