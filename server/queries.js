const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'qna',
  password: '421',
  port: '5432',
});

const getQuestions = (req, res) => {
  pool.query('SELECT * FROM public.question ORDER BY id DESC LIMIT 100', (err, results) => {
    if (err) {
      throw err;
    }
    res.status(200).json(results.rows);
  });
};

module.exports = {
  getQuestions,
}