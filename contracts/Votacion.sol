// SPDX-License-Identifier: MIT
// Especifica la licencia bajo la cual se publica el código.

// Define la versión del compilador de Solidity a utilizar.
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

// El contrato ahora hereda de ERC2771Context para soportar meta-transacciones.
contract Votacion is ERC2771Context {
    // Define una estructura de datos para representar a un candidato.
    struct Candidato {
        string nombre; // Nombre del candidato.
        uint votos;    // Número de votos recibidos por el candidato.
    }

    // Un mapeo para rastrear si una dirección (votante) ya ha emitido su voto.
    // 'public' crea una función getter automática para que se pueda consultar desde fuera.
    mapping(address => bool) public yaVoto;
    
    // Un arreglo dinámico y público para almacenar todos los candidatos.
    Candidato[] public candidatos;

    // El constructor ahora también acepta la dirección de un "Forwarder" de confianza.
    constructor(string[] memory nombres, address trustedForwarder) ERC2771Context(trustedForwarder) {
        // Itera sobre el arreglo de nombres proporcionado.
        for (uint i = 0; i < nombres.length; i++) {
            // Crea una nueva instancia de Candidato con el nombre actual y 0 votos,
            // y la añade al arreglo de candidatos.
            candidatos.push(Candidato(nombres[i], 0));
        }
    }

    // Función que permite a un usuario emitir un voto.
    // 'public' significa que puede ser llamada desde fuera del contrato.
    function votar(uint indiceCandidato) public {
        // Se usa _msgSender() en lugar de msg.sender.
        // _msgSender() devolverá la dirección del firmante original (el votante).
        address votante = _msgSender();

        // Verifica que la dirección que llama a la función (msg.sender) no haya votado antes.
        // Si ya votó, la transacción se revierte con el mensaje de error.
        require(!yaVoto[votante], "Ya votaste");

        // Verifica que el índice del candidato sea válido (esté dentro de los límites del arreglo).
        // Si no es válido, la transacción se revierte con el mensaje de error.
        require(indiceCandidato < candidatos.length, "Candidato invalido");
        
        // Incrementa en uno el contador de votos del candidato seleccionado.
        candidatos[indiceCandidato].votos++;
        
        // Marca la dirección del votante como que ya ha votado para prevenir votos múltiples.
        yaVoto[votante] = true;
    }

    // Función para obtener la lista completa de candidatos y sus votos.
    // 'public' para que sea accesible desde fuera.
    // 'view' indica que la función no modifica el estado del contrato (es de solo lectura).
    // 'returns (Candidato[] memory)' especifica que devuelve un arreglo de Candidatos en memoria.
    function obtenerCandidatos() public view returns (Candidato[] memory) {
        // Devuelve el arreglo completo de candidatos.
        return candidatos;
    }

    // Sobrescribimos la función para que sea compatible con el sistema de meta-transacciones.
    function _msgSender() internal view virtual override(ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }
}