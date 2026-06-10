const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// MAKE SURE YOUR REALSMS KEY IS INSIDE QUOTES!
const FAST2SMS_API_KEY = 'kGFr3U3CoYMNR6P3lXaiU4WAwWaiFCniUQpvUFmCKCDVRVdEVZEjzsqES8Df'; 

// 1. HEALTH PING (To test if server is alive)
app.get('/', (req, res) => {
    res.status(200).send('🚀 SURAKSHIT AWAAZ BACKEND SERVER IS ONLINE!');
});

// 2. SOS ROUTER
// REPLACE FROM HERE...
app.post('/api/sos', (req, res) => {
    const { numbers } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ success: false, error: 'No phone numbers provided.' });
    }

    const cleanNumbers = numbers.map(num => String(num).trim().replace(/[^0-9]/g, '')).join(',');
    
    // Clean string formatting for Hindi characters via URL parameter encoding
    const smsMessage = encodeURIComponent('⚠️ आपातकालीन अलर्ट: आपकी संपर्क सदस्य मुसीबत में हैं और उन्होंने "सुरक्षित आवाज़" ऐप को सक्रिय किया है। कृपया तुरंत उनसे संपर्क करें।');

    // Fire a GET request with query params - avoids the 405 Method block entirely
    const targetUrl = `/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&route=q&message=${smsMessage}&language=unicode&numbers=${cleanNumbers}`;

    const options = {
        hostname: 'www.fast2sms.com',
        path: targetUrl,
        method: 'GET'
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.return === true || parsedData.status === 'success') {
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false, error: parsedData.message || 'Fast2SMS processing failed' });
                }
            } catch (e) {
                if(data.includes("true") || response.statusCode === 200) {
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false, error: 'Response parsing adjustment needed' });
                }
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({ success: false, error: error.message });
    });

    request.end();
});
// ...DOWN TO HERE.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('SOS Server processing online'));
