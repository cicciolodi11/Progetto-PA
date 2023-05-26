const express = require('express');
const router = require('./router').router;
const sequelize = require('sequelize');


const port = 3000;
const app = express();

app.use('/', router);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
