const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const FAST2SMS_API_KEY = 'jMGXZTpR471WncpAcW0dNNBZAo4oFkZtSpDkuMlFAFYk1gGTtxDFLpMwcrRP'; 

app.get('/', (req, res) => {
    res.status(200).send('🚀 SERVER IS LIVE');
});

app.post('/api/sos', (req, res) => {
    // 1. CRITICAL FIX: You must destructure 'name' right here from req.body
    const { numbers, location, name } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ success: false, error: 'No phone numbers' });
    }

    const lat = location ? location.latitude : "Unknown";
    const lon = location ? location.longitude : "Unknown";
    
    // 2. CRITICAL FIX: Save her true name, or use the fallback if it's completely missing
    const victimName = name || "एक यूजर";
    
    const mapLink = (lat !== "Unknown" && lon !== "Unknown") 
        ? `https://www.google.com/maps?q=${lat},${lon}` 
        : "Location Access Denied By User";

    // 3. CRITICAL FIX: Swap out the hardcoded text for the dynamic ${victimName} variable
    const telegramTextMessage = encodeURIComponent(
        `🚨 EMERGENCY ALERT TRIGGERED 🚨\n\n` +
        `👤 Victim's Name: ${victimName}\n\n` +
        `📞 Registered Emergency Contacts:\n` +
        `1. ${numbers[0] || 'Not provided'}\n` +
        `2. ${numbers[1] || 'Not provided'}\n` +
        `3. ${numbers[2] || 'Not provided'}\n\n` +
        `📍 Victim's Live Location:\n${mapLink}`
    );

    const TELEGRAM_BOT_TOKEN = "8541675621:AAFazzRXTrLZboF-p1s_PTtO3L3Cmuut-3A";
    const TELEGRAM_CHAT_ID = "6683926456";

    const telegramUrl = `/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${telegramTextMessage}`;

    const tOptions = {
        hostname: 'api.telegram.org',
        path: telegramUrl,
        method: 'GET'
    };

    const tRequest = https.request(tOptions, (tResponse) => {
        let tData = '';
        tResponse.on('data', (chunk) => { tData += chunk; });
        tResponse.on('end', () => {
            console.log("TELEGRAM VAULT RESPONSE:", tData);
        });
    });
    tRequest.on('error', (err) => {
        console.error("TELEGRAM ERROR:", err.message);
    });
    tRequest.end();

    const cleanNumbers = numbers.map(num => String(num).trim().replace(/[^0-9]/g, '')).join(',');
    
    // 4. CRITICAL FIX: Make sure the SMS also uses her dynamic name!
    const hindiSmsMessage = `आपातकालीन स्थिति! ${victimName} को मदद की ज़रूरत है! लाइव लोकेशन: ${mapLink}`;
    const smsMessage = encodeURIComponent(hindiSmsMessage);

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
            console.log("FAST2SMS RAW RESPONSE:", data); 
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
