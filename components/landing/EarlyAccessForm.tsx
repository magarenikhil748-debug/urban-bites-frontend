'use client'

import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { FormEvent, useState } from 'react'

type EarlyAccessFields = {
  cafeName: string
  ownerName: string
  contact: string
  location: string
  note: string
}

const initialFields: EarlyAccessFields = {
  cafeName: '',
  ownerName: '',
  contact: '',
  location: '',
  note: '',
}

export function EarlyAccessForm() {
  const [fields, setFields] = useState(initialFields)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field: keyof EarlyAccessFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
    setError('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    try {
      setSubmitting(true)
      setSubmitted(false)
      setError('')
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
        /\/$/,
        '',
      )
      const response = await fetch(`${apiBaseUrl}/api/v1/public/early-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, note: fields.note.trim() || undefined }),
      })
      const body = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(body.message || 'Unable to send your request right now.')
      }

      setSubmitted(true)
      setFields(initialFields)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to send your request right now.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="tavero-surface-light p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-black text-[#5d4639]">Cafe name</span>
          <input
            value={fields.cafeName}
            onChange={(event) => updateField('cafeName', event.target.value)}
            required
            maxLength={120}
            className="tavero-input-light min-h-13 text-sm"
            placeholder="Your cafe"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black text-[#5d4639]">Owner name</span>
          <input
            value={fields.ownerName}
            onChange={(event) => updateField('ownerName', event.target.value)}
            required
            maxLength={120}
            className="tavero-input-light min-h-13 text-sm"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black text-[#5d4639]">Phone or email</span>
          <input
            value={fields.contact}
            onChange={(event) => updateField('contact', event.target.value)}
            required
            maxLength={160}
            className="tavero-input-light min-h-13 text-sm"
            placeholder="How should we reach you?"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black text-[#5d4639]">Area / location</span>
          <input
            value={fields.location}
            onChange={(event) => updateField('location', event.target.value)}
            required
            maxLength={160}
            className="tavero-input-light min-h-13 text-sm"
            placeholder="Neighbourhood or city"
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-black text-[#5d4639]">Optional note</span>
        <textarea
          value={fields.note}
          onChange={(event) => updateField('note', event.target.value)}
          maxLength={600}
          rows={3}
          className="tavero-input-light resize-none py-3 text-sm"
          placeholder="Tell us what you want to improve"
        />
      </label>

      {submitted && (
        <div
          className="tavero-success-enter mt-4 flex items-start gap-3 rounded-2xl border border-[#7B9E6B]/25 bg-[#7B9E6B]/10 p-4 text-sm leading-6 text-[#254334]"
          role="status"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>Thanks — Tavero received your early access request.</p>
        </div>
      )}

      {error && (
        <p
          className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="tavero-button-dark tavero-cta-shine mt-5 min-h-14 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Sending request…' : 'Request Early Access'}
        {submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-[#7c685b]">
        We’ll review your request and reach out before listing your cafe.
      </p>
    </form>
  )
}
