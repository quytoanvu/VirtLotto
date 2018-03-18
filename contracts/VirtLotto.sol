pragma solidity ^0.4.18;


contract VirtLotto {
    address public owner;
    address[] public winnerAddress;
    uint public winNumber;
    uint[] public lottoNumbers;
    uint public maximumBetCall;
    int public maximumTicket;
    uint public minimumSpend;
    Result[] public resultTable; // List of bet result
    Proposal[] public betPool; // Current bet pool info
    Result public result;
    mapping(address => int) public currentTicketCount;

    struct Proposal {
        address bettor;
        uint selectedNumber;
        uint value;
    }

    struct Result {
        Proposal[] winnerProposal;
        Proposal[] loserProposal;
        uint winNumber;
    }

    function VirtLotto(
        uint[] _lottoNumbers,
        uint _maximumBetCall,
        int _maximumTicket,
        uint _minimumSpend
    ) public
    {
        owner = msg.sender;
        lottoNumbers = _lottoNumbers;
        maximumBetCall = _maximumBetCall;
        minimumSpend = _minimumSpend;
        maximumTicket = _maximumTicket;
    }

    function pickNumer(uint selectedNumber) public payable {
        // 1. Validate:
        //  - maximum bet of a bettor
        //  - minimum spend per ticket
        // 2. If max call reached, do spin and distribute prize
        require(msg.value >= minimumSpend);
        require(checkValidNumberOfTicket(msg.sender));

        msg.sender.transfer(msg.value);
        betPool.push(Proposal({
            selectedNumber : selectedNumber,
            bettor : msg.sender,
            value: msg.value
        }));

        // Check and do spin
        if (betPool.length == maximumBetCall) {
            spinAndDistributePrize();
        } else {
            currentTicketCount[msg.sender] += 1;
        }
    }

    function checkValidNumberOfTicket(address bettor) public constant returns (bool) {
        // A bettor can only bet maximumTicket times
        int ticketCount = 0;
        for (uint i = 0; i < betPool.length; i++) {
            if (betPool[i].bettor == bettor) {
                ticketCount += 1;
            }
        }
        return ticketCount < maximumTicket;
    }

    function spinAndDistributePrize() public payable {
        uint totalBetAmmount;
        winNumber = random();
        result.winNumber = winNumber;
        for (uint i = 0; i < betPool.length; i++) {
            totalBetAmmount += betPool[i].value;
            if (betPool[i].selectedNumber == winNumber) {
                result.winnerProposal.push(betPool[i]);
                winnerAddress.push(betPool[i].bettor);
                currentTicketCount[betPool[i].bettor] = 0; // reset ticket counter
            } else {
                result.loserProposal.push(betPool[i]);
                currentTicketCount[betPool[i].bettor] = 0; // reset ticket counter
            }
        }
        resultTable.push(result);
        // Distribute prize
        if (result.winnerProposal.length > 0) {
            uint prizePerWinner = totalBetAmmount / result.winnerProposal.length;
            for (uint j = 0; i < result.winnerProposal.length; j++) {
                result.winnerProposal[j].bettor.transfer(prizePerWinner);
            }
        }
    }

    function getCurrentTotalBet() public constant returns (uint totalBetAmmount) {
        totalBetAmmount = 0;
        for (uint i = 0; i < betPool.length; i++) {
            totalBetAmmount += betPool[i].value;
        }
    }

    function getWinner() public constant returns (address[] _winnerAddress) {
        _winnerAddress = winnerAddress;
    }

    function getWinNumber() public constant returns (uint _winNumber) {
        _winNumber = winNumber;
    }

    function resetResult () public {
        delete winnerAddress;
        winNumber = 0;
        delete result;
        delete betPool;
    }

    function kill() public {
        if (msg.sender == owner) {
            selfdestruct(owner);
        }
    }

    function random() private constant returns (uint) {
        return uint8(uint256(keccak256(block.timestamp, block.difficulty))%10);
    }
}