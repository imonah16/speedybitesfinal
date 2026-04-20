import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const { items, orderNumber, customerName, total } = await req.json();

    const origin = 'https://speedy-bites.co.uk';

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          ...(item.notes ? { description: item.notes } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add tax as a line item
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.08;
    lineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: { name: 'Tax (8%)' },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/order?success=true&order=${orderNumber}`,
      cancel_url: `${origin}/order?cancelled=true`,
      customer_email: undefined,
      metadata: {
        order_number: orderNumber,
        customer_name: customerName || '',
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});