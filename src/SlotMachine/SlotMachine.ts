import { Config } from "../Config";
import { Reel } from "./Reel";
import { LogicState } from "../logic_state";
import anime from "animejs";
import { ASSETS } from "../Assets";
import {
    deferrify,
    getEmptyReelsMatrix,
    sleep,
    stop_spine_animation,
} from "../Util";
import { TopReel } from "./TopReel";
import { AUDIO_MANAGER } from "../AudioManager";
import {
    getFormOf,
    SymToIndexMatrix,
    topSymToIndexMatrix,
} from "../MatrixForm";
import { ECL } from "ecl";
import { TextStyles } from "../TextStyles";
import { symbolsMatrix } from "../Models";
import { numberNullRectangularMatrix } from "../types";
interface Win {
    amount?: number;
    payline_index: number;
    streak: number;
}

export class SlotMachine {
    app: PIXI.Application;
    container: PIXI.Container;
    multiplier_panel?: PIXI.Sprite;
    multiplier_text?: PIXI.Sprite;
    reels: Reel[] = [];

    extra_reels: TopReel[] = [];

    reels_bg?: PIXI.Sprite;

    extra_reels_mask?: PIXI.Graphics;

    reels_mask?: PIXI.Graphics;
    animated_extra_reels_mask?: PIXI.Graphics;

    paylines_indexes_container?: PIXI.Container;
    wins: Win[] = [];
    symbols_to_destroy: number[][] = getEmptyReelsMatrix();
    symbols_to_destroy_top: number[] = [0, 0, 0];
    multiplier_indexes_active: PIXI.Container[] = [];
    multiplier_indexes_inactive: PIXI.Container[] = [];
    multiplier_indexes_animation: PIXI.spine.Spine[] = [];
    current_win_animation: null | anime.AnimeInstance = null;

    payline_squares: PIXI.Sprite[][] = [];
    payline_anim_squares: PIXI.spine.Spine[][] = [];
    payline_lines?: PIXI.SimpleRope[];
    total_win_text?: PIXI.Text | PIXI.BitmapText;
    line_win_text?: PIXI.Text | PIXI.BitmapText;

    old_multiplier_index = 0;
    multiplier_index = 0;
    /**
     * current spin has free spins
     */
    free_spin_win = false;
    /**
     * Amount of money won before avalanche.
     */
    avalanche_win = 0;
    topReel?: TopReel;

    win_box?: PIXI.Container;
    top_win_box?: PIXI.Container;
    highlights?: PIXI.spine.Spine[];
    top_highlights?: PIXI.spine.Spine[];

    multiplier?: PIXI.Container;
    multiplier_num?: PIXI.Text;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.scale.set(0.95);

        this.build_reels();
        this.build_multiplier();
        this.build_win_text();

