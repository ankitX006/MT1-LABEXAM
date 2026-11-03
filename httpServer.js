import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 3000;
const publicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350 },
  { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen', price: 420 },
  { id: 3, title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 500 },
];

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(Object.assign(new Error('Request body is too large'), { statusCode: 413 }));
        request.destroy();
      }
    });
    request.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(Object.assign(new Error('Request body must be valid JSON'), { statusCode: 400 })); }
    });
    request.on('error', reject);
  });
}

function isValidBook(book) {
  return book && Number.isInteger(book.id) && book.id > 0
    && typeof book.title === 'string' && book.title.trim().length > 0
    && typeof book.author === 'string' && book.author.trim().length > 0
    && typeof book.price === 'number' && Number.isFinite(book.price) && book.price >= 0;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
  const { pathname } = requestUrl;

  if (request.method === 'GET' && pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>Library server</title><body><h1>Welcome to the Library Book Management server</h1><p>Explore <a href="/books">the books API</a> or view <a href="/about">about this application</a>.</p></body></html>');
    return;
  }

  if (request.method === 'GET' && pathname === '/books') {
    sendJson(response, 200, books);
    return;
  }

  if (request.method === 'POST' && pathname === '/add-book') {
    try {
      const book = await readJsonBody(request);
      if (!isValidBook(book)) {
        sendJson(response, 400, { error: 'Book must include a positive integer id, non-empty title and author, and a non-negative numeric price.' });
        return;
      }
      if (books.some((existingBook) => existingBook.id === book.id)) {
        sendJson(response, 409, { error: `A book with id ${book.id} already exists.` });
        return;
      }
      const newBook = { id: book.id, title: book.title.trim(), author: book.author.trim(), price: book.price };
      books.push(newBook);
      sendJson(response, 201, { message: 'Book added successfully', book: newBook });
    } catch (error) {
      if (!response.destroyed) sendJson(response, error.statusCode ?? 400, { error: error.message });
    }
    return;
  }

  if (request.method === 'GET' && pathname === '/about') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>About | Library</title><body><h1>About this application</h1><p>A library book management demonstration built with the Node.js HTTP and FS modules.</p><p><a href="/">Back to welcome page</a></p></body></html>');
    return;
  }

  if (request.method === 'GET' && pathname === '/home') {
    try {
      const html = await readFile(path.join(publicDirectory, 'index.html'), 'utf8');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(html);
    } catch (error) {
      console.error('Could not read public/index.html:', error);
      sendJson(response, 500, { error: 'The library home page could not be read.' });
    }
    return;
  }

  sendJson(response, 404, { error: `Route not found: ${request.method} ${pathname}` });
});

server.listen(PORT, () => console.log(`HTTP Server running at http://localhost:${PORT}`));

