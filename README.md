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

## Notes
- Data is stored locally in the browser using `localStorage`.
- This is a client-side prototype without a backend service.
