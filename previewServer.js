const express = require('express');
const path = require('path');

const app = express();

app.use('/preview', express.static(path.join(__dirname, 'demo')));
app.use('', express.static(path.join(__dirname, 'demo'))); // For when using a custom address

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

let server = app.listen(9000);

process.on('SIGINT', function () {
    server.close();
    console.log('Preview server stopped');
    process.exit();
});

console.log('\nPreview hosted at port 9000');