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
  addQuestion: 'INSERT INTO question (question_id, product_id, question_body, question_date_written, asker_name, \
    asker_email, question_reported, question_helpful)',
  addAnswer: 'INSERT INTO answer (answer_id, question_id, answer_body, answer_date_written, answerer_name, \
    answerer_email, answer_reported, answer_helpful)',
  addPhoto: 'INSERT INTO photo (id, answer_id, url)',
  updateQuestionHelpful: 'UPDATE question SET question_helpful=(SELECT question_helpful FROM question WHERE question_id =',
  reportQuestion: 'UPDATE question SET question_report=(SELECT question_report FROM question WHERE question_id =',
  updateAnswerHelpful: 'UPDATE answer SET answer_helpful=(SELECT answer_helpful FROM answer WHERE answer_id =',
  reportAnswer: 'UPDATE answer SET answer_report=(SELECT answer_report FROM answer WHERE answer_id =',
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
        if (answerData[photo.answer_id].photos.length < 5) {
          answerData[photo.answer_id].photos.push(photo.url.trim());
        }
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
  pool.query(`${queryStatements.addQuestion} VALUES (default, ${req.params.product_id}, \
    '${req.body.body}', default, '${req.body.name}', '${req.body.email}', 0, 0)`, (err, results) => {
      if (err) {
        throw err;
      }
      res.status(201).send('Created');
  });
};

const addAnswer = (req, res) => {
  pool.query(`${queryStatements.addAnswer} VALUES (default, ${req.params.question_id}, '${req.body.body}', default, '${req.body.name}', \
  '${req.body.email}', 0, 0)`, (err, results) => {
    if (err) {
      console.log(err.stack);
    } else {
      if (req.body.photos.length > 0) {
        let valueQuery = ''
        for (let i = 0; i < req.body.photos.length; i++) {
          i + 1 === req.body.photos.length ? valueQuery = valueQuery + `(default, (SELECT MAX(answer_id) FROM answer), ${req.body.photos[i]})`
          : valueQuery = valueQuery + `(default, (SELECT MAX(answer_id) FROM answer), ${req.body.photos[i]}), `
        }

        pool.query(`${queryStatements.addPhoto} VALUES ${valueQuery}`, (err, results) => {
          res.status(200).send('Created');
        });
      } else {
        res.sendStatus(200);
      }
    }
  });
};

const updateHelpfulQuestion = (req, res) => {
  pool.query(`${queryStatements.updateQuestionHelpful} ${req.params.question_id}) + 1 WHERE question_id = ${req.params.question_id}`, (err, results) => {
    res.sendStatus(200);
  })
};

const reportQuestion = (req, res) => {
  pool.query(`${queryStatements.reportQuestion} ${req.params.question_id}) + 1 WHERE question_id = ${req.params.question_id}`, (err, results) => {
    res.sendStatus(200);
  });
};

const updateHelpfulAnswer = (req, res) => {
  pool.query(`${queryStatements.updateAnswerHelpful} ${req.params.answer_id}) + 1 WHERE answer_id = ${req.params.answer_id}`, (err, results) => {
    res.sendStatus(200);
  });
};

const reportAnswer = (req, res) => {
  pool.query(`${queryStatements.reportAnswer} ${req.params.answer_id}) + 1 WHERE answer_id = ${req.params.answer_id}`, (err, results) => {
    res.sendStatus(200);
  });
};

module.exports = {
  getQuestions,
  addQuestion,
  addAnswer,
  updateHelpfulQuestion,
  reportQuestion,
  updateHelpfulAnswer,
  reportAnswer,
}