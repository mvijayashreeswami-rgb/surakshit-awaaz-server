const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Your Fast2SMS API Key - set this in Railway environment variables
const FAST2SMS_KEY = process.env.FAST2SMS_KEY;

app.use(cors());
app.use(express.json());

// Health check - UptimeRobot will ping this
app.get('/', (req, res) => {
  res.json({ 
    status: 'Surakshit Awaaz Server Running ✅',
    time: new Date().toLocaleString('hi-IN')
  });
});

// Send alert SMS to all 3 contacts
app.post('/send-alert', async (req, res) => {
  const { name, contacts } = req.body;

  // Validate inputs
  if (!name || !contacts || contacts.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name and contacts required' 
    });
  }

  // Build the SMS message in Hindi
  const message = `🆘 SURAKSHIT AWAAZ ALERT\n${name} ko madad chahiye!\nAbhi unse contact karein.\nHelpline: 1091 | 100`;

  // Clean contact numbers - remove spaces, +91, etc
  const cleanContacts = contacts
    .map(c => c.replace(/\D/g, '').slice(-10))
    .filter(c => c.length === 10)
    .join(',');

  if (!cleanContacts) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid contact numbers' 
    });
  }

  try {
    // Send SMS via Fast2SMS
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: cleanContacts
      },
      {
        headers: {
          'authorization': FAST2SMS_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.return === true) {
      console.log(`✅ Alert sent for ${name} to ${cleanContacts}`);
      res.json({ 
        success: true, 
        message: 'SMS sent successfully',
        contacts: cleanContacts
      });
    } else {
      console.log('Fast2SMS error:', response.data);
      res.status(500).json({ 
        success: false, 
        error: 'SMS sending failed' 
      });
    }

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Surakshit Awaaz server running on port ${PORT}`);
});
