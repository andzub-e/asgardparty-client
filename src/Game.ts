import { Background } from "./Background";
import { Foreground } from "./Foreground";
import { SlotMachine } from "./SlotMachine/SlotMachine";
import { MainUI } from "./UI/MainUI";
import { EVENTS } from "./Events";
import { LogicState } from "./logic_state";
import { BigWin } from "./BigWin";
import anime from "animejs";
import { Config } from "./Config";
import { AUDIO_MANAGER } from "./AudioManager";

import { FreeSpins } from "./FreeSpins";
import { ECL } from "ecl";
import { modify_spin_result } from "./MatrixForm";
import { objectJsonCopy, sleep } from "./Util";
import { OldFormSpin, ServerState, SpinResult, SpinStepResult } from "./Models";
import { make_spin, update_spins_indexes } from "./Controller";
import { Localize } from "ecl/dist/i18n";

export class Game {
    readonly container: PIXI.Container;
    private readonly app: PIXI.Application;
    bg?: Background;
    fg?: Foreground;
    slot_machine?: SlotMachine;
    mainUI?: MainUI;
    bigWin?: BigWin;
    freeSpins?: FreeSpins;

    fift_free_spin?: PIXI.spine.Spine;

    constructor(app: PIXI.Application) {
        this.app = app;

        this.container = new PIXI.Container();
        app.stage.addChild(this.container);

        this.draw_game();
        this.add_event_listeners();

        this.on_resize();
    }

    draw_game = () => {
        this.bg = new Background(this.app);
        this.bg!.container.pivot.x = 0.5;
        this.bg!.container.pivot.y = 0.5;
        this.container.addChild(this.bg.container);

        if (LogicState.spin_result?.reels.spins !== null) {
            const mSpinResult =
                modify_spin_result(LogicState.spin_result!).steps[
                    LogicState.currentSpinStage
                ] || modify_spin_result(LogicState.spin_result!).steps.pop();

            LogicState.current_reels_indexes = mSpinResult.falled_all
                .map((reel) =>
                    reel.map((el) =>
                        el ? Config.symbols_to_index.indexOf(el!.name) : null
                    )
                )
                .slice();

            LogicState.current_top_reels_indexes = mSpinResult.top_falled_all;
        }

        this.slot_machine = new SlotMachine(this.app);
        this.container.addChild(this.slot_machine.container);

        this.fg = new Foreground(this.app);
        this.container.addChild(this.fg.container);

        this.mainUI = new MainUI(this.app);
        this.container.addChild(this.mainUI.container);

        this.bigWin = new BigWin(this.app);
        this.container.addChild(this.bigWin.container);

        this.freeSpins = new FreeSpins(this.app);
        this.container.addChild(this.freeSpins.container);

        LogicState.reels_target_symbols = this.slot_machine!.reels;
        LogicState.top_reels_target_symbols = this.slot_machine!.topReel;

        if (LogicState.spin_result?.reels.spins !== null) {
            this.restore_reels();
        }
    };

    play_step = async (step: SpinStepResult) => {
        await this.slot_machine!.place_new_reels(
            step.symbols_placed,
            step.top_symbols_placed
        );

        // Uncomment for debug
        // console.log("curr step", LogicState.currentSpinStage - 1, step);

        await this.slot_machine!.fall_down_symbols(
            step.symbols_placed,
            step.falled_mystery,
            step.top_symbols_placed,
            step.top_falled_mystery
        );

        for (const reel of this.slot_machine!.reels) {
            reel.reset_symbols_to_avalanche_matrix(
                step.falled_all[reel.reel_index]
            );
        }
        this.slot_machine!.topReel!.reset_symbols_to_avalanche_matrix(
            step.top_falled_all[0]
        );

        await this.slot_machine!.replace_mystery_symbols(
            step.symbols_placed,
            step.exchanged_mystery,
            step.top_symbols_placed,
            step.top_exchanged_mystery
        );

        await this.slot_machine!.play_all_animations_after_spin_end(
            step.falled_all,
            step.top_falled_all
        );

        LogicState.win =
            LogicState.game_state === "bonus"
                ? step.prev_bonus_stages_win
                : step.prev_stages_win + step.stage_win;
        document.dispatchEvent(new CustomEvent("win_changed"));

        await this.slot_machine!.destroy_symbols(
            step.falled_all,
            step.top_falled_all
        );
        await this.slot_machine!.fall_down_symbols(
            step.symbols_placed,
            step.reel_final,
            step.top_symbols_placed,
            step.top_reel_final
        );

        for (const reel of this.slot_machine!.reels) {
            reel.reset_symbols_to_avalanche_matrix(
                step.reel_final[reel.reel_index]
            );
        }
        this.slot_machine!.topReel!.reset_symbols_to_avalanche_matrix(
            step.top_reel_final[0]
        );
    };

