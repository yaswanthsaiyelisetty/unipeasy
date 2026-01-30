# UniPeasy

> _Making learning easy, one concept at a time._

Hey there! UniPeasy is a learning companion built for JNTUK students who want to study smarter, not harder. Whether you're struggling with complex topics, need a study plan, or want to build real skills — we've got your back.

---

## What Can You Do Here?

### Learn

Got a confusing topic? Just type it in! We'll break it down with simple explanations, real-world analogies, and a quick quiz to make sure it sticks.

### Strategist

Exams coming up? Paste your syllabus, tell us your exam date, and we'll create a personalized study plan that matches your learning pace. No more last-minute panic!

### Skills

Want to level up? Pick a skill track — Python, Web Dev, DSA, or soft skills — and work through bite-sized challenges. Get instant AI feedback as you grow.

### Materials

All your study notes, organized by branch, year, and subject. No more hunting through random folders!

### My Documents

Upload and store your own PDFs and notes. Access them anywhere, anytime.

### Memory Palace

Found a great explanation or mind map? Save it to your personal Memory Palace and revisit whenever you need a refresher.

---

## Built With

- **Next.js 15** + **React** — Fast, modern web app
- **Firebase** — Authentication & real-time database
- **Google Gemini AI** — Powers all the smart explanations
- **Tailwind CSS** — Clean, responsive design

---

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up your environment**

   Create a `.env.local` file with:

   ```
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GOOGLE_GENAI_API_KEY=your_gemini_key
   ```

3. **Run the app**

   ```bash
   npm run dev
   ```

4. **Open** [localhost:9002](http://localhost:9002) and start learning! 🎉

---

## Admin Panel

Head to `/admin` to manage users, upload materials, and check analytics. It's password protected, so only you can access it.

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in Vercel's dashboard
4. Deploy!

### Deploy to Firebase App Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase apphosting:backends:create
```

### Environment Variables for Production

Make sure to set these in your deployment platform:

| Variable                                   | Required | Description              |
| ------------------------------------------ | -------- | ------------------------ |
| `NEXT_PUBLIC_ADMIN_PASSWORD`               | ✅       | Admin panel password     |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | ✅       | Firebase API key         |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | ✅       | Firebase auth domain     |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | ✅       | Firebase project ID      |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | ✅       | Firebase storage bucket  |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅       | Firebase sender ID       |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | ✅       | Firebase app ID          |
| `GOOGLE_GENAI_API_KEY`                     | ✅       | Google Gemini AI API key |
| `FIREBASE_CLIENT_EMAIL`                    | ❌       | For server-side uploads  |
| `FIREBASE_PRIVATE_KEY`                     | ❌       | For server-side uploads  |

---

## Project Structure

```
src/
├── app/          → All the pages
├── components/   → Reusable UI components
├── ai/           → AI flows & prompts
├── lib/          → Utility functions
└── context/      → Global state management
```

## Checkout The Sample Website

```
unipeasy-five.vercel.app
```

---

## License

MIT — Feel free to use, modify, and share!
