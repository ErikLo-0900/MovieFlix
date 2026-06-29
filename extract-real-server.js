const https = require('https');
const url = require('url');

const targetUrl = process.argv[2];
if (!targetUrl) {
    console.log("Uso: node extract-real-server.js <URL_CON_TOKEN>");
    console.log("Ejemplo: node extract-real-server.js \"https://tungtungsahur.cuevana.you/?token=1AkxFVEFADwkdBwpL&apl=0\"");
    process.exit(1);
}

const cleanUrl = targetUrl.trim();
console.log(`Conectando a Cuevana Player: ${cleanUrl}...`);

// Intentar extraer token directamente de la URL
let tokenValue = null;
try {
    const parsedUrl = new URL(cleanUrl);
    tokenValue = parsedUrl.searchParams.get('token');
} catch (e) {
    // Fallback manual si no es una URL válida
    const match = cleanUrl.match(/[?&]token=([^&]+)/);
    if (match) tokenValue = match[1];
}

if (!tokenValue) {
    console.error("Error: No se encontró ningún parámetro '?token=' en la URL proporcionada.");
    process.exit(1);
}

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': 'https://cuevana.you/'
    }
};

https.get(cleanUrl, options, (res) => {
    if (res.statusCode !== 200) {
        console.error(`\nError: El servidor respondió con código de estado ${res.statusCode}`);
        if (res.statusCode === 403 || res.statusCode === 503) {
            console.log("Detalle: Cloudflare (sistema anti-bot) bloqueó la conexión automática de Node.js.");
            console.log("Para estos casos, debes usar el método manual con la consola F12 de tu navegador.");
        }
        process.exit(1);
    }

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            // 1. Extraer los servidores del HTML
            let servers = {
                1: 'https://tiktokshopping.xyz/v/',
                2: 'https://filemoon.sx/e/',
                3: 'https://martinshop.xyz/e/',
                4: 'https://dood.li/e/'
            }; // Fallback por defecto

            const serversMatch = data.match(/const servers\s*=\s*\{([^}]+)\}/i);
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

            // 2. Extraer la clave de cifrado del HTML
            let key = 'a45f04ce-2394-47c3-b718-0ecd97ce51d6'; // Fallback por defecto
            const keyMatch = data.match(/const key\s*=\s*([^;]+);/i);
            if (keyMatch && keyMatch[1]) {
                // Evaluar de forma segura concatenación de strings de la clave
                try {
                    const evaluatedKey = keyMatch[1].replace(/['"+\s]/g, '');
                    if (evaluatedKey && evaluatedKey.length > 10) {
                        key = evaluatedKey;
                    }
                } catch (e) {
                    // Mantener el fallback
                }
            }

            // 3. Decodificar el token con el algoritmo de descifrado XOR
            const firstChar = tokenValue[0];
            const serverUrl = servers[firstChar];
            
            if (!serverUrl) {
                console.error(`\nError: El servidor del token "${firstChar}" no está registrado en el reproductor.`);
                process.exit(1);
            }

            // Decodificar Base64 de la parte cifrada del token
            const encryptedBase64 = tokenValue.slice(1);
            const decodedBytes = Buffer.from(encryptedBase64, 'base64').toString('binary');
            
            let decrypted = '';
            for (let i = 0; i < decodedBytes.length; i++) {
                decrypted += String.fromCharCode(decodedBytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }

            const realVideoUrl = serverUrl + decrypted;

            console.log("\n=========================================");
            console.log("¡ENLACE DE SERVIDOR REAL DESENCRIPTADO!");
            console.log("=========================================");
            console.log(`\nURL Decodificada Completa:`);
            console.log(`   ${realVideoUrl}`);
            console.log("\n=========================================");
        } catch (error) {
            console.error("\nError al procesar y desencriptar el token:", error.message);
        }
    });
}).on('error', (err) => {
    console.error("Error de conexión:", err.message);
});
