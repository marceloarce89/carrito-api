const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/crear-carrito-try', async (req, res) => {
  const urls = req.body.urls;
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ success: false, error: "No se recibieron URLs válidas." });
  }

  const browser = await puppeteer.launch({
    headless: true, // Modo headless para servidores
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necesario para Railway
  });

  const page = await browser.newPage();

  try {
    for (const url of urls) {
      const p = await browser.newPage();
      await p.goto(url, { waitUntil: 'networkidle2' });

      await p.waitForSelector('button.single_add_to_cart_button', { timeout: 10000 });
      await p.click('button.single_add_to_cart_button');

      await new Promise(resolve => setTimeout(resolve, 2500));
      await p.close();
    }

    await page.goto('https://try.com.ar/carrito/', { waitUntil: 'networkidle2' });

    res.json({
      success: true,
      message: "✅ Carrito armado en Try.",
      redirectUrl: 'https://try.com.ar/carrito/'
    });
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({ success: false, error: e.message });
    await browser.close();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
