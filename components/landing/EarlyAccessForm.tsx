'use client'

import { CheckCircle2, Send } from 'lucide-react'
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

  const updateField = (field: keyof EarlyAccessFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <form
      onSubmit={submit}
      className="tavero-surface-light p-5 sm:p-7"
    >
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
          <p>
            Thanks — Tavero early access request captured locally for demo. Connect a backend lead
            form before public launch.
          </p>
        </div>
      )}

      <button
        type="submit"
        className="tavero-button-dark tavero-cta-shine mt-5 min-h-14 w-full"
      >
        Request Early Access
        <Send size={17} />
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-[#7c685b]">
        Demo-only local form. No information is sent or stored yet.
      </p>
    </form>
  )
}
