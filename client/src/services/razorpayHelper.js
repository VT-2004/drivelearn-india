// Loads the Razorpay checkout script once and provides a helper to open it

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// orderData: { orderId, amount, currency, keyId }
// options: { name, description, prefill: { name, email, contact }, onSuccess(response), onFailure() }
export const openRazorpayCheckout = async (orderData, options) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Failed to load payment gateway. Check your internet connection.');
    return;
  }

  const rzpOptions = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: options.name || 'DriveLearn India',
    description: options.description || '',
    order_id: orderData.orderId,
    handler: function (response) {
      options.onSuccess(response);
    },
    prefill: options.prefill || {},
    theme: { color: '#1C1F22' },
    modal: {
      ondismiss: function () {
        if (options.onFailure) options.onFailure();
      },
    },
  };

  const rzp = new window.Razorpay(rzpOptions);
  rzp.open();
};
