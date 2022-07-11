// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IERC20Votes {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract CustomBallot {
    // pushes the Voted event with the voter address, proposal number,
    // the vote's weight and the number of votes that proposal has
    event Voted(
        address indexed voter,
        uint256 indexed proposal,
        uint256 weight,
        uint256 proposalVotes
    );

    // creates a Proposal object with name and voteCount properties
    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    // maps addresses to the number of votes already used
    mapping(address => uint256) public spentVotePower;

    // array of proposals called "Proposal" created
    Proposal[] public proposals; 
    // creates a public variable, voteToken, using the ERC20Votes interface
    IERC20Votes public voteToken;
    // creates a public variable for the current block
    uint256 public referenceBlock;

    /** creates an array stored in memory called proposalNames of proposals
        with zero votes and creates a voteToken with IERC20Votes, and
        the referenceBlock for us to work with.
    */
    constructor(bytes32[] memory proposalNames, address _voteToken) {
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
        voteToken = IERC20Votes(_voteToken);
        referenceBlock = block.number;
    }

    // the vote function
    function vote(uint256 proposal, uint256 amount) external {
        // stores the voting power available in the assigned variable
        // TO-DO: check out the votingPower() function
        uint256 votingPowerAvailable = votingPower();
        // makes sure the voter has the votes it is about to cast
        require(votingPowerAvailable >= amount, "Has not enough voting power");
        // makes sure the cast vote is added to the voter's spentVotePower
        spentVotePower[msg.sender] += amount;
        // count the votes in favor of the proposal voted for
        proposals[proposal].voteCount += amount;
        // put out an alert about the vote
        emit Voted(msg.sender, proposal, amount, proposals[proposal].voteCount);
    }

    // keeps track of what the winning proposal is
    function winningProposal() public view returns (uint256 winningProposal_) {
        // initializes the winning vote count at 0
        uint256 winningVoteCount = 0;
        // loop over proposals 
        for (uint256 p = 0; p < proposals.length; p++) {
            // check if a proposal has more votes than the winning vote
            if (proposals[p].voteCount > winningVoteCount) {
                // if so, make the count the value of the winningVoteCount variable
                winningVoteCount = proposals[p].voteCount;
                // assign the proposal the label of winning proposal
                winningProposal_ = p;
            }
        }
    }

    // declares the winner 
    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    // defines the voting power
    function votingPower() public view returns (uint256 votingPower_) {
        votingPower_ =
            voteToken.getPastVotes(msg.sender, referenceBlock) -
            spentVotePower[msg.sender];
    }
}
