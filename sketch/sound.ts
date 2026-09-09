export class SoundEffects {
    private context: AudioContext | undefined;
    private lastThrustTime = 0;

    unlock(): void {
        if (!this.context) {
            this.context = new AudioContext();
        }
        void this.context.resume();
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
