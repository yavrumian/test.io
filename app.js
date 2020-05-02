const express = require('express'),
    app = express();

const port = 8080// Change port here

app.use(express.static('static'))

app.listen(port)
