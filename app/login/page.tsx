import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_25%)]" />
      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-border/70 bg-card/90 shadow-lg backdrop-blur">
        <LoginForm />
      </div>
    </div>
  )
}
