const https = require('https');
const fs = require('fs');

const mainUrl = process.argv[2];
if (!mainUrl) {
    console.log("Uso: node cuevana-series-scraper.js <URL_DE_CUEVANA_SERIE>");
    console.log("Ejemplo: node cuevana-series-scraper.js https://cuevana.you/serie/invencible");
    process.exit(1);
}

const cleanMainUrl = mainUrl.trim();
const domainMatch = cleanMainUrl.match(/https?:\/\/[a-z0-9.-]+/i);
const baseUrl = domainMatch ? domainMatch[0] : 'https://cuevana.you';

// Extraer el nombre de la serie desde la URL
const urlParts = cleanMainUrl.split('/');
const seriesSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
const seriesTitle = seriesSlug.charAt(0).toUpperCase() + seriesSlug.slice(1).replace(/-/g, ' ');

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

// Función para desencriptar el token
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

// Retardar la ejecución para no saturar al servidor
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    try {
        console.log(`\n=========================================`);
        console.log(`RASCADOR AUTOMÁTICO DE SERIES DE CUEVANA`);
        console.log(`=========================================`);
        console.log(`Serie a procesar: ${seriesTitle}`);
        console.log(`URL inicial: ${cleanMainUrl}`);
        console.log(`Excluyendo servidores en inglés: ${excludedHosts.join(', ')}`);

        // 1. Obtener las URL de las Temporadas
        console.log(`\nObteniendo lista de temporadas...`);
        const mainHtml = await fetchHtml(cleanMainUrl);
        const seasonRegex = /href="([^"]+\/temporada-\d+)"/g;
        const seasonUrls = [];
        let match;
        while ((match = seasonRegex.exec(mainHtml)) !== null) {
            seasonUrls.push(match[1]);
        }

        const uniqueSeasonUrls = Array.from(new Set(seasonUrls)).sort((a, b) => {
            const numA = parseInt(a.match(/temporada-(\d+)/)[1]);
            const numB = parseInt(b.match(/temporada-(\d+)/)[1]);
            return numA - numB;
        });

        if (uniqueSeasonUrls.length === 0) {
            console.log(`No se encontraron temporadas en la página principal.`);
            console.log(`Intentando buscar episodios directamente en la URL dada (por si es una temporada individual)...`);
            uniqueSeasonUrls.push(cleanMainUrl);
        } else {
            console.log(`Se encontraron ${uniqueSeasonUrls.length} temporadas.`);
        }

        const resultDatabase = {
            title: seriesTitle,
            slug: seriesSlug,
            url: cleanMainUrl,
            seasons: []
        };

        // 2. Procesar cada Temporada
        for (let seasonUrl of uniqueSeasonUrls) {
            const seasonNumMatch = seasonUrl.match(/temporada-(\d+)/);
            const seasonNum = seasonNumMatch ? parseInt(seasonNumMatch[1]) : 1;
            console.log(`\n-----------------------------------------`);
            console.log(`Procesando Temporada ${seasonNum} (${seasonUrl})...`);
            
            await sleep(1000);
            const seasonHtml = await fetchHtml(seasonUrl);
            const episodeRegex = /href="([^"]+\/episodio-\d+x\d+)"/g;
            const episodeUrls = [];
            
            while ((match = episodeRegex.exec(seasonHtml)) !== null) {
                episodeUrls.push(match[1]);
            }

            const uniqueEpisodeUrls = Array.from(new Set(episodeUrls)).sort((a, b) => {
                const epMatchA = a.match(/episodio-\d+x(\d+)/);
                const epMatchB = b.match(/episodio-\d+x(\d+)/);
                const numA = epMatchA ? parseInt(epMatchA[1]) : 0;
                const numB = epMatchB ? parseInt(epMatchB[1]) : 0;
                return numA - numB;
            });

            console.log(`Se encontraron ${uniqueEpisodeUrls.length} episodios en esta temporada.`);
            
            const seasonData = {
                seasonNumber: seasonNum,
                episodes: []
            };

            // 3. Procesar cada Episodio
            for (let epUrl of uniqueEpisodeUrls) {
                const epNumMatch = epUrl.match(/episodio-\d+x(\d+)/);
                const epNum = epNumMatch ? parseInt(epNumMatch[1]) : 1;
                console.log(`   -> Resolviendo Episodio ${seasonNum}x${epNum}...`);
                
                try {
                    await sleep(800);
                    const epHtml = await fetchHtml(epUrl);
                    
                    // Buscar todos los data-server="..." del episodio
                    const serverRegex = /data-server="([^"]+)"/g;
                    const serverUrls = [];
                    let sMatch;
                    while ((sMatch = serverRegex.exec(epHtml)) !== null) {
                        serverUrls.push(sMatch[1]);
                    }

                    if (serverUrls.length === 0) {
                        console.log(`      [!] No se encontraron servidores para el episodio ${seasonNum}x${epNum}.`);
                        continue;
                    }
                    
                    const resolvedServers = [];

                    for (let optionUrl of serverUrls) {
                        // Comprobar si el host está excluido
                        const isExcluded = excludedHosts.some(host => optionUrl.toLowerCase().includes(host));
                        if (isExcluded) continue;

                        let cleanVideoUrl = optionUrl;

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
                        resolvedServers.push({
                            name: serverName,
                            url: cleanVideoUrl
                        });
                    }

                    if (resolvedServers.length > 0) {
                        console.log(`      [OK] Servidores encontrados en español: ${resolvedServers.map(s => s.name).join(', ')}`);
                        seasonData.episodes.push({
                            episodeNumber: epNum,
                            name: `Capítulo ${epNum}`,
                            servers: resolvedServers
                        });
                    } else {
                        console.log(`      [!] No quedaron servidores válidos después de excluir los globales en inglés.`);
                    }
                } catch (epErr) {
                    console.log(`      [!] Error en episodio ${seasonNum}x${epNum}: ${epErr.message}`);
                }
            }

            resultDatabase.seasons.push(seasonData);
        }

        // Guardar la base de datos a un archivo JSON
        const outputFilename = `${seriesSlug}_links.json`;
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
