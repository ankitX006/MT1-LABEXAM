# MT1-LABEXAM — Library Book Management

A Node.js lab project with two independent applications: a built-in HTTP/FS server on port 3000 and an Express REST API on port 4000. Both keep their records in JavaScript arrays; there is no database.

## Requirements

- Node.js 18 or newer
- npm

## Install

```sh
npm install
```

## Run Part A: HTTP and FS modules

```sh
npm run start:http
```

Expected message: `HTTP Server running at http://localhost:3000`

- `GET /` — HTML welcome page
- `GET /books` — books as JSON
- `POST /add-book` — add a book using JSON (`id`, `title`, `author`, `price`)
- `GET /about` — application information
- `GET /home` — reads and serves `public/index.html` with the FS module

Example:

```sh
curl -X POST http://localhost:3000/add-book -H "Content-Type: application/json" -d '{"id":4,"title":"Clean Code","author":"Robert C. Martin","price":550}'
```

## Run Part B: Express REST API

Open a second terminal:

```sh
npm run start:api
```

Expected message: `Express Server running at http://localhost:4000`

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/books` | List all books |
| GET | `/books/:id` | Get a book by ID |
| POST | `/books` | Add a book; returns 201 |
| PUT | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

Create example:

```sh
curl -X POST http://localhost:4000/books -H "Content-Type: application/json" -d '{"id":4,"title":"Clean Code","author":"Robert C. Martin","price":550,"category":"Programming"}'
```

The API validates request data, reports missing records with 404, rejects duplicate IDs with 409, and returns JSON errors for invalid requests. Data resets when the corresponding process restarts.

## Submission screenshots

Capture and save the requested evidence in `screenshots/`:

1. HTTP server running and a successful request.
2. `/home` displayed in a browser to show FS static file serving.
3. EchoAPI GET, POST, PUT and DELETE results against port 4000.
4. GitHub repository page showing commit history after publishing.

Screenshots are intentionally left for the student to capture from their own terminal, browser, EchoAPI session and connected GitHub account.

