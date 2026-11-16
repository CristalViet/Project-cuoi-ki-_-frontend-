/**
 * Web Audio API synthesizer for soothing relaxation soundscapes
 * Zero external audio file download dependencies, plays seamlessly offline
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private oceanNode: AudioNode | null = null;
  private currentMode: 'rain' | 'ocean' | 'silence' = 'silence';
  private gainNode: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playRain() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.currentMode = 'rain';
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // Generate gentle pink noise for rain
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Lowpass filter for cozy night rain
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    whiteNoise.start();

    this.rainNode = whiteNoise;
  }

  playOcean() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.currentMode = 'ocean';
    const bufferSize = 3 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // LFO for wave swelling
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec ocean wave period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    noise.start();
    lfo.start();

    this.oceanNode = noise;
  }

  playChime(type: 'inhale' | 'hold' | 'exhale') {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = type === 'inhale' ? 440 : type === 'hold' ? 523.25 : 392;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  private lofiInterval: number | null = null;

  playLofiChimes() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.currentMode = 'lofi' as any;
    const notes = [261.63, 329.63, 392.00, 440.00, 523.25]; // C, E, G, A, C5 Pentatonic calm
    let step = 0;

    const playNote = () => {
      if (!this.ctx || this.currentMode !== ('lofi' as any)) return;
      const freq = notes[step % notes.length];
      step = (step + 1) % notes.length;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.0);
    };

    playNote();
    this.lofiInterval = window.setInterval(playNote, 2200);
  }

  stop() {
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    if (this.rainNode) {
      try {
        (this.rainNode as AudioBufferSourceNode).stop();
      } catch {
        // already stopped
      }
      this.rainNode = null;
    }
    if (this.oceanNode) {
      try {
        (this.oceanNode as AudioBufferSourceNode).stop();
      } catch {
        // already stopped
      }
      this.oceanNode = null;
    }
    this.currentMode = 'silence';
  }

  getMode() {
    return this.currentMode;
  }
}

export const soundEngine = new AudioSynthesizer();
