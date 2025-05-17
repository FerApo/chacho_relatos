import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RK4poFxcC3JoMUgSqoYeQNqr9ax5cb6Xrw8b1GrCv2JBSxsuSCmUPklz5HdYtQxocgyRzMbvWIczSNQjHhSPvAj00asXeWI5i');

// Lógica preparada para integración con Stripe
// Reemplaza los siguientes valores cuando tengas la cuenta definitiva:
// - STRIPE_PUBLISHABLE_KEY: tu clave pública de Stripe
// - priceId: el ID real de tu producto o suscripción en Stripe

// Ejemplo de función para crear una sesión de pago (llamada desde el frontend)
export async function createCheckoutSession(priceId, mode = 'payment') {
  try {
    // Aquí deberías llamar a tu endpoint backend seguro que use la clave secreta de Stripe
    // Por ahora, solo dejamos la estructura prevista
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, mode }),
    });
    const session = await response.json();
    if (session.url) {
      window.location.href = session.url; // Redirige a Stripe Checkout
    } else {
      throw new Error('No se pudo crear la sesión de pago');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export const STRIPE_PRICES = {
  PACK_BASIC: 'price_1RKN9n4b3EUDOM1gZ9XfLpSa', // 1€ por 100 monedas
  // PACK_MEDIUM y PACK_LARGE: agrega aquí los priceId si tienes más paquetes
  SUBSCRIPTION: 'price_1RKN9n4b3EUDOM1gZ9XfLpSa', // Usa este mismo priceId si tu plan mensual es este
};
