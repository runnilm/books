# Book Collection Manager

## Features

- **Postgres**: users, collections, and collection membership
- **MongoDB**: book catalog and reviews/ratings
- **User app (React)**:
    - browse, search, and filter books
    - manage your personal library ("My Library")
    - add, update, and delete your review per book
- **Admin app (Handlebars)**:
    - add, edit, and delete books
    - list, search, and filter books
    - restricted to admin users
- **Single server**: Express serves the API, Handlebars admin UI, and
  built React app

<small>**Note**: I modified the schema slightly and built this with a "global" book catalog that the admin modifies, and so user collections are modeled via a collection_books join table rather than having a collection_id on the book object.</small>

## Requirements

- Docker

## Setup (Docker)

Create the environment file:

```bash
cp .env.example .env
```

Build and run:

```bash
docker compose up --build
```

## URLs

React app:\
http://localhost:3000/app/books

My Library:\
http://localhost:3000/app/library

Admin:\
http://localhost:3000/admin/books

Health check:\
http://localhost:3000/api/health

## Seeded Admin Account

- username: `admin`
- password: `admin123!`

## Reset databases

```bash
docker compose down -v
docker compose up --build
```
