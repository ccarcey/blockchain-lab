pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract MinimalForwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("MinimalForwarder") {
    }
}