    on_spin = async () => {
        if (
            LogicState.balance < LogicState.getBet() &&
            !ECL.PFR.is_free_spinning
        ) {
            return ECL.popup.show(
                {
                    title: Localize("error_if"),
                    message: Localize("no_money"),
                },
                {
                    middle: {
                        label: "OK",
                        callback: () => {
                            LogicState.sm_state = "idle";
                            this.stop_autoplay_event();
                            ECL.popup.hide();
                        },
                    },
                }
            );
        }
        LogicState.pressed_button = true;

        if (LogicState.is_bonus_mode) LogicState.first_free_spin = false;
        LogicState.sm_state = "spin_start";
        await this.slot_machine!.drop_reels();
        this.on_spin_start_finish();

        let __currentSpin__: OldFormSpin;

        const startNextSpinStep = () => {
            const step = __currentSpin__.steps[LogicState.currentSpinStage - 1];
            this.play_step(step).then(() => {
                if (
                    this.slot_machine?.free_spin_win &&
                    !LogicState.is_bonus_mode
                ) {
                    AUDIO_MANAGER.bg_music?.stop();
                    AUDIO_MANAGER.playFreeSpinIn();
                    this.switch_to_bonus_mode();
                } else if (
                    LogicState.currentSpinStage !== __currentSpin__.steps.length
                ) {
                    // console.log(`переход на следующий STAGE ${LogicState.currentSpinStage}`,__currentSpin__.steps[LogicState.currentSpinStage]);
                    this.update_reels_state(
                        __currentSpin__.steps[LogicState.currentSpinStage]
                    );
                    startNextSpinStep();
                } else {
                    document.dispatchEvent(EVENTS.spin_animation_end);

                    // Если бонуска закончилась
                    if (
                        LogicState.game_state === "bonus" &&
                        LogicState.free_spins_left === 0
                    ) {
                        this.on_spin_finished();
                    } else {
                        if (LogicState.game_state === "base") {
                            LogicState.currentBonusSpinStep = 0;
                            const big_win_completed_promise =
                                this.bigWin!.show_big_win_container();
                            big_win_completed_promise.then(async () => {
                                await this.on_spin_finished();
                                document.dispatchEvent(
                                    new CustomEvent("big_win_ended")
                                );
                                LogicState.win = LogicState.box.win;
                                LogicState.balance = LogicState.box.balance;
                            });
                        } else {
                            this.on_spin_finished();
                        }
                    }
                }
            });
        };

        if (LogicState.is_bonus_mode) {
            const copy = objectJsonCopy(LogicState.originBonus);
            __currentSpin__ = modify_spin_result(
                copy[LogicState.currentBonusSpinStep]
            );
            LogicState.currentBonusSpinStep++;
            this.update_reels_state(
                __currentSpin__.steps[LogicState.currentSpinStage]
            );
            startNextSpinStep();
        } else {
            make_spin().then(async (spinResult: SpinResult) => {
                console.warn("Spin result that come from server", spinResult);
                if (!spinResult) {
                    if (LogicState.spin_result!.reels.spins !== null) {
                        const res = modify_spin_result(
                            LogicState.spin_result!
                        ).steps;
                        const mSpinResult = res[res.length - 1];

                        LogicState.current_reels_indexes =
                            mSpinResult.symbols_placed
                                .map((reel) =>
                                    reel.map((el) =>
                                        el
                                            ? Config.symbols_to_index.indexOf(
                                                  el!.name
                                              )
                                            : null
                                    )
                                )
                                .slice();

                        LogicState.current_top_reels_indexes =
                            mSpinResult.top_falled_all;
                    } else {
                        LogicState.current_top_reels_indexes = [
                            this.slot_machine!.topReel!.get_current_indexes()!,
                        ];
                        this.slot_machine!.topReel?.place_new_symbols(
                            LogicState.current_reels_symbols
                        );
                    }
                    await this.slot_machine!.place_new_reels(
                        LogicState.current_reels_symbols,
                        LogicState.current_top_reels_indexes
                    );
                    document.dispatchEvent(EVENTS.spin_animation_end);
                    await sleep(100);
                    LogicState.notify_all();
                    LogicState.sm_state = "idle";
                    return;
                }

                LogicState.spin_result = spinResult as ServerState;

                LogicState.box.win = spinResult.total_wins;
                LogicState.box.balance = spinResult.balance;

                __currentSpin__ = modify_spin_result(spinResult);

                this.update_reels_state(
                    __currentSpin__.steps[LogicState.currentSpinStage]
                );
                startNextSpinStep();
            });
        }
        Config.multiplier_count = 0;
    };

