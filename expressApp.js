import express from 'express';

const app = express();
const PORT = 4000;
app.use(express.json({ limit: '1mb' }));

const books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, category: 'Fiction' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 450, category: 'Self-help' },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', price: 550, category: 'Programming' },
];

function validBookFields(book, { requireId = false } = {}) {
  if (!book || typeof book !== 'object' || Array.isArray(book)) return false;
  const hasValidId = !requireId || (Number.isInteger(book.id) && book.id > 0);
  return hasValidId
    && typeof book.title === 'string' && book.title.trim().length > 0
    && typeof book.author === 'string' && book.author.trim().length > 0
    && typeof book.price === 'number' && Number.isFinite(book.price) && book.price >= 0
    && (book.category === undefined || (typeof book.category === 'string' && book.category.trim().length > 0));
}

app.get('/books', (request, response) => response.json(books));

app.get('/books/:id', (request, response) => {
  const id = Number(request.params.id);
  const book = books.find((item) => item.id === id);
  if (!Number.isInteger(id) || !book) {
    response.status(404).json({ error: 'Book not found.' });
    return;
  }
  response.json(book);
});

app.post('/books', (request, response) => {
  const { body } = request;
  if (!validBookFields(body, { requireId: true })) {
    response.status(400).json({ error: 'Provide a positive integer id, non-empty title and author, and a non-negative numeric price. Category is optional.' });
    return;
  }
  if (books.some((book) => book.id === body.id)) {
    response.status(409).json({ error: `A book with id ${body.id} already exists.` });
    return;
  }
  const book = {
    id: body.id,
    title: body.title.trim(),
    author: body.author.trim(),
    price: body.price,
    category: typeof body.category === 'string' ? body.category.trim() : 'Uncategorized',
  };
  books.push(book);
  response.status(201).json({ message: 'Book added successfully', book });
});

app.put('/books/:id', (request, response) => {
  const id = Number(request.params.id);
  const bookIndex = books.findIndex((book) => book.id === id);
  if (!Number.isInteger(id) || bookIndex === -1) {
    response.status(404).json({ error: 'Book not found.' });
    return;
  }
  if (!validBookFields(request.body)) {
    response.status(400).json({ error: 'Provide non-empty title and author, a non-negative numeric price, and an optional non-empty category.' });
    return;
  }
  const updatedBook = {
    id,
    title: request.body.title.trim(),
    author: request.body.author.trim(),
    price: request.body.price,
    category: typeof request.body.category === 'string' ? request.body.category.trim() : books[bookIndex].category,
  };
  books[bookIndex] = updatedBook;
  response.json({ message: 'Book updated successfully', book: updatedBook });
});

app.delete('/books/:id', (request, response) => {
  const id = Number(request.params.id);
  const bookIndex = books.findIndex((book) => book.id === id);
  if (!Number.isInteger(id) || bookIndex === -1) {
    response.status(404).json({ error: 'Book not found.' });
    return;
  }
  const [deletedBook] = books.splice(bookIndex, 1);
  response.json({ message: 'Book deleted successfully', book: deletedBook });
});

app.use((request, response) => response.status(404).json({ error: `Route not found: ${request.method} ${request.path}` }));

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'Request body must be valid JSON.' });
    return;
  }
  if (error.status === 413) {
    response.status(413).json({ error: 'Request body is too large.' });
    return;
  }
  console.error(error);
  response.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`Express Server running at http://localhost:${PORT}`));

