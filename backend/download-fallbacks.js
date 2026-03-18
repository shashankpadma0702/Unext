const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/ICICI_Bank_Headquarters_at_Bandra_Kurla_Complex.jpg/800px-ICICI_Bank_Headquarters_at_Bandra_Kurla_Complex.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bombay_Stock_Exchange.jpg/800px-Bombay_Stock_Exchange.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Reserve_Bank_of_India%2C_Mumbai.jpg/800px-Reserve_Bank_of_India%2C_Mumbai.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Web_Analytics.png/800px-Web_Analytics.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/National_Stock_Exchange_of_India.jpg/800px-National_Stock_Exchange_of_India.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Indian_Rupee_Symbol.jpg/800px-Indian_Rupee_Symbol.jpg"
];

const destFolder = path.join(__dirname, '../frontend/public/finance-images');
if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

Promise.all(images.map((url, i) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(destFolder, `finance${i+1}.jpg`);
    const file = fs.createWriteStream(filePath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(`Downloaded finance${i+1}.jpg`);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
})).then(results => {
  console.log("All downloads finished successfully:\n", results.join("\n"));
}).catch(console.error);
