# PrepBros Launch Checklist

Use this checklist to move from "works locally" to a safe public beta.

## Launch Decision

- Public beta: yes
- Paid growth push: not yet
- Goal of this launch: get 20-50 real users, learn what they use, and measure whether they come back

## Must Finish Before Public Beta

- [ ] Confirm production shows the full live question bank, not just the fallback set in `client/src/data/questions.ts`
- [ ] Verify `questions_db` in Supabase contains the 400+ real PYQs you want users to see
- [ ] Test the practice flow on production: landing page -> practice -> answer -> explanation -> dashboard
- [ ] Test signup and login on production
- [ ] Test support flow on production using `/support`
- [ ] Buy and connect the domain
- [ ] Add analytics on the deployed domain and confirm page + event tracking works

## Data and Content

- [ ] Import the latest CSV batches from `content/imports/` into `questions_db`
- [ ] Spot-check at least 25 random imported questions for:
  correct answer index
- [ ] Spot-check at least 25 random imported questions for:
  explanation quality
- [ ] Spot-check at least 25 random imported questions for:
  exam / topic / difficulty tags
- [ ] Confirm filters in `/practice` work for the imported data
- [ ] Remove or deactivate any low-confidence rows before launch

Current repo signal:

- Bundled fallback questions in `client/src/data/questions.ts`: 66
- Bundled fallback `PYQ` rows in `client/src/data/questions.ts`: 61
- CSV rows present under `content/imports/`: about 500 total including headers

## Database Safety

- [ ] Confirm row-level security exists for `questions_db`
- [ ] Confirm row-level security exists for `resources`
- [ ] Confirm only your admin account can insert, update, or delete admin-managed rows
- [ ] Confirm anonymous users can only read what should be public

Why this matters:

- The admin page writes directly from the client via Supabase in `client/src/pages/Admin.tsx`
- The browser client uses a publishable key in `client/src/lib/supabase.ts`
- UI-gating the `/admin` route is not enough unless RLS is correct

## Support and Trust

- [ ] Run `supabase/launch_hardening.sql`
- [ ] Set the env vars listed in `.env.example`
- [ ] Follow `SUPPORT_SETUP.md` end to end
- [ ] Submit a real support request and confirm:
  it lands in `support_requests`
- [ ] Submit a real support request and confirm:
  the email notification arrives
- [ ] Submit a real support request and confirm:
  the admin view can read it
- [ ] Replace any placeholder support addresses with the final domain email if needed

## Product Honesty

- [ ] Decide whether `/premium` stays public before payments are wired
- [ ] If payments are not live, change premium CTAs to "Coming soon" or "Join waitlist"
- [ ] Do not position the static `/status` page as real monitoring
- [ ] Make sure all visible claims match what the product actually does today

## Device and UX Checks

- [ ] Test mobile layout on iPhone-size viewport
- [ ] Test mobile layout on Android-size viewport
- [ ] Test slow 3G / weak network behavior for:
  landing page
- [ ] Test slow 3G / weak network behavior for:
  practice page
- [ ] Test slow 3G / weak network behavior for:
  auth flow
- [ ] Confirm no broken links on:
  home
- [ ] Confirm no broken links on:
  practice
- [ ] Confirm no broken links on:
  dashboard
- [ ] Confirm no broken links on:
  support
- [ ] Confirm no broken links on:
  privacy / terms

## Beta Launch Plan

- [ ] Launch quietly to 20-50 real users first
- [ ] Share it manually in:
  friends and alumni groups
- [ ] Share it manually in:
  UPSC / SSC Telegram or WhatsApp groups
- [ ] Share it manually in:
  your own socials with a simple "try this and send feedback" ask
- [ ] Ask every early user 3 questions:
  Did you solve at least 5 questions?
- [ ] Ask every early user 3 questions:
  What felt missing or confusing?
- [ ] Ask every early user 3 questions:
  Would you come back tomorrow?

## Metrics To Watch First

- [ ] Visitors -> started practice
- [ ] Started practice -> answered first question
- [ ] Signup conversion
- [ ] Day 2 retention
- [ ] Day 7 retention
- [ ] Top searched topics
- [ ] Top drop-off page
- [ ] Support issues reported in first week

## Do Not Prioritize Yet

- [ ] Do not spend on ads before retention is proven
- [ ] Do not build many new features before users finish the core solve loop
- [ ] Do not over-polish secondary pages while content, trust, and retention are still being validated

## Recommended Order This Week

1. Import and verify the full question bank in production.
2. Confirm RLS for `questions_db` and `resources`.
3. Run the support setup and test it.
4. Buy the domain and point deployment to it.
5. Make premium/status messaging honest for beta.
6. Launch to a small real-user cohort.
7. Review analytics and user feedback after the first 3-7 days.