        this.container.position.set(720 - this.container.width / 2, 120);
        document.addEventListener(
            "skip_button_pressed",
            this.skip_win_animations
        );
    }

    build_reels = () => {
        this.reels_bg = new PIXI.Sprite(ASSETS["ReelFrame"]);
        this.reels_bg.position.y = -103;
        this.container.addChild(this.reels_bg!);

        this.build_masks();

        const bottomExtraSymbolsContainer = new PIXI.Container();
        this.container.addChild(bottomExtraSymbolsContainer);

        this.buid_top_highlights();

        const topExtraSymbolsContainer = new PIXI.Container();
        this.container.addChild(topExtraSymbolsContainer);

        topExtraSymbolsContainer.mask = bottomExtraSymbolsContainer.mask = this
            .extra_reels_mask as PIXI.Graphics;

        topExtraSymbolsContainer.y = bottomExtraSymbolsContainer.y =
            -Config.out_of_top_symbols_count * Config.symbol_height + 140;

        const extraReelsPosition = new PIXI.Point(
            Config.symbol_width * 0 + Config.symbol_width / 2 + 318,
            Config.symbol_height / 2 - 57
        );

        topExtraSymbolsContainer.position.copyFrom(extraReelsPosition);
        bottomExtraSymbolsContainer.position.copyFrom(extraReelsPosition);

        // add top reels
        this.topReel = new TopReel(
            this.app,
            topExtraSymbolsContainer,
            bottomExtraSymbolsContainer
        );

        const bottomSymbolsContainer = new PIXI.Container();
        this.container.addChild(bottomSymbolsContainer);

        this.build_highlights();

        const topSymbolsContainer = new PIXI.Container();
        this.container.addChild(topSymbolsContainer);

        topSymbolsContainer.mask = bottomSymbolsContainer.mask = this
            .reels_mask as PIXI.Graphics;

        topSymbolsContainer.y = bottomSymbolsContainer.y =
            -Config.out_of_top_symbols_count * Config.symbol_height + 140;

        //add main containers
        for (let i = 0; i < Config.reels_count; i++) {
            const reel = new Reel(
                this.app,
                i,
                undefined,
                topSymbolsContainer,
                bottomSymbolsContainer
            );
            this.reels[i] = reel;
        }
    };

    build_masks = () => {
        this.extra_reels_mask = new PIXI.Graphics();
        this.extra_reels_mask.beginFill();
        this.extra_reels_mask.drawRect(
            318,
            -55,
            Config.symbol_width * 3,
            Config.symbol_height
        );
        this.container.addChild(this.extra_reels_mask);

        this.animated_extra_reels_mask = new PIXI.Graphics();
        this.animated_extra_reels_mask.beginFill();
        this.animated_extra_reels_mask.drawRect(
            303,
            -70,
            Config.symbol_width * 3 + 30,
            Config.symbol_height + 30
        );
        this.animated_extra_reels_mask.visible = false;
        this.container.addChild(this.animated_extra_reels_mask);

        this.reels_mask = new PIXI.Graphics();
        this.reels_mask.beginFill();
        this.reels_mask.drawRect(
            -15,
            55,
            Config.symbol_width * 5 + 350,
            Config.symbol_height * 3 + 240
        );
        this.container.addChild(this.reels_mask);
    };

    buid_top_highlights = () => {
        this.top_win_box = new PIXI.Container();
        for (let i = 0; i < 3; i++) {
            const win_box_anim = new PIXI.spine.Spine(
                PIXI.Loader.shared.resources["win_highlight_anim"].spineData
            );
            win_box_anim.scale.set(1.2);
            win_box_anim.visible = false;
            win_box_anim.position.set(i * 104, 0);
            this.top_win_box.addChild(win_box_anim);
        }
        this.top_win_box.position.set(370, -10);
        this.container.addChild(this.top_win_box);

        this.top_highlights = this.top_win_box.children as PIXI.spine.Spine[];
    };

    build_highlights = () => {
        this.win_box = new PIXI.Container();
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 7; j++) {
                const win_box_anim = new PIXI.spine.Spine(
                    PIXI.Loader.shared.resources["win_highlight_anim"].spineData
                );
                win_box_anim.scale.set(1.2);
                win_box_anim.visible = false;
                win_box_anim.position.set(j * 104, i * 103);
                this.win_box.addChild(win_box_anim);
            }
        }
        this.win_box.position.set(160, 135);
        this.container.addChild(this.win_box);

        this.highlights = this.win_box.children as PIXI.spine.Spine[];
    };

    build_multiplier = () => {
        this.multiplier = new PIXI.Container();

        const shining = new PIXI.Sprite(
            PIXI.Loader.shared.resources["number_shining"].texture
        );
        this.multiplier.addChild(shining);

        this.multiplier_num = new PIXI.Text("0", {
            ...TextStyles.bigWinTextValue,
            fontSize: 70,
        });
        this.multiplier_num!.anchor = new PIXI.Point(0.5, 0.5);
        this.multiplier_num!.position.set(
            this.multiplier.width / 2,
            this.multiplier.height / 2
        );
        this.multiplier.addChild(this.multiplier_num!);
        this.container.addChild(this.multiplier);

        this.multiplier.position.set(this.container.width / 2, 250);
        this.multiplier.pivot.x = this.multiplier.width / 2;
        this.multiplier.pivot.y = this.multiplier.height / 2;
        this.multiplier!.visible = false;
        this.multiplier!.scale.set(0);
    };

    show_multiplier = (amount = LogicState.stage_win, symbol = "") => {
        if (LogicState.are_sound_fx_on) {
            switch (symbol) {
                case "X":
                    AUDIO_MANAGER.symbol_thor?.play();
                    break;
                case "P":
                    AUDIO_MANAGER.symbol_lady?.play();
                    break;
                case "O":
                    AUDIO_MANAGER.symbol_viking?.play();
                    break;
                default:
                    AUDIO_MANAGER.symbol_rest?.play();
            }
        }

        Config.multiplier_count++;
        if (amount === 0) {
        } else {
            this.multiplier!.visible = true;
            this.multiplier_num!.text = `${ECL.fmt.money(amount)}`;
        }

        anime.remove([this.multiplier!.scale, this.multiplier!]);
        this.multiplier!.alpha = 1;
        this.multiplier!.scale.set(0);
        anime({
            targets: this.multiplier!.scale,
            keyframes: [
                {
                    x: 1,
                    y: 1,
                },
                {
                    x: 1.25,
                    y: 1.25,
                    delay: 500,
                },
                {
                    x: 1,
                    y: 1,
                },
            ],
            duration: 1500,
            easing: "linear",
            complete: () => {
                anime({
                    targets: this.multiplier!,
                    duration: 500,
                    alpha: 0,
                    easing: "linear",
                    complete: () => {
                        this.multiplier!.visible = false;
                        this.multiplier!.alpha = 1;
                        this.multiplier!.scale.set(0);
                    },
                });
            },
        });
    };

    build_win_text = () => {
        this.total_win_text = new PIXI.BitmapText("200", {
            fontName: "big_win",
            fontSize: 50,
        });
        this.total_win_text.visible = false;
        this.total_win_text.x = Config.symbol_width * 2.5;
        this.total_win_text.y = Config.symbol_height * 1.5 + 40;
        this.total_win_text.anchor = 0.5;
        this.container.addChild(this.total_win_text);

        this.line_win_text = new PIXI.BitmapText("", {
            fontName: "big_win",
            fontSize: 50,
        });
        this.line_win_text.x = Config.symbol_width * 2.5;
        this.line_win_text.anchor = 0.5;
        this.line_win_text.visible = false;
        this.container.addChild(this.line_win_text);
    };

    drop_reels = (): Promise<void[][]> => {
        const promises = [];

        promises.push(this.topReel!.drop_symbols());

        for (let i = 0; i < Config.reels_count; i++) {
            promises.push(this.reels[i].drop_symbols());
        }

        return Promise.all(promises);
    };

    place_new_reels = (
        symbols: symbolsMatrix,
        top_symbols: symbolsMatrix,
        restore = false
    ): Promise<void[][]> => {
        if (!restore) LogicState.sm_state = "spin_end";

        const promises = [];

        promises.push(this.topReel!.place_new_symbols(top_symbols));

        for (let i = 0; i < Config.reels_count; i++) {
            promises.push(this.reels[i].place_new_symbols(symbols));
        }

        return Promise.all(promises);
    };

    play_all_animations_after_spin_end = (
        curr_symbols: symbolsMatrix,
        curr_top_symbols: symbolsMatrix
    ): Promise<void> => {
        this.cleanup();

        const curr_symbols_indexes = SymToIndexMatrix(curr_symbols);

        const win_matrix = LogicState.win_matrix;
        if (!win_matrix || win_matrix.length === 0) return Promise.resolve();

        curr_symbols.forEach((reel, x) => {
            reel.forEach((line, y) => {
                if (!line || !win_matrix.includes(line.id)) return;

                const index = curr_symbols_indexes[x][y];
                if (index == null) {
                    return console.error(`symbol_index is null at ${x} ${y}`);
                }

                const form = getFormOf(index, new PIXI.Point(x, y));

                for (const point of form) {
                    this.symbols_to_destroy[point.x][point.y] = 1;
                }
            });
        });

        curr_top_symbols[0].forEach((symbol, n) => {
            if (symbol && win_matrix!.includes(symbol.id)) {
                this.symbols_to_destroy_top[n] = 1;
            }
        });

        return this.show_win_by_win(curr_symbols, curr_top_symbols);
    };

    play_bonus_symbol_animation = () => {
        const promises: Array<Promise<void[]>> = [];
        console.log("!!!BONUS SYMBOL!!!");

        const reelIndexes = LogicState.current_reels_indexes;

        let is_bonus = false;

        for (let i = 0; i < 7; i++) {
            for (let j = 4; j < 9; j++) {
                const index = 7 * (j - 4) + i;

                if (reelIndexes[i][j] === Config.scatter_index) {
                    if (!is_bonus) {
                        AUDIO_MANAGER.skatter!.play();
                    }
                    is_bonus = true;
                    this.highlights![index].alpha = 0;
                    this.highlights![index].visible = true;
                    this.highlight_specified(this.highlights![index]);
                }
            }
        }

        for (let i = 0; i < Config.reels_count; i++) {
            const reel = this.reels[i];

            promises[i] = reel.play_bonus_symbol_animtion();
        }

        return Promise.all(promises);
    };

    replace_mystery_symbols = (
        curr_symbols: symbolsMatrix,
        mysteryMatrix: numberNullRectangularMatrix,
        top_curr_symbols: symbolsMatrix,
        mysteryTopMatrix: numberNullRectangularMatrix
    ): Promise<void[][]> => {
        const promises = [];
        let is_mystery = false;

        mysteryTopMatrix[0].forEach((el, index) => {
            if (el !== null) {
                if (!is_mystery) {
                    AUDIO_MANAGER.mystery?.play();
                }
                is_mystery = true;

                this.top_highlights![index].alpha = 0;
                this.top_highlights![index].visible = true;
                this.highlight_specified(this.top_highlights![index]);
            }
        });

        // Show highlight before animation
        for (let i = 0; i < 7; i++) {
            for (let j = 4; j < 9; j++) {
                const index = 7 * (j - 4) + i;

                if (mysteryMatrix[i][j] !== null) {
                    if (!is_mystery) {
                        AUDIO_MANAGER.mystery?.play();
                    }
                    is_mystery = true;

                    this.highlights![index].alpha = 0;
                    this.highlights![index].visible = true;
                    this.highlight_specified(this.highlights![index]);
                }
            }
        }

        for (let i = 0; i < Config.reels_count; i++) {
            const reel = this.reels[i];
            promises[i] = reel.exchange_mystery_symbols(
                curr_symbols,
                mysteryMatrix
            );
        }
        promises.push(
            this.topReel!.exchange_top_mystery_symbols(
                mysteryTopMatrix,
                top_curr_symbols
            )
        );

        return Promise.all(promises);
    };

    play_win_animations = () => {
        return this.show_all_wins();
        // @TODO integrate correct win animations
    };

    show_big_win = (): Promise<void> => {
        return Promise.resolve();
    };

    skip_win_animations = () => {
        console.error("skip");

        LogicState.skip_button_pressed = true;
        LogicState.notify_all();

        if (this.current_win_animation && this.current_win_animation.complete) {
            this.current_win_animation.pause();
            this.current_win_animation.complete(this.current_win_animation);
        }

        this.top_highlights!.forEach((animation) => {
            stop_spine_animation(animation, 0, false);
        });
        this.highlights!.forEach((animation) => {
            stop_spine_animation(animation, 0, false);
        });
    };

    // prettier-ignore
    show_win_by_win = (
        curr_symbols: symbolsMatrix,
        curr_top_symbols: symbolsMatrix,
    ): Promise<void> => {
        if (!LogicState.skip_button_pressed) {
            const payouts = LogicState.payout.values || [];
            let chain = deferrify<void>()
            chain.promise.catch(() => { })

            // eslint-disable-next-line no-async-promise-executor
            return new Promise<void>(async (resolve) => {
                this.current_win_animation = anime({
                    duration: 0,
                    complete: () => {
                        resolve()
                        chain.resolve()
                    },
                });
                this.current_win_animation.pause();

                for (const { amount, figures, symbol } of payouts) {
                    this.show_multiplier(amount, symbol);

                    // create empty matrix
                    const symbols_to_destroy: number[][] = getEmptyReelsMatrix()
                    symbols_to_destroy.forEach(r => r.fill(0));

                    // processing symbols_to_destroy
                    for (const destroyID of figures) {
                        const current_symbols = curr_symbols
                        for (let si = 0; si < current_symbols!.length; si++) {
                            const reel = current_symbols![si];
                            for (let ri = 0; ri < reel.length; ri++) {
                                const symbol = reel[ri];
                                if (symbol?.id !== destroyID) continue;

                                const index = Config.symbols_to_index.indexOf(symbol.name);
                                const formPoints = getFormOf(index, new PIXI.Point(si, ri));

                                for (const point of formPoints) {
                                    symbols_to_destroy[point.x][point.y] = 1;
                                }
                            }
                        }
                    }

                    // processing symbols_to_destroy_top
                    const current_top_reels_indexes = curr_top_symbols[0].slice()
                    const symbols_to_destroy_top = [0, 0, 0]
                    for (const destroyID of figures) {
                        current_top_reels_indexes.forEach((symbol, n) => {
                            if (symbol && symbol.id === destroyID) {
                                symbols_to_destroy_top[n] = 1;
                            }
                        });
                    }

                    // stop all symbols anim an brighten
                    for (const reel of this.reels) {
                        for (const target_symbol of reel.target_symbols) {
                            target_symbol.stop_anim();
                            target_symbol.brighten();
                        }
                    }
                    // play win symbols anim
                    for (let i = 0; i < this.reels.length; i++) {
                        this.reels[i].play_symbols_anim(symbols_to_destroy[i]);
                    }

                    // highlight win symbols
                    for (let x = 0; x < 7; x++) {
                        for (let y = 4; y < 9; y++) {
                            const index = 7 * (y - 4) + x;
                            if (symbols_to_destroy[x][y] === 1) {
                                this.highlights![index].alpha = 0;
                                this.highlights![index].visible = true;
                                this.highlight_specified(this.highlights![index]);
                            }
                        }
                    }

                    // highlight top win symbols
                    for (let i = 0; i < 3; i++) {
                        if (symbols_to_destroy_top[i] === 1) {
                            this.top_highlights![i].alpha = 0;
                            this.top_highlights![i].visible = true;
                            this.highlight_specified(this.top_highlights![i]);
                        }
                    }

                    // play top win symbols anim
                    this.topReel!.play_symbols_anim(symbols_to_destroy_top);

                    chain.resolve()
                    await chain.promise;
                    await sleep(
                        payouts.length > 1
                            ? Config.show_win_by_win_animations_duration
                            : Config.show_win_animations_duration
                    );
                    if (LogicState.skip_button_pressed) break;
                    chain = deferrify()
                }


                for (const reel of this.reels) {
                    for (const target_symbol of reel.target_symbols) {
                        target_symbol.brighten();
                    }
                }

                for (const sym of this.topReel?.target_symbols || []) {
                    sym.brighten();
                }

                this.current_win_animation.play();

                resolve()

            });
        } else {
            this.show_multiplier();
            return Promise.resolve();
        }
    };

    show_all_wins = (): Promise<void> => {
        if (!LogicState.skip_button_pressed) {
            const result = new Promise<void>((resolve) => {
                // console.error("Wins");

                if (LogicState.win_matrix!.length) {
                    // console.log("!!!WIN!!!");

                    this.show_multiplier();

                    this.switch_top_reels_mask(true);

                    //darken all inactive symbols and play animation on active
                    for (let i = 0; i < Config.reels_count; i++) {
                        this.reels[i].play_symbols_anim(
                            this.symbols_to_destroy[i]
                        );
                    }

                    for (let i = 0; i < 7; i++) {
                        for (let j = 4; j < 9; j++) {
                            const index = 7 * (j - 4) + i;

                            if (this.symbols_to_destroy[i][j] === 1) {
                                this.highlights![index].alpha = 0;
                                this.highlights![index].visible = true;
                                this.highlight_specified(
                                    this.highlights![index]
                                );
                            }
                        }
                    }

                    this.topReel!.play_symbols_anim(
                        this.symbols_to_destroy_top
                    );

                    for (let i = 0; i < 3; i++) {
                        if (this.symbols_to_destroy_top[i] === 1) {
                            this.top_highlights![i].alpha = 0;
                            this.top_highlights![i].visible = true;
                            this.highlight_specified(this.top_highlights![i]);
                        }
                    }

                    // AUDIO_MANAGER.win?.play();

                    // if (this.avalanche_win > 0) {
                    //     this.total_win_text!.visible = true;
                    //     this.total_win_text!.text = ECL.fmt.money(
                    //         this.avalanche_win
                    //     );
                    // }

                    this.current_win_animation = anime({
                        duration:
                            Config.show_win_by_win_animations_duration + 1500,
                        complete: () => {
                            for (const reel of this.reels) {
                                reel.topSymbolsContainer.mask = this
                                    .reels_mask as PIXI.Graphics;
                            }

                            this.switch_top_reels_mask(false);

                            //brighten all inactive symbols
                            // this.current_win_animation = null;
                            // for (let i = 0; i < Config.reels_count; i++) {
                            //     this.reels[i].brighten_symbols();
                            // }
                            // this.hide_paylines();
                            // this.total_win_text!.visible = false;
                            resolve();
                        },
                    });
                } else {
                    resolve();
                }
            });

            return result;
        } else {
            if (LogicState.win_matrix!.length) {
                this.show_multiplier();
            }

            return Promise.resolve();
        }
    };

    destroy_symbols = (
        curr_symbols: symbolsMatrix,
        curr_top_symbols: symbolsMatrix
    ): Promise<void> => {
        //Setting up destory symbols matrix
        if (LogicState.win_matrix!.length) {
            const destoryPromises: Array<Promise<void>> = [];

            for (let i = 0; i < LogicState.win_matrix!.length; i++) {
                const destroyID = LogicState.win_matrix![i];
                for (let f = 0; f < curr_symbols!.length; f++) {
                    const reel = curr_symbols![f];

                    for (let g = 0; g < reel.length; g++) {
                        const symbol = reel[g];
                        if (symbol && symbol.id === destroyID) {
                            const index = Config.symbols_to_index.indexOf(
                                symbol.name
                            );

                            /**
                             * Это вызывает баг с падением символов
                             * Поэтому отключаем
                             */
                            // LogicState.avalancheIndexes![f][g] = null;

                            const formPoints = getFormOf(
                                index,
                                new PIXI.Point(f, g)
                            );

                            formPoints.forEach((point) => {
                                if (point.y > 3) {
                                    this.reels[point.x].play_destroy_animation(
                                        point.y
                                    );
                                }
                            });
                        }
                    }
                }

                // Ничего не изменилось когда закомментировал ...
                for (let k = 0; k < curr_top_symbols[0]!.length; k++) {
                    const symbol = curr_top_symbols[0][k];
                    if (symbol) {
                        if (symbol.id === destroyID) {
                            this.topReel!.play_destroy_animation(k);
                        }
                    }
                }
            }

            for (let i = 0; i < Config.reels_count; i++) {
                for (let j = 0; j < Config.symbols_count; j++) {
                    if (this.symbols_to_destroy[i][j] === 1) {
                        destoryPromises.push(this.reels[i].destroy_symbol(j));
                    }
                }
            }

            for (let i = 0; i < this.symbols_to_destroy_top.length; i++) {
                if (this.symbols_to_destroy_top[i] === 1) {
                    destoryPromises.push(this.topReel!.destroy_symbol(i));
                }
            }
            AUDIO_MANAGER.crash_stones?.play();
            destoryPromises.push(sleep(1000));
            // Промисы падений символов
            // Падают все сначала даже если какой то из них находился на позиции
            // Нужно анимировать падение неких символов с некой позиции
            // Если закоментровать - символы падают сверху

            return Promise.all(destoryPromises).then(() => {});
        } else {
            return Promise.resolve();
        }
    };
    fall_down_symbols = (
        fromPositions: symbolsMatrix,
        toPositions: symbolsMatrix,
        topFromPositions: symbolsMatrix,
        topToPositions: symbolsMatrix
    ): Promise<void> => {
        if (!toPositions) return Promise.resolve();

        const playFallDownPromises: Array<Promise<unknown>> = [];

        for (let i = 0; i < Config.reels_count; i++) {
            playFallDownPromises.push(
                this.reels[i].fall_down_top_symbols(
                    fromPositions,
                    toPositions,
                    false
                )
            );
        }
        playFallDownPromises.push(
            this.topReel!.fall_down_top_symbols(
                topFromPositions,
                topToPositions
            )
        ); // TODO
        return Promise.all(playFallDownPromises).then(() => {
            let isChangePosition = 0;
            fromPositions.forEach((arr, i) => {
                arr.forEach((arr2, j) => {
                    if (
                        JSON.stringify(arr2) !=
                            JSON.stringify(toPositions[i][j]) &&
                        toPositions[i][j] != null &&
                        arr2 != null
                    ) {
                        if (arr2.y != toPositions[i][j]?.y) isChangePosition++;
                    }
                });
            });

            if (isChangePosition > 0) {
                AUDIO_MANAGER.stopSpin?.play();
            }
        });
    };
    cleanup = () => {
        this.avalanche_win = 0;
        this.wins = [];
        this.symbols_to_destroy.forEach((reel) => {
            reel.fill(0);
        });

        this.symbols_to_destroy_top.fill(0);
    };

    cleanup_after_spin = () => {
        this.free_spin_win = false;
        this.old_multiplier_index = this.multiplier_index;
        this.multiplier_index = 0;

        LogicState.slam_stop = false;
        LogicState.skip_button_pressed = false;

        this.switch_multiplier_index();
    };

    switch_multiplier_index = () => {
        anime({
            targets: this.multiplier_indexes_active[this.old_multiplier_index],
            y: -72,
            easing: "easeInQuad",
            duration: Config.multiplier_switch_duration,
        });
        anime({
            targets:
                this.multiplier_indexes_inactive[this.old_multiplier_index],
            y: -11,
            easing: "easeInQuad",
            duration: Config.multiplier_switch_duration,
        });

        anime({
            targets: this.multiplier_indexes_active[this.multiplier_index],
            y: -11,
            easing: "easeInQuad",
            duration: Config.multiplier_switch_duration,
        });
        anime({
            targets: this.multiplier_indexes_inactive[this.multiplier_index],
            y: 50,
            easing: "easeInQuad",
            duration: Config.multiplier_switch_duration,
        });
    };

    switch_to_bonus_mode = () => {
        this.reels_bg!.texture = ASSETS["ReelFrameGold"];
    };

    switch_to_base_mode = () => {
        this.reels_bg!.texture = ASSETS["ReelFrame"];
    };

    add_multiplier_animation = () => {
        const anim = new PIXI.spine.Spine(
            PIXI.Loader.shared.resources["multiplier"].spineData
        );
        anim.position.set(50, 80);
        return anim;
    };

    switch_top_reels_mask = (is_animated: boolean) => {
        this.extra_reels_mask!.visible = !is_animated;
        this.animated_extra_reels_mask!.visible = is_animated;

        if (is_animated) {
            this.topReel!.topSymbolsContainer.mask =
                this.topReel!.bottomSymbolsContainer.mask = this
                    .animated_extra_reels_mask as PIXI.Graphics;
        } else {
            this.topReel!.topSymbolsContainer.mask =
                this.topReel!.bottomSymbolsContainer.mask = this
                    .extra_reels_mask as PIXI.Graphics;
        }
    };

    highlight_specified = (highLight: PIXI.spine.Spine) => {
        const total_delay =
            LogicState.payout.values && LogicState.payout.values.length > 1
                ? Config.show_win_by_win_animations_duration
                : Config.show_win_animations_duration;
        const ms_fadein = total_delay * 0.2;
        const ms_fadeout = total_delay * 0.13;
        const ms_delay = total_delay - ms_fadein - ms_fadeout;

        anime
            .timeline({})
            .add({
                targets: highLight,
                duration: ms_fadein,
                alpha: 1,
                easing: "easeInCubic",
            })
            .add({
                targets: highLight,
                delay: ms_delay,
                duration: ms_fadeout,
                alpha: 0,
                easing: "easeInCubic",
                complete: () => stop_spine_animation(highLight),
            });
        highLight.state.setAnimation(0, "animation", true);
    };

    resize = () => {
        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                Config.reels_x = (1440 - 191 * 5) / 2;
                Config.reels_y = 124;

                this.container.scale.set(0.95);
                this.container.position.set(
                    720 - this.container.width / 2,
                    120
                );
            } else {
                Config.reels_x = 0;
                Config.reels_y = this.app.screen.height / 2 - 300;

                const scale = 0.85;

                this.container.scale.set(scale);
                this.container.position.set(Config.reels_x, Config.reels_y);
            }
        }
    };
}
