const https = require('https');
const fs = require('fs');
const path = require('path');

const CLOUD_NAME = 'drenz1aia';
const API_KEY = '783989942313329';
const API_SECRET = 'kb1ANB17DfdYzKuKgiR_2LLNyG8';

const imagePath = './frontend/images/hero-tractor-premium.jpg';
const publicId = 'dongfeng-minitraktor/hero-premium';

// Read image and convert to base64
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

// Prepare upload data
const timestamp = Math.floor(Date.now() / 1000);
const uploadData = JSON.stringify({
    file: base64Image,
    public_id: publicId,
    timestamp: timestamp,
    api_key: API_KEY,
    signature: require('crypto')
        .createHash('sha1')
        .update(`public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`)
        .digest('hex')
});

const options = {
    hostname: 'api.cloudinary.com',
    port: 443,
    path: `/v1_1/${CLOUD_NAME}/image/upload`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(uploadData)
    }
};

console.log('🚀 Загружаем премиальное фото на Cloudinary...');

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('✅ Успешно загружено!');
            console.log('📸 URL:', response.secure_url);
            console.log('🔗 Public ID:', response.public_id);
        } else {
            console.error('❌ Ошибка загрузки:', res.statusCode);
            console.error(data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Ошибка запроса:', error);
});

req.write(uploadData);
req.end();
