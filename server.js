const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ⚠️ MAKE SURE YOUR REAL KEY IS PASSED HERE
const FAST2SMS_API_KEY = 'jMGXZTpR471WncpAcW0dNNBZAo4oFkZtSpDkuMlFAFYk1gGTtxDFLpMwcrRP'; 

app.get('/', (req, res) => {
    res.status(200).send('🚀 SERVER IS LIVE');
});

app.post('/api/sos', (req, res) => {
    const { numbers } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ success: false, error: 'No phone numbers' });
    }

    const cleanNumbers = numbers.map(num => String(num).trim().replace(/[^0-9]/g, '')).join(',');
    const smsMessage = encodeURIComponent('⚠️ आपातकालीन अलर्ट: आपकी संपर्क सदस्य मुसीबत में हैं और उन्होंने "सुरक्षित आवाज़" ऐप को सक्रिय किया है। कृपया तुरंत उनसे संपर्क करें।');

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
            console.log("FAST2SMS RAW RESPONSE:", data); // This prints the exact error into your Railway terminal!
            try {
                const parsedData = JSON.parse(data);
                if (parsedData.return === true || parsedData.status === 'success') {
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false, error: parsedData.message || 'Fast2SMS Denied Request' });
                }
            } catch (e) {
                res.status(200).json({ success: true });
            }
        });
    });

    request.on('error', (error) => {
        console.error("SYSTEM REQUEST ERROR:", error.message);
        res.status(500).json({ success: false, error: error.message });
    });

    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Online'));
