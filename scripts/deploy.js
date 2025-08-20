import fs from 'fs';
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    // 1. Desplegar el contrato MinimalForwarder de OpenZeppelin
    const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
    const forwarder = await MinimalForwarder.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddress = await forwarder.getAddress();
    console.log("MinimalForwarder desplegado en:", forwarderAddress);

    // 2. Desplegar el contrato Votacion, pasándole la dirección del Forwarder
    const nombres = ["Candidato 1", "Candidato 2", "Candidato 3"];
    const Votacion = await ethers.getContractFactory("Votacion");
    // Ahora se pasan los dos argumentos que el constructor espera
    const contrato = await Votacion.deploy(nombres, forwarderAddress);
    
    await contrato.waitForDeployment();
    const address = await contrato.getAddress();

    console.log("Contrato Votacion desplegado en:", address);
    
    // Actualizar el archivo .env con las nuevas direcciones
    const envContent = `CONTRACT_ADDRESS=${address}\nFORWARDER_ADDRESS=${forwarderAddress}\nPRIVATE_KEY=${process.env.PRIVATE_KEY || 'your_private_key_here'}\n`;
    fs.writeFileSync('.env', envContent);
    console.log("Direcciones guardadas en .env");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });