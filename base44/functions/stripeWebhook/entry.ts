import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log('Stripe webhook event received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderNumber = session.metadata?.order_number;

    if (!orderNumber) {
      console.error('No order_number in session metadata');
      return Response.json({ received: true });
    }

    try {
      const base44 = createClientFromRequest(req);

      // Find the order by order_number
      const orders = await base44.asServiceRole.entities.Order.filter({ order_number: orderNumber });

      if (orders.length === 0) {
        console.error('Order not found:', orderNumber);
        return Response.json({ received: true });
      }

      const order = orders[0];

      // Mark as paid
      await base44.asServiceRole.entities.Order.update(order.id, {
        payment_status: 'paid',
        payment_method: 'card',
      });

      console.log(`Order ${orderNumber} marked as paid`);
    } catch (err) {
      console.error('Failed to update order payment status:', err.message);
    }
  }

  return Response.json({ received: true });
});