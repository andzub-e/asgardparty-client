import { Config } from "./Config";
import { LogicState } from "./logic_state";
import anime from "animejs";
import { sleep, stop_spine_animation } from "./Util";
import { AUDIO_MANAGER } from "./AudioManager";
import { FreeSpins } from "./FreeSpins";
import { ECL } from "ecl";
import { TextStyles } from "./TextStyles";

export class BigWin {
    app: PIXI.Application;
    container: PIXI.Container;
    big_win_container = new PIXI.Container();
    big_win_spine: PIXI.spine.Spine;
    big_win_value: PIXI.Text;
    bonus_mode_overlay: PIXI.Sprite;
    big_win_anim?: anime.AnimeInstance;

    big_win_value_anim: anime.AnimeInstance;
    bonus_won: FreeSpins;

    light_between_win: PIXI.spine.Spine;

    free_win_anim?: anime.AnimeInstance | null;
    bg: PIXI.Sprite;
    anims = ["Big Win Cycle", "Mega Big Win Cycle", "Epic Big Win Cycle"];

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();

        this.container.addChild(this.big_win_container);
        this.big_win_container.visible = false;

        this.bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.bg.tint = 0x000000;
        this.bg.width = 2880;
        this.bg.height = 2880;
        this.bg.position.set(-720, -720);

        this.bg.alpha = 0.7;
        this.big_win_container.addChild(this.bg);

        this.big_win_spine = new PIXI.spine.Spine(
            PIXI.Loader.shared.resources["big_win_anim"].spineData
        );

        this.big_win_spine.position.set(this.app.screen.width / 2, 400);

        this.big_win_spine.visible = false;
        this.big_win_container.addChild(this.big_win_spine);

        this.bonus_won = new FreeSpins(this.app);
        this.big_win_container.addChild(this.bonus_won.fift_free_spin);

        this.big_win_value = new PIXI.Text("0", TextStyles.bigWinTextValue);

        this.big_win_value.anchor = new PIXI.Point(0.5, 0.5);
        this.big_win_value.position.set(720, 600);
        this.big_win_container.addChild(this.big_win_value);

        this.big_win_value_anim = anime({
            targets: this.big_win_value.scale,
            duration: 450,
            x: 1.2,
            y: 1.2,
            direction: "alternate",
            easing: "linear",
            loop: true,
        });
        this.big_win_value_anim.pause();

        this.bonus_mode_overlay = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.bonus_mode_overlay.tint = 0x000000;
        this.bonus_mode_overlay.width = 2880;
        this.bonus_mode_overlay.height = 2880;
        this.bonus_mode_overlay.position.set(-720, -720);
        this.bonus_mode_overlay.alpha = 0.7;
        this.bonus_mode_overlay.visible = false;
        this.container.addChild(this.bonus_mode_overlay);

        this.big_win_container.cursor = "pointer";