    restore_reels = async () => {
        let current_spin = modify_spin_result(LogicState.spin_result!);

        if (current_spin.free_spins_left > 0) {
            console.warn("BONUS GAME RESTORE");

            if (
                LogicState.currentBonusSpinStep > 0 &&
                LogicState.currentBonusSpinStep !==
                    current_spin.total_free_spins
            ) {
                console.log(
                    "------------------------1-14 of 15 FREESPINS------------------------"
                );
                AUDIO_MANAGER.bg_music?.stop();

                this.bg!.switch_to_bonus_mode();
                this.slot_machine!.switch_to_bonus_mode();
                this.fg!.switch_to_bonus_mode();

                LogicState.is_bonus_mode = true;
                LogicState.game_state = "bonus";

                for (const step of current_spin.steps) {
                    if (step.bonus_game !== null) this.update_reels_state(step);
                }

                let total_win = 0;
                LogicState.originBonus.forEach((step, i) => {
                    if (i < LogicState.currentBonusSpinStep) {
                        total_win += step.amount;
                    }
                });
                LogicState.win = total_win;
                LogicState.box.win = LogicState.spin_result!.reels.amount;

                LogicState.balance =
                    LogicState.server_state!.balance -
                    LogicState.server_state!.reels.amount;

                LogicState.box.balance = LogicState.spin_result!.balance;

                LogicState.free_spins_left = current_spin.free_spins_left;
                LogicState.sm_state = "spin_end";

                document.dispatchEvent(new Event("win_changed"));
                document.dispatchEvent(new Event("spin_animation_end"));

                document.dispatchEvent(new Event("restore_game"));
                await new Promise<void>((resolve) => {
                    ECL.popup.show(
                        {
                            title: `You have ${
                                LogicState.free_spins_left === 1
                                    ? 1
                                    : LogicState.free_spins_left
                            } free spins left!`,
                            message: 'Click "OK" button to enter bonus mode!',
                        },
                        {
                            middle: {
                                label: "OK",
                                callback: () => {
                                    ECL.popup.hide();
                                    resolve();
                                },
                            },
                        }
                    );
                });
                AUDIO_MANAGER.playBonusBG();
                this.on_spin_finished();

                return;
            } else if (
                LogicState.currentBonusSpinStep ===
                current_spin.total_free_spins - 1
            ) {
                console.log(
                    "------------------------15 of 15 FREESPINS------------------------"
                );
                LogicState.sm_state = "spin_end";
                LogicState.box.win = LogicState.spin_result!.total_wins;
                LogicState.box.balance = LogicState.spin_result!.balance;
                LogicState.currentSpinStage = 0;
                LogicState.end_fs_after_restore = true;
                return;
            } else {
                console.log(
                    "------------------------0 of 15 FREESPINS------------------------"
                );
                LogicState.sm_state = "spin_end";
                for (const step of current_spin.steps) {
                    if (step.bonus_game !== null) this.update_reels_state(step);
                    // break;
                }
                LogicState.currentSpinStage = 0;
                LogicState.balance =
                    LogicState.server_state!.balance -
                    LogicState.server_state!.reels.amount;

                LogicState.box.balance = LogicState.spin_result!.balance;
                document.dispatchEvent(new Event("restore_game"));
            }
        } else {
            if (LogicState.currentBonusSpinStep !== 0) return;

            await this.slot_machine!.topReel?.place_new_symbols(
                current_spin.steps[LogicState.currentSpinStage].top_reel_final
            );

            if (
                LogicState.currentSpinStage === 0 &&
                current_spin.steps.length === 1
            ) {
                console.log(
                    "------------------------NO WINS------------------------"
                );
            } else if (
                LogicState.currentSpinStage + 1 !==
                current_spin.steps.length
            ) {
                console.log(
                    "------------------------NEED TO DISPLAY WINS------------------------"
                );
            } else {
                console.log(
                    "------------------------WINS ARE ALREADY DISPLAYED------------------------"
                );
                LogicState.currentSpinStage = 0;
                return;
            }
            console.log(LogicState.currentSpinStage, current_spin.steps.length);
        }

        if (LogicState.is_bonus_mode) {
            LogicState.first_free_spin = false;
        }

        LogicState.sm_state = "spinning";

        const startNextSpinStep = () => {
            this.play_step(
                current_spin.steps[LogicState.currentSpinStage - 1]
            ).then(() => {
                if (
                    this.slot_machine?.free_spin_win &&
                    !LogicState.is_bonus_mode
                ) {
                    AUDIO_MANAGER.bg_music?.stop();
                    AUDIO_MANAGER.playFreeSpinIn();
                    this.switch_to_bonus_mode();
                } else if (
                    LogicState.currentSpinStage !== current_spin.steps.length
                ) {
                    this.update_reels_state(
                        current_spin.steps[LogicState.currentSpinStage]
                    );
                    startNextSpinStep();
                } else {
                    document.dispatchEvent(EVENTS.spin_animation_end);

                    // Если бонуска закончилась
                    if (
                        LogicState.game_state === "bonus" &&
                        LogicState.free_spins_left === 0
                    ) {
                        this.on_spin_finished();
                    } else {
                        if (LogicState.game_state === "base") {
                            const big_win_completed_promise =
                                this.bigWin!.show_big_win_container();
                            big_win_completed_promise.then(
                                this.on_spin_finished
                            );
                        } else {
                            this.on_spin_finished();
                        }
                    }
                }
            });
        };

        if (LogicState.is_bonus_mode) {
            const copy = objectJsonCopy(LogicState.originBonus);
            current_spin = modify_spin_result(
                copy[LogicState.currentBonusSpinStep]
            );

            LogicState.currentBonusSpinStep++;
            this.update_reels_state(
                current_spin.steps[LogicState.currentSpinStage]
            );

            startNextSpinStep();
        } else {
            const spinResult = LogicState.spin_result!;
            if ("error" in spinResult) return;

            this.update_reels_state(
                current_spin.steps[LogicState.currentSpinStage]
            );
            startNextSpinStep();
        }
        Config.multiplier_count = 0;
    };

