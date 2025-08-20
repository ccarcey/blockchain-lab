import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración del proveedor y contrato
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const contractABI = JSON.parse(fs.readFileSync('./artifacts/contracts/Votacion.sol/Votacion.json')).abi;

// Leer direcciones del archivo .env
const envContent = fs.readFileSync('.env', 'utf8');
const CONTRACT_ADDRESS = envContent.match(/CONTRACT_ADDRESS=(.+)/)?.[1];
const FORWARDER_ADDRESS = envContent.match(/FORWARDER_ADDRESS=(.+)/)?.[1];

console.log(`📋 Intentando conectar con contrato en: ${CONTRACT_ADDRESS}`);
console.log(`🔄 Forwarder en: ${FORWARDER_ADDRESS}`);

if (!CONTRACT_ADDRESS) {
    console.error('CONTRACT_ADDRESS no encontrada en .env');
    process.exit(1);
}

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

// Función para verificar si el contrato existe
async function verificarContrato() {
    try {
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
            console.error('❌ No hay contrato desplegado en la dirección:', CONTRACT_ADDRESS);
            console.log('💡 Ejecuta: npx hardhat run scripts/deploy.js --network localhost');
            return false;
        }
        console.log('✅ Contrato encontrado en:', CONTRACT_ADDRESS);
        return true;
    } catch (error) {
        console.error('❌ Error verificando contrato:', error.message);
        return false;
    }
}

// Rutas de la API
app.get('/api/candidatos', async (req, res) => {
    try {
        console.log("📋 Obteniendo candidatos...");
        
        // Verificar si el contrato existe
        const contratoExiste = await verificarContrato();
        if (!contratoExiste) {
            return res.status(500).json({ 
                error: 'Contrato no encontrado. Ejecuta el script de deploy primero.',
                solucion: 'npx hardhat run scripts/deploy.js --network localhost'
            });
        }
        
        // Intentar diferentes métodos para obtener candidatos
        let candidatos = [];
        
        try {
            // Método 1: función obtenerCandidatos
            const candidatosRaw = await contract.obtenerCandidatos();
            candidatos = candidatosRaw.map((candidato, index) => ({
                id: index,
                nombre: candidato.nombre,
                votos: candidato.votos.toString()
            }));
        } catch (error1) {
            console.log("❌ obtenerCandidatos falló:", error1.message);
            
            try {
                // Método 2: acceso directo al array candidatos
                let i = 0;
                while (i < 10) { // Límite de seguridad
                    const candidato = await contract.candidatos(i);
                    candidatos.push({
                        id: i,
                        nombre: candidato.nombre,
                        votos: candidato.votos.toString()
                    });
                    i++;
                }
            } catch (error2) {
                console.log(`✅ Encontrados ${candidatos.length} candidatos`);
            }
        }
        
        console.log("📊 Candidatos:", candidatos);
        res.json(candidatos);
    } catch (error) {
        console.error("❌ Error completo:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/votar', async (req, res) => {
    try {
        const { indice, privateKey } = req.body;
        
        if (!privateKey) {
            return res.status(400).json({ error: "Private key requerida para votar" });
        }
        
        // Crear wallet con la private key
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractWithSigner = contract.connect(wallet);
        
        const tx = await contractWithSigner.votar(indice);
        await tx.wait();
        res.json({ 
            message: "Voto registrado exitosamente",
            transactionHash: tx.hash 
        });
    } catch (error) {
        console.error("Error votando:", error);
        res.status(500).json({ error: "Error registrando voto: " + error.message });
    }
});

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Sistema de Votación Blockchain</title></head>
            <body>
                <h1>Sistema de Votación Blockchain</h1>
                <p>Contrato desplegado en: ${CONTRACT_ADDRESS}</p>
                <p>Forwarder en: ${FORWARDER_ADDRESS}</p>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📋 Contrato de Votación: ${CONTRACT_ADDRESS}`);
    console.log(`🔄 Forwarder: ${FORWARDER_ADDRESS}`);
});