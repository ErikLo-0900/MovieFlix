const https = require('https');

const url = process.argv[2];
if (!url) {
    console.log("Uso: node extract-cuevana.js <URL_DE_CUEVANA>");
    console.log("Ejemplo: node extract-cuevana.js https://cuevana.you/serie/gravity-falls/episodio-2x1");
    process.exit(1);
}

// Limpiar la URL de posibles espacios
const cleanUrl = url.trim();

console.log(`Conectando a: ${cleanUrl}...`);

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
    }
};

https.get(cleanUrl, options, (res) => {
    if (res.statusCode !== 200) {
        console.error(`\nError: El servidor respondió con código de estado ${res.statusCode}`);
        if (res.statusCode === 403 || res.statusCode === 503) {
            console.log("Detalle: Cloudflare (el sistema anti-bot de Cuevana) bloqueó la conexión automática desde tu IP.");
        }
        process.exit(1);
    }

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        // Expresión regular para buscar data-server="..."
        const regex = /data-server="([^"]+)"/g;
        let match;
        const links = [];

        while ((match = regex.exec(data)) !== null) {
            links.push(match[1]);
        }

        if (links.length === 0) {
            console.log("\nNo se encontraron enlaces de reproducción.");
            if (data.includes("cloudflare") || data.includes("just a moment")) {
                console.log("Detalle: Cloudflare bloqueó el acceso (pidió verificación de humano).");
            } else {
                console.log("Verifica si la URL del episodio es correcta.");
            }
            process.exit(1);
        }

        console.log("\n=========================================");
        console.log(`ENLACES ENCONTRADOS: ${links.length}`);
        console.log("=========================================");

        links.forEach((link, index) => {
            console.log(`\nOPCIÓN #${index + 1}:`);
            console.log(`   URL Original: ${link}`);
            
            // Decodificar Base64 si contiene ?v= o &v=
            if (link.includes("?v=") || link.includes("&v=")) {
                const vMatch = link.match(/[?&]v=([^&]+)/);
                if (vMatch && vMatch[1]) {
                    try {
                        const decoded = Buffer.from(vMatch[1], 'base64').toString('utf-8');
                        console.log(`   URL Limpia (Decodificada): ${decoded}`);
                    } catch (e) {
                        console.log(`   [No se pudo decodificar el Base64 automáticamente]`);
                    }
                }
            }
        });
        console.log("\n=========================================");
    });
}).on('error', (err) => {
    console.error("Error al conectar:", err.message);
});
