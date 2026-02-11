# Book Collection Manager

- **Postgres** users, collections, collection membership
- **MongoDB** global book catalog + reviews
- Admins manage the catalog
- Users maintain personal collections and leave one review per book

---

## Requirements

- Docker

---

## Setup

```bash
cp .env.example .env
docker compose up --build
```

Server runs at:

```
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/api/health
```

---

## Seeded Admin Account

```
username: admin
password: admin123!
```

---

## Main Endpoints

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Catalog (admin-only for write operations)

```
GET    /api/books
GET    /api/books/search?q=
POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id
```

### Collections

```
GET    /api/collections
POST   /api/collections
GET    /api/collections/:collectionId/books
POST   /api/collections/:collectionId/books
DELETE /api/collections/:collectionId/books/:bookId
```

### Reviews

```
GET    /api/books/:id/reviews
POST   /api/books/:id/reviews
```

(One review per user per book.)

---

## Reset Database

```bash
docker compose down -v
docker compose up --build
```
