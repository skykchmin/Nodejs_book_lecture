const http = require('http');

http.createServer((req, res) => {
    res.write('<h1>Hello Node!</h1>');
    res.write('<p>Hello Server</p>');
    res.end('<p>Hello!!</p>');
})
    .listen(8080, () => {
        console.log('8080 대기!');
    });

