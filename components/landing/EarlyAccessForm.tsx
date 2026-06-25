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
      className="rounded-[2rem] border border-[#5a3a27]/10 bg-white p-5 shadow-[0_24px_70px_rgba(72,43,25,0.11)] sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-black text-[#5d4639]">Cafe name</span>
          <input
            value={fields.cafeName}
            onChange={(event) => updateField('cafeName', event.target.value)}
            required
            maxLength={120}
            className="min-h-13 w-full rounded-2xl border border-[#4a2e1d]/10 bg-[#faf6ee] px-4 text-sm text-[#33231a] outline-none transition focus:border-[#b77531]/50"
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
            className="min-h-13 w-full rounded-2xl border border-[#4a2e1d]/10 bg-[#faf6ee] px-4 text-sm text-[#33231a] outline-none transition focus:border-[#b77531]/50"
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
            className="min-h-13 w-full rounded-2xl border border-[#4a2e1d]/10 bg-[#faf6ee] px-4 text-sm text-[#33231a] outline-none transition focus:border-[#b77531]/50"
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
            className="min-h-13 w-full rounded-2xl border border-[#4a2e1d]/10 bg-[#faf6ee] px-4 text-sm text-[#33231a] outline-none transition focus:border-[#b77531]/50"
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
          className="w-full resize-none rounded-2xl border border-[#4a2e1d]/10 bg-[#faf6ee] px-4 py-3 text-sm text-[#33231a] outline-none transition focus:border-[#b77531]/50"
          placeholder="Tell us what you want to improve"
        />
      </label>

      {submitted && (
        <div
          className="mt-4 flex items-start gap-3 rounded-2xl border border-[#75966d]/20 bg-[#75966d]/10 p-4 text-sm leading-6 text-[#365033]"
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
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#392117] px-5 font-black text-[#fff7e9] transition hover:bg-[#4b2a1b]"
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