    on_spin_start_finish = () => {
        LogicState.sm_state = "spinning";
    };

    add_event_listeners = () => {
        document.addEventListener("spin_event", this.on_spin);
        document.addEventListener("start_autospin_event", this.start_autospin);
        document.addEventListener("stop_event", this.stop_autoplay_event);

        document.addEventListener("FREESPINS_ACCEPTED_EVENT", () => {
            LogicState.notify_all();
        });
    };

    start_autospin = (e: Event) => {
        console.log("!!!Start autospin!!!");

        document.dispatchEvent(EVENTS.close_autospin_settings);

        const event = e as CustomEvent<number>;

        LogicState.autoplay_spins_remaining = event.detail;

        LogicState.is_autoplay = true;
        LogicState.should_be_autoplay = true;

        LogicState.autoplay_start_balance = LogicState.balance;
        LogicState.notify_all();

        if (LogicState.sm_state === "idle") {
            this.spin_autoplay();
        }
    };

    spin_autoplay = () => {
        console.log("!!!SPIN AUTOPLAY!!!");
        this.slot_machine!.cleanup_after_spin();

        if (!LogicState.is_infinite_autoplay) {
            LogicState.autoplay_spins_remaining--;

            if (LogicState.autoplay_spins_remaining <= 0) {
                LogicState.should_be_autoplay = false;
            }
        }

        document.dispatchEvent(EVENTS.spin_event);
    };

