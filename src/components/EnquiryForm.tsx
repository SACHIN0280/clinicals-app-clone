import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface FormData {
  full_name: string
  phone: string
  city: string
}

interface FormErrors {
  full_name?: string
  phone?: string
  city?: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.full_name.trim()) {
    errors.full_name = 'Full name is required.'
  } else if (data.full_name.trim().length < 2) {
    errors.full_name = 'Name must be at least 2 characters.'
  }
  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!/^\d{10}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Enter a valid 10-digit phone number.'
  }
  if (!data.city.trim()) {
    errors.city = 'City is required.'
  }
  return errors
}

function SuccessView({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-8 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">You're on the list!</h2>
        <p className="text-slate-400 leading-relaxed max-w-xs">
          Thanks, <span className="text-white font-medium">{name}</span>. Our team will reach out to you shortly. Keep an eye on your phone!
        </p>
      </div>
      <div className="w-full h-px bg-slate-800" />
      <p className="text-slate-500 text-sm">Have questions? Contact us at <a href="mailto:hello@clinicals.in" className="text-indigo-400 underline">hello@clinicals.in</a></p>
    </div>
  )
}

export function EnquiryForm() {
  const [form, setForm] = useState<FormData>({ full_name: '', phone: '', city: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [state, setState] = useState<FormState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // For phone: only allow digits and spaces
    if (name === 'phone') {
      const cleaned = value.replace(/[^\d\s]/g, '')
      setForm(prev => ({ ...prev, phone: cleaned }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    // Re-validate touched fields inline
    if (touched[name]) {
      const newErrors = validate({ ...form, [name]: value })
      setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const newErrors = validate(form)
    setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Touch all fields to show any remaining errors
    setTouched({ full_name: true, phone: true, city: true })
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setState('submitting')
    setSubmitError(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('enquiries') as any).insert({
      full_name: form.full_name.trim(),
      phone: form.phone.replace(/\s/g, ''),
      city: form.city.trim(),
      stage: 'new',
    })
    if (error) {
      setSubmitError('Something went wrong. Please try again.')
      setState('error')
    } else {
      setState('success')
    }
  }

  if (state === 'success') {
    return <SuccessView name={form.full_name.trim()} />
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-slate-300">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          placeholder="Priya Sharma"
          value={form.full_name}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-describedby={errors.full_name ? 'full_name-error' : undefined}
          aria-invalid={!!errors.full_name}
          className={`w-full px-4 py-3 rounded-xl bg-slate-800/60 border text-white placeholder-slate-500 outline-none transition-all duration-200 text-base
            ${errors.full_name
              ? 'border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
            }`}
        />
        {errors.full_name && (
          <p id="full_name-error" role="alert" className="text-red-400 text-xs flex items-center gap-1 animate-fade-in">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.full_name}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-slate-300">
          Phone Number <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base font-medium select-none">+91</span>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            placeholder="98765 43210"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={11}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={!!errors.phone}
            className={`w-full pl-14 pr-4 py-3 rounded-xl bg-slate-800/60 border text-white placeholder-slate-500 outline-none transition-all duration-200 text-base
              ${errors.phone
                ? 'border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
          />
        </div>
        {errors.phone && (
          <p id="phone-error" role="alert" className="text-red-400 text-xs flex items-center gap-1 animate-fade-in">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.phone}
          </p>
        )}
      </div>

      {/* City */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="text-sm font-medium text-slate-300">
          City <span className="text-red-400">*</span>
        </label>
        <input
          id="city"
          name="city"
          type="text"
          autoComplete="address-level2"
          placeholder="Mumbai"
          value={form.city}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-describedby={errors.city ? 'city-error' : undefined}
          aria-invalid={!!errors.city}
          className={`w-full px-4 py-3 rounded-xl bg-slate-800/60 border text-white placeholder-slate-500 outline-none transition-all duration-200 text-base
            ${errors.city
              ? 'border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
            }`}
        />
        {errors.city && (
          <p id="city-error" role="alert" className="text-red-400 text-xs flex items-center gap-1 animate-fade-in">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.city}
          </p>
        )}
      </div>

      {/* Submit Error */}
      {submitError && (
        <div role="alert" className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <button
        id="submit-enquiry"
        type="submit"
        disabled={state === 'submitting'}
        className="mt-2 w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
          text-white font-semibold text-base transition-all duration-200 
          disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
          flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
      >
        {state === 'submitting' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            Apply Now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
