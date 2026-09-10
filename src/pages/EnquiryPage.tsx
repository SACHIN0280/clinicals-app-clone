import { EnquiryForm } from '../components/EnquiryForm'

export function EnquiryPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Clinicals</span>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1.5 leading-tight">
              Start your clinical journey
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fill in your details and our team will get in touch within 24 hours.
            </p>
          </div>

          <EnquiryForm />
        </div>

        {/* Team login link */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Team member?{' '}
          <a href="/login" className="text-slate-400 hover:text-white transition-colors">
            Sign in to dashboard →
          </a>
        </p>
      </div>
    </div>
  )
}
