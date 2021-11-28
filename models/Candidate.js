const mongoose = require('mongoose')

const candidateSchema = new mongoose.Schema({
    candidate_name: { type: String, required: true },
    campaign_description: { type: String, required: true },
    wallet_address: { type: String, default: "" },
    private_key: { type: String, required: true }
})

const Candidate = mongoose.model('Candidate', candidateSchema)
module.exports = Candidate