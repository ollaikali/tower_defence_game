// const http = require('http')
const fs = require('fs')
// const port = 3000
const main = require('./main.js')

main()

// const server = http.createServer(function(req, res) {
//     res.writeHead(200, { 'Content-Type': 'text/html' })
//     fs.readFile('index.html', main, function(error, data) {
//         if (error) {
//             res.writeHead(404)
//             res.write('Error: FIle Not Found')
//         } else {
//             res.write(data)
//         }
//         res.end
//     })
// })

// server.listen(port, function(error) {
//     if(error) {
//         console.log('Something went wrong', error)
//     }else {
//         console.log('Server is listening on port ' + port);
//     }
// })

