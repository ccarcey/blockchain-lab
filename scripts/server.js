const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(express.json());

// Validación de variables de entorno
if (!process.env.CONTRACT_ADDRESS || !process.env.PRIVATE_KEY) {
    console.error("Error: CONTRACT_ADDRESS y PRIVATE_KEY deben estar definidos en .env");
    process.exit(1);
}

const contractAddress = process.env.CONTRACT_ADDRESS.trim();
const privateKey = process.env.PRIVATE_KEY.trim();

// Validar que CONTRACT_ADDRESS sea una dirección válida
if (!ethers.isAddress(contractAddress)) {
    console.error("Error: CONTRACT_ADDRESS no es una dirección Ethereum válida:", contractAddress);
    console.error("Debe ser una dirección hexadecimal como: 0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234");
    process.exit(1);
}

// Configuración
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet(privateKey, provider);
const abi = require('../artifacts/contracts/Votacion.sol/Votacion.json').abi;
const contrato = new ethers.Contract(contractAddress, abi, wallet);

console.log("CONTRACT_ADDRESS:", contractAddress);
console.log("WALLET ADDRESS:", wallet.address);

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

// Endpoints REST con manejo de errores
app.get('/candidatos', async (req, res) => {
    try {
        // Verificar si el contrato existe en la dirección
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            throw new Error('No hay contrato desplegado en la dirección proporcionada');
        }
        
        const candidatosRaw = await contrato.obtenerCandidatos();
        // Convertir BigInt a string para la serialización JSON
        const candidatos = candidatosRaw.map(candidato => {
            // Ethers devuelve un objeto similar a un array con propiedades nombradas.
            // Creamos un nuevo objeto solo con las propiedades que necesitamos.
            return {
                nombre: candidato.nombre,
                votos: candidato.votos.toString()
            };
        });
        res.json(candidatos);
    } catch (error) {
        console.error("Error obteniendo candidatos:", error);
        res.status(500).json({ error: "Error obteniendo candidatos: " + error.message });
    }
});

app.post('/votar', async (req, res) => {
    try {
        const { indice } = req.body;
        const tx = await contrato.votar(indice);
        await tx.wait();
        res.json({ message: "Voto registrado" });
    } catch (error) {
        console.error("Error votando:", error);
        res.status(500).json({ error: "Error registrando voto: " + error.message });
    }
});

app.listen(3000, () => console.log("Servidor REST en http://localhost:3000"));
