const http = require('http');
const GATE = 3000;
const network = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  if (req.url === '/') {
    res.statusCode = 200;
    res.end('<html><body><h1>Hiii!! Affordmed</h1><p>Welcome to the MKCE</p></body></html>');
  } else {
    res.statusCode = 404;
    res.end('<html><body><h1>404: Not Found</h1><p>The requested resource was not found.</p></body></html>');
  }
});
network.listen(GATE, () => {
  console.log(`network running at http://localhost:${GATE}/`);
});
