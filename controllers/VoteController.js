const User = require('../models/User')
const Candidate = require('../models/Candidate')
const { web3, account, contract } = require('../utils/contract_handler')
const Transaction = require('../utils/transaction_handler')

const isActive = async (req, res) => {
    try {
        const isActive = await contract.methods.IsActive().call()
        const isCompleted = await contract.methods.IsCompleted().call()
        res.status(200).json({ isActive: isActive, isCompleted: isCompleted })
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const changePhase = async (req, res) => {
    try {
        const isActive = await contract.methods.IsActive().call()
        const isCompleted = await contract.methods.IsCompleted().call()
        if (!isActive && !isCompleted) {
            const transaction = await contract.methods.Activate()
            const receipt = await Transaction(account, web3, transaction)
            console.log(receipt)
            res.status(200).json({ message: "Voting started." })
        } else if (isActive && !isCompleted) {
            const transaction = await contract.methods.Completed()
            const receipt = await Transaction(account, web3, transaction)
            console.log(receipt)
            res.status(200).json({ message: "Voting ended." })
        } else {
            res.send(200).json({ message: "Voting already ended." })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const transferVote = async (req, res) => {
    try {

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const countVote = async (req, res) => {
    
    try {

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const result = async (req, res) => {
    
    try {

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const getCount = async (req, res) => {
    try {
        const voterCount = await contract.methods.voterCount().call()
        const candidateCount = await contract.methods.candidateCount().call()
        res.status(200).json({ voterCount: voterCount, candidateCount: candidateCount })
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

module.exports = { isActive, changePhase, transferVote, countVote, result, getCount }