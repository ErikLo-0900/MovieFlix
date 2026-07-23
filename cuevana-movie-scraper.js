const https = require('https');
const fs = require('fs');

const mainUrl = process.argv[2];
if (!mainUrl) {
    console.log("Uso: node cuevana-movie-scraper.js <URL_DE_CUEVANA_PELICULA>");
    console.log("Ejemplo: node cuevana-movie-scraper.js https://cuevana3i.you/pelicula/scary-movie");
    process.exit(1);
}

const cleanMainUrl = mainUrl.trim();
const domainMatch = cleanMainUrl.match(/https?:\/\/[a-z0-9.-]+/i);
const baseUrl = domainMatch ? domainMatch[0] : 'https://cuevana3i.you';

// Extraer el slug de la película
const urlParts = cleanMainUrl.split('/');
const movieSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
let movieTitle = movieSlug.charAt(0).toUpperCase() + movieSlug.slice(1).replace(/-/g, ' ');

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

// Servidores globales en inglés a excluir
const excludedHosts = ["vsembed", "vidlink", "videasy", "vidapi"];

// Función auxiliar para descargar HTML de forma asíncrona (Promesa)
function fetchHtml(targetUrl) {
    return new Promise((resolve, reject) => {
        https.get(targetUrl, getRequestOptions(targetUrl), (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Código de estado ${res.statusCode} en ${targetUrl}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', err => reject(err));
    });
}

// Obtener nombre del servidor a partir de la URL
function getServerName(urlStr) {
    try {
        const parsed = new URL(urlStr);
        let host = parsed.hostname.replace('www.', '');
        // Retornar primera parte con letra capital (ej. streamwish.to -> Streamwish)
        const parts = host.split('.');
        if (parts.length > 0) {
            return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }
        return host;
    } catch (e) {
        return "Servidor";
    }
}

// Función para desencriptar el token de Cuevana (XOR)
function decryptToken(tokenValue, playerHtml) {
    try {
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
            if (Object.keys(parsedServers).length > 0) servers = parsedServers;
        }

        let key = 'a45f04ce-2394-47c3-b718-0ecd97ce51d6';
        const keyMatch = playerHtml.match(/const key\s*=\s*([^;]+);/i);
        if (keyMatch && keyMatch[1]) {
            const evaluatedKey = keyMatch[1].replace(/['"+\s]/g, '');
            if (evaluatedKey && evaluatedKey.length > 10) key = evaluatedKey;
        }

        const firstChar = tokenValue[0];
        const serverUrl = servers[firstChar];
        if (!serverUrl) return null;

        const encryptedBase64 = tokenValue.slice(1);
        const decodedBytes = Buffer.from(encryptedBase64, 'base64').toString('binary');
        
        let decrypted = '';
        for (let i = 0; i < decodedBytes.length; i++) {
            decrypted += String.fromCharCode(decodedBytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return serverUrl + decrypted;
    } catch (e) {
        return null;
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    try {
        console.log(`\n=========================================`);
        console.log(`RASCADOR AUTOMÁTICO DE PELÍCULAS DE CUEVANA`);
        console.log(`=========================================`);
        console.log(`URL de la película: ${cleanMainUrl}`);
        console.log(`Excluyendo servidores globales: ${excludedHosts.join(', ')}`);

        console.log(`\nObteniendo página de la película...`);
        const mainHtml = await fetchHtml(cleanMainUrl);

        // Intentar extraer el título real de la película de la página
        const titleMatch = mainHtml.match(/<h1 class="title">([^<]+)<\/h1>/i) || 
                           mainHtml.match(/<h1>([^<]+)<\/h1>/i) || 
                           mainHtml.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            movieTitle = titleMatch[1].replace(/Ver\s+/i, '').replace(/Online\s*$/i, '').trim();
        }
        console.log(`Película identificada: ${movieTitle}`);

        // Buscar todos los data-server="..." de la película
        const serverRegex = /data-server="([^"]+)"/g;
        const serverUrls = [];
        let sMatch;
        while ((sMatch = serverRegex.exec(mainHtml)) !== null) {
            serverUrls.push(sMatch[1]);
        }

        if (serverUrls.length === 0) {
            console.log(`\n[!] No se encontraron servidores para esta película.`);
            if (mainHtml.includes("cloudflare") || mainHtml.includes("just a moment")) {
                console.log("Detalle: Cloudflare bloqueó el acceso (pidió verificación de humano).");
            }
            process.exit(1);
        }

        console.log(`\nSe encontraron ${serverUrls.length} opciones de servidores en crudo.`);
        console.log(`Resolviendo y decodificando enlaces...`);

        const resolvedServers = [];

        for (let i = 0; i < serverUrls.length; i++) {
            const optionUrl = serverUrls[i];
            
            // Comprobar si el host está excluido
            const isExcluded = excludedHosts.some(host => optionUrl.toLowerCase().includes(host));
            if (isExcluded) {
                console.log(`   [Opción #${i + 1}] Servidor excluido por idioma/global`);
                continue;
            }

            let cleanVideoUrl = optionUrl;

            try {
                if (optionUrl.includes('?v=') || optionUrl.includes('&v=')) {
                    // Base64 directo
                    const vMatch = optionUrl.match(/[?&]v=([^&]+)/);
                    if (vMatch && vMatch[1]) {
                        cleanVideoUrl = Buffer.from(vMatch[1], 'base64').toString('utf-8');
                    }
                } else if (optionUrl.includes('?token=') || optionUrl.includes('&token=')) {
                    // Cifrado XOR, descargar reproductor
                    const tokenMatch = optionUrl.match(/[?&]token=([^&]+)/);
                    if (tokenMatch && tokenMatch[1]) {
                        const tokenValue = tokenMatch[1];
                        await sleep(500);
                        const playerHtml = await fetchHtml(optionUrl);
                        const decrypted = decryptToken(tokenValue, playerHtml);
                        if (decrypted) cleanVideoUrl = decrypted;
                    }
                }

                const serverName = getServerName(cleanVideoUrl);
                console.log(`   [Opción #${i + 1}] [OK] Encontrado: ${serverName} -> ${cleanVideoUrl}`);
                
                resolvedServers.push({
                    name: serverName,
                    url: cleanVideoUrl
                });
            } catch (optErr) {
                console.log(`   [Opción #${i + 1}] [!] Error resolviendo enlace: ${optErr.message}`);
            }
        }

        if (resolvedServers.length === 0) {
            console.log(`\n[!] No quedaron servidores válidos después del filtrado.`);
            process.exit(1);
        }

        const resultDatabase = {
            title: movieTitle,
            slug: movieSlug,
            url: cleanMainUrl,
            servers: resolvedServers
        };

        // Guardar la base de datos a un archivo JSON
        const outputFilename = `${movieSlug}_links.json`;
        fs.writeFileSync(outputFilename, JSON.stringify(resultDatabase, null, 2), 'utf-8');
        
        console.log(`\n=========================================`);
        console.log(`¡PROCESO COMPLETADO EXITOSAMENTE!`);
        console.log(`=========================================`);
        console.log(`Se ha generado el archivo JSON con los enlaces listos:`);
        console.log(`   ${outputFilename}`);
        console.log(`=========================================`);

    } catch (err) {
        console.error(`\nError general en el proceso:`, err.message);
    }
}

main();
