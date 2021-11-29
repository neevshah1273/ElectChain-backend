const express = require('express')
const router = express.Router()

const { isActive, currentPhase, changePhase, transferVote, result, getCount, getVoterDetail } = require('../controllers/VoteController')
const verify = require('../utils/verify')


router.post('/is-active', isActive)
router.post('/voting-phase', currentPhase)
router.post('/change-phase', changePhase)
router.post('/transfer-vote', verify, transferVote)
router.post('/result', result)
router.post('/count', getCount)
router.post('/voter-detail', verify, getVoterDetail)

module.exports = router