    update_reels_state = (spinStep: SpinStepResult) => {
        console.warn("update_reels_state", spinStep);

        if (spinStep.bonus_game) {
            LogicState.originBonus = spinStep.bonus_game.spins;
        }

        /**
         * Символы установлены перед началом игрового цикла,
         * Хранят айди, имя, координаты
         */
        LogicState.symbols = spinStep.symbols_placed;
        /**
         * То же что и предыдущее но хранит только индексы новых символов
         */
        LogicState.current_reels_indexes = spinStep.symbols_placed
            .map((reel) =>
                reel.map((el) =>
                    el ? Config.symbols_to_index.indexOf(el!.name) : null
                )
            )
            .slice();

        LogicState.current_top_reels_indexes = spinStep.top_falled_all;
        LogicState.current_reels_symbols = spinStep.symbols_placed;
        LogicState.current_falled_symbols = spinStep.falled_all;
        // Индексы измененных символов мистери
        LogicState.current_mystery_changed_indexes = spinStep.exchanged_mystery;

        LogicState.current_mystery_top_changed_indexes =
            spinStep.top_exchanged_mystery;

        LogicState.win_matrix = spinStep.winID;

        LogicState.stage_win = spinStep.stage_win;
        LogicState.payout = spinStep.payout;

        if (ECL.PFR.is_free_spinning) {
            ECL.PFR.update_winnings(LogicState.win);
        }

        if (!LogicState.end_fs_after_restore) {
            LogicState.free_spins_left = spinStep.free_spins_left;
        } else {
            LogicState.end_fs_after_restore = false;
        }
        LogicState.avalancheIndexesTopReels = spinStep.top_reel_final;

        if (LogicState.free_spins_left) {
            this.slot_machine!.free_spin_win = true;
        }

        LogicState.currentSpinStage++; // @TODO make correct place
    };

    on_spin_finished = async () => {
        if (LogicState.currentSpinStage === 0) LogicState.currentSpinStage = 1;
        await update_spins_indexes();
        console.log(
            LogicState.currentSpinStage,
            LogicState.currentBonusSpinStep
        );
        LogicState.currentSpinStage = 0; // @TODO make correct place
        this.slot_machine!.cleanup_after_spin();

        let free_spins_ended_promise = Promise.resolve();

        if (ECL.PFR.is_free_spinning) {
            ECL.PFR.check_free_spins_ended();

            if (!ECL.PFR.is_free_spinning) {
                free_spins_ended_promise = new Promise((resolve) => {
                    document.addEventListener(
                        ECL.events.FREESPINS_COMPLETED_EVENT,
                        () => {
                            console.log("Free spins completed event received!");
                            resolve();
                        },
                        {
                            once: true,
                        }
                    );
                });
            }
        }

        await free_spins_ended_promise;

        console.log(`!!!${LogicState.free_spins_left}!!!`);

        if (LogicState.free_spins_left !== 0) {
            if (LogicState.is_autoplay) {
                if (LogicState.autoplay_stop_on_fs == true) {
                    document.dispatchEvent(EVENTS.stop_event);
                }
            }
            // if (!LogicState.first_free_spin) {
            if (LogicState.free_spins_left === 1) {
                this.freeSpins!.play_last_free_spin_anim().then(() => {
                    document.dispatchEvent(EVENTS.spin_event);
                });
            } else {
                document.dispatchEvent(EVENTS.spin_event);
            }
            // }
        } else if (LogicState.game_state === "bonus") {
            AUDIO_MANAGER.playFreeSpinOut();
            AUDIO_MANAGER.free_spin_in?.stop();
            AUDIO_MANAGER.bg_bonus_music?.stop();

            this.switch_to_base_mode();
        } else {
            LogicState.sm_state = "idle";
            if (LogicState.is_autoplay) {
                this.check_should_stop_autoplay();
            }
            LogicState.notify_all();
        }
    };

