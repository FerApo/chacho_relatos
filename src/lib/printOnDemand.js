
import { loadStripe } from '@stripe/stripe-js';

const PRINT_COSTS = {
  softcover: 15.99,
  hardcover: 24.99,
  shipping: {
    standard: 4.99,
    express: 9.99
  }
};

export async function calculatePrintingCosts(pageCount, format = 'softcover', shipping = 'standard') {
  const baseCost = PRINT_COSTS[format];
  const shippingCost = PRINT_COSTS.shipping[shipping];
  const extraPages = Math.max(0, pageCount - 100);
  const extraPageCost = extraPages * 0.05;
  
  return {
    printing: baseCost + extraPageCost,
    shipping: shippingCost,
    total: baseCost + extraPageCost + shippingCost
  };
}

export async function initiatePrintOrder(bookDetails, shippingDetails) {
  try {
    const stripe = await loadStripe('your_publishable_key');
    
    const response = await fetch('/api/create-print-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        book: bookDetails,
        shipping: shippingDetails
      }),
    });

    const session = await response.json();
    
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return session;
  } catch (error) {
    console.error('Error al procesar el pedido:', error);
    throw error;
  }
}

export function trackPrintOrder(orderId) {
  // Simulación de seguimiento de pedido
  const status = ['preparing', 'printing', 'binding', 'shipping', 'delivered'];
  const currentStatus = status[Math.floor(Math.random() * status.length)];
  
  return {
    orderId,
    status: currentStatus,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };
}
