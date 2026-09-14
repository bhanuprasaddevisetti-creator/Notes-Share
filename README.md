# Shelf — college notes, organized

A website where students pick their college, year, and subject to find notes
their classmates already uploaded — instead of scrolling through WhatsApp.

Built with **React + Vite** on the frontend and **Supabase** (free tier) for
the database, login/email verification, and file storage.

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free, no card needed).
2. Click **New project**. Pick any name and a database password (save it somewhere).
3. Wait ~2 minutes for it to finish setting up.

## 2. Set up the database

1. In your project, go to **SQL Editor** (left sidebar) -> **New query**.
2. Open `supabase/schema.sql` from this project, copy all of it, paste it in, and click **Run**.
   This creates all the tables (`colleges`, `profiles`, `notes`, `votes`), the
   automatic profile-creation trigger, the vote-scoring trigger, the storage
   bucket for uploaded files, and all the security rules.

## 3. Turn on email confirmation (this is your "verification")

1. Go to **Authentication -> Sign In / Providers -> Email** (menu names vary slightly by Supabase version -- look under Authentication settings).
2. Make sure **Confirm email** is turned ON. This is what makes a signup
   require clicking a link in their inbox before they can use the account --
   that's the actual verification step.
3. Optional but recommended: under **Authentication -> URL Configuration**,
   set your site URL once you've deployed it (step 6), so confirmation links
   point to the right place.

## 4. Get your API keys

1. Go to **Project Settings -> API**.
2. Copy the **Project URL** and the **anon public** key.
3. In this project folder, copy `.env.example` to a new file named `.env`:
   ```
   cp .env.example .env
   ```
4. Paste your values into `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

## 5. Run it locally

```bash
npm install
npm run dev
```

Open the link it prints (usually `http://localhost:5173`). Try signing up
with your own college email, confirm it via the email you receive, log in,
and upload a test note.

## 5b. Set up the admin dashboard (member counts + storage used)

1. In the SQL Editor, open `supabase/admin_dashboard.sql`, copy it all, and run it.
   This adds an `is_admin` flag and a secure stats function.
2. At the bottom of that file there's a commented line — uncomment it, replace
   the email with the one **you** signed up with, and run just that line:
   ```sql
   update profiles set is_admin = true where id = (select id from auth.users where email = 'you@yourcollege.ac.in');
   ```
3. Log out and back in on the site. You'll now see an **Admin** link in the
   navbar, showing total members, verified vs. unverified counts, notes
   uploaded, and how much of your 1GB free storage is used — overall and
   broken down by college.

No one else can see this page or call this data — the function checks that
the logged-in account is flagged as admin before returning anything.

## 6. Put it online (free)

The easiest free option is **Vercel**:

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), sign up with GitHub, click **New Project**, pick your repo.
3. In the project's **Environment Variables** settings, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values from your `.env`.
4. Deploy. You'll get a free `.vercel.app` link you can share with your college.

(Netlify works the same way if you prefer it.)

---

## How the college email verification works

- When someone signs up, they type their college name and email.
- If it's the **first person** from that college, whatever comes after the
  `@` in their email becomes that college's official domain going forward.
- Everyone after them is marked **verified** only if their email matches
  that domain. Anyone using a personal email (Gmail, etc.) can still sign up
  and use the app -- they just won't get the verified badge.
- Combined with Supabase's email confirmation, this means a "verified"
  badge means: real inbox + matches the college's known domain.

## What's included

- Sign up / log in (`src/pages/Auth.jsx`)
- Browse & filter notes by college, year, subject (`src/pages/Dashboard.jsx`)
- Upload a note with a file (`src/pages/Upload.jsx`)
- Upvote / downvote notes so good ones rise to the top (`src/components/NoteCard.jsx`)
- Verified-student badge
- Admin dashboard: member count, verified/unverified split, storage used, members by college (`src/pages/AdminDashboard.jsx`) — visible only to accounts you flag as admin

## Natural next steps (not built yet, in case you want to extend it)

- A "report" button on bad/duplicate uploads
- A per-subject doubt/Q&A thread
- Ads for the free tier, and a small paid tier for "verified-only" premium notes
- Push notifications for new notes in your subjects (would need converting to a PWA)
