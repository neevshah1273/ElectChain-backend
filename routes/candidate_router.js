const express = require('express')
const router = express.Router();

const { candidate_register, candidate_list } = require('../controllers/CandidateController')

router.post('/register', candidate_register)
router.post('/list', candidate_list)


module.exports = router