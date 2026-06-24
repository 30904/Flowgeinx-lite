import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  'AI-Powered Document Intelligence',
  'WhatsApp Upload & Reminders',
  'Expiry Tracking & Alerts',
  'Secure Vault for Indian Documents',
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg">
        <svg className="h-6 w-6 text-teal" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 18V6h3l3 6 3-6h3v12h-2.5V9.5L13.5 18h-1.5l-1.5-8.5V18H6z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="text-xl font-bold text-white">
        Flow<span className="text-teal-light">genix</span> Lite
      </span>
    </div>
  );
}

export default function Auth() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await api.sendOtp(phone);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await login(phone, otp);
      navigate('/vault');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8eaed] px-4 py-8">
      <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_40px_rgba(13,27,42,0.12)] md:min-h-[600px] md:flex-row">
        {/* Brand panel */}
        <div className="auth-marble relative flex flex-col justify-between px-8 py-10 md:w-1/2 md:px-10 md:py-12">
          <div className="relative z-10">
            <Link to="/">
              <BrandLogo />
            </Link>
          </div>

          <div className="relative z-10 my-8 md:my-0">
            <h1 className="mb-4 text-2xl font-bold leading-snug text-white md:text-3xl lg:text-[2rem]">
              Smarter documents,
              <br />
              faster decisions.
            </h1>
            <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/60">
              The AI-powered standard for Indian document storage, extraction, and renewal
              reminders.
            </p>
            <ul className="space-y-4">
              {FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10">
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              Help Center
            </a>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 flex-col justify-center px-8 py-10 md:px-12 md:py-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="mb-1 text-2xl font-bold text-navy md:text-3xl">
              {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
            </h2>
            <p className="mb-8 text-sm text-gray-500">
              {step === 'phone'
                ? 'Sign in to your Flowgenix Lite vault'
                : `Enter the code sent to +91 ${phone}`}
            </p>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <span className="auth-input flex w-[72px] items-center justify-center text-gray-500">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      className="auth-input flex-1"
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex cursor-pointer items-center gap-2 text-gray-500">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-teal focus:ring-teal"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="font-medium text-teal hover:text-teal-dark hover:underline"
                    onClick={() =>
                      window.open('https://wa.me/919876543210', '_blank', 'noopener,noreferrer')
                    }
                  >
                    Need help?
                  </button>
                </div>

                <button type="submit" className="btn-signin w-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-700">
                    6-Digit OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    className="auth-input text-center text-2xl tracking-[0.4em]"
                    placeholder="••••••"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Dev tip: check the server console for OTP if SMS is not configured.
                  </p>
                </div>

                <button type="submit" className="btn-signin w-full" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  className="w-full text-center text-sm font-medium text-teal hover:text-teal-dark hover:underline"
                  onClick={resetToPhone}
                >
                  Change number
                </button>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => (step === 'otp' ? resetToPhone() : document.getElementById('phone')?.focus())}
                className="font-semibold text-teal hover:text-teal-dark hover:underline"
              >
                Get Started
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
