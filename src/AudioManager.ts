import { Howl, Howler } from "howler";
import { LogicState } from "./logic_state";
import { SessionConfig } from "./SessionConfig";

class AudioManager {
    MUSIC: Howl[] = [];
    SOUND_FXS: Howl[] = [];

    bg_music?: Howl;
    bg_bonus_music?: Howl;

    spin_sound?: Howl;
    stopSpin?: Howl;

    crash_stones?: Howl;
    skatter?: Howl;

    win?: Howl;
    big_win?: Howl;
    big_win_super?: Howl;
    big_win_mega?: Howl;

    free_spin_in?: Howl;
    free_spin_out?: Howl;

    symbol_lady?: Howl;
    symbol_thor?: Howl;
    symbol_viking?: Howl;
    symbol_rest?: Howl;
    mystery?: Howl;
    transition?: Howl;

    click_sound?: Howl; // ?

    suspended = false;
    initialized = false;

    constructor() {
        this.initialized = false;

        this.addListeners();
    }

    addListeners = () => {
        const mute = () => {
            this.muteHowler(true);
        };

        const unmute = () => {
            this.muteHowler(false);
        };

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                if (PIXI.utils.isMobile.apple.device) {
                    document.addEventListener("touchend", unmute, {
                        once: true,
                    });
                } else {
                    unmute();
                }
            } else {
                mute();
            }
        });
    };

    muteHowler = (mute: boolean) => {
        const audioContext = Howler.ctx;

        if (audioContext == null) return;
        if (mute) {
            if (audioContext.state == "running") {
                audioContext.suspend();
                this.suspended = true;
            }
        } else {
            if (this.initialized) {
                if (audioContext.state == "suspended") {
                    audioContext.resume();
                    this.suspended = false;
                }
            }
        }
    };

    init = () => {
        this.bg_music = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/back1.mp3`,
            autoplay: true,
            loop: true,
        });
        this.MUSIC.push(this.bg_music);

        this.bg_bonus_music = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/back2.mp3`,
            autoplay: false,
            loop: true,
        });
        this.MUSIC.push(this.bg_bonus_music);

        this.spin_sound = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/symbol_fall.mp3`,
        });
        this.SOUND_FXS.push(this.spin_sound);

        this.stopSpin = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/symbol_fall.mp3`,
        });
        this.SOUND_FXS.push(this.stopSpin);

        this.win = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/win.mp3`,
        });
        this.SOUND_FXS.push(this.win);

        this.big_win = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/bigWin1.mp3`,
        });
        this.SOUND_FXS.push(this.big_win);

        this.big_win_super = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/bigWin2.mp3`,
        });
        this.SOUND_FXS.push(this.big_win_super);

        this.big_win_mega = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/bigWin3.mp3`,
        });
        this.SOUND_FXS.push(this.big_win_mega);

        this.crash_stones = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/crashStones.mp3`,
        });
        this.SOUND_FXS.push(this.crash_stones);

        this.skatter = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/skatter1.mp3`,
        });
        this.SOUND_FXS.push(this.skatter);

        this.free_spin_in = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/freespinIN.mp3`,
        });
        this.SOUND_FXS.push(this.free_spin_in);

        this.free_spin_out = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/freeSpinOUT.mp3`,
        });
        this.SOUND_FXS.push(this.free_spin_out);

        this.mystery = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/mystery.mp3`,
        });
        this.SOUND_FXS.push(this.mystery);

        this.transition = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/transition.mp3`,
        });
        this.SOUND_FXS.push(this.transition);

        this.symbol_lady = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/symbol_lady.mp3`,
        });
        this.SOUND_FXS.push(this.transition);

        this.symbol_thor = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/symbol_thor.mp3`,
        });
        this.SOUND_FXS.push(this.transition);

        this.symbol_viking = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/symbol_viking.mp3`,
        });
        this.SOUND_FXS.push(this.transition);

        this.symbol_rest = new Howl({
            src: `${SessionConfig.ASSETS_ADDRESS}sounds/symbol_rest.mp3`,
        });
        this.SOUND_FXS.push(this.transition);

        this.initialized = true;
    };

    change_fx_volume = (new_volume: number) => {
        for (const fx of this.SOUND_FXS) {
            fx.volume(new_volume);
        }
    };

    change_music_volume = (new_volume: number) => {
        for (const m of this.MUSIC) {
            m.volume(new_volume);
        }
    };

    playTransition = () => {
        this.transition!.volume(LogicState.sound_fx_volume * 0.2);
        this.transition!.play();
    };

    playFreeSpinOut = () => {
        this.free_spin_out!.volume(LogicState.sound_fx_volume * 0.5);
        this.free_spin_out!.play();
    };

    playFreeSpinIn = () => {
        this.free_spin_in!.volume(LogicState.sound_fx_volume * 0.5);
        this.free_spin_in!.play();
    };

    playBonusBG = () => {
        this.bg_bonus_music!.volume(LogicState.music_volume * 0.2);
        this.bg_bonus_music!.play();
    };

    playBigWin = (num: number) => {
        switch (num) {
            case 0:
                this.big_win!.volume(LogicState.sound_fx_volume * 0.2);
                this.big_win!.play();
                break;
            case 1:
                this.big_win_super!.volume(LogicState.sound_fx_volume * 0.2);
                this.big_win_super!.play();
                break;
            case 2:
                this.big_win_mega!.volume(LogicState.sound_fx_volume * 0.2);
                this.big_win_mega!.play();
                break;
        }
    };
    /**
     * @param target_volume 0-1
     * @param duration ms
     */
    fade_music = (target_volume: number, duration: number) => {
        target_volume = Math.min(
            target_volume,
            LogicState.is_music_on ? LogicState.music_volume : 0
        );

        for (const m of this.MUSIC) {
            if (m === this.bg_bonus_music) {
                m.fade?.(m.volume(), target_volume * 0.2, duration);
            } else {
                m.fade?.(m.volume(), target_volume, duration);
            }
        }
    };
}

export type SoundNames = "click_sound" | "spin_sound";

export const AUDIO_MANAGER = new AudioManager();
