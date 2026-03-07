/**
 * STREAM RESOLVER
 * Handles fetching audio from SoundCloud, Bandcamp, and YouTube using a proxy-based approach.
 * For local-only use without a backend.
 */
export class StreamResolver {
    constructor() {
        // We'll use a mix of public APIs and a CORS proxy
        this.proxy = "https://api.allorigins.win/raw?url=";
    }

    async resolve(url) {
        if (url.includes('soundcloud.com')) {
            return this.resolveSoundCloud(url);
        } else if (url.includes('bandcamp.com')) {
            return this.resolveBandcamp(url);
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return this.resolveYouTube(url);
        } else {
            // Assume it's a direct audio link
            return { streamUrl: url, title: "External Stream" };
        }
    }

    async resolveSoundCloud(url) {
        try {
            // Fetch the page content via proxy to find the direct stream or client_id
            const response = await fetch(`${this.proxy}${encodeURIComponent(url)}`);
            const html = await response.text();
            
            // Search for stream URL in the page source (fallback method)
            const streamMatch = html.match(/https:\/\/api-v2\.soundcloud\.com\/media\/[^\"]+/);
            if (streamMatch) {
                // This would normally need a client_id. For a simple local project,
                // we'll attempt a direct extraction if possible or return a simplified error.
                return { streamUrl: streamMatch[0], title: "SoundCloud Stream" };
            }
            throw new Error("Could not find SoundCloud stream");
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async resolveBandcamp(url) {
        try {
            const response = await fetch(`${this.proxy}${encodeURIComponent(url)}`);
            const html = await response.text();
            
            // Bandcamp embeds audio in a data-tralbum attribute (JSON)
            const match = html.match(/data-tralbum=\"({.*?})\"/);
            if (match) {
                const data = JSON.parse(match[1].replace(/&quot;/g, '"'));
                const streamUrl = data.trackinfo[0].file['mp3-128'];
                return { 
                    streamUrl: streamUrl, 
                    title: data.trackinfo[0].title 
                };
            }
            throw new Error("Bandcamp stream not found");
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async resolveYouTube(url) {
        // YouTube requires a more robust engine like Cobalt
        // We will use a public instance of Cobalt for this project
        const cobaltInstance = "https://cobalt.canine.is/api/json";
        
        try {
            const response = await fetch(cobaltInstance, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: url,
                    isAudioOnly: true
                })
            });
            const data = await response.json();
            
            if (data.url) {
                return { streamUrl: data.url, title: "YouTube Stream" };
            }
            throw new Error("YouTube resolution failed");
        } catch (e) {
            console.error("YouTube Proxy error:", e);
            return null;
        }
    }
}
