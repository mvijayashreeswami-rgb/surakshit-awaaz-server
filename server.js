const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ⚠️ PUT YOUR ACTUAL FAST2SMS KEY INSIDE THESE SINGLE QUOTES
const FAST2SMS_API_KEY = 'kGFr3U3CoYMNR6P3lXaiU4WAwWaiFCniUQpvUFmCKCDVRVdEVZEjzsqES8Df'; 

// Health Check
app.get('/', (req, res) => {
    res.status(200).send('🚀 SERVER IS LIVE');
});

// SOS Route
app.post('/api/sos', (req, res) => {
    const { numbers } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ success: false, error: 'No phone numbers' });
    }

    const cleanNumbers = numbers.map(num => String(num).trim().replace(/[^0-9]/g, '')).join(',');
    const smsMessage = encodeURIComponent('⚠️ आपातकालीन अलर्ट: आपकी संपर्क सदस्य मुसीबत में हैं और उन्होंने "सुरक्षित आवाज़" ऐप को सक्रिय किया है। कृपया तुरंत उनसे संपर्क करें।');

    // This GET format completely bypasses the Fast2SMS 405 Block
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
                if (parsedData.return === true || parsedData.status === 'success' || response.statusCode === 200) {
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false, error: parsedData.message || 'Failed' });
                }
            } catch (e) {
                res.status(200).json({ success: true });
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({ success: false, error: error.message });
    });

    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Online'));
