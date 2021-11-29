const express = require('express')
const router = express.Router();

const { candidate_register, candidate_list } = require('../controllers/CandidateController')
const verify = require('../utils/verify')

router.post('/register', verify, candidate_register)
router.post('/list', verify, candidate_list)


module.exports = router