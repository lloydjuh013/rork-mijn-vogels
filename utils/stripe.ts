import { Platform } from 'react-native';

// Initialize Stripe with your publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51LuGHqLXJutBmJsVXkoK4jW43u8mEpVnjkf945va8b2OOh4xtMZlBK6JD1VEuBikpQhlMxYGCVPdZYdzVnG25Ete00Ej8Ej8Ej';
const STRIPE_SECRET_KEY = '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';

export const initializeStripe = async () => {
  if (Platform.OS !== 'web') {
    // Only initialize native Stripe on mobile
    const { initStripe } = await import('@stripe/stripe-react-native');
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.mybird.app',
    });
  }
  // Web will use Stripe.js directly in components
};

export const PREMIUM_PRICE_ID = 'price_1234567890'; // Replace with your actual price ID from Stripe Dashboard
export const PREMIUM_AMOUNT = 995; // €9.95 in cents

export type PaymentIntentResponse = {
  client_secret: string;
  payment_intent_id: string;
};

export const createPaymentIntent = async (customerId?: string): Promise<PaymentIntentResponse> => {
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: PREMIUM_AMOUNT.toString(),
        currency: 'eur',
        customer: customerId || '',
        description: 'MyBird Premium Abonnement - €9.95/maand',
        'metadata[product]': 'mybird_premium',
        'metadata[billing_cycle]': 'monthly'
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create payment intent');
    }

    const data = await response.json();
    return {
      client_secret: data.client_secret,
      payment_intent_id: data.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const createCustomer = async (email: string, name: string): Promise<string> => {
  try {
    const response = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        name,
        description: `MyBird Premium Customer - ${name}`,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create customer');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const createSubscription = async (customerId: string, paymentMethodId: string): Promise<string> => {
  try {
    const response = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customerId,
        'items[0][price]': PREMIUM_PRICE_ID,
        default_payment_method: paymentMethodId,
        description: 'MyBird Premium Abonnement',
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create subscription');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Web-compatible Stripe utilities
export const loadStripeWeb = async () => {
  if (Platform.OS === 'web') {
    const { loadStripe } = await import('@stripe/stripe-js');
    return await loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return null;
};

export { STRIPE_PUBLISHABLE_KEY };