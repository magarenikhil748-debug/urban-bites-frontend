'use client'

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Coffee,
  Compass,
  ExternalLink,
  HeartHandshake,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Store,
  Table2,
  Wifi,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { TaveroBrand } from '@/components/brand/TaveroBrand'
import { EarlyAccessForm } from './EarlyAccessForm'
import { LandingEffects } from './LandingEffects'

const discoveryChips = [
  'Date Cafes',
  'Work Cafes',
  'Study Cafes',
  'Hidden Gems',
  'Late Night Cafes',
  'Aesthetic Cafes',
  'Budget Cafes',
  'Rooftop Cafes',
  'Pet-Friendly Cafes',
  'Dessert Spots',
  'Coffee Roasters',
  'Brunch Cafes',
]

const liveFeatures = [
  [Store, 'Cafe discovery profile', 'Present your cafe, location, and current menu preview.'],
  [QrCode, 'QR menu ordering', 'Guests scan the secure QR placed on their table and order.'],
  [Table2, 'Table-based ordering', 'Every order is locked to the table encoded by its QR.'],
  [ReceiptText, 'Live order dashboard', 'Staff receive new orders and move them through service.'],
  [BookOpen, 'Menu management', 'Manage categories, items, prices, images, and availability.'],
  [LayoutDashboard, 'Table management', 'Create, edit, deactivate, and reactivate cafe tables.'],
  [MessageCircle, 'WhatsApp sharing', 'Share cafe profiles and menu links without extra tooling.'],
  [BadgeCheck, 'Admin approval control', 'Approve, suspend, and reactivate marketplace cafes.'],
  [
    ShieldCheck,
    'Public order protection',
    'Orders require a secure table QR and remain rate-limited.',
  ],
  [
    CheckCircle2,
    'Deployment-ready base',
    'Environment, migration, security, and pilot guides are ready.',
  ],
] as const

const roadmapFeatures = [
  'Bookings and reservations',
  'Offer campaigns',
  'Loyalty and repeat visit tools',
  'Saved cafes',
  'Advanced owner analytics',
  'AI menu import from photo or PDF',
]

