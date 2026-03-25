# Support Launch Setup

Use this checklist before going live.

## 1. Make sure the table exists

Run `supabase/launch_hardening.sql` in the Supabase SQL editor. The support flow expects the `public.support_requests` table and its insert policy to exist.

## 2. Set the server environment variables

Copy `.env.example` and fill in the real values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `SUPPORT_FROM_EMAIL`
- `SUPPORT_TO_EMAIL`

`RESEND_API_KEY` and `SUPPORT_FROM_EMAIL` are what make inbox notifications work in real life. Without them, requests can still be saved to Supabase, but you will not get an email alert.

## 3. Verify the sending domain in Resend

The address in `SUPPORT_FROM_EMAIL` must be from a verified Resend domain. Example:

```txt
PrepBros Support <support@updates.prepbros.com>
```

## 4. Test the full flow

Before launch:

1. Open `/support`
2. Submit a real test request
3. Confirm the request appears in the `support_requests` table
4. Confirm the support inbox receives the email notification
5. Confirm the Admin support view shows the request

## 5. Important deployment note

This repo now supports support submissions through `POST /api/support` in both:

- the Express server in `server/index.ts`
- the Vercel function in `api/support.ts`

The client also falls back to a direct Supabase insert if the API is temporarily unavailable, so the request still has a chance to land instead of disappearing.
