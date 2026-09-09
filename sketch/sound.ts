export class SoundEffects {
    private context: AudioContext | undefined;
    private lastThrustTime = 0;
    private musicStarted = false;
    private musicTimer: number | undefined;

    unlock(): void {
        if (!this.context) {
            this.context = new AudioContext();
        }
        void this.context.resume();
        this.startMusic();
    }

    fire(): void {
        this.tone("square", 660, 180, 0.09, 0.045);
    }

    thrust(): void {
        if (!this.context || this.context.currentTime - this.lastThrustTime < 0.07) {
            return;
        }
        this.lastThrustTime = this.context.currentTime;
        this.tone("sawtooth", 85, 55, 0.06, 0.035);
    }

    explosion(): void {
        this.tone("sawtooth", 180, 28, 0.38, 0.11);
    }

    private startMusic(): void {
        if (!this.context || this.musicStarted) {
            return;
        }

        this.musicStarted = true;
        this.scheduleMusicLoop();
        this.musicTimer = window.setInterval(() => this.scheduleMusicLoop(), 8000);
    }

    private scheduleMusicLoop(): void {
        if (!this.context) {
            return;
        }

        const start = this.context.currentTime + 0.08;
        const beat = 0.25;
        const melody = [
            659, 784, 880, 784, 659, 587, 659, 523,
            587, 659, 784, 880, 784, 659, 587, 523,
            523, 659, 784, 988, 880, 784, 659, 587,
            659, 784, 880, 784, 659, 587, 523, 392,
        ];
        const bass = [131, 165, 196, 165, 147, 175, 220, 175];

        melody.forEach((frequency, index) => {
            this.note("square", frequency, start + index * beat, beat * 0.8, 0.028);
        });
        bass.forEach((frequency, index) => {
            const time = start + index * beat * 4;
            this.note("triangle", frequency, time, beat * 1.65, 0.045);
            this.note("triangle", frequency * 1.5, time + beat * 2, beat * 1.35, 0.025);
        });
    }

    private note(
        type: OscillatorType,
        frequency: number,
        startTime: number,
        duration: number,
        volume: number
    ): void {
        if (!this.context) {
            return;
        }

        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.setValueAtTime(0.001, startTime + duration);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    private tone(
        type: OscillatorType,
        startFrequency: number,
        endFrequency: number,
        duration: number,
        volume: number
    ): void {
        if (!this.context) {
            return;
        }

        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const now = this.context.currentTime;
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(startFrequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
}