const faqs = [
  [
    'What is Tavero?',
    'Tavero is a cafe discovery, QR ordering, and cafe operations platform built for modern cafes and their customers.',
  ],
  [
    'Is Tavero a food delivery app?',
    'No. Tavero is focused on cafe discovery, in-cafe QR ordering, and helping cafes turn visits into better operations.',
  ],
  [
    'Who is Tavero for?',
    'Customers who want to discover cafes, and cafe owners who want a marketplace profile, QR menu, and live order dashboard.',
  ],
  [
    'How does Tavero help cafe owners?',
    'It gives cafes a public profile, QR menu, table-based ordering, WhatsApp sharing, and a live dashboard to manage orders.',
  ],
  [
    'Can customers book tables through Tavero?',
    'Table booking is planned for the roadmap. The current MVP supports QR and table-based ordering.',
  ],
  [
    'Can cafes run offers?',
    'Offer campaigns are planned for early partners. The current MVP focuses on marketplace presence, QR ordering, and live operations.',
  ],
  [
    'Does Tavero take commissions?',
    'Pricing and the commission model are not finalized for MVP. Early partners can join the pilot and help shape the model.',
  ],
  [
    'Is Tavero only for cafes?',
    'Tavero starts with cafes, dessert shops, bakeries, and coffee spaces. Later it can expand to restaurants, lounges, and food courts.',
  ],
  [
    'Can I list my cafe during MVP?',
    'Yes. Early cafe partners can request access and test Tavero during the pilot phase.',
  ],
  [
    'When is Tavero launching in my area?',
    'Tavero is starting with pilot cafes first, then expanding area by area.',
  ],
] as const

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string
  title: string
  description?: string
  light?: boolean
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`text-xs font-black uppercase tracking-[0.23em] ${
          light ? 'text-[#f0c57a]' : 'text-[#a56128]'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-5xl ${
          light ? 'text-white' : 'text-[#33231a]'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 max-w-2xl text-base leading-7 ${
            light ? 'text-white/55' : 'text-[#6d594c]'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}

function HeroPreview() {
  return (
    <div className="relative mx-auto min-h-[35rem] w-full max-w-2xl lg:min-h-[40rem]">
      <div className="tavero-preview-card tavero-preview-left absolute left-0 top-5 w-[78%] max-w-[23rem] rounded-[2.2rem] border border-white/10 bg-[#f7f0e4] p-3 text-[#35241b] shadow-2xl shadow-black/30 sm:left-5">
        <div className="rounded-[1.7rem] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56128]">
                Find your cafe
              </p>
              <p className="mt-1 font-display text-2xl font-bold">What fits today?</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#392117] text-[#f0c57a]">
              <Compass size={19} />
            </span>
          </div>
          <div className="mt-4 flex gap-2 overflow-hidden">
            {['Date', 'Work', 'Study'].map((chip) => (
              <span
                key={chip}
                className="shrink-0 rounded-full bg-[#f4eadb] px-3 py-2 text-[10px] font-black"
              >
                {chip} cafes
              </span>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.4rem] bg-[#284139] text-white">
            <div className="h-28 bg-[radial-gradient(circle_at_20%_15%,rgba(240,197,122,0.55),transparent_34%),linear-gradient(135deg,#496a5d,#20362e)]" />
            <div className="p-4">
              <p className="font-display text-xl font-bold">A warm corner for slow coffee</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-white/55">
                <MapPin size={11} /> Cafe profile preview
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-xl bg-[#f0c57a] px-3 py-2 text-[10px] font-black text-[#2d1b12]">
                  View menu
                </span>
                <span className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black">
                  Open profile
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[9px] font-bold text-[#90786a]">
            Illustrative marketplace preview
          </p>
        </div>
      </div>

      <div className="tavero-preview-card tavero-preview-right absolute bottom-3 right-0 w-[75%] max-w-[24rem] rounded-[2.2rem] border border-white/10 bg-[#15221d] p-4 text-white shadow-2xl shadow-black/35">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f0c57a]">
              Tavero Partner
            </p>
            <p className="mt-1 text-xl font-black">Cafe operations</p>
          </div>
          <span className="rounded-full bg-[#75966d]/20 px-2.5 py-1 text-[9px] font-black text-[#b9d5b2]">
            LIVE
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            [ReceiptText, 'Live orders', 'Receive and update'],
            [QrCode, 'QR menu ready', 'Download and share'],
            [Table2, 'Table QR lock', 'Connected to orders'],
            [MessageCircle, 'WhatsApp sharing', 'Profile and menu'],
          ].map(([Icon, title, text]) => {
            const PreviewIcon = Icon as typeof ReceiptText
            return (
              <div key={title as string} className="rounded-2xl bg-white/[0.055] p-3">
                <PreviewIcon size={16} className="text-[#f0c57a]" />
                <p className="mt-3 text-xs font-black">{title as string}</p>
                <p className="mt-1 text-[9px] leading-4 text-white/35">{text as string}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#75966d]/20 bg-[#75966d]/10 p-3">
          <BadgeCheck size={17} className="text-[#b9d5b2]" />
          <div>
            <p className="text-[10px] font-black text-[#d8ead4]">Admin-approved visibility</p>
            <p className="mt-0.5 text-[9px] text-white/35">Public when approved and active</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaveroLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <main
      className="tavero-landing min-h-screen overflow-hidden bg-[#FAF7F2] text-[#2D2D2D]"
      data-tavero-landing
    >
      <LandingEffects />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#2C1810]/10 bg-[#FAF7F2]/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.75rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Tavero home" onClick={closeMobile}>
            <TaveroBrand compact />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {[
              ['/cafes', 'Explore Cafes'],
              ['#owners', 'For Cafe Owners'],
              ['#how-it-works', 'How It Works'],
              ['#early-access', 'Early Access'],
              ['#faq', 'FAQ'],
              ['/dashboard', 'Dashboard'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="tavero-nav-link rounded-xl px-3 py-2 text-sm font-bold text-[#654f42] transition hover:bg-[#EFE7DA] hover:text-[#2C1810]"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/admin/cafes"
              className="tavero-nav-link ml-1 rounded-xl px-3 py-2 text-xs font-black text-[#8d7567] hover:text-[#2C1810]"
            >
              Admin
            </Link>
            <Link
              href="#early-access"
              className="tavero-cta-shine ml-2 flex min-h-11 items-center rounded-2xl bg-[#2C1810] px-5 text-sm font-black text-[#fff8ec] transition hover:-translate-y-0.5 hover:bg-[#3b2117]"
            >
              List Your Cafe
            </Link>
          </nav>
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2C1810]/10 bg-white text-[#2C1810] transition hover:border-[#C17F3E]/30 hover:bg-[#EFE7DA] lg:hidden"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <nav
            className="border-t border-[#2C1810]/10 bg-[#FAF7F2] px-4 py-4 shadow-xl lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {[
                ['/cafes', 'Explore Cafes'],
                ['#owners', 'For Cafe Owners'],
                ['#how-it-works', 'How It Works'],
                ['#early-access', 'Early Access'],
                ['#faq', 'FAQ'],
                ['/dashboard', 'Dashboard'],
                ['/admin/cafes', 'Admin'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  className="min-h-11 rounded-xl px-3 py-3 text-sm font-black text-[#594236] transition hover:bg-[#EFE7DA]"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="#early-access"
                onClick={closeMobile}
                className="tavero-cta-shine mt-2 flex min-h-12 items-center justify-center rounded-2xl bg-[#2C1810] px-5 text-sm font-black text-white"
              >
                List Your Cafe
              </Link>
            </div>
          </nav>
        )}
      </header>

      <section className="relative overflow-hidden bg-[#2d1b13] pb-20 pt-32 text-white sm:pt-36 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(240,197,122,0.2),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(117,150,109,0.2),transparent_28%)]" />
        <div className="absolute -left-28 top-48 h-80 w-80 rounded-full border border-white/[0.05]" />
        <div className="absolute -right-32 top-24 h-[30rem] w-[30rem] rounded-full border border-white/[0.05]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div>
            <p className="tavero-hero-enter inline-flex items-center gap-2 rounded-full border border-[#F2C572]/20 bg-[#F2C572]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#f7dca9]">
              <Sparkles size={13} />
              Built for modern cafe discovery and service
            </p>
            <h1 className="tavero-hero-enter tavero-hero-enter-delay-1 mt-7 max-w-4xl font-display text-5xl font-bold leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Turn cafe discovery into
              <span className="block text-[#f0c57a]">real customers.</span>
            </h1>
            <p className="tavero-hero-enter tavero-hero-enter-delay-2 mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
              Tavero helps people discover cafes by vibe, occasion, and menu — then scan the secure
              QR on their table and order without downloading an app.
            </p>
            <p className="mt-4 max-w-2xl border-l-2 border-[#75966d] pl-4 text-sm leading-6 text-white/48">
              For cafe owners, Tavero turns discovery into live orders, QR ordering, WhatsApp
              sharing, and a dashboard your team can actually use.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#early-access"
                className="tavero-cta-shine flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#F2C572] px-6 font-black text-[#2C1810] transition hover:-translate-y-0.5 hover:bg-[#f7d99f] hover:shadow-[0_16px_40px_rgba(193,127,62,0.3)]"
              >
                List Your Cafe <ArrowRight size={17} />
              </Link>
              <Link
                href="/cafes"
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#F2C572]/30 hover:bg-white/10"
              >
                <Compass size={18} />
                Explore Cafes
              </Link>
            </div>
            <p className="mt-6 max-w-2xl text-xs leading-5 text-white/35">
              Launching first for modern cafes, dessert shops, bakeries, coffee spaces,
              student-friendly cafes, and premium local brands.
            </p>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section
        className="border-b border-[#4b301f]/10 bg-[#f2e7d8] py-5"
        aria-label="Cafe discovery ideas"
      >
        <div className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
          {discoveryChips.map((chip) => (
            <span key={chip} className="tavero-chip shrink-0">
              {chip}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" data-tavero-reveal>
        <SectionHeading
          eyebrow="The gap cafe owners feel"
          title="Cafes are visible everywhere, but customers still slip away."
          description="Attention is scattered across platforms. Tavero connects cafe discovery and menu preview to secure QR ordering once a guest is seated."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              MessageCircle,
              'Instagram',
              'Great for attention, but views rarely open a direct table-order flow.',
            ],
            [
              MapPin,
              'Google Maps',
              'Useful for search, but your cafe sits beside every other nearby listing.',
            ],
            [
              CircleDollarSign,
              'Food apps',
              'Useful for delivery, but often shaped around discounts and commissions.',
            ],
            [
              Store,
              'Walk-ins',
              'Valuable, but unpredictable and disconnected from your digital presence.',
            ],
          ].map(([Icon, title, text]) => {
            const ProblemIcon = Icon as typeof Store
            return (
              <article
                key={title as string}
                className="rounded-[1.7rem] border border-[#4a2e1d]/[0.08] bg-white p-5 shadow-[0_16px_45px_rgba(72,43,25,0.06)]"
              >
                <ProblemIcon size={20} className="text-[#a56128]" />
                <h3 className="mt-5 text-lg font-black">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-[#735f52]">{text as string}</p>
              </article>
            )
          })}
        </div>
        <div className="mt-5 rounded-[2rem] bg-[#392117] p-6 text-white sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f0c57a]">
            The Tavero bridge
          </p>
          <p className="mt-3 max-w-4xl font-display text-3xl font-bold leading-tight">
            Get discovered, open the real menu, make QR ordering simple, and manage the resulting
            orders live.
          </p>
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-[#EFE7DA] px-4 py-20 sm:px-6 lg:py-28"
        data-tavero-reveal
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How Tavero works"
            title="One clear path for guests. One practical flow for cafe teams."
            description="The marketplace and operating dashboard are connected, without pretending discovery alone runs the cafe."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[
              {
                label: 'Customer flow',
                icon: Compass,
                steps: [
                  'Discover a cafe',
                  'Open the cafe profile',
                  'View the current menu',
                  'Preview the menu before visiting',
                  'Scan the QR on the table',
                  'Place the order',
                ],
              },
              {
                label: 'Cafe owner flow',
                icon: LayoutDashboard,
                steps: [
                  'Manage the cafe profile',
                  'Manage menu and tables',
                  'Generate secure table QR codes',
                  'Share profile or menu on WhatsApp',
                  'Receive orders live',
                  'Update order status',
                ],
              },
            ].map((flow) => (
              <article
                key={flow.label}
                className="rounded-[2rem] border border-[#4c3020]/[0.08] bg-[#fbf7ef] p-5 sm:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#392117] text-[#f0c57a]">
                    <flow.icon size={21} />
                  </span>
                  <h3 className="text-xl font-black">{flow.label}</h3>
                </div>
                <ol className="mt-7 space-y-3">
                  {flow.steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex items-center gap-3 rounded-2xl border border-[#4a2e1d]/[0.07] bg-white px-4 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#75966d]/15 text-[10px] font-black text-[#496344]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-[#5f493c]">{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" data-tavero-reveal>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Marketplace personality"
            title="A marketplace built around why people visit cafes."
            description="These are collection directions for the Tavero marketplace—not claims that every collection is fully indexed today."
          />
          <Link href="/cafes" className="tavero-button-dark tavero-cta-shine w-fit text-sm">
            Explore Tavero Marketplace <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [HeartHandshake, 'Best Cafes for First Dates', 'Warm, conversational spaces'],
            [Wifi, 'Work Cafes with WiFi', 'Settle in and get things done'],
            [Sparkles, 'Aesthetic Cafes Under ₹500', 'Visual character without the splurge'],
            [Compass, 'Hidden Gems in Your Area', 'Local places worth discovering'],
            [Clock3, 'Late Night Coffee Spots', 'Coffee after the usual hours'],
            [Coffee, 'Dessert Places for Weekends', 'A sweet reason to step out'],
            [BookOpen, 'Quiet Study Corners', 'Calmer spaces for focused time'],
            [Leaf, 'Coffee Spaces to Chill', 'Slow cups and unhurried tables'],
          ].map(([Icon, title, text], index) => {
            const CollectionIcon = Icon as typeof Coffee
            return (
              <article
                key={title as string}
                className={`group min-h-52 rounded-[1.8rem] p-5 transition hover:-translate-y-1 ${
                  index % 3 === 0
                    ? 'bg-[#2f473d] text-white'
                    : index % 3 === 1
                      ? 'bg-[#efd8b2] text-[#3b271c]'
                      : 'bg-[#392117] text-white'
                }`}
              >
                <CollectionIcon
                  size={21}
                  className={index % 3 === 1 ? 'text-[#9c5d26]' : 'text-[#f0c57a]'}
                />
                <h3 className="mt-16 font-display text-2xl font-bold leading-tight">
                  {title as string}
                </h3>
                <p
                  className={`mt-2 text-xs leading-5 ${
                    index % 3 === 1 ? 'text-[#755442]' : 'text-white/48'
                  }`}
                >
                  {text as string}
                </p>
                <p className="mt-4 text-[9px] font-black uppercase tracking-[0.17em] opacity-45">
                  Collection preview
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="owners"
        className="bg-[#2C1810] px-4 py-20 text-white sm:px-6 lg:py-28"
        data-tavero-reveal
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Live in the MVP"
            title="Real tools behind the warm marketplace."
            description="Every capability in this grid exists in the current product foundation."
            light
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {liveFeatures.map(([Icon, title, description]) => (
              <article
                key={title}
                className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.045] p-5"
              >
                <Icon size={20} className="text-[#f0c57a]" />
                <p className="mt-5 font-black">{title}</p>
                <p className="mt-2 text-xs leading-5 text-white/42">{description}</p>
                <span className="mt-5 inline-flex rounded-full bg-[#75966d]/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#b9d5b2]">
                  Live
                </span>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] border border-[#f0c57a]/15 bg-[#f0c57a]/[0.07] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f0c57a]">
              Coming soon for early partners
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roadmapFeatures.map((feature) => (
                <p
                  key={feature}
                  className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/10 px-4 py-3 text-sm font-bold text-white/58"
                >
                  <Clock3 size={15} className="text-[#f0c57a]" />
                  {feature}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EFE7DA] px-4 py-20 sm:px-6 lg:py-28" data-tavero-reveal>
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Tavero Partner"
            title="Run the cafe from a dashboard your team can read at a glance."
            description="New orders, kitchen progress, menu availability, tables, QR sharing, and marketplace visibility stay in one operational workspace."
          />
          <div className="rounded-[2rem] border border-white bg-[#101a16] p-4 text-white shadow-2xl shadow-[#563824]/20 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f0c57a]">
                  Tavero Partner
                </p>
                <p className="mt-1 text-xl font-black">Order command center</p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black text-emerald-300">
                LIVE
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {['New orders', 'Preparing', 'Ready', 'Served'].map((label) => (
                <div key={label} className="rounded-2xl bg-white/[0.05] p-3">
                  <p className="text-[10px] font-bold text-white/38">{label}</p>
                  <p className="mt-3 text-sm font-black">
                    {label === 'New orders' ? 'Needs action' : 'Service stage'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl bg-[#f6efe3] p-4 text-[#33231a]">
                <div className="flex items-center justify-between">
                  <p className="font-black">QR order workflow</p>
                  <ReceiptText size={17} className="text-[#a56128]" />
                </div>
                <div className="mt-4 space-y-2">
                  {['Accept new order', 'Mark preparing', 'Mark ready', 'Serve table'].map(
                    (step, index) => (
                      <div
                        key={step}
                        className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5"
                      >
                        <span className="text-[9px] font-black text-[#a56128]">0{index + 1}</span>
                        <span className="text-xs font-bold">{step}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  [BookOpen, 'Menu availability'],
                  [Table2, 'Table status'],
                  [QrCode, 'QR sharing'],
                  [BadgeCheck, 'Approved visibility'],
                ].map(([Icon, text]) => {
                  const PanelIcon = Icon as typeof BookOpen
                  return (
                    <div
                      key={text as string}
                      className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/[0.05] px-4"
                    >
                      <PanelIcon size={16} className="text-[#f0c57a]" />
                      <span className="text-xs font-black">{text as string}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-dashed border-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                Coming soon
              </p>
              <p className="mt-2 text-xs text-white/42">
                Discovery insights, saved cafes, repeat visits, and offer redemptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" data-tavero-reveal>
        <SectionHeading
          eyebrow="A different role in the cafe stack"
          title="Tavero is not another food app. It is the discovery-to-order layer for cafes."
          description="Each platform has a useful job. Tavero connects cafe identity to direct menu access, table ordering, and live operations."
        />
        <div className="mt-10 overflow-x-auto rounded-[2rem] border border-[#4a2e1d]/10 bg-white shadow-sm">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#392117] text-white">
              <tr>
                <th className="p-4 font-black">Capability</th>
                {['Instagram', 'Google Maps', 'Food Apps', 'Tavero'].map((title) => (
                  <th key={title} className="p-4 text-center font-black">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Shows cafe personality', true, true, false, true],
                ['Discovery by vibe / occasion', true, false, false, 'Designed for'],
                ['Direct menu and order flow', false, false, true, true],
                ['QR table ordering', false, false, false, true],
                ['Live order operations', false, false, true, true],
                ['Marketplace approval control', false, false, true, true],
                ['Built specifically for cafes', false, false, false, true],
                ['High delivery commissions required', false, false, 'Often', false],
              ].map(([label, ...values], rowIndex) => (
                <tr key={label as string} className={rowIndex % 2 ? 'bg-[#fbf7ef]' : 'bg-white'}>
                  <th className="p-4 font-bold text-[#5d4639]">{label as string}</th>
                  {values.map((value, index) => (
                    <td key={`${label}-${index}`} className="p-4 text-center text-[#715c4f]">
                      {value === true ? (
                        <>
                          <Check size={16} className="mx-auto text-[#587653]" aria-hidden="true" />
                          <span className="sr-only">Yes</span>
                        </>
                      ) : value === false ? (
                        <span className="text-[#c6b7ab]">—</span>
                      ) : (
                        <span className="text-xs font-bold">{value as string}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="early-access"
        className="bg-[#EFE7DA] px-4 py-20 sm:px-6 lg:py-28"
        data-tavero-reveal
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Early cafe network"
            title="Early cafe partners get priority visibility."
            description="No fixed public pricing yet. The pilot is about proving discovery, QR ordering, and day-to-day usefulness with real cafe teams."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              {
                title: 'Starter Access',
                badge: 'Live MVP',
                items: [
                  'Cafe profile',
                  'Marketplace listing',
                  'QR menu',
                  'Basic order dashboard',
                  'WhatsApp sharing',
                ],
              },
              {
                title: 'Growth Roadmap',
                badge: 'Coming soon',
                items: [
                  'Featured collections',
                  'Offer campaigns',
                  'Booking and inquiry tools',
                  'Loyalty tools',
                  'Advanced insights',
                ],
              },
              {
                title: 'Premium Launch Support',
                badge: 'Pilot support',
                items: [
                  'Setup guidance',
                  'QR poster and table setup',
                  'Multi-location readiness',
                  'Pilot feedback loop',
                  'Priority roadmap input',
                ],
              },
            ].map((tier) => (
              <article
                key={tier.title}
                className="rounded-[1.8rem] border border-[#4a2e1d]/[0.08] bg-[#fbf7ef] p-6"
              >
                <span className="rounded-full bg-[#75966d]/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#496344]">
                  {tier.badge}
                </span>
                <h3 className="mt-5 font-display text-3xl font-bold">{tier.title}</h3>
                <div className="mt-6 space-y-3">
                  {tier.items.map((item) => (
                    <p
                      key={item}
                      className="flex items-start gap-2 text-sm font-bold text-[#685346]"
                    >
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#75966d]" />
                      {item}
                    </p>
                  ))}
                </div>
                <Link
                  href="#early-access-form"
                  className="mt-7 flex min-h-12 items-center justify-center rounded-2xl border border-[#2C1810]/15 px-4 text-sm font-black text-[#2C1810] transition hover:-translate-y-0.5 hover:border-[#C17F3E]/35 hover:bg-white"
                >
                  Join Early Access
                </Link>
              </article>
            ))}
          </div>

          <div
            id="early-access-form"
            className="mt-12 grid items-start gap-10 scroll-mt-28 lg:grid-cols-[0.8fr_1.2fr]"
          >
            <div className="pt-4">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a56128]">
                Request a pilot spot
              </p>
              <h3 className="mt-3 font-display text-4xl font-bold leading-tight">
                Bring your cafe into the first Tavero network.
              </h3>
              <p className="mt-4 text-base leading-7 text-[#6d594c]">
                Early partners get launch visibility, setup guidance, a direct feedback loop, and
                product influence before wider rollout.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[
                  'Real QR ordering flow',
                  'Live staff dashboard',
                  'Admin-approved marketplace',
                  'WhatsApp-ready sharing',
                  'Built for local cafe pilots',
                  'No app download required',
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-2 rounded-2xl bg-white/55 px-4 py-3 text-xs font-black text-[#5e493c]"
                  >
                    <Check size={15} className="text-[#587653]" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <EarlyAccessForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" data-tavero-reveal>
        <SectionHeading
          eyebrow="Honest launch proof"
          title="Built for independent cafe pilots, not inflated launch numbers."
          description="Tavero is designed for dessert shops, bakeries, coffee houses, student-friendly spaces, and premium local cafe brands."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            [
              QrCode,
              'Real ordering flow',
              'Scan the table QR, order, and see it on the dashboard.',
            ],
            [
              BadgeCheck,
              'Trusted marketplace control',
              'Only approved and active cafes appear publicly.',
            ],
            [
              HeartHandshake,
              'Product influence',
              'Pilot partners help shape what Tavero builds next.',
            ],
          ].map(([Icon, title, description]) => {
            const TrustIcon = Icon as typeof QrCode
            return (
              <article
                key={title as string}
                className="rounded-[1.8rem] border border-[#4a2e1d]/[0.08] bg-white p-6"
              >
                <TrustIcon size={23} className="text-[#a56128]" />
                <h3 className="mt-7 text-xl font-black">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-[#715d50]">{description as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="faq"
        className="bg-[#2C1810] px-4 py-20 text-white sm:px-6 lg:py-28"
        data-tavero-reveal
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Questions before the pilot"
            title="Straight answers about what Tavero is today."
            light
          />
          <div className="mt-10 space-y-3">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="tavero-faq group rounded-[1.5rem] border border-white/[0.08] bg-white/[0.045] p-5 transition open:border-[#F2C572]/20 open:bg-white/[0.07]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">
                  {question}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-[#f0c57a] transition group-open:rotate-180"
                  />
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F2C572] px-4 py-20 sm:px-6" data-tavero-reveal>
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#81501f]">
            Early partner network
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-[#321d13] sm:text-6xl">
            Be one of the first cafes discovered on Tavero.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#65452f]">
            Join the early cafe network and get priority visibility before Tavero launches publicly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="#early-access"
              className="tavero-cta-shine flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#2C1810] px-6 font-black text-white transition hover:-translate-y-0.5 hover:bg-[#3b2117]"
            >
              List Your Cafe <ArrowRight size={17} />
            </Link>
            <Link
              href="/cafes"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#2C1810]/15 bg-white/35 px-6 font-black text-[#2C1810] transition hover:-translate-y-0.5 hover:bg-white/55"
            >
              Explore Cafes <ExternalLink size={16} />
            </Link>
          </div>
          <p className="mt-5 text-xs font-bold text-[#79543a]">
            No heavy setup. No generic listing. Built for cafes that want real visits and smoother
            table ordering.
          </p>
        </div>
      </section>

      <footer className="bg-[#21130d] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <TaveroBrand inverse />
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/38">
              Turn cafe discovery into visits, QR orders, and a calmer live service workflow.
            </p>
          </div>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-white/55"
            aria-label="Footer navigation"
          >
            <Link href="/cafes" className="hover:text-white">
              Marketplace
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/cafes" className="hover:text-white">
              Admin
            </Link>
            <Link href="#owners" className="hover:text-white">
              For Cafe Owners
            </Link>
            <Link href="#early-access" className="hover:text-white">
              Early Access
            </Link>
            <Link href="#faq" className="hover:text-white">
              FAQ
            </Link>
          </nav>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-2 border-t border-white/[0.07] pt-5 text-[10px] font-bold uppercase tracking-[0.17em] text-white/24 sm:flex-row">
          <p>Tavero MVP</p>
          <p>Discover. Scan. Order.</p>
        </div>
      </footer>
    </main>
  )
}
