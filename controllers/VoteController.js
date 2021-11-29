const { web3, account, contract } = require('../utils/contract_handler')
const Transaction = require('../utils/transaction_handler')
const Candidate = require('../models/Candidate')
const User = require('../models/User')

const isActive = async (req, res) => {
    try {
        const isActive = await contract.methods.IsActive().call()
        const isCompleted = await contract.methods.IsCompleted().call()
        res.status(200).send({ isActive: isActive, isCompleted: isCompleted })
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
}

const currentPhase = async (req, res) => {
    try {
        const isActive = await contract.methods.IsActive().call()
        const isCompleted = await contract.methods.IsCompleted().call()
        if (!isActive && !isCompleted) {
            res.status(200).send({ message: "Registration Phase" })
        } else if (isActive && !isCompleted) {
            res.status(200).send({ message: "Voting Phase" })
        } else if (!isActive && isCompleted) {
            res.status(200).send({ message: "Result Phase" })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send()
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
            res.status(200).send({ message: "Voting started." })
        } else if (isActive && !isCompleted) {
            const transaction = await contract.methods.Completed()
            const receipt = await Transaction(account, web3, transaction)
            console.log(receipt)
            res.status(200).send({ message: "Voting ended." })
        } else {
            const transaction = await contract.methods.Reset()
            const receipt = await Transaction(account, web3, transaction)
            if (!receipt) {
                res.status(400).send()
            } else {
                res.send(200).send({ message: "Voting already ended." })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
}

const transferVote = async (req, res) => {
    const { candidateId } = req.body
    const voterId = req.user.id
    console.log(candidateId)
    console.log(voterId)
    try {
        const isActive = await contract.methods.IsActive().call()
        const isCompleted = await contract.methods.IsCompleted().call()
        if (isActive && !isCompleted) {
            const user = await User.findOne({ _id: voterId })
            const candidate = await Candidate.findOne({ _id: candidateId })
            if (user && candidate) {
                const transaction = await contract.methods.Vote(voterId, candidateId)
                const receipt = await Transaction(account, web3, transaction)
                console.log(receipt)
                if (receipt == null) {
                    res.status(200).send({ error: "Vote not registered." })
                } else {
                    if (receipt) {
                        res.status(200).json({ message: "Your vote has been registered." })
                    } else if (!receipt) {
                        res.status(200).json({ message: "Your vote has already been registered. Cannot vote again." })
                    }
                }
            }
        } else {
            if (!isActive && !isCompleted) {
                res.status(200).json({ message: "Election is still in registration phase." })
            } else if (!isActive && isCompleted) {
                res.status(200).json({ message: "Voting has now ended. You can check results in dashboard." })
            }  
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const result = async (req, res) => {
    try {
        const isActive = await contract.methods.IsActive().call()
        const isCompleted = await contract.methods.IsCompleted().call()
        if (!isActive && isCompleted) {
            const result = await contract.methods.result().call()
            console.log(result)
            res.status(200).json({ result: result })
        } else {
            if (isActive) {
                res.status(401).json({ message: "Voting is still in progress." })
            } else if (!isCompleted) {
                res.status(401).json({ message: "Voting has not started yet." })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(400).send()
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

const getVoterDetail = async (req, res) => {
    try {
        const _id = req.user.id
        const user = await User.findOne({ _id: _id })
        const objToSend = {
            firstName: user.first_name,
            lastName: user.last_name,
            dob: user.dob,
            phone: user.phone,
            email: user.email,
            voterId: user.voter_id
        }
        res.status(200).send(objToSend)
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
}

module.exports = { isActive, currentPhase, changePhase, transferVote, result, getCount, getVoterDetail }