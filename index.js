const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Nastavení EJS jako templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Připojení k databázi
const connection = mysql.createConnection({
  host: '192.168.11.1',
  user: '4IT_2024',
  password: '4it2024',
  database: '4IT_2024',
  port: 3306
});

// Otestování připojení
connection.connect((err) => {
  if (err) {
    console.error('Chyba při připojování k databázi: ' + err.stack);
    return;
  }
  console.log('Připojeno k databázi jako id ' + connection.threadId);
});

// Přidání záznamu do tabulky
app.post('/add/:tableName', (req, res) => {
  const tableName = req.params.tableName;  
  const columns = Object.keys(req.body);   
  const values = Object.values(req.body);  

  const query = `INSERT INTO ?? (${columns.join(', ')}) VALUES (?)`;

  connection.query(query, [tableName, values], (error) => {
    if (error) {
      console.error("Chyba při přidávání záznamu:", error);
      return res.status(500).send('Chyba při přidávání záznamu');
    }
    res.redirect(`/table/${tableName}`);
  });
});

// Smazání záznamu
app.post('/delete/:tableName/:id', (req, res) => {
  const { tableName, id } = req.params;

  const deleteQuery = `DELETE FROM ?? WHERE id = ?`;
  connection.query(deleteQuery, [tableName, id], (error) => {
    if (error) {
      console.error('Chyba při mazání záznamu:', error);
      return res.status(500).send('Chyba při mazání záznamu');
    }
    res.redirect(`/table/${tableName}`);
  });
});

// Domovská stránka
app.get('/', (req, res) => {
  res.render('home');
});

// Zobrazení tabulky
app.get('/table/:tableName', (req, res) => {
  const tableName = decodeURIComponent(req.params.tableName); // Dekódování názvu tabulky

  const getTablesQuery = 'SHOW TABLES';
  connection.query(getTablesQuery, (error, tables) => {
    if (error) {
      console.error('Chyba při získávání seznamu tabulek:', error);
      return res.status(500).send('Chyba při získávání seznamu tabulek');
    }

    const tableNames = tables.map(row => Object.values(row)[0]);

    const getColumnsQuery = `SHOW COLUMNS FROM ??`;
    connection.query(getColumnsQuery, [tableName], (error, columnResults) => {
      if (error) {
        console.error('Chyba při získávání informací o sloupcích:', error);
        return res.status(500).send('Chyba při získávání informací o sloupcích');
      }

      const columns = columnResults
        .filter(col => col.Field !== 'id')
        .map(col => col.Field);

      const getRecordsQuery = `SELECT * FROM ??`;
      connection.query(getRecordsQuery, [tableName], (error, recordResults) => {
        if (error) {
          console.error('Chyba při získávání záznamů:', error);
          return res.status(500).send('Chyba při získávání záznamů');
        }

        res.render('table', {
          tableName: tableName,
          tableNames: tableNames,
          columns: columns,
          records: recordResults,
        });
      });
    });
  });
});



// Vytvoření nové tabulky
app.post('/create-table', (req, res) => {
  const tableName = req.body.table_name;
  const column1 = req.body.column1;
  const column2 = req.body.column2;
  const column3 = req.body.column3; // Přidán třetí sloupec

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`${column1}\` VARCHAR(255) NOT NULL,
      \`${column2}\` VARCHAR(255) NOT NULL,
      \`${column3}\` VARCHAR(255) NOT NULL
    )
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Chyba při vytváření tabulky:', err);
      return res.status(500).send('Chyba při vytváření tabulky');
    }

    res.redirect(`/table/${tableName}`);
  });
});


// Smazání tabulky
app.post('/deleteTable', (req, res) => {
  const { tableName } = req.body;

  if (!tableName) {
    return res.status(400).send('Název tabulky je vyžadován');
  }

  const dropTableQuery = `DROP TABLE IF EXISTS ??`;
  connection.query(dropTableQuery, [tableName], (error) => {
    if (error) {
      console.error('Chyba při mazání tabulky:', error);
      return res.status(500).send('Chyba při mazání tabulky');
    }

    res.redirect('/');
  });
});

app.get('/home', (req, res) => {
  res.render('home'); // Ujisti se, že máš šablonu `home.ejs`
});

// Spuštění serveru
app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
