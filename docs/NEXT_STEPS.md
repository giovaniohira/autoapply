# AutoApply — Next Steps: How to Run and Use

This guide walks you through running the backend and extension and applying to jobs (MVP flow).

---

## 1. One-time setup

### 1.1 Backend environment

From the project root:

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- **OPENAI_API_KEY** — required for AI-generated answers on application forms. Get a key from [OpenAI](https://platform.openai.com/api-keys).
- **PORT** (optional) — default `3000`.
- **DATABASE_PATH** (optional) — default `./data/autoapply.sqlite`. Use `:memory:` for a temporary DB.

### 1.2 Install and build

```bash
npm install
npm run build
```

### 1.3 Database

The backend uses SQLite and runs migrations on startup. For a persistent DB, ensure the directory exists, e.g.:

- Windows: `mkdir data`
- Linux/macOS: `mkdir -p data`

If `DATABASE_PATH` is unset or points to a file, the file is created on first run.

---

## 2. Run the backend

From the project root:

```bash
npm start
```

Or from the backend package:

```bash
npm run start -w @autoapply/backend
```

The API listens on `http://127.0.0.1:3000` (or your `PORT`). Keep this process running while using the extension.

---

## 3. Create a user and get your User ID

The extension needs a **User ID** that exists in the backend.

### Option A: cURL

```bash
curl -X POST http://127.0.0.1:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"my-user-1\", \"name\": \"Your Name\", \"email\": \"you@example.com\", \"yearsExperience\": 5}"
```

Use the same `id` (e.g. `my-user-1`) as the User ID in the extension.

### Option B: Any HTTP client (Postman, etc.)

- **POST** `http://127.0.0.1:3000/users`
- Body (JSON): `id`, `name`, `email`, `yearsExperience` (number). Optionally `phone`, `location`.

Add skills (used for compatibility scoring):

```bash
curl -X POST http://127.0.0.1:3000/users/my-user-1/skills \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"skill-1\", \"skill\": \"TypeScript\", \"yearsExperience\": 3}"
```

(Replace `my-user-1` with your user `id`.)

---

## 4. Load the extension in the browser

1. Build the extension (if not already): `npm run build` (builds shared, backend, extension).
2. Open the extension management page:
   - **Chrome / Vivaldi**: `chrome://extensions/`
3. Enable **Developer mode**.
4. Click **Load unpacked** and choose the **`extension`** folder (the one that contains `manifest.json` and `dist/`).
5. Pin the extension so you can open the popup easily.

---

## 5. Configure the extension

The extension reads configuration from `chrome.storage.local`. You must set at least **User ID** and optionally **Backend URL**.

### Backend URL

- Default: `http://127.0.0.1:3000`
- If your backend runs on another host/port, set the key `autoapply_backend_url` to that base URL (e.g. `http://localhost:3000`).

### User ID

- Set the key `autoapply_user_id` to the user `id` you created in step 3 (e.g. `my-user-1`).

### How to set storage (MVP)

1. Open a page where the extension can run (e.g. `https://www.linkedin.com/jobs/`).
2. Open DevTools (F12) → **Console**.
3. Run (replace with your values):

```javascript
chrome.storage.local.set({
  autoapply_user_id: "my-user-1",
  autoapply_backend_url: "http://127.0.0.1:3000"
});
```

4. Open the extension popup to confirm: it should show “User configured” and the backend URL.

*(Later you can add an options page so users can set these in the UI.)*

---

## 6. Use the flow on LinkedIn Jobs

1. **Backend**: ensure `npm start` is running and `.env` has `OPENAI_API_KEY` if you want AI answers.
2. **Browser**: go to [LinkedIn Jobs](https://www.linkedin.com/jobs/).
3. **Listing page**: the content script will scrape visible job cards and send them to the background; the background calls the backend to score jobs and persist them.
4. **Job page**: open a job and click **Easy Apply**. When the application form/modal opens, the extension will:
   - Call the backend **POST /apply** (score, optional AI answers).
   - Receive profile + answers and autofill the form when score ≥ threshold (default 60).
5. **Popup**: use it to:
   - See status (backend URL, user configured or not).
   - Toggle automation on/off.
   - Set compatibility threshold (0–100).
   - See “Applications in last hour” (rate limit info).

---

## 7. Useful API endpoints

| Method | Path | Purpose |
|--------|------|--------|
| POST | /users | Create user |
| GET | /users/:id | Get user + skills |
| PATCH | /users/:id | Update user |
| GET/POST | /users/:id/skills | Get or add skills |
| GET/POST | /users/:id/job-filters | Get or save job filters (role, techs, location, experience) |
| POST | /compatibility/score | Score a job for a user (body: userId, job, threshold, etc.) |
| POST | /apply | Full apply flow: score + AI answers + JobApplication (body: userId, job, threshold, questions) |
| GET | /users/:id/applications | List applications (query: status, fromDate, toDate, limit) |

---

## 8. Checks if something fails

- **“User not configured”**  
  Set `autoapply_user_id` in extension storage to an existing user `id` from the backend.

- **“Request failed” / CORS or connection errors  
  Backend must be running and URL in extension must match (e.g. `http://127.0.0.1:3000`). For localhost, ensure `host_permissions` in the manifest allow it (already include `http://127.0.0.1/*`).

- **AI answers not generated  
  Set `OPENAI_API_KEY` in `.env` and restart the backend. If the key is invalid, check backend logs.

- **Form not filling  
  LinkedIn’s DOM may have changed; selectors live in `extension/src/content/linkedin-jobs/selectors.ts`. Check console for errors and adjust selectors if needed.

- **Rate limit  
  Default: 10 applications per hour. Stored in `autoapply_apply_timestamps`; clearing that key resets the count (or wait for the window to pass).

---

## 9. Optional: job filters

To persist job preferences (role, technologies, location, experience range), use:

- **GET** `/users/:id/job-filters` — get current filters.
- **POST** `/users/:id/job-filters` — set filters (body: role, technologies, location, minExperience, maxExperience as per API schema).

The extension can later use these to filter which jobs to score or apply to.

---

## 10. Tests and quality

- **Unit/integration**: `npm test`
- **E2E (Playwright)**: `npm run test:e2e` (uses a dummy job page; no real LinkedIn).
- **Lint**: `npm run lint`
- **Format**: `npm run format` / `npm run format:fix`

---

## Summary

1. Copy `.env.example` → `.env`, set `OPENAI_API_KEY` (and optionally PORT, DATABASE_PATH).
2. `npm install && npm run build && npm start`.
3. Create a user via **POST /users** and note its `id`.
4. Load the **extension** from the `extension` folder and set `autoapply_user_id` (and optionally `autoapply_backend_url`) in storage (e.g. via DevTools).
5. Open LinkedIn Jobs, go to a job, click Easy Apply; the extension will score and autofill when score ≥ threshold.

For product and architecture details, see `.cursor/rules/product.mdc` and `.cursor/rules/architecture.mdc`. For the full roadmap, see `docs/ROADMAP.md`.
