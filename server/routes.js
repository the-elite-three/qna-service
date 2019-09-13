const express = require('express');
const router = express.Router();
const db = require('./queries');

router.get('/:product_id', db.getQuestions);

router.get('/:question_id/answers', (req, res) => {
  res.send(`Get request for question ${req.params.question_id} answers`);
});

router.post('/:product_id', db.addQuestion);

router.post('/:question_id/answers', (req, res) => {
  res.send(`Post request to add an aswer to question ${req.params.question_id}`);
});

router.put('/question/:question_id/helpful', (req, res) => {
  res.send(`Put request to add to question ${req.params.question_id} helpful count`);
});

router.put('/question/:question_id/report', (req, res) => {
  res.send(`Put request to report question ${req.params.question_id}`);
});

router.put('/answer/:answer_id/helpful', (req, res) => {
  res.send(`Put request to add to answer ${req.params.answer_id} helpful count`);
});

router.put('/answer/:answer_id/report', (req, res) => {
  res.send(`Put request to report answer ${req.params.answer_id}`)
});

module.exports = router;
