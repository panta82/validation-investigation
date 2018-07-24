const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res, next) => {
  res.send({
    result: 'Hello, ' + (req.query.word || 'world')
  });
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});