import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold">Sign in</h1>
        <p className="mb-8 text-sm text-white/60">
          {step === 'phone'
            ? 'Enter your mobile number. We will send a one-time password.'
            : `OTP sent to +91 ${phone}`}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/70">Mobile number</label>
              <div className="flex gap-2">
                <span className="input-field flex w-16 items-center justify-center text-white/50">
                  +91
                </span>
                <input
                  type="tel"
                  className="input-field flex-1"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-white/70">6-digit OTP</label>
              <input
                type="text"
                className="input-field text-center text-2xl tracking-[0.5em]"
                placeholder="••••••"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              <p className="mt-2 text-xs text-white/40">
                Dev tip: check Arnav&apos;s server console for the OTP if SMS is not configured.
              </p>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Sign in'}
            </button>
            <button
              type="button"
              className="w-full text-sm text-teal hover:underline"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
