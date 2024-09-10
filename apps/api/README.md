# Stripe

Stripe user is created when the user is registered on `/auth/register` endpoint.
It should populate the `stripe_id` field in the `users` table.

## Test Stripe webhook

Need [Stripe CLI](https://stripe.com/docs/stripe-cli) installed.

To get `STRIPE_WEBHOOK_SECRET` secret:

```
    stripe login
    stripe listen --forward-to localhost:3000/stripe/webhook
```

# To do:

- [x] Add rate limiting to critical endpoints (login, register, reset password, etc)
- [ ] Add OAUTH login (Google at least)
- [x] Add logging system
- [ ] Add tests
