import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '₹0',
    period: '',
    features: [
      'Up to 10 documents',
      '5 AI Q&A per month',
      'AI field extraction',
      'Secure document vault',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    priceLabel: '₹99',
    period: '/month',
    highlighted: true,
    features: [
      'Unlimited documents',
      'Unlimited AI Q&A',
      'WhatsApp upload & reminders',
      'Expiry alerts (30, 7 & 1 day)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '₹249',
    period: '/month',
    features: [
      'Everything in Basic',
      'Family vault (5 members)',
      'Export all documents',
      'Priority support',
    ],
  },
];

function formatPlanLabel(plan) {
  if (!plan) return 'Free';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export default function Subscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadStatus = useCallback(() => {
    setStatusLoading(true);
    api
      .getSubscriptionStatus()
      .then(setStatus)
      .catch((err) => setError(err.message))
      .finally(() => setStatusLoading(false));
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const currentPlan = status?.plan || user?.plan || 'free';

  const handleUpgrade = async (planId) => {
    if (planId === 'free' || planId === currentPlan) return;

    setError('');
    setNotice('');
    setCheckoutPlan(planId);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay checkout. Check your internet connection.');
      }

      const data = await api.createSubscription(planId);
      const planName = PLANS.find((p) => p.id === planId)?.name || planId;

      openRazorpayCheckout({
        keyId: data.keyId,
        subscriptionId: data.subscriptionId,
        planName,
        userPhone: user?.phone ? `+91${user.phone}` : undefined,
        onSuccess: () => {
          setNotice(
            'Payment successful! Your plan will activate shortly once Razorpay confirms the subscription.'
          );
          loadStatus();
        },
        onDismiss: () => setCheckoutPlan(''),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckoutPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-surface text-navy">
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/landing"
              className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-teal"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to home
            </Link>
            <h1 className="text-2xl font-bold text-navy md:text-3xl">Choose your plan</h1>
            <p className="mt-1 text-sm text-gray-500">
              Upgrade for unlimited documents, WhatsApp reminders, and more.
            </p>
          </div>
          {!statusLoading && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
              <p className="text-gray-500">Current plan</p>
              <p className="font-semibold text-navy">{formatPlanLabel(currentPlan)}</p>
              {status?.docCount != null && currentPlan === 'free' && (
                <p className="mt-1 text-xs text-gray-400">{status.docCount}/10 documents used</p>
              )}
            </div>
          )}
          {statusLoading && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-400">
              Loading plan…
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-6 rounded-lg border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-dark">
            {notice}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isPaid = plan.id !== 'free';

            return (
              <PlanCard
                key={plan.id}
                {...plan}
                isCurrent={isCurrent}
                ctaLabel={
                  isCurrent
                    ? 'Current plan'
                    : plan.id === 'free'
                      ? 'Included'
                      : `Upgrade to ${plan.name}`
                }
                disabled={isCurrent || plan.id === 'free'}
                loading={checkoutPlan === plan.id}
                onSelect={() => isPaid && handleUpgrade(plan.id)}
              />
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Secure payments via Razorpay. Subscriptions renew monthly. Cancel anytime from your Razorpay dashboard.
        </p>
      </div>
    </div>
  );
}
