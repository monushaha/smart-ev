import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Payment() {
  const { id } = useParams(); // booking id
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      // Step 1: ask our backend to create a Razorpay order for this booking's amount
      const { data: order } = await api.post('/payments/create-order', { bookingId: id });

      // Step 2: open Razorpay's checkout popup
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Smart EV Charging',
        description: 'Charging slot booking',
        order_id: order.orderId,
        handler: async (response) => {
          // Step 3: send the payment result back to our backend to verify + confirm booking
          try {
            await api.post('/payments/verify', {
              bookingId: id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/confirmation/${id}`);
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false), // user closed the popup without paying
        },
        theme: { color: '#10b981' }, // Matches our new Electric Emerald theme color
      };

      const razorpayCheckout = new window.Razorpay(options);
      razorpayCheckout.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate secure payment pipeline.');
      setProcessing(false);
    }
  };

  return (
    <div className="container payment-container-layout">
      <div className="payment-card">
        
        {/* Header Branding */}
        <div className="payment-header">
          <div className="payment-icon-badge">🔒</div>
          <h2>Secure Checkout</h2>
          <p>You're one step away from finalizing your reserved charging slot allocation.</p>
        </div>

        {/* Error Notification Alert */}
        {error && <div className="error">{error}</div>}

        {/* Main Payment Gateway Trigger Zone */}
        <div className="payment-action-box">
          <div className="secure-badge-row">
            <span className="secure-shield-text">🛡️ 256-Bit Encrypted Connection</span>
          </div>
          
          <button 
            onClick={handlePay} 
            disabled={processing} 
            className="btn-primary btn-checkout"
          >
            {processing ? 'Launching Razorpay Checkout...' : 'Proceed to Pay Now'}
          </button>
        </div>

        {/* Test Mode Simulation Callout Card */}
        <div className="test-credentials-box">
          <span className="test-badge">SANDBOX TEST ENVIRONMENT</span>
          <p>Use the mock layout variables below to complete your test transaction:</p>
          <div className="mock-card-details">
            <div className="mock-row">
              <span className="mock-label">Card Number</span>
              <code>4111 •••• •••• 1111</code>
            </div>
            <div className="mock-row-grid">
              <div>
                <span className="mock-label">Expiry</span>
                <code>Any Future Date</code>
              </div>
              <div>
                <span className="mock-label">CVV</span>
                <code>Any 3 Digits</code>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}