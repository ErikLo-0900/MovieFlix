const https = require('https');

const mainUrl = process.argv[2];
if (!mainUrl) {
    console.log("Uso: node cuevana-resolver.js <URL_DE_CUEVANA_EPISODIO>");
    console.log("Ejemplo: node cuevana-resolver.js https://cuevana.you/serie/gravity-falls/episodio-2x1");
    process.exit(1);
}

const cleanMainUrl = mainUrl.trim();
console.log(`Paso 1: Conectando a la página de Cuevana: ${cleanMainUrl}...`);

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
};

const getRequestOptions = (targetUrl) => {
    return {
        headers: {
            ...headers,
            'Referer': targetUrl
        }
    };
};

// 1. Primer paso: Descargar la página del episodio de Cuevana
https.get(cleanMainUrl, getRequestOptions(cleanMainUrl), (res) => {
    if (res.statusCode !== 200) {
        console.error(`\nError en Paso 1: El servidor respondió con código ${res.statusCode}`);
        if (res.statusCode === 403 || res.statusCode === 503) {
            console.log("Detalle: Cloudflare bloqueó la petición automática de Node.js.");
        }
        process.exit(1);
    }

    let htmlData = '';
    res.on('data', (chunk) => { htmlData += chunk; });
    res.on('end', () => {
        // Buscar todos los data-server="..." en el HTML
        const regex = /data-server="([^"]+)"/g;
        let match;
        const links = [];

        while ((match = regex.exec(htmlData)) !== null) {
            links.push(match[1]);
        }

        if (links.length === 0) {
            console.log("\nNo se encontraron enlaces de reproducción en esta página.");
            process.exit(1);
        }

        // Tomar la Opción 1
        const option1Url = links[0];
        console.log(`\nOpción #1 Encontrada: ${option1Url}`);

        // Verificar si la Opción 1 tiene ?v= (Base64 directo) o ?token= (XOR encriptado)
        if (option1Url.includes('?v=') || option1Url.includes('&v=')) {
            // Opción 1 es Base64 directo
            console.log("\nPaso 2: Decodificando Base64 directo...");
            const vMatch = option1Url.match(/[?&]v=([^&]+)/);
            if (vMatch && vMatch[1]) {
                try {
                    const decoded = Buffer.from(vMatch[1], 'base64').toString('utf-8');
                    printSuccess(decoded);
                } catch (e) {
                    console.error("Error al decodificar Base64:", e.message);
                }
            } else {
                console.error("No se encontró el parámetro 'v' en la URL.");
            }
        } 
        else if (option1Url.includes('?token=') || option1Url.includes('&token=')) {
            // Opción 1 tiene Token (cifrado XOR)
            const tokenMatch = option1Url.match(/[?&]token=([^&]+)/);
            if (tokenMatch && tokenMatch[1]) {
                const tokenValue = tokenMatch[1];
                console.log(`\nPaso 2: Conectando al reproductor cifrado para resolver el Token: ${tokenValue}...`);
                
                // Realizar la segunda extracción (descargar la página del reproductor)
                https.get(option1Url, getRequestOptions(option1Url), (resPlayer) => {
                    if (resPlayer.statusCode !== 200) {
                        console.error(`Error en Paso 2: El reproductor respondió con código ${resPlayer.statusCode}`);
                        process.exit(1);
                    }

                    let playerHtml = '';
                    resPlayer.on('data', (chunk) => { playerHtml += chunk; });
                    resPlayer.on('end', () => {
                        decryptTokenAndPrint(tokenValue, playerHtml);
                    });
                }).on('error', (err) => {
                    console.error("Error al conectar al reproductor:", err.message);
                });
            } else {
                console.error("No se encontró el parámetro 'token' en la URL.");
            }
        } else {
            // No tiene token ni v, es un enlace directo
            console.log("\nEl enlace de la Opción 1 ya está limpio.");
            printSuccess(option1Url);
        }
    });
}).on('error', (err) => {
    console.error("Error de conexión al episodio:", err.message);
});

// Desencriptar el Token con los datos del reproductor
function decryptTokenAndPrint(tokenValue, playerHtml) {
    try {
        // 1. Obtener servidores
        let servers = {
            1: 'https://tiktokshopping.xyz/v/',
            2: 'https://filemoon.sx/e/',
            3: 'https://martinshop.xyz/e/',
            4: 'https://dood.li/e/'
        };
        const serversMatch = playerHtml.match(/const servers\s*=\s*\{([^}]+)\}/i);
        if (serversMatch && serversMatch[1]) {
            const serversText = serversMatch[1];
            const serverRegex = /(\d+)\s*:\s*['"]([^'"]+)['"]/g;
            let m;
            const parsedServers = {};
            while ((m = serverRegex.exec(serversText)) !== null) {
                parsedServers[m[1]] = m[2];
            }
            if (Object.keys(parsedServers).length > 0) {
                servers = parsedServers;
            }
        }

        // 2. Obtener clave XOR
        let key = 'a45f04ce-2394-47c3-b718-0ecd97ce51d6';
        const keyMatch = playerHtml.match(/const key\s*=\s*([^;]+);/i);
        if (keyMatch && keyMatch[1]) {
            const evaluatedKey = keyMatch[1].replace(/['"+\s]/g, '');
            if (evaluatedKey && evaluatedKey.length > 10) {
                key = evaluatedKey;
            }
        }

        // 3. Desencriptar
        const firstChar = tokenValue[0];
        const serverUrl = servers[firstChar];
        if (!serverUrl) {
            console.error(`\nError: El servidor del token "${firstChar}" no está registrado.`);
            process.exit(1);
        }

        const encryptedBase64 = tokenValue.slice(1);
        const decodedBytes = Buffer.from(encryptedBase64, 'base64').toString('binary');
        
        let decrypted = '';
        for (let i = 0; i < decodedBytes.length; i++) {
            decrypted += String.fromCharCode(decodedBytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }

        const finalRealUrl = serverUrl + decrypted;
        printSuccess(finalRealUrl);

    } catch (e) {
        console.error("Error al desencriptar el token:", e.message);
    }
}

function printSuccess(finalUrl) {
    console.log("\n=========================================");
    console.log("¡DOBLE EXTRACCIÓN COMPLETADA CON ÉXITO!");
    console.log("=========================================");
    console.log(`\nEnlace del Servidor Real Limpio:`);
    console.log(`   ${finalUrl}`);
    console.log("\n=========================================");
}
