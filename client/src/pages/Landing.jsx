import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'No signup, just a nickname',
    description: 'Jump into any room instantly. No accounts, no passwords — just pick a name and start talking.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Rooms auto-expire',
    description: 'Every room has a countdown timer. When time is up, the conversation ends naturally with zero clutter.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[var(--color-forest)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Chat stays readable for 24h',
    description: 'Missed the live discussion? Archived rooms remain readable for a full day after they auto-expire.',
  },
]

export default function Landing() {
  return (
    <div className="relative">
      {/* ─── Hero Section (Zaiflu Light Style) ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
        {/* Top Label */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[var(--color-border-subtle)] bg-white text-xs font-bold uppercase tracking-wider text-[var(--color-forest)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[var(--color-active)]" />
          Real-time Ephemeral Discussions
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines & Action */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--color-forest)] leading-[1.1] tracking-tight">
              Connecting People With The <span className="underline decoration-[var(--color-accent-lime)] decoration-4 underline-offset-4">Right Voices</span>
            </h1>

            <p className="animate-fade-in-up text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              Create a room, share the link, and talk while it matters. No sign-up required — fast, lightweight, and temporary.
            </p>

            <div className="animate-fade-in-up flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/create" className="btn-primary text-xs font-bold uppercase tracking-wider py-3.5 px-7">
                Create a Room
              </Link>
              <Link to="/browse" className="btn-secondary text-xs font-bold uppercase tracking-wider py-3.5 px-7">
                Browse Active Rooms
              </Link>
            </div>

            {/* Quick stats rectangular box */}
            <div className="animate-fade-in-up grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border-subtle)]">
              <div className="p-3 bg-white border border-[var(--color-border-subtle)] rounded-sm">
                <p className="text-2xl font-black text-[var(--color-forest)]">25+</p>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Active Rooms</p>
              </div>
              <div className="p-3 bg-white border border-[var(--color-border-subtle)] rounded-sm">
                <p className="text-2xl font-black text-[var(--color-forest)]">4M+</p>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Messages</p>
              </div>
              <div className="p-3 bg-[var(--color-bg-mint)] border border-[var(--color-border-subtle)] rounded-sm col-span-2 sm:col-span-1">
                <p className="text-2xl font-black text-[var(--color-forest)]">0</p>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Signups Needed</p>
              </div>
            </div>
          </div>

          {/* Right Column: Rectangular Live Chat Preview Box */}
          <div className="lg:col-span-5">
            <div className="p-4 sm:p-6 bg-[var(--color-bg-mint)] border border-[var(--color-border-subtle)] rounded-md shadow-sm">
              <div className="bg-white border border-[var(--color-border-subtle)] rounded-sm p-4 sm:p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[var(--color-active)] rounded-none" />
                    <span className="text-sm font-bold text-[var(--color-forest)]">Product Design Discussion</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--color-forest)] bg-[var(--color-accent-lime)] px-2 py-0.5 rounded-sm">
                    47:23 left
                  </span>
                </div>

                {/* Fake Messages */}
                <div className="space-y-3">
                  <FakeMessage name="Rahul" text="Should we simplify the room navigation bar?" time="3:42 PM" color="bg-[var(--color-forest)] text-[var(--color-accent-lime)]" />
                  <FakeMessage name="Priya" text="Yes! Keeping sharp rectangular layouts feels clean." time="3:42 PM" color="bg-[var(--color-accent-lime)] text-[var(--color-forest)]" />
                  <FakeMessage name="Arjun" text="Live countdown timers keep conversations focused." time="3:43 PM" color="bg-[var(--color-bg-input)] text-[var(--color-forest)]" />
                </div>

                {/* Fake Input */}
                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-9 rounded-sm bg-[var(--color-bg-input)] border border-[var(--color-border-subtle)] px-3 text-xs flex items-center text-[var(--color-text-muted)]">
                    Type a message...
                  </div>
                  <div className="h-9 px-4 rounded-sm bg-[var(--color-forest)] text-[var(--color-accent-lime)] font-bold text-xs flex items-center justify-center">
                    Send
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Callouts Section (Rectangular Cards) ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">About Our Platform</p>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-forest)] tracking-tight">
            Ephemeral Solutions For Modern Conversations
          </h2>
        </div>

        <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="animate-fade-in-up glass-card p-6 border border-[var(--color-border-subtle)] rounded-sm hover:border-[var(--color-forest)] transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-sm bg-[var(--color-bg-mint)] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-[var(--color-forest)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Zaiflu Dark Forest Contrast Section ─── */}
      <section className="bg-[var(--color-forest)] text-white py-16 sm:py-20 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-[var(--color-accent-lime)] text-[var(--color-forest)] text-xs font-extrabold uppercase tracking-wider mb-4 rounded-sm">
                Why Choose Huddle
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                Elevate Your Live Discussions Without The Clutter
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
                Most chat apps save endless history you will never re-read. Huddle brings back the natural magic of real-time presence with auto-expiring rooms.
              </p>
              <Link to="/create" className="btn-primary text-xs uppercase tracking-wider font-bold py-3 px-6">
                Start A Discussion Now
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-[var(--color-bg-dark-card)] border border-[rgba(255,255,255,0.1)] rounded-sm">
                <p className="text-3xl font-black text-[var(--color-accent-lime)] mb-1">100%</p>
                <p className="text-xs font-bold uppercase text-gray-300">Anonymous</p>
                <p className="text-xs text-gray-400 mt-1">No phone numbers or emails required.</p>
              </div>
              <div className="p-5 bg-[var(--color-bg-dark-card)] border border-[rgba(255,255,255,0.1)] rounded-sm">
                <p className="text-3xl font-black text-[var(--color-accent-lime)] mb-1">24h</p>
                <p className="text-xs font-bold uppercase text-gray-300">Archive Window</p>
                <p className="text-xs text-gray-400 mt-1">Read-only buffer before cleanup.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--color-border-subtle)] py-8 bg-[var(--color-bg-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-[var(--color-forest)] flex items-center justify-center text-[var(--color-accent-lime)] font-bold text-xs">
              H
            </div>
            <span className="text-sm font-bold text-[var(--color-forest)]">
              Huddle
            </span>
          </div>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            Rooms that exist only when they matter.
          </p>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            Huddle {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ─── Helper: Fake message for preview ─── */
function FakeMessage({ name, text, time, color }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex items-start gap-2.5 animate-slide-in">
      <div className={`w-6 h-6 rounded-sm ${color} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-bold text-[var(--color-forest)]">{name}</span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{time}</span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-tight">{text}</p>
      </div>
    </div>
  )
}

