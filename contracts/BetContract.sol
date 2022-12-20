pragma solidity ^0.8.0;


contract RockPaperScrissorsGameContract {
    // Суть игры:
    // Два игрока вводят по очереди

    // Для тестирования кодировал через консоль:
    // закрытый ключ hardhat ether.utils.formatBytes32String('secret')
    // кто-то выбирает камень: ethers.utils.solidityKeccak256(["uint", "bytes32", "address"], ["1", "0x7365637265740000000000000000000000000000000000000000000000000000", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"])


    address[] public players = new address[](2);

    mapping (address => bytes32) public commits;
    mapping (address => uint) public player2move;
    event moneyGot(address indexed _from, uint _value);

    uint playersRevealed = 0;
    uint currentPlayer = 0;

    modifier commitsDone {
        require(currentPlayer == 2);
        _;
    }

    modifier gameFinished {
        require(currentPlayer == 2);
        _;
    }

    function doesGameFinished() external returns(bool) {
        return (playersRevealed == 2);
    }

    function getWinnerNumber() public gameFinished returns(uint) {
        address firstPlayer = players[0];
        address secondPlayer = players[1];
        uint firstPlayerMove = player2move[firstPlayer];
        uint secondPlayerMove = player2move[secondPlayer];

        if(firstPlayerMove == 1 && secondPlayerMove == 3) {
            return 0;
        } else if (firstPlayerMove == 2 && secondPlayerMove == 1) {
            return 0;
        } else if (firstPlayerMove == 3 && secondPlayerMove == 2) {
            return 0;
        } else {
            return 1;
        }
    }

    function commitMove(bytes32 _hashedMove) external payable {
        players[currentPlayer] = msg.sender;
        commits[msg.sender] = _hashedMove;
        currentPlayer += 1;
        
        emit moneyGot(msg.sender, msg.value);
    }

    function revealMove(uint _move, bytes32 _secret) external commitsDone {
        // 1 - камень
        // 2 - бумага
        // 3 - ножницы

        require(playersRevealed < 2);

        bytes32 commit = keccak256(abi.encodePacked(_move, _secret, msg.sender));
        
        require(commit == commits[msg.sender]);
        require(player2move[msg.sender] == 0);

        delete commits[msg.sender];
        player2move[msg.sender] = _move;
        playersRevealed += 1;
    }

    function payToWinner() external commitsDone gameFinished {
        uint winnerNumber = getWinnerNumber();
        address payable winner = payable(players[winnerNumber]);

        winner.transfer(address(this).balance);
    }
}

contract BetContract {
    address[] public bidders = new address[](0);
    mapping (address => uint) public bidder2bet;
    mapping (uint => uint) public player2sum;

    RockPaperScrissorsGameContract gameContract;

    event moneyGot(address indexed _from, uint _value);

    constructor(address gameContractAddress) public {
        gameContract = RockPaperScrissorsGameContract(gameContractAddress); 
    }

    modifier notPlacedBetYet {
        require(bidder2bet[msg.sender] == 0, "You have already placed a bet.");
        _;
    }

    modifier gameFinished {
        require(gameContract.doesGameFinished() == true, "The game has not finished yet.");
        _;
    }

    function placeBet(uint playerNumber) external payable notPlacedBetYet {
        bidders.push(msg.sender);
        bidder2bet[msg.sender] = msg.value;
        player2sum[playerNumber] += msg.value;

        emit moneyGot(msg.sender, msg.value);
    }

    function payToLuckyOnes() external gameFinished {
        uint winnerNumber = gameContract.getWinnerNumber();

        for(uint i = 0; i < bidders.length; i++) {
            uint howMuchToPay = address(this).balance * bidder2bet[bidders[i]] / player2sum[winnerNumber];
            address payable bidderAddress = payable(bidders[i]);
            bidderAddress.transfer(howMuchToPay);
        }
    }
}