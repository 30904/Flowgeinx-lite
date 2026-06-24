import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Upload & Organize',
    description:
      'Drop Aadhaar, PAN, insurance, leases, and more. AI sorts them into vaults automatically.',
    icon: '📁',
  },
  {
    title: 'Expiry Reminders',
    description:
      'Never miss a renewal. Get WhatsApp alerts 30, 7, and 1 day before documents expire.',
    icon: '🔔',
  },
  {
    title: 'Ask Anything',
    description:
      '"When does my car insurance expire?" — get instant answers from your documents.',
    icon: '💬',
  },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-teal">
          DocDrop by Flowgenix
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
          Your documents, organized.
          <br />
          <span className="text-teal">Your questions, answered.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
          Indians deal with an insane number of documents. Upload yours, let AI extract key info,
          set renewal reminders, and ask questions anytime.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/auth" className="btn-primary text-lg px-8 py-3">
            Get Started Free
          </Link>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-lg px-8 py-3"
          >
            Send via WhatsApp
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card text-left">
              <span className="mb-4 block text-3xl">{f.icon}</span>
              <h3 className="mb-2 text-lg font-semibold text-teal">{f.title}</h3>
              <p className="text-sm text-white/70">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
