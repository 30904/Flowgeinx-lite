import { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingSidebar from '../components/LandingSidebar';
import MetricCard from '../components/MetricCard';
import FeaturePanelCard from '../components/FeaturePanelCard';
import Logo from '../components/Logo';

const METRICS = [
  {
    id: 'upload',
    label: 'Doc Types',
    sublabel: 'Supported',
    value: '12+',
    trend: 'Aadhaar, PAN & more',
    trendUp: true,
    iconBg: 'bg-teal/10 text-teal',
    sparkColor: '#00B4D8',
    sparkPoints: [0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'reminders',
    label: 'Reminders',
    sublabel: 'Automated',
    value: '3 alerts',
    trend: '30, 7 & 1 day before',
    trendUp: true,
    iconBg: 'bg-orange-500/10 text-orange-500',
    sparkColor: '#f97316',
    sparkPoints: [0.2, 0.4, 0.6, 0.5, 0.8, 0.7, 1],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'AI Extraction',
    sublabel: 'Accuracy',
    value: '99%',
    trend: 'Key fields auto-filled',
    trendUp: true,
    iconBg: 'bg-violet-500/10 text-violet-500',
    sparkColor: '#8b5cf6',
    sparkPoints: [0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.95],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    id: 'features',
    label: 'Free Tier',
    sublabel: 'Documents',
    value: '10',
    trend: 'No credit card needed',
    trendUp: true,
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    sparkColor: '#10b981',
    sparkPoints: [0.4, 0.3, 0.5, 0.6, 0.55, 0.7, 0.65],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    id: 'overview',
    label: 'Upload Speed',
    sublabel: 'Average',
    value: '<30s',
    trend: 'Extract & categorize',
    trendUp: true,
    iconBg: 'bg-blue-500/10 text-blue-500',
    sparkColor: '#3b82f6',
    sparkPoints: [0.8, 0.6, 0.5, 0.4, 0.35, 0.3, 0.25],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    id: 'auth',
    label: 'Sign In',
    sublabel: 'OTP only',
    value: '0 pwd',
    trend: 'Mobile number login',
    trendUp: true,
    iconBg: 'bg-rose-500/10 text-rose-500',
    sparkColor: '#f43f5e',
    sparkPoints: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
];

const DOC_TYPES = [
  { label: 'Aadhaar', pct: 28, color: 'bg-teal', count: 3 },
  { label: 'PAN', pct: 22, color: 'bg-blue-500', count: 2 },
  { label: 'Insurance', pct: 18, color: 'bg-violet-500', count: 2 },
  { label: 'Lease', pct: 12, color: 'bg-orange-500', count: 1 },
  { label: 'Other', pct: 20, color: 'bg-gray-400', count: 2 },
];

const SUGGESTIONS = [
  'When does my car insurance expire?',
  'Show all documents expiring this month',
  'What is my PAN number?',
  'List my identity documents',
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Landing() {
  const [activeSection, setActiveSection] = useState('overview');
  const [query, setQuery] = useState('');

  const handleMetricClick = (id) => {
    setActiveSection(id);
    if (id === 'auth') return;
    scrollToSection(id);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <LandingSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 bg-surface">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <Logo variant="dark" showSubtitle />
          <Link to="/auth" className="btn-primary py-2 text-sm">
            Sign in
          </Link>
        </div>

        {/* Page header */}
        <header className="border-b border-gray-200 bg-white px-4 py-5 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy md:text-3xl">
                Your documents, organized.
              </h1>
              <p className="mt-1 text-sm text-gray-500 md:text-base">
                AI-powered vault for Aadhaar, PAN, insurance, leases & more — built for India.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/auth" className="btn-primary hidden py-2 text-sm sm:inline-flex">
                Get Started Free
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline hidden py-2 text-sm sm:inline-flex"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </header>

        <div className="space-y-8 px-4 py-6 md:px-8 md:py-8">
          {/* AI search bar */}
          <section id="overview" className="scroll-mt-4">
            <div className="card-interactive group p-0">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="input-field-light pr-10"
                    placeholder="Ask Flowgenix anything about your documents…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && scrollToSection('ai')}
                  />
                  <svg
                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <Link to="/auth" className="btn-primary shrink-0 gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Ask AI
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3 sm:px-5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuery(s);
                      scrollToSection('ai');
                    }}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 transition hover:border-teal/40 hover:bg-teal/5 hover:text-teal-dark"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Metric cards */}
          <section id="features" className="scroll-mt-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
              {METRICS.map((m) => (
                <MetricCard
                  key={m.id}
                  {...m}
                  onClick={
                    m.id === 'auth'
                      ? undefined
                      : () => handleMetricClick(m.id)
                  }
                  to={m.id === 'auth' ? '/auth' : undefined}
                />
              ))}
            </div>
          </section>

          {/* Feature panels */}
          <section className="grid gap-4 lg:grid-cols-2">
            <div id="upload" className="scroll-mt-4">
              <FeaturePanelCard
                title="Upload & Organize"
                description="Drop documents — AI sorts them into vaults"
                iconBg="bg-teal/10 text-teal"
                accentColor="teal"
                onClick={() => {
                  setActiveSection('upload');
                  scrollToSection('upload');
                }}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                }
              >
                <div className="space-y-3">
                  <div className="flex h-32 items-end gap-1.5">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-teal/20 transition-all duration-300 group-hover:bg-teal/40"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Document uploads over time — sign in to start</p>
                </div>
              </FeaturePanelCard>
            </div>

            <div id="reminders" className="scroll-mt-4">
              <FeaturePanelCard
                title="Documents by Type"
                description="AI categorizes your vault automatically"
                iconBg="bg-blue-500/10 text-blue-500"
                accentColor="blue"
                onClick={() => {
                  setActiveSection('reminders');
                  scrollToSection('reminders');
                }}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                }
              >
                <div className="flex items-center gap-6">
                  <div className="relative h-28 w-28 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00B4D8" strokeWidth="3" strokeDasharray="28 100" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="22 100" strokeDashoffset="-28" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="18 100" strokeDashoffset="-50" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-navy">10</span>
                      <span className="text-[10px] text-gray-400">TYPES</span>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-2">
                    {DOC_TYPES.map((d) => (
                      <li key={d.label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <span className={`h-2 w-2 rounded-full ${d.color}`} />
                          {d.label}
                        </span>
                        <span className="font-medium text-navy">{d.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FeaturePanelCard>
            </div>
          </section>

          {/* AI + CTA row */}
          <section id="ai" className="scroll-mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Expiry Reminders',
                  desc: 'WhatsApp alerts 30, 7 & 1 day before renewal.',
                  iconBg: 'bg-orange-500/10 text-orange-500',
                  section: 'reminders',
                },
                {
                  title: 'Ask Anything',
                  desc: '"When does my insurance expire?" — instant AI answers.',
                  iconBg: 'bg-violet-500/10 text-violet-500',
                  section: 'ai',
                },
                {
                  title: 'Secure Vault',
                  desc: 'Encrypted storage with OTP-only sign in. No passwords.',
                  iconBg: 'bg-emerald-500/10 text-emerald-600',
                  section: 'overview',
                },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => scrollToSection(item.section)}
                  className="card-interactive group text-left"
                >
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${item.iconBg}`}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-semibold text-navy transition-colors group-hover:text-teal-dark">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                  <span className="mt-4 inline-block text-xs font-medium text-teal opacity-0 transition-opacity group-hover:opacity-100">
                    Learn more &rarr;
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="card-interactive bg-navy p-8 text-center text-white">
            <h2 className="mb-2 text-xl font-bold md:text-2xl">Ready to secure your documents?</h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-white/60">
              Free for up to 10 documents. Sign in with your mobile number — no password needed.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/auth" className="btn-primary px-8">
                Open My Vault
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline border-white/30 text-white hover:bg-white/10"
              >
                Send via WhatsApp
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
