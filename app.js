const express = require('express'),
    app = express();

const port = process.env.PORT || 8080 // Change port here

app.use(express.static('static'))

app.listen(port)
