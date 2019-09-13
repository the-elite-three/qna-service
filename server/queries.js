const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'qna',
  password: '421',
  port: '5432',
});

const queryStatements = {
  getQuestions: 'SELECT question.product_id, question.question_id, question.question_body, \
    question.question_date_written, question.asker_name, question.question_helpful, question.question_reported, \
    answer.answer_id, answer.answer_body, answer.answer_date_written, answer.answerer_name, answer.answer_helpful, \
    answer.answer_reported, photo.url FROM question \
    LEFT JOIN answer ON question.question_id = answer.question_id \
    LEFT JOIN photo ON answer.answer_id = photo.answer_id WHERE question.product_id = ',
  addQuestion: 'INSERT INTO question(question_id, product_id, question_body, question_date_written, asker_name, \
    asker_email, question_reported, question_helpful)'
};

const getQuestions = (req, res) => {
  pool.query(`${queryStatements.getQuestions}${req.params.product_id}`, (err, results) => {
    if (err) {
      throw err;
    }

    let questionData = {};
    let answerData = {};
    
    results.rows.map((question) => {
      if (!questionData[question.question_body.trim()]) {
        questionData[question.question_body.trim()] = {
          'question_id': question.question_id,
          'question_body': question.question_body.trim(),
          'question_date': question.question_date_written,
          'asker_name': question.asker_name.trim(),
          'question_helpfulness': question.question_helpful,
          reported: question.question_reported,
          answers: {},
        };
      } 
    });

    results.rows.map((answer) => {
      if(!answerData[answer.answer_id] && answer.answer_id !== null) {
        answerData[answer.answer_id] = {
          id: answer.answer_id,
          body: answer.answer_body.trim(),
          date: answer.answer_date_written,
          'answerer_name': answer.answerer_name.trim(),
          helpfulness: answer.answer_helpful,
          photos: [],
        }
      }
    });

    results.rows.map((photo) => {
      if (photo.url !== null) {
        answerData[photo.answer_id].photos.push(photo.url.trim());
      }
    });

    results.rows.map((qna) => {
      if (qna.answer_id !== null && !questionData[qna.question_body.trim()].answers[qna.answer_id]) {
        questionData[qna.question_body.trim()].answers[qna.answer_id] = answerData[qna.answer_id];
      }
    });

    let serverResponse = {
      'product_id': results.rows[0].product_id,
      results: [],
    };

    for (let key in questionData) {
      serverResponse.results.push(questionData[key]);
    }

    res.status(200).json(serverResponse);
  });
};

const addQuestion = (req, res) => {
  //return console.log(req.body.name);
  const betterQuotes = {
    body: req.body.body,
    name: req.body.name,
    email: req.body.email,
  }

  pool.query(`${queryStatements.addQuestion} VALUES (default, ${req.params.product_id}, \
    '${req.body.body}', default, '${req.body.name}', '${req.body.email}', 0, 0)`, (err, results) => {
      if (err) {
        throw err;
      }
      res.status(201).send('Created');
  });
};

module.exports = {
  getQuestions,
  addQuestion,
}