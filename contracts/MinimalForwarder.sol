// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

// En OpenZeppelin v5, MinimalForwarder fue reemplazado por ERC2771Forwarder
contract MinimalForwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("MinimalForwarder") {
        // El constructor de ERC2771Forwarder requiere un nombre
    }
}
