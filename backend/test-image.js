const https = require('https');

https.get('https://unext-1.onrender.com/finance-images/finance1.jpg', res => {
  console.log('Status code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  
  res.once('data', chunk => {
    console.log('First chunk length:', chunk.length);
    console.log('First 50 bytes (string):', chunk.toString('utf8').substring(0, 50));
    process.exit();
  });
});
