export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.waveformArray = null;
        this.isInitialized = false;
        this.stream = null;
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = "anonymous";
        
        // FFT settings
        this.fftSize = 2048;
    }

    init() {
        if (this.isInitialized) return;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext({
            latencyHint: 'interactive',
            sampleRate: 44100,
        });
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = this.fftSize;
        
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.waveformArray = new Uint8Array(bufferLength);
        
        this.isInitialized = true;
        console.log("Audio Engine Initialized");
    }

    async startMic() {
        this.init();
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        if (!navigator.mediaDevices?.getUserMedia) {
            console.error("Microphone access requires a secure context (localhost or HTTPS).");
            return false;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (this.source) this.source.disconnect();
            
            this.source = this.ctx.createMediaStreamSource(this.stream);
            this.source.connect(this.analyser);
            // Don't connect to destination to avoid feedback loops!
            return true;
        } catch (err) {
            console.error("Error accessing microphone:", err);
            return false;
        }
    }

    async playFile(file) {
        this.init();
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        const url = URL.createObjectURL(file);
        this.audioElement.src = url;
        
        if (this.source) this.source.disconnect();
        
        this.source = this.ctx.createMediaElementSource(this.audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        
        this.audioElement.play();
    }

    async playUrl(url) {
        this.init();
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        this.audioElement.src = url;
        
        if (this.source) this.source.disconnect();
        
        this.source = this.ctx.createMediaElementSource(this.audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        
        this.audioElement.play();
    }

    getFrequencyData() {
        if (!this.analyser) return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    getWaveformData() {
        if (!this.analyser) return null;
        this.analyser.getByteTimeDomainData(this.waveformArray);
        return this.waveformArray;
    }

    getAverageFrequency() {
        const data = this.getFrequencyData();
        if (!data) return 0;
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        return sum / data.length;
    }

    // Get smoothed volume (0 to 1)
    getVolume() {
        const data = this.getFrequencyData();
        if (!data) return 0;
        return Math.max(...data) / 255;
    }

    isPlaying() {
        if (this.stream) return true; // Mic is always "playing" if active
        return !this.audioElement.paused && this.audioElement.currentTime > 0;
    }

    getCurrentTime() {
        return this.audioElement.currentTime;
    }

    getDuration() {
        return this.audioElement.duration;
    }

    seek(time) {
        if (this.audioElement.duration) {
            this.audioElement.currentTime = time;
        }
    }
stopMic() {
    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
    }
}

pause() {
    this.audioElement.pause();
}

resume() {
    this.audioElement.play();
}

setVolume(val) {
    this.audioElement.volume = val;
}
}

