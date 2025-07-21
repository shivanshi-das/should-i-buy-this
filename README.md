# Reddit Product Review Analyzer (Archived MVP)

**Archived MVP**
This project is a Reddit-based product review analyzer built using the MERN stack. It applies lightweight NLP heuristics to extract and summarize product reviews from Reddit discussions.
I plan to revisit this project in the future with a trained classifier, improved filtering, and better UI/UX.

---

## Overview

This application targets real-world beauty product reviews shared on Reddit. It pulls Reddit threads using the Reddit API and filters them using custom rules to identify:

* Review-like content
* Pros and cons from user-generated posts
* A sentiment score and simple verdict ("Yes", "No", "Maybe")

This MVP was created as a proof-of-concept to explore non-influencer, community-driven opinions on popular products.

---

## Features

* Reddit API search with exact product name
* Heuristic filtering (`isReviewLike`, `isGenericLookPost`, `isAskingAboutProduct`)
* Sentiment scoring using positive and negative keyword matching
* Thread comment expansion for review extraction
* MongoDB schemas for product and review storage (optional)
* REST API endpoint: `/api/reviews/analyze?product=...`
* React frontend (minimal) without Tailwind or styling frameworks

---

## Backend Review Pipeline

This project’s backend uses the Reddit API (via Snoowrap) to fetch and filter Reddit threads and comments that are likely to contain real product reviews.

### `searchFilteredPosts(query, subreddits, limit)`

This function searches Reddit and applies multiple layers of filtering:

#### 1. Exact Phrase Match

Searches Reddit using:

```js
query: `"${query}"` // Forces exact phrase match
```

#### 2. Initial Cleanup

* Filters out `[deleted]` content
* Requires non-empty title or body

#### 3. Product Mention Check

`mentionsExactProduct(text, productName)` checks for:

* Exact product mentions
* Plural variations (e.g., "blushes", "concealers")

#### 4. Review-Like Detection

`isLikelyProductReview(text)` combines:

* `isReviewLike(text)` — matches review phrases like:
  `"i love"`, `"holy grail"`, `"broke me out"`, `"not worth it"`
* `!isGenericLookPost(text)` — filters out hauls, lookbooks, and phrases like:
  `"wedding makeup"`, `"product list"`, `"soft glam"`, `"recreating this look"`

#### 5. Question Detection

`isAskingAboutProduct(text)` matches opinion-seeking patterns like:

* `"Is this worth it?"`
* `"Has anyone tried ___?"`
* `"Repurchase?"`
* `"How does it compare?"`

#### 6. Comment Expansion

Expands post replies using:

```js
await reddit.getSubmission(post.id).expandReplies({ limit: Infinity, depth: 2 });
```

Filters comments using the same `isLikelyProductReview` logic.

---

## Project Structure

```
DEINFLUENCE-AI/
├── backend/
│   ├── controllers/        # API logic (analyze + store reviews)
│   ├── models/             # MongoDB schemas for Product and Review
│   ├── reddit/             # Reddit fetcher + heuristics
│   ├── routes/             # Express API routes
│   ├── utils/              # Sentiment scoring, string helpers
│   ├── redditTest.js       # Manual test script
│   └── index.js            # Express server entry
│
├── frontend/
│   ├── public/             # Static HTML shell
│   ├── src/
│   │   ├── assets/         # Images (if any)
│   │   ├── App.jsx         # Main app component
│   │   ├── App.css         # CSS (no Tailwind yet)
│   │   ├── index.css       # Entry styles
│   │   └── main.jsx        # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── README.md
├── .gitignore
```

---

## Example API Usage

You can call the analysis route directly:

```bash
GET http://localhost:5000/api/reviews/analyze?product=Rare Beauty Blush
```

Example response:

```json
{
  "product": "Rare Beauty Blush",
  "verdict": "Maybe",
  "sentimentScore": "0.17",
  "pros": ["i love", "holy grail", "natural look"],
  "cons": ["too pigmented"],
  "topQuotes": [
    {
      "snippet": "Finally panned my Rare Beauty blush in Believe...",
      "author": "OP",
      "url": "https://reddit.com/r/beautytalkph/comments/1gpij0e/rare_beauty_pan/"
    }
  ]
}
```

---

## How to Test This Project Locally

You will need a Reddit API client ID/secret to test the backend.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/deinfluence-ai.git
cd deinfluence-ai
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory with the following:

```env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_USER_AGENT=your_app_name
REDDIT_REFRESH_TOKEN=your_refresh_token
```

You can create an app and get credentials here:
[https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)

### 3. Run the Backend Server

```bash
npm start
```

### 4. (Optional) Run the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 5. Test the API in Browser or Postman

Example:

```bash
http://localhost:5000/api/reviews/analyze?product=NARS Radiant Creamy Concealer
```

---

## Status

This project is archived as a prototype MVP.

### Future plans include:

* Replace heuristic classifier with a trained model
* Add Tailwind CSS for better UI
* Extend to YouTube, TikTok, and Sephora reviews
* Build a Chrome extension for on-site review summaries

---

## Author

Shivanshi Das
CS + Math @ UT Austin

---

## License

MIT License


