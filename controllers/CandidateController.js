const Candidate = require('../models/Candidate')

const { web3, account, contract } = require('../utils/contract_handler')
const Transaction = require('../utils/transaction_handler')

const candidate_list = async (req, res) => {
    try {
        const candidate_list = await Candidate.find()
        const return_list = []
        for (let i = 0; i < candidate_list.length; i++) {
            const temporary_obj = {}
            temporary_obj.candidateId = candidate_list[i]._id
            temporary_obj.candidateName = candidate_list[i].candidate_name
            temporary_obj.campaignDescription = candidate_list[i].campaign_description
            return_list.push(temporary_obj)
        } 
        res.status(200).send(return_list)
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const candidate_register = async (req, res) => {
    const { candidateName, campaignDescription } = req.body
    try {
        const isActive = await contract.methods.IsActive().call()
        if (!isActive) {
            const newCandidate = web3.eth.accounts.create(web3.utils.randomHex(32))
            const candidate = await Candidate.create({
                candidate_name: candidateName,
                campaign_description: campaignDescription,
                wallet_address: newCandidate.address,
                private_key: newCandidate.privateKey
            })
            const transaction = await contract.methods.addCandidate(candidate._id, candidate.wallet_address)
            const receipt = await Transaction(account, web3, transaction)
            console.log(receipt)
            res.status(200).send({ message: "Candidate Registered."} )
        } else {
            res.status(200).send({ message: "Voting has already begun. Cannot add new candidates." })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
}

module.exports = { candidate_list, candidate_register }