    check_should_stop_autoplay = () => {
        let autoplay_must_be_stopped = false;
        let type = "";

        if (LogicState.autospin_any_win_flag && LogicState.win > 0) {
            autoplay_must_be_stopped = true;
            type = "ANY_WIN";
        } else if (
            LogicState.autospin_single_win_exceeds_flag &&
            LogicState.win >
                LogicState.autospin_single_win_exceeds * LogicState.getBet()
        ) {
            autoplay_must_be_stopped = true;
            type = "SINGLE_WIN";
        } else if (
            LogicState.autospin_cash_increases_flag &&
            LogicState.balance - LogicState.autoplay_start_balance >=
                LogicState.autospin_cash_increases * LogicState.getBet()
        ) {
            autoplay_must_be_stopped = true;
            type = "INCREASE";
        } else if (
            LogicState.autospin_cash_decreases_flag &&
            LogicState.autoplay_start_balance -
                LogicState.balance -
                LogicState.win >=
                LogicState.autospin_cash_decreases * LogicState.getBet()
        ) {
            autoplay_must_be_stopped = true;
            type = "DECREASE";
        }
        console.table({
            "Before spin": LogicState.autoplay_start_balance,
            "After spin": LogicState.balance,
            Win: LogicState.win,
            "Decreased to":
                LogicState.autoplay_start_balance - LogicState.balance,
            Порог: LogicState.autospin_cash_decreases * LogicState.getBet(),
            true:
                LogicState.autoplay_start_balance -
                LogicState.balance -
                LogicState.win,
        });
        // debugger;
        if (autoplay_must_be_stopped) {
            document.dispatchEvent(new Event("stop_event"));
            // @ts-ignore
            ECL.popup.autoplay_msg(type);
        }

        if (LogicState.should_be_autoplay) {
            this.spin_autoplay();
        } else {
            LogicState.is_autoplay = false;
        }
    };

    stop_autoplay_event = () => {
        LogicState.is_autoplay = false;
        LogicState.should_be_autoplay = false;

        LogicState.autoplay_spins_remaining = 0;
        LogicState.is_infinite_autoplay = false;
        LogicState.notify_all();
    };

    switch_to_bonus_mode = () => {
        LogicState.is_bonus_mode = true;

        this.bigWin!.bonus_mode_overlay.visible = true;
        this.bigWin!.bonus_mode_overlay.alpha = 0;

        this.freeSpins!.play_free_spin_anim();

        anime({
            duration: 5300,
            complete: () => {
                AUDIO_MANAGER.playBonusBG();

                anime({
                    targets: this.bigWin!.bonus_mode_overlay,
                    alpha: 1,
                    easing: "easeInCubic",
                    duration: Config.bonus_mode_transition_duration,

                    complete: () => {
                        this.bg!.switch_to_bonus_mode();
                        this.slot_machine!.switch_to_bonus_mode();
                        this.fg!.switch_to_bonus_mode();

                        anime({
                            targets: this.bigWin!.bonus_mode_overlay,
                            alpha: 0,
                            duration: Config.bonus_mode_transition_duration,
                            complete: () => {
                                LogicState.game_state = "bonus";
                                this.on_spin_finished();
                            },
                        });
                    },
                });
            },
        });
    };

    switch_to_base_mode = () => {
        console.log("!!!!switcht to base!!!");

        LogicState.is_bonus_mode = false;
        LogicState.first_free_spin = true;
        // LogicState.currentBonusSpinStep = 0;

        this.bigWin!.bonus_mode_overlay.visible = true;
        this.bigWin!.bonus_mode_overlay.alpha = 0;

        const total_win_completed_promise =
            this.bigWin!.show_total_win_container();
        // return;
        total_win_completed_promise.then(() => {
            this.bigWin!.bonus_mode_overlay.alpha = 0.7;
            anime({
                targets: this.bigWin!.bonus_mode_overlay,
                alpha: 1,
                easing: "easeInCubic",
                duration: Config.bonus_mode_transition_duration * 0.3,
                complete: () => {
                    AUDIO_MANAGER.bg_music?.play();

                    this.bg!.switch_to_base_mode();
                    this.slot_machine!.switch_to_base_mode();
                    this.fg!.switch_to_base_mode();

                    anime({
                        targets: this.bigWin!.bonus_mode_overlay,
                        alpha: 0,
                        duration: Config.bonus_mode_transition_duration,
                        complete: () => {
                            LogicState.game_state = "base";
                            LogicState.sm_state = "idle";
                            LogicState.win = LogicState.box.win;
                            LogicState.balance = LogicState.box.balance;

                            document.dispatchEvent(
                                new CustomEvent("update_balance", {
                                    detail: LogicState.balance,
                                })
                            );
                            if (
                                LogicState.is_autoplay &&
                                LogicState.autospin_bonus_win_flag
                            ) {
                                ECL.popup.autoplay_msg("BONUS");
                                document.dispatchEvent(EVENTS.stop_event);
                            }
                            this.on_spin_finished();
                        },
                    });
                },
            });
        });
    };

    on_resize = () => {
        this.mainUI!.on_resize();
        this.bg!.resize();
        this.fg!.resize();
        this.slot_machine!.resize();
        this.bigWin!.resize();
        this.freeSpins!.resize();
    };
}