        this.light_between_win = new PIXI.spine.Spine(
            PIXI.Loader.shared.resources["light_between_win"].spineData
        );
        this.light_between_win.position.set(1440 / 2, 300);
        this.big_win_container.addChild(this.light_between_win);
        this.resize();
    }

    exitBigWinAnim = (animName: string) => {
        return new Promise<void>((res) => {
            this.big_win_spine.state.setAnimation(0, animName, true);
            this.big_win_spine.state.onComplete = () => {
                res();
            };
        });
    };

    show_big_win_container = (): Promise<void> => {
        this.big_win_container.interactive = true;

        return new Promise<void>((resolve) => {
            const bet = LogicState.getBet();
            const real_ratio = LogicState.win / bet;
            const ratios = Config.big_win_ratios;
            this.big_win_value.alpha = 1;

            if (real_ratio < ratios.big_win) return resolve();

            const endAnimName = this.checkEndAnim(real_ratio, ratios);
            let clickCount = 0;
            this.big_win_container.on("pointerdown", () => {
                if (clickCount == 0) {
                    if (this.big_win_anim) {
                        this.big_win_anim.pause();
                    }
                    this.big_win_value.text = ECL.fmt.money(LogicState.win);

                    this.exitBigWinAnim(this.anims[endAnimName]);
                } else {
                    this.big_win_container_clicked();
                    resolve();
                }
                clickCount++;
            });

            this.big_win_container.visible = true;
            this.big_win_value.text = "0";

            this.bigWinSound(real_ratio, ratios);

            this.big_win_spine.visible = true;
            this.big_win_spine.state.setAnimation(0, "Big Win IN", false);
            this.big_win_spine.state.onComplete = () => {
                this.big_win_spine.state.setAnimation(0, "Big Win Cycle", true);
            };

            this.animBigWinText(resolve, bet, ratios);
        });
    };

    animBigWinText = (callback: any, bet: number, ratios: any) => {
        const progress1 = {
            value: 0,
        };
        let animState = 0;

        this.big_win_anim = anime({
            targets: progress1,
            value: 1,
            duration: Config.big_win_countup_duration,
            update: (anim) => {
                const progress = anim.progress / 100;
                const currentWin = progress * LogicState.win;
                const currentRatio = currentWin / bet;

                if (currentRatio >= ratios.super_big_win && animState == 0) {
                    animState = 1;
                    this.playBigWinAnim(
                        "Mega Big Win IN",
                        "Mega Big Win Cycle"
                    );
                } else if (
                    currentRatio >= ratios.mega_big_win &&
                    animState == 1
                ) {
                    animState = 2;
                    this.playBigWinAnim(
                        "Epic Big Win IN",
                        "Epic Big Win Cycle"
                    );
                }

                const win_amount_temp = progress * LogicState.win;
                this.big_win_value.text = ECL.fmt.money(win_amount_temp);
            },
            complete: () => {
                this.big_win_value.text = ECL.fmt.money(LogicState.win);
                this.big_win_anim = anime({
                    duration: 1000,
                    complete: () => {
                        anime({
                            targets: this.big_win_value,
                            alpha: 0,
                            easing: "linear",
                            duration: 500,
                        });
                        this.fadeout_big_win_container(() => {
                            this.big_win_container.visible = false;
                            this.big_win_value_anim.pause();
                            this.hide_big_win_spine_anim();
                            this.stop_all_audio();
                            AUDIO_MANAGER.fade_music(1, 500);
                            callback();
                        });
                    },
                });
            },
        });
    };

    checkEndAnim = (real_ratio: number, ratios: any) => {
        let animCount = 0;
        switch (true) {
            case real_ratio >= ratios.mega_big_win:
                animCount = 2;
                break;
            case real_ratio >= ratios.super_big_win:
                animCount = 1;
                break;
            case real_ratio >= ratios.big_win:
                animCount = 0;
                break;
        }

        return animCount;
    };

    bigWinSound = (real_ratio: number, ratios: any) => {
        AUDIO_MANAGER.fade_music(0, 1000);
        AUDIO_MANAGER.playTransition();
        switch (true) {
            case real_ratio >= ratios.mega_big_win:
                AUDIO_MANAGER.playBigWin(2);
                break;
            case real_ratio >= ratios.super_big_win:
                AUDIO_MANAGER.playBigWin(1);
                break;
            case real_ratio >= ratios.big_win:
                AUDIO_MANAGER.playBigWin(0);
                break;
        }
    };

    playBigWinAnim = (transitionName: string, animName: string) => {
        this.big_win_spine.state.onComplete = () => {};
        this.light_between_win.state.setAnimation(0, "animation", false);
        this.big_win_spine.state.setAnimation(0, transitionName, false);
        this.big_win_spine.state.addAnimation(0, animName, true, 0);
    };

    stop_all_audio = () => {
        AUDIO_MANAGER.big_win!.stop();
        AUDIO_MANAGER.big_win_super!.stop();
        AUDIO_MANAGER.big_win_mega!.stop();
    };

    hide_big_win_spine_anim = () => {
        stop_spine_animation(this.big_win_spine, 0, false);
    };

    fadeout_big_win_container = (complete: () => void) => {
        anime({
            targets: this.big_win_container,
            easing: "easeOutCubic",
            duration: 1000,
            alpha: 0,
            complete: () => {
                complete();
                this.big_win_container.alpha = 1;
            },
        });
    };

    /**The function is responsible for the animation of the text and the animation of congratulations */
    show_total_win_container = async (): Promise<void> => {
        this.big_win_container.visible = true;
        this.big_win_value.visible = false;

        this.free_win_anim = anime({
            duration: Config.big_win_countup_duration,
            update: (anim) => {
                const win = LogicState.win;
                const progress = anim.progress / 100;
                const animatedWin = win * progress;
                this.big_win_value.text = ECL.fmt.money(animatedWin);
            },
        });

        await this.bonus_won.play_won(
            this.big_win_value,
            this,
            this.free_win_anim
        );

        this.big_win_container.visible = false;
        this.big_win_value_anim.pause();
        this.free_win_anim = null;

        return Promise.resolve();
    };

    private big_win_container_clicked = async () => {
        if (this.free_win_anim) {
            this.free_win_anim!.pause();
            this.big_win_value_anim.pause();
            this.big_win_value!.text = `${ECL.fmt.money(LogicState.win)}`;
            await sleep(2000);
        }
        if (this.big_win_anim) {
            this.stop_all_audio();
            AUDIO_MANAGER.fade_music(1, 500);
            this.big_win_container.interactive = false;
            this.big_win_container.removeAllListeners();
            this.big_win_anim!.pause();
            this.big_win_anim!.complete!(this.big_win_anim!);
            anime({
                duration: 1000,
                complete: () => (this.big_win_spine.state.timeScale = 1),
            });
        }
    };

    resize = () => {
        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                this.big_win_spine.scale.set(1);
                this.big_win_spine.position.set(this.app.screen.width / 2, 400);

                this.light_between_win.position.set(1440 / 2, 300);

                this.big_win_value.position.set(720, 600);

                this.bonus_won.fift_free_spin.position.set(720, 400);
                this.bonus_mode_overlay.position.set(
                    this.app.screen.width,
                    this.app.screen.height / 2
                );
                this.bonus_mode_overlay.anchor.set(0.5);
                this.bg.position.set(
                    this.app.screen.width,
                    this.app.screen.height / 2
                );
                this.bg.anchor.set(0.5);
                this.bonus_mode_overlay.height = this.app.screen.height;
                this.bg.height = this.app.screen.height;
            } else {
                this.bonus_mode_overlay.position.set(
                    this.app.screen.width,
                    this.app.screen.height / 2
                );
                this.bonus_mode_overlay.anchor.set(0.5);
                this.bonus_mode_overlay.height = this.app.screen.height;
                this.bg.position.set(
                    this.app.screen.width,
                    this.app.screen.height / 2
                );
                this.bg.height = this.app.screen.height;
                this.bg.anchor.set(0.5);
                this.big_win_spine.scale.set(0.75);
                this.big_win_spine.position.set(
                    this.app.screen.width / 2,
                    this.app.screen.height / 2 - 150
                );

                this.light_between_win.position.set(
                    810 / 2,
                    this.app.screen.height / 2 - 200
                );

                this.big_win_value.position.set(
                    408.5,
                    this.app.screen.height / 2 + 100
                );

                this.bonus_won.fift_free_spin.position.set(
                    405,
                    this.app.screen.height / 2 - 150
                );
                this.bonus_won.last_free_spin.position.set(
                    405,
                    this.app.screen.height / 2 - 150
                );
            }
        }
    };
}
