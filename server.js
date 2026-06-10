const express = require('express');
const cors = require('cors');
const https = require('https'); // Native Node fallback (No installation needed)

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const FAST2SMS_API_KEY = 'const express = require('express');
const cors = require('cors');
const https = require('https'); // Native Node fallback (No installation needed)

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const FAST2SMS_API_KEY = 'kGFr3U3CoYMNR6P3lXaiU4WAwWaiFCniUQpvUFmCKCDVRVdEVZEjzsqES8Df'; 

app.post('/api/sos', (req, res) => {
    const { numbers } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ success: false, error: 'No phone numbers provided.' });
    }

    const cleanNumbers = numbers.map(num => num.trim().replace(/[^0-9]/g, '')).join(',');

    // CRITICAL FAST2SMS CHANGE FOR HINDI: 
    // 1. Change language to 'unicode'
    // 2. Write your message cleanly in Hindi text
    const smsPayload = JSON.stringify({
        route: 'q',
        message: '⚠️ आपातकालीन अलर्ट: आपकी संपर्क सदस्य मुसीबत में हैं और उन्होंने "सुरक्षित आवाज़" ऐप को सक्रिय किया है। कृपया तुरंत उनसे संपर्क करें।',
        language: 'unicode', 
        numbers: cleanNumbers
    });

    // Native HTTPS request configuration to prevent 'fetch is not a function' environment crashes
    const options = {
        hostname: 'www.fast2sms.com',
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
            'authorization': FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(smsPayload)
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.return === true) {
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false, error: parsedData.message });
                }
            } catch (e) {
                res.status(500).json({ success: false, error: 'Data parse failure' });
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({ success: false, error: error.message });
    });

    request.write(smsPayload);
    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SOS Server processing on port ${PORT}`));'; 

app.post('/api/sos', (req, res) => {
    const { numbers } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ success: false, error: 'No phone numbers provided.' });
    }

    const cleanNumbers = numbers.map(num => num.trim().replace(/[^0-9]/g, '')).join(',');

    // CRITICAL FAST2SMS CHANGE FOR HINDI: 
    // 1. Change language to 'unicode'
    // 2. Write your message cleanly in Hindi text
    const smsPayload = JSON.stringify({
        route: 'q',
        message: '⚠️ आपातकालीन अलर्ट: आपकी संपर्क सदस्य मुसीबत में हैं और उन्होंने "सुरक्षित आवाज़" ऐप को सक्रिय किया है। कृपया तुरंत उनसे संपर्क करें।',
        language: 'unicode', 
        numbers: cleanNumbers
    });

    // Native HTTPS request configuration to prevent 'fetch is not a function' environment crashes
    const options = {
        hostname: 'www.fast2sms.com',
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
            'authorization': FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(smsPayload)
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.return === true) {
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false, error: parsedData.message });
                }
            } catch (e) {
                res.status(500).json({ success: false, error: 'Data parse failure' });
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({ success: false, error: error.message });
    });

    request.write(smsPayload);
    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SOS Server processing on port ${PORT}`));
