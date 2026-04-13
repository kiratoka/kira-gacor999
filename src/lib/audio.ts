class SimpleSynth {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playMatch() {
    this.init();
    this.playTone(440, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(554, 'sine', 0.2, 0.1), 100);
  }

  playCombo(comboMultiplier: number) {
    this.init();
    const baseFreq = 440 + (comboMultiplier * 50);
    this.playTone(baseFreq, 'square', 0.1, 0.05);
    setTimeout(() => this.playTone(baseFreq * 1.5, 'square', 0.3, 0.05), 100);
  }

  playNearMiss() {
    this.init();
    this.playTone(300, 'triangle', 0.2, 0.1);
    setTimeout(() => this.playTone(280, 'triangle', 0.4, 0.1), 150);
  }

  playSwap() {
    this.init();
    this.playTone(800, 'sine', 0.05, 0.02);
  }
  
  playError() {
    this.init();
    this.playTone(150, 'sawtooth', 0.2, 0.05);
  }

  playTap() {
    this.init();
    this.playTone(600, 'sine', 0.05, 0.03);
  }
}

export const soundEngine = new SimpleSynth();
