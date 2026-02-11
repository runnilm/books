# Book Collection Manager - Technical Assessment

## Overview

Create a simple book collection management system that allows users to manage their personal library. This project will demonstrate familiarity with your full stack skills while remaining manageable within a reasonable interview timeframe.

## Technical Requirements

### Database

- PostgreSQL: Store user and book collection metadata
- MongoDB: Store book details and reviews

### Backend (Node.js + Express)

- RESTful API endpoints for CRUD operations
- Authentication middleware
- Data validation
- Integration between PostgreSQL and MongoDB

### Admin Frontend (Handlebars)

- Responsive design
- Book list view with search/filter capabilities
- Add/edit/delete book functionality
- Do not use AI for any Handlebars development

### User Frontend (Vite + React)

- Responsive design
- Basic user authentication UI
- Book list view with search/filter capabilities
- Use AI for all React development

## Core Features

1. User Authentication
    - Sign up/login functionality
    - Session management
    - Users should not have access to the admin frontend

2. Admin frontend
    - Add new books with title, author, ISBN, and category
    - Edit existing book details
    - Delete books from collection
    - List view with search/filter

3. User frontend
    - Add reviews, ratings, etc
    - List of existing books with search/filter

4. Search Functionality
    - Search books by title, author, or ISBN
    - Filter by category

5. Single Server
    - The React app, Handlebars views, and Express app should be run and served from a single application server

## Technical Specifications

### PostgreSQL Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE user_collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Schema

```javascript
const BookSchema = {
    title: String,
    author: String,
    isbn: String,
    category: String,
    collection_id: Number,
    added_at: Date,
};
```

### Required API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/books
- POST /api/books
- PUT /api/books/:id
- DELETE /api/books/:id
- GET /api/books/search

## Evaluation Criteria

### Code Quality (40%)

- Clean, well-organized code structure
- Proper error handling
- Input validation
- Security best practices
- Use of async/await
- Functional React

### Functionality (30%)

- All CRUD operations working correctly
- Proper database integration
- Authentication working as expected
- Search/filter functionality working

### Frontend Implementation (20%)

- Clean, intuitive UI using Handlebars & React
- Responsive design
- Form validation
- Proper error messaging

### Extra Credit (10%)

- Data seeding script
- Documentation
- Performance optimization

## Submission Requirements

- GitHub repository with complete code
- README with setup instructions
- Any necessary environment variables documented
- Database setup scripts included
