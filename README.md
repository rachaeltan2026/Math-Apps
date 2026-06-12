# Math-Apps

This repository now includes a browser-based prototype for Workflow 1 of the Teacher Attendance & Workshop Registration app.

## What is implemented
- Teacher registration form with MOE email
- Automatic login after registration
- Login for returning teachers
- Workshop browsing page with available seats
- Workshop signup with a maximum of 2 confirmed registrations
- Registration confirmation message with confirmation number
- Unregister from workshops
- Waitlist support when a workshop is full

## How to use
1. Open `index.html` in a browser.
2. Register as a teacher with your name, MOE email, contact number, school, and grade level.
3. After registration, browse workshops and click "Register" to sign up.
4. View your registered workshops and confirmations.

## Supabase (optional) - quick setup
1. Create a Supabase project and get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` (public anon key).
2. Copy `config.example.js` to `config.js` and replace the placeholder values with your real values.
3. Locally, the app will load `config.js` at runtime and initialize the Supabase client.

Vercel notes: to keep keys out of the repo, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as Environment Variables
in your Vercel project, and add a build command that writes `config.js` before deployment. Example build command:

```bash
bash -lc 'echo "window.SUPABASE_URL=\"$SUPABASE_URL\";window.SUPABASE_ANON_KEY=\"$SUPABASE_ANON_KEY\";" > ./config.js' && true
```

This writes a `config.js` file at build time containing your public keys. Keep private keys secret and do not commit `config.js`.

## Notes
- Data is stored locally in the browser using `localStorage`.
- This is a client-side prototype without a backend service.
