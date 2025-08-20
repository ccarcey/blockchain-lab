pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Votacion is ERC2771Context {
    struct Candidato {
        string nombre;
        uint votos;
    }

    mapping(address => bool) public yaVoto;
    
    Candidato[] public candidatos;

    constructor(string[] memory nombres, address trustedForwarder) ERC2771Context(trustedForwarder) {
        for (uint i = 0; i < nombres.length; i++) {
            candidatos.push(Candidato(nombres[i], 0));
        }
    }

    function votar(uint indiceCandidato) public {
        address votante = _msgSender();

        require(!yaVoto[votante], "Ya votaste");

        require(indiceCandidato < candidatos.length, "Candidato invalido");
        
        candidatos[indiceCandidato].votos++;
        
        yaVoto[votante] = true;
    }

    function obtenerCandidatos() public view returns (Candidato[] memory) {
        return candidatos;
    }

    function _msgSender() internal view virtual override(ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }
}