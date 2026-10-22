# TripVault 🗺️

A calm, modern travel-memory journal starter built for the CodGen Full Stack (MERN) Week 1 internship task. The visual direction follows the supplied Roam/TripVault designs: deep forest green, sage surfaces, editorial typography, rounded cards, scenic imagery, and restrained motion.

## Week 1 requirements implemented

- Express API on port `5000` with MongoDB connection.
- Mongoose `User` model containing name, unique email, and a bcrypt-hashed password.
- `POST /api/auth/register` for validation and account creation.
- `POST /api/auth/login` for credential validation and JWT issue.
- Protected `GET /api/auth/me` for the authenticated profile.
- React + Vite app with `/`, `/login`, `/register`, and protected `/dashboard` routes.
- JWT stored in `localStorage`; the frontend restores and validates the session on page load.
- End-to-end register → login → dashboard flow, validation messages, loading states, and logout.
- Clean `/client` and `/server` separation. Environment files are ignored by Git.

The Week 1 scope does not include trip CRUD, photo uploads, sharing, or password reset APIs. The dashboard labels those as upcoming rather than pretending those features are already backed by a server.

## Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- npm
- A MongoDB Atlas database (or local MongoDB)

## 1. Configure the backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your MongoDB connection string and a long, random JWT secret:

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<db-user>:<db-password>@<cluster-host>/tripvault?retryWrites=true&w=majority
JWT_SECRET=replace-this-with-a-random-secret-of-at-least-32-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

In MongoDB Atlas, create a database user and allow your development IP under **Network Access**. Avoid leaving `0.0.0.0/0` enabled in production. URL-encode special characters in the database username/password when needed. Never commit `.env` or share database credentials.

Generate a suitable secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 2. Install dependencies

From the project root:

```bash
npm install
npm run install:all
```

## 3. Run the app

From the project root:

```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend health: <http://localhost:5000/api/health>
- API base: <http://localhost:5000/api>

The backend intentionally exits with a clear startup error if `MONGO_URI` or a sufficiently long `JWT_SECRET` is missing. Configure `server/.env` before starting it.

## API reference

### `POST /api/auth/register`

Request:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "a-strong-password"
}
```

Success (`201`):

```json
{
  "message": "Account created successfully. You can now sign in.",
  "user": {
    "id": "<user-id>",
    "name": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

### `POST /api/auth/login`

Request:

```json
{ "email": "alex@example.com", "password": "a-strong-password" }
```

Success (`200`) returns a `token` and a safe `user` object. The password hash is never included in responses.

### `GET /api/auth/me`

Send the header `Authorization: Bearer <token>`. Returns the authenticated user's safe profile. Missing, expired, or invalid tokens receive `401 Unauthorized`.

### `GET /api/health`

Reports API status and whether MongoDB is connected.

## Useful checks

```bash
# Check the frontend production build
npm run build

# Check backend JavaScript syntax
node --check server/index.js
node --check server/routes/auth.js
node --check server/middleware/authMiddleware.js
```

You can also test the API with Postman or Thunder Client. Register first, sign in to obtain the JWT, then use it as a Bearer token for `/api/auth/me`.

## Security notes

- Passwords are hashed with `bcryptjs` (12 salt rounds); plain-text passwords are never saved.
- JWT signing uses `JWT_SECRET`; the API does not accept tokens from query strings.
- Email is normalized and unique. Responses do not expose the password hash.
- Auth inputs are validated, error messages avoid confirming whether an email exists during login, and request bodies are size-limited.
- `.env` is ignored by Git. Use HTTPS and rotate credentials before any public deployment.

## Folder structure

```text
tripvault/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
├── server/
│   ├── middleware/authMiddleware.js
│   ├── models/User.js
│   ├── routes/auth.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```


## Week 2: Trip Management (CRUD)

TripVault now supports private trip journaling for authenticated users. The dashboard can create, list, edit, and delete trips. Each trip stores a title, destination, optional start/end dates, description, optional 1–5 rating, and an owner reference.

### Protected Trip API

All routes require `Authorization: Bearer <JWT>`:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/trips` | Create a trip for the signed-in user |
| `GET` | `/api/trips` | List only the signed-in user's trips |
| `GET` | `/api/trips/:id` | Read one owned trip |
| `PUT` | `/api/trips/:id` | Update one owned trip |
| `DELETE` | `/api/trips/:id` | Delete one owned trip |

The API validates required fields, date order and rating range. It scopes reads, updates and deletes by both trip ID and authenticated user ID, so users cannot access or modify another user's trips. The React API client automatically attaches the saved JWT.

### Run locally

1. Install Node.js (LTS) and ensure MongoDB Atlas is configured.
2. Copy `server/.env.example` to `server/.env`, then set `MONGO_URI` and a random `JWT_SECRET` (at least 32 characters). Never commit `.env`.
3. From the project root, run `npm install` and `npm run install:all`.
4. Run `npm run dev`; the frontend is usually at `http://localhost:5173` and API at `http://localhost:5000`.
5. Sign in, open the dashboard, and use **Create trip** to test create, edit, list, and delete.

### Week 2 verification checklist

- [ ] Register or sign in and confirm the dashboard loads.
- [ ] Create a trip and confirm it appears in the list.
- [ ] Edit a trip and confirm changes persist after refresh.
- [ ] Delete a trip and confirm the list refreshes.
- [ ] Call `/api/trips` without a token and confirm it returns `401`.
- [ ] Test with two users and confirm each user sees only their own trips.
