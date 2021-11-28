// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


contract ElectChain {
    uint256 public voterCount=0;
    uint256 public candidateCount=0;

    Candidate public max;
    
    //Get openingTime and closingTime from BackEnd:)
    //In the constructor get method
    
    uint id;
    uint Electionnumber;
    
    address owner;
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyPreElection() {
        require(state == State.Pre);
        _;
    }
    
     modifier onlyActiveElection() {
        require(state == State.Active);
        _;
    }

     modifier onlyPostElection() {
        require(state == State.Post);
        _;
    }

    struct Voter{
        uint voterNum;
        string voterId;
        address voterAddress;
        bool isvoted;
    }
    
    struct Candidate{
        uint candidateNum;
        string candidateId;
        address candidateAddress;
        int counter;
    }
    
    
    mapping(uint => Voter) voters;
    mapping(uint => Candidate) public candidates;
    //Candidate[] public candidates;
        
    
    event TransferVote(address from, address to, uint amount);
    
    enum State {Pre, Active, Post}
    State public state;
    
    constructor(){
        owner = msg.sender;
        state = State.Pre;
        
    }
    
    
    function Activate() public onlyOwner{
        state = State.Active;
    }
    
    function IsActive() public view returns(bool){
        return state == State.Active;
    }
    
    function Completed() public onlyOwner{
        state = State.Post;
    }
    
    function IsCompleted() public view returns(bool){
        return state == State.Post;
    }
    
    function addVoter(string memory voterId,address voterAddress,bool isvoted) public onlyPreElection{
        incrementVC();
        voters[voterCount] = Voter(voterCount,voterId,voterAddress,isvoted);
    }
    
    function addCandidate(string memory _candidateId, address _candidateAddress) public onlyOwner{
        incrementCC();
        candidates[candidateCount] = Candidate(candidateCount,_candidateId,_candidateAddress,0);
    }
    
    function incrementVC() internal{
        voterCount+=1;
    }
    
    function incrementCC() internal{
        candidateCount+=1;
    }
    
    function Vote(string memory _voterId,string memory _candidateId) public onlyActiveElection returns(bool){
        for(uint i=1;i<=voterCount;i++){
            
            //keccak256(abi.encode())
            if(keccak256(abi.encode(voters[i].voterId)) == keccak256(abi.encode(_voterId))){
                if(voters[i].isvoted==false && voters[i].voterAddress == msg.sender){
                    voters[i].isvoted=true;
                }
                else{
                    return false;
                }
            }
        }
        for(uint i=1;i<=candidateCount;i++){
            if(keccak256(abi.encode(candidates[i].candidateId))== keccak256(abi.encode(_candidateId))){
                candidates[i].counter++;
                //inrementC(i);
                break;
            }
        }
        return true;
    }
    
    function result()public onlyPostElection returns(string memory,int){
        max = candidates[1];
        if(candidateCount == 0) {
            return ("", -1);
        }
        for(uint i=1;i<=candidateCount;i++){
            if(candidates[i].counter>max.counter){
                max = candidates[i];
            }
        }
        //return (max.candidateId,max.counter);
        return (max.candidateId, max.counter);
    }
}