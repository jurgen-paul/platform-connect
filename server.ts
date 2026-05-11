import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Create a Connect account
  app.post('/api/create-connect-account', async (req, res) => {
    const { email } = req.body;
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      res.json({ accountId: account.id });
    } catch (error: any) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create account link for onboarding
  app.post('/api/create-account-link', async (req, res) => {
    const { accountId } = req.body;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${appUrl}`,
        return_url: `${appUrl}?accountId=${accountId}`,
        type: 'account_onboarding',
      });
      res.json({ url: accountLink.url });
    } catch (error: any) {
      console.error('Error creating account link:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get account status
  app.get('/api/account-status/:accountId', async (req, res) => {
    try {
      const account = await stripe.accounts.retrieve(req.params.accountId);
      
      const chargesEnabled = account.charges_enabled;
      const detailsSubmitted = account.details_submitted;
      const payoutsEnabled = account.payouts_enabled;

      res.json({
        id: account.id,
        payoutsEnabled,
        chargesEnabled,
        detailsSubmitted,
        requirements: account.requirements?.currently_due || [],
      });
    } catch (error: any) {
      console.error('Error fetching status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a product
  app.post('/api/create-product', async (req, res) => {
    const { productName, productDescription, productPrice, accountId } = req.body;
    try {
      const product = await stripe.products.create({
        name: productName,
        description: productDescription,
        metadata: { stripeAccount: accountId },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(parseFloat(productPrice) * 100),
        currency: 'usd',
        metadata: { stripeAccount: accountId },
      });

      res.json({
        productName: product.name,
        productDescription: product.description,
        productPrice,
        priceId: price.id,
      });
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get products for an account
  app.get('/api/products/:accountId', async (req, res) => {
    try {
      const prices = await stripe.prices.search({
        query: `metadata['stripeAccount']:'${req.params.accountId}' AND active:'true'`,
        expand: ['data.product'],
        limit: 100,
      });

      const products = prices.data.map((price: any) => ({
        id: price.product.id,
        name: price.product.name,
        description: price.product.description,
        price: price.unit_amount, // in cents
        priceId: price.id,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      }));

      res.json(products);
    } catch (error: any) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create checkout session
  app.post('/api/create-checkout-session', async (req, res) => {
    const { priceId, accountId } = req.body;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    try {
      const price = await stripe.prices.retrieve(priceId);
      const mode = price.type === 'recurring' ? 'subscription' : 'payment';

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode: mode,
        success_url: `${appUrl}/done?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}`,
        payment_intent_data: mode === 'payment' ? {
          transfer_data: {
            destination: accountId,
          },
        } : undefined,
        subscription_data: mode === 'subscription' ? {
          transfer_data: {
            destination: accountId,
          },
        } : undefined,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook handled simply
  app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    // In a real app, verify signal with stripe.webhooks.constructEvent
    res.json({ received: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
