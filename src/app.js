const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/../public'));

app.use(require('./game_routes'));

module.exports = app;
