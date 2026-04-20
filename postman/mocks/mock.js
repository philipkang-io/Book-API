const http = require('http');

// In-memory book store
const books = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925, genre: 'Fiction' },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960, genre: 'Fiction' },
  { id: '3', title: '1984', author: 'George Orwell', year: 1949, genre: 'Dystopian' }
];

let nextId = 4;

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function sendJSON(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  const method = req.method;
  const url = req.url.split('?')[0];

  // @endpoint GET /
  if (method === 'GET' && url === '/') {
    return sendJSON(res, 200, {
      message: 'Book API',
      docs: 'GET /api/v1/books'
    });
  }

  // @endpoint GET /health
  if (method === 'GET' && url === '/health') {
    return sendJSON(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  }

  // @endpoint GET /api/v1/books
  if (method === 'GET' && url === '/api/v1/books') {
    return sendJSON(res, 200, { books });
  }

  // @endpoint POST /api/v1/books
  if (method === 'POST' && url === '/api/v1/books') {
    let body;
    try {
      body = await getBody(req);
    } catch (e) {
      return sendJSON(res, 400, { error: 'Invalid JSON body' });
    }
    if (!body.title || !body.author) {
      return sendJSON(res, 400, {
        error: 'Validation error',
        message: 'Fields \'title\' and \'author\' are required'
      });
    }
    const book = {
      id: String(nextId++),
      title: body.title,
      author: body.author,
      year: body.year || null,
      genre: body.genre || null
    };
    books.push(book);
    return sendJSON(res, 201, { book });
  }

  // Match /api/v1/books/:id
  const bookIdMatch = url.match(/^\/api\/v1\/books\/([^/]+)$/);

  // @endpoint GET /api/v1/books/:id
  if (method === 'GET' && bookIdMatch) {
    const id = bookIdMatch[1];
    const book = books.find(b => b.id === id);
    if (!book) {
      return sendJSON(res, 404, { error: 'Not found', message: `Book with id '${id}' not found` });
    }
    return sendJSON(res, 200, { book });
  }

  // @endpoint PUT /api/v1/books/:id
  if (method === 'PUT' && bookIdMatch) {
    const id = bookIdMatch[1];
    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
      return sendJSON(res, 404, { error: 'Not found', message: `Book with id '${id}' not found` });
    }
    let body;
    try {
      body = await getBody(req);
    } catch (e) {
      return sendJSON(res, 400, { error: 'Invalid JSON body' });
    }
    books[index] = {
      ...books[index],
      title: body.title !== undefined ? body.title : books[index].title,
      author: body.author !== undefined ? body.author : books[index].author,
      year: body.year !== undefined ? body.year : books[index].year,
      genre: body.genre !== undefined ? body.genre : books[index].genre
    };
    return sendJSON(res, 200, { book: books[index] });
  }

  // @endpoint DELETE /api/v1/books/:id
  if (method === 'DELETE' && bookIdMatch) {
    const id = bookIdMatch[1];
    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
      return sendJSON(res, 404, { error: 'Not found', message: `Book with id '${id}' not found` });
    }
    books.splice(index, 1);
    return sendJSON(res, 200, { message: 'Book deleted', id });
  }

  // 404 fallback
  sendJSON(res, 404, { error: 'Not found', message: `Cannot ${method} ${url}` });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Book API Mock server running on port ${PORT}`);
});
