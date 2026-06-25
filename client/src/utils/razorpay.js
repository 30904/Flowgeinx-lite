export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout({
  keyId,
  subscriptionId,
  planName,
  userPhone,
  onSuccess,
  onDismiss,
}) {
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout failed to load');
  }

  const options = {
    key: keyId,
    subscription_id: subscriptionId,
    name: 'Flowgenix Lite',
    description: `${planName} plan`,
    prefill: userPhone ? { contact: userPhone } : {},
    theme: { color: '#00B4D8' },
    handler: (response) => onSuccess?.(response),
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
