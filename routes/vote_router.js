const express = require('express')
const router = express.Router()

const { isActive, changePhase, transferVote, countVote, result, getCount } = require('../controllers/VoteController')

router.post('/voting-phase', isActive)
router.post('/change-phase', changePhase)
router.post('/transfer-vote', transferVote)
router.post('/count-vote', countVote)
router.post('/result', result)
router.post('/count', getCount)

module.exports = router