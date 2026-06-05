const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/sos', async (req, res) => {
  try {
    const { numbers } = req.body; 

    if (!numbers) {
      return res.status(400).json({ success: false, error: "No mobile numbers provided." });
    }

    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      "route": "q",
      "message": "EMERGENCY: This is an SOS alert from Surakshit Awaaz. Please help immediately!",
      "language": "english",
      "numbers": numbers 
    }, {
      headers: {
        "authorization": process.env.FAST2SMS_KEY
      }
    });

    return res.status(200).json({ success: true, details: response.data });

  } catch (error) {
    console.error("Fast2SMS Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ success: false, error: "SMS transmission failed." });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Surakshit Awaaz backend active on port ${PORT}`);
});
