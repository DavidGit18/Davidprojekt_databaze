const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Nastav EJS jako templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Připojení k databázi
const connection = mysql.createConnection({
  host: '192.168.11.1',
  user: '4IT_2024',
  password: '4it2024',
  database: '4IT_2024',
  port: 3306
});

// Otestuj připojení
connection.connect((err) => {
  if (err) {
    console.error('Chyba při připojování k databázi: ' + err.stack);
    return;
  }
  console.log('Připojeno k databázi jako id ' + connection.threadId);
});

// Nastav routu pro zobrazení dat
app.get('/', (req, res) => {
  connection.query('SELECT * FROM legia_foods', (error, results) => {
    if (error) {
      return res.status(500).send('Chyba při dotazu na databázi');
    }
    res.render('table', { foods: results });
  });
});

// Spusť server
app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
