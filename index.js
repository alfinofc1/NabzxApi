const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;
app.enable("trust proxy");
app.set("json spaces", 2);
 
const {
  convertCRC16,
  generateTransactionId,
  generateExpirationTime,
  elxyzFile,
  generateQRIS,
  createQRIS,
  checkQRISStatus
} = require('./orkut.js') 

const { terabox, ytdl } = require('./lib/scraper.js') 

// Log Info
const messages = {
  error: {
    status: 404,
    creator: "Nabzx",
    result: "Error, Service Unavailable",
  },
  notRes: {
    status: 404,
    creator: "Nabzx",
    result: "Error, Invalid JSON Result",
  },
  query: {
    status: 400,
    creator: "Nabzx",
    result: "Please input parameter query!",
  },
  amount: {
    status: 400,
    creator: "Nabzx",
    result: "Please input parameter amount!",
  },
  codeqr: {
    status: 400,
    creator: "Nabzx",
    result: "Please input parameter codeqr!",
  },
  url: {
    status: 400,
    creator: "Nabzx",
    result: "Please input parameter URL!",
  },
  notUrl: {
    status: 404,
    creator: "Nabzx",
    result: "Error, Invalid URL",
  },
};
function genreff() {
  const characters = '0123456789';
  const length = 5;
  let reffidgen = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    reffidgen += characters[randomIndex];
  }
  return reffidgen;
}

// Middleware untuk CORS
app.use(cors());






// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'feature.html'));
});

app.get("/api/download/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json(messages.url);

  try {
  const { tiktokdl } = require("tiktokdl")
    const data = await tiktokdl(url);
    if (!data) return res.status(404).json(messages.notRes);
    res.json({ status: true, creator: "Nabzx", result: data });
  } catch (e) {
    res.status(500).json(messages.error);
  }
});

app.get('/api/download/terabox', async (req, res) => {
 try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        status: false,
        creator: "Nabzx",
        error: "Isi Parameter Url.",
      });
    }
    const results = await terabox(url);
    if (!results || results.length === 0) {
      return res.status(404).json({
        status: false,
        creator: "Nabzx",
        error: "No files found or unable to generate download links.",
      });
    }
    return res.status(200).json({
      success: true,
      creator: "Nabzx",
      results: results,
      request_at: new Date(),
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: false,
      creator: "Nabzx",
      error: "Internal server error.",
    });
  }
});

app.get('/api/download/spotify', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: "Nabzx",
        error: "Isi Parameter Url."
      });
    }

    const response = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`);

    const metadata = response.data.metadata;
    const downloadUrl = response.data.download;

    return res.status(200).json({
      status: true,
      creator: "Nabzx",
      metadata: {
        album_artist: metadata.album_artist,
        album_name: metadata.album_name,
        artist: metadata.artist,
        cover_url: metadata.cover_url,
        name: metadata.name,
        release_date: metadata.releaseDate,
        track_number: metadata.trackNumber,
        spotify_url: metadata.url
      },
      download: downloadUrl
    });
  } catch (e) {
    console.error("Error:", e.message);
    return res.status(500).json({
      status: false,
      creator: "Nabzx", 
      error: "Internal server error."
    });
  }
});

app.get('/api/download/ytdl', async (req, res) => {
  try {
    const { url, videoQuality, audioQuality } = req.query;

    if (!url || !videoQuality || !audioQuality) {
      return res.status(400).json({
        success: false,
        creator: "Nabzx",
        error: "Isi Parameter url, videoQuality, dan audioQuality.",
      });
    }

    const videoQualityIndex = parseInt(videoQuality, 10);
    const audioQualityIndex = parseInt(audioQuality, 10);

    try {
      const result = await ytdl.downloadVideoAndAudio(url, videoQualityIndex, audioQualityIndex);
      return res.status(200).json({
        success: true,
        creator: "Nabzx",
        result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        creator: "Nabzx",
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      creator: "Nabzx",
      error: 'Internal server error.',
    });
  }
});

app.get('api/ai/dukun', async (req, res) => {  // <-- Ganti GET menjadi POST
    const content = req.body.content; // <-- Ambil data dari body request

    if (!content) {
        return res.json({
            status: false,
            creator: "kiki",
            message: '[!] masukan data content di body request', // <-- Pesan error diubah
        });
    }

    axios.get(`https://api.siputzx.my.id/api/ai/dukun?content=${encodeURIComponent(content)}`) // <-- Gunakan content dari body
        .then(response => {
            const data = response.data;
            if (data && data.status === true && data.result) {
                
                res.json({
                    status: true,
                    creator: `${creator}`,
                    result: data.result,
                });
            } else {
                res.json({
                    status: false,
                    creator: `${creator}`,
                    message: "Gagal mengambil data dari API Dukun atau data tidak sesuai format",
                });
            }

        })
        .catch(error => {
            console.error("Error saat memanggil API Dukun:", error);
            res.json(loghandler.error);
        });
});

app.get('/api/orkut/createpayment', async (req, res) => {
    const { apikey } = req.query;    
    if (apikey !== 'Nabzxboy') {
    return res.status(403).json({ error: "Isi Parameter Apikey" });
    }
    const { amount } = req.query;
    if (!amount) {
    return res.json("Isi Parameter Amount.");
    }
    const { codeqr } = req.query;
    if (!codeqr) {
    return res.json("Isi Parameter CodeQr menggunakan qris code kalian.");
    }
    try {
        const qrData = await createQRIS(amount, codeqr);
        res.json({ status: true, creator: "Nabzx", result: qrData });        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orkut/cekstatus', async (req, res) => {
    const { apikey, merchant, keyorkut } = req.query;
    
    if (apikey !== 'Nabzxboy') {
    return res.status(403).json({ error: "Isi Parameter Apikey" });
    }
    
        if (!merchant) {
        return res.json({ error: "Isi Parameter Merchant." });
    }
    if (!keyorkut) {
        return res.json({ error: "Isi Parameter Token menggunakan token kalian." });
    }
    try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant}/${keyorkut}`;
        const response = await axios.get(apiUrl);
        const result = response.data;
                // Check if data exists and get the latest transaction
        const latestTransaction = result.data && result.data.length > 0 ? result.data[0] : null;
                if (latestTransaction) {
            res.json(latestTransaction);
        } else {
            res.json({ message: "No transactions found." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orkut/ceksaldo', async (req, res) => {
    const { apikey, merchant, pin, password } = req.query;
    
    if (apikey !== 'Nabzxboy') {
    return res.status(403).json({ error: "Isi Parameter Apikey" });
    }
    
    if (!merchant) {
    return res.json({ error: "Isi Parameter Merchant." });
    }
    if (!pin) {
    return res.json({ error: "Isi Parameter Pin menggunakan Pin transaksi." });
    }
    if (!password) {
        return res.status(400).json({ error: "Parameter 'password' tidak diisi." });
    }
    
    try {
        const apiUrl = `https://h2h.okeconnect.com/trx/balance?memberID=${merchant}&pin=${pin}&password=${password}`;
        const response = await axios.get(apiUrl);        
        const result = response.data;
        if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
            const latestTransaction = result.data[0];
            return res.json(latestTransaction);
        } else {
            return res.json({ message: "Tidak ada transaksi ditemukan." });
        }
    } catch (error) {
        console.error("Error saat mengakses API eksternal:", error.message);
        const errorMessage = error.response ? error.response.data : error.message;
        return res.status(500).json({ error: errorMessage });
    }
});

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app