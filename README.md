# TripVault 🗺️

TripVault is a MERN-stack travel memory journal built for the CodGen Full Stack Virtual Internship. It lets travelers securely manage trips, attach trip photos stored in Cloudinary, and share a public profile that can be viewed without signing in.

## Current features

### Authentication (Week 1)
- React + Vite frontend and Express API.
- User registration and login with bcrypt password hashing.
- JWT-based sessions and protected dashboard routes.
- Existing Week 1/2 accounts are assigned a stable username during server startup if they do not already have one.

### Trip management (Week 2)
- Create, list, view, edit, and delete trips.
- Trips store title, destination, start/end dates, description, rating, and owner reference.
- All trip routes require a valid JWT and only return or modify trips owned by the signed-in user.
- Dashboard has separate Overview, Journeys, and Journal sections.

### Photo uploads and public profiles (Week 3)
- Cloudinary-backed image upload using `multer` and `multer-storage-cloudinary`.
- Upload up to 10 images from the Create Trip or Edit Trip form; each image is uploaded individually to `POST /api/trips/:id/upload`.
- JPG, PNG, and WEBP images up to 5 MB each are accepted.
- The first image uploaded to a trip becomes its cover image. All uploaded URLs are also stored in the trip's `photos` array.
- Trip cards display cover images, and the protected trip detail page (`/trips/:id`) shows the photo grid.
- User accounts have a unique public username and optional bio.
- Public profile route (`/profile/:username`) and API (`GET /api/users/:username/profile`) do not require authentication.
- Public profile responses contain only name, username, bio, and trip summary fields. They never include email, password, or other sensitive account fields.
- Signed-in users can edit their username and bio from the dashboard and open their public profile with **My Profile**.

## Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- npm
- MongoDB Atlas (free tier is sufficient) or a local MongoDB instance
- A Cloudinary account for photo uploads

## 1. Configure the backend

From the project root, copy the example file:

```powershell
Copy-Item server/.env.example server/.env
```

Edit `server/.env` and set your own values:

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<db-user>:<db-password>@<cluster-host>/tripvault?retryWrites=true&w=majority
JWT_SECRET=replace-this-with-a-random-secret-of-at-least-32-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary setup

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Open the Cloudinary Console / Dashboard.
3. Copy **Cloud name**, **API Key**, and **API Secret**.
4. Add them to `server/.env` using the exact variable names above.
5. Restart the backend after changing `.env`.

Cloudinary credentials are server-only. Never put the API secret in `client/.env`, frontend source, or GitHub. The server can start without Cloudinary values, but photo upload requests return `503` until all three credentials are configured.

In MongoDB Atlas, create a database user and allow your development IP under **Network Access**. URL-encode special characters in database credentials when needed. Keep `server/.env` private.

Generate a suitable JWT secret with:

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

The backend requires `MONGO_URI` and a `JWT_SECRET` of at least 32 characters. It connects to MongoDB before starting the API. When it starts, it backfills usernames for existing legacy accounts and ensures schema indexes.

## API reference

### Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register with name, username, email, and password |
| `POST` | `/api/auth/login` | No | Validate credentials and return JWT |
| `GET` | `/api/auth/me` | Yes | Return the current signed-in user's account details |

Registration body:

```json
{
  "name": "Alex Morgan",
  "username": "alex_morgan",
  "email": "alex@example.com",
  "password": "a-strong-password"
}
```

Username must be 3–24 characters and contain lowercase letters, numbers, or underscores.

### Trips

All trip routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/trips` | Create a trip for the signed-in user |
| `GET` | `/api/trips` | List only the signed-in user's trips |
| `GET` | `/api/trips/:id` | Read one trip owned by the signed-in user |
| `PUT` | `/api/trips/:id` | Update one owned trip |
| `DELETE` | `/api/trips/:id` | Delete one owned trip |
| `POST` | `/api/trips/:id/upload` | Upload one image and attach its Cloudinary URL to an owned trip |

Photo upload uses `multipart/form-data` with the file field named `image`. The upload endpoint accepts one image per request. The frontend sends selected photos one at a time.

### User profiles

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/users/:username/profile` | No | Return a public user profile and trip summaries |
| `PUT` | `/api/users/profile` | Yes | Update the signed-in user's username and/or bio |

The public endpoint explicitly selects `name`, `username`, and `bio` from the user model. Its trip list selects only `title`, `destination`, `startDate`, `endDate`, `rating`, and `coverImage`. Email and password are not returned.

## Data models

### User

- `name`: String, required
- `username`: String, required, unique, lowercase (3–24 characters)
- `bio`: String, optional (maximum 280 characters)
- `email`: String, required, unique
- `password`: String, required, bcrypt hash, excluded from normal queries

### Trip

- `title`: String, required
- `destination`: String, required
- `startDate`, `endDate`: Date
- `description`: String
- `rating`: Number, 1–5
- `coverImage`: String, Cloudinary URL
- `photos`: Array of Cloudinary URL strings
- `user`: ObjectId reference to the owning User

## 4. Test the Week 3 work

1. Sign in using a Week 1/2 account. Its username is generated automatically at server startup if it had none. Open the dashboard and check the username shown in **Edit Profile**.
2. Open **Edit Profile**, set a unique username and a short bio, and save. Open **My Profile** to check the public page.
3. Open the public profile URL in an incognito/private browser window. It should load without a token.
4. Create a trip and select one or more JPG, PNG, or WEBP photos in the photo picker. Save the trip.
5. Confirm that the trip card displays its cover image. Open **Details** on the trip card and confirm that the photo grid displays all uploaded images.
6. Edit the trip and upload another image. Confirm that it is added to the grid.
7. Open the public profile again and confirm the trip summary and cover image appear.
8. Inspect the public API response and verify that email and password are not present.
9. Check that the upload endpoint without a JWT returns `401`, and that a trip cannot be uploaded to by a different user.

## Security notes

- `CLOUDINARY_API_SECRET`, `MONGO_URI`, and `JWT_SECRET` belong only in `server/.env`.
- `.env` files are ignored by Git. Keep `.env.example` placeholders only.
- Image uploads are accepted only on an authenticated, owned trip, are limited to 5 MB, and are restricted to JPG, PNG, and WEBP MIME types.
- Public profiles use allowlisted response fields. Do not change them to return a full User document.
- Trip reads, updates, deletes, and uploads are scoped by both trip ID and authenticated user ID.
- The API does not expose secrets in errors or public profile responses.

## Folder structure

```text
tripvault/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   └── TripDetail.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── styles.css
│   └── package.json
├── server/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Trip.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trips.js
│   │   └── users.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```
