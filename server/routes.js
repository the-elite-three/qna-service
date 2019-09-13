const express = require('express');
const router = express.Router();
const db = require('./queries');

router.get('/:product_id', db.getQuestions);

router.get('/:question_id/answers', (req, res) => {
  res.send(`Get request for question ${req.params.question_id} answers`);
});

router.post('/:product_id', db.addQuestion);

router.post('/:question_id/answers', db.addAnswer);

router.put('/question/:question_id/helpful', db.updateHelpfulQuestion);

router.put('/question/:question_id/report', db.reportQuestion);

router.put('/answer/:answer_id/helpful', db.updateHelpfulAnswer);

router.put('/answer/:answer_id/report', db.reportAnswer);

module.exports = router;
