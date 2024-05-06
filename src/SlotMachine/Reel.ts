import { rSymbol } from "./Symbol";
import { LogicState } from "../logic_state";
import { Config } from "../Config";
import anime from "animejs";
import { AUDIO_MANAGER } from "../AudioManager";
import { deferrify, sleep, stop_spine_animation } from "../Util";
import { symbolsMatrix } from "../Models";
import { numberNullRectangularMatrix } from "../types";
export class Reel {
    app: PIXI.Application;
    reel_index: number;
    pool_of_symbols: rSymbol[][] = [];
    target_symbols: rSymbol[] = [];
    destroy_anims: PIXI.spine.Spine[] = [];
    symbol_anim_delay?: number;
    /** Высота рила равна 9 */
    symbolsCount: number;

    topSymbolsContainer: PIXI.Container;
    bottomSymbolsContainer: PIXI.Container;

    constructor(
        app: PIXI.Application,
        reel_index: number,
        symbolsCount = Config.symbols_count,
        topSymbolsContainer = new PIXI.Container(),
        bottomSymbolsContainer = new PIXI.Container(),
        top_reel = false
    ) {
        this.app = app;
        this.reel_index = reel_index;

        this.topSymbolsContainer = topSymbolsContainer;
        this.bottomSymbolsContainer = bottomSymbolsContainer;

        this.symbolsCount = symbolsCount;

        this.build_reel();
        if (!top_reel) {
            this.place_new_symbols(LogicState.current_reels_symbols);
        }
        this.build_destroy_anims();
    }

    build_reel() {
        for (let i = 0; i < Config.main_textures_keys.length; i++) {
            this.pool_of_symbols[i] = [];
            for (let j = 0; j < this.symbolsCount; j++) {
                const symbol = new rSymbol(this.app, i);
                if (j == 0) this.target_symbols[i] = symbol;
                symbol.container.x =
                    this.reel_index * Config.symbol_width +
                    Config.symbol_width / 2 +
                    110;
                this.pool_of_symbols[i].push(symbol);
                this.topSymbolsContainer.addChild(symbol.container);
            }
        }
    }

    build_destroy_anims() {
        for (
            let i = Config.out_of_top_symbols_count;
            i < this.symbolsCount;
            i++
        ) {
            const anim = new PIXI.spine.Spine(
                PIXI.Loader.shared.resources["destroy"].spineData
            );
            anim.x = this.reel_index * Config.symbol_width + 162;
            anim.y = i * Config.symbol_height;
            anim.visible = false;
            this.topSymbolsContainer.addChild(anim);
            this.destroy_anims[i] = anim;

            anim.state.onComplete = () => {
                stop_spine_animation(anim);
                anim.visible = false;
            };
        }
    }

    play_destroy_animation(row: number) {
        const anim = this.destroy_anims[row];
        anim.visible = true;
        anim.state.setAnimation(0, "animation_org", false);
    }

    drop_symbols = (): Promise<void[]> => {
        const Promises = [];

        for (let i = 0; i < this.symbolsCount; i++) {
            const symbol = this.target_symbols[i];
            this.app.stage.removeChild(symbol.info_container!);

            let symbol_anim_delay;
            if (LogicState.spin_mode === "base") {
                symbol_anim_delay =
                    this.reel_index * Config.reels_drop_delay +
                    Config.symbols_drop_delay * (2 - i);
            } else {
                symbol_anim_delay = 0;
            }

            if (i < Config.out_of_top_symbols_count) {
                symbol.cleanup();
                continue;
            }

            const animation = anime({
                targets: symbol.container,
                y: Config.symbol_height * (i + 4),
                easing: "easeInQuad",
                delay: symbol_anim_delay,
                duration: Config.symbols_drop_duration,
                complete: () => {
                    symbol.cleanup();
                },
            });

            Promises.push(animation.finished);
        }
        return Promise.all(Promises);
    };

    place_new_symbols = (
        current_reels_symbols: symbolsMatrix
    ): Promise<void[]> => {
        const Promises = [];

        const current_reel_symbols =
            LogicState.current_reels_indexes[this.reel_index];
        // console.log('placing '+this.reel_index, current_reel_symbols, LogicState.current_reels_symbols[this.reel_index]);

        for (let i = 0; i < this.symbolsCount; i++) {
            const current_symbol = current_reel_symbols[i];
            const _current_symbol_info =
                current_reels_symbols[this.reel_index][i];
            let symbol_anim_delay;
            if (LogicState.spin_mode === "base" && !LogicState.slam_stop) {
                symbol_anim_delay =
                    this.reel_index * Config.reels_drop_delay +
                    Config.symbols_drop_delay * (2 - i);
            } else {
                symbol_anim_delay = 0;
            }

            if (current_symbol === null) {
                // Empty Symbol
                continue;
            }

            // this.pool_of_symbols[current_symbol][
            //     i
            // ].debug_text.text = `${_current_symbol_info?.id}-P`;
            // If current symbol already plced, just skip
            if (this.target_symbols[i] && this.target_symbols[i].in_use) {
                continue;
            }

            let correctIndex: number;
            if (current_symbol === 7) correctIndex = i - 3;
            else if (current_symbol === 6) correctIndex = i - 1;
            else correctIndex = i;

            const symbol = this.pool_of_symbols[current_symbol][i];

            symbol!.use();
            symbol!.container.y =
                (correctIndex -
                    (Config.symbols_count + Config.out_of_top_symbols_count)) *
                Config.symbol_height;

            this.target_symbols[i] = symbol;

            this.topSymbolsContainer.addChild(symbol.container);

            const animation = anime({
                targets: symbol.container,
                y: Config.symbol_height * correctIndex,
                easing: "easeInQuad",
                delay: symbol_anim_delay,
                duration: Config.symbols_drop_duration * 2.5,

                complete: () => {
                    this.play_failling_symbols_anim(symbol);
                },
            });

            if (Promises.length == 0 && LogicState.sm_state !== "idle")
                animation.finished.then(() => AUDIO_MANAGER.stopSpin?.play());

            Promises.push(animation.finished);
        }

        return Promise.all(Promises);
    };

    play_bonus_symbol_animtion = (): Promise<void[]> => {
        const Promises = [];

        const current_reel_symbols =
            LogicState.current_mystery_changed_indexes[this.reel_index];

        for (let i = 0; i < this.symbolsCount; i++) {
            const current_symbol = current_reel_symbols[i];

            // Empty symbol or the same
            if (current_symbol === null) {
                continue;
            }

            this.topSymbolsContainer.addChild(this.target_symbols[i].container);

            const animation = anime({
                duration: 1500,
                autoplay: false,
            });

            // Delay for hightligh animation
            anime({
                duration: 1000,

                complete: () => {
                    if (current_symbol === Config.scatter_index) {
                        this.target_symbols[i].play_anim();
                    }

                    animation.play();
                },
            });

            Promises.push(animation.finished);
        }

        return Promise.all(Promises);
    };
    exchange_mystery_symbols = (
        curr_symbols: symbolsMatrix,
        exchanged_mystery: numberNullRectangularMatrix
    ): Promise<void[]> => {
        const Promises = [];
        /** Массив длиной 9, заполнен null, в меремешку с новыми символами  */
        const newSymbols = exchanged_mystery[this.reel_index];
        // console.log("newSymbols", newSymbols, LogicState.symbols![this.reel_index], this.pool_of_symbols);
        const oldSymbols = curr_symbols[this.reel_index];
        // console.log('exchange_mystery_symbols', this.reel_index, newSymbols, oldSymbols, LogicState.current_new_reel_figures);

        // symbol = newSymbols.new_reel_figures?.filter((el) => el.x === point.x && el.y === point.y)[0];
        /**
         * Перебираются 9 ячеек
         */
        for (let i = 0; i < this.symbolsCount; i++) {
            const new_symbol = newSymbols[i]; // Новый символ, подлежащий установке на ячеку
            const old_symbol = oldSymbols[i]; // Старый символ, подлежащий уделинию с ячейки

            const index_old =
                old_symbol === null
                    ? null
                    : Config.symbols_to_index.indexOf(old_symbol.name);

            // Empty symbol or the same
            if (
                new_symbol === null ||
                (this.target_symbols[i].in_use &&
                    new_symbol === this.target_symbols[i].symbol_type)
            ) {
                continue;
            }
            const symbol = this.pool_of_symbols[new_symbol][i];

            const deffered = deferrify();
            // Delay for hightligh animation
            anime({
                duration: 1000,
                complete: async () => {
                    if (
                        Config.mystery_indexes.indexOf(index_old as number) !==
                        -1
                    ) {
                        const prev = this.target_symbols[i];
                        prev.play_anim(prev.fadeout);
                    }

                    await sleep(1500);
                    symbol.container.y = Config.symbol_height * i;
                    symbol.use();
                    this.target_symbols[i] = symbol;
                    symbol.fadein(deffered.resolve);
                },
            });

            Promises.push(deffered.promise);
        }

        return Promise.all(Promises);
    };

    fall_down_top_symbols(
        fromPositions: symbolsMatrix,
        toPositions: symbolsMatrix,
        reset_enabled = true
    ): Promise<void[]> {
        const Promises: Array<Promise<void>> = [];

        for (let i = 0; i < this.symbolsCount; i++) {
            const targetSymbol = toPositions[this.reel_index][i];
            if (!targetSymbol) continue;

            const index = Config.symbols_to_index.indexOf(targetSymbol.name);

            let correctIndex: number;
            if (index === 7) correctIndex = i - 3;
            else if (index === 6) correctIndex = i - 1;
            else correctIndex = i;

            let symbol = this.pool_of_symbols[index][i];
            if (LogicState!.symbols![this.reel_index]) {
                const indexOfAvalancheId = fromPositions[
                    this.reel_index
                ].findIndex((symbol) => symbol?.id === targetSymbol.id);

                symbol = this.target_symbols[indexOfAvalancheId];
                if (indexOfAvalancheId === -1) continue;
                symbol.use();
            } else {
                debugger;
            }

            const animation = anime({
                targets: symbol.container,
                y: Config.symbol_height * correctIndex,
                easing: "easeInQuad",
                duration: Config.symbols_drop_duration,
            });

            Promises.push(animation.finished);
        }

        const promises = Promise.all(Promises);

        promises.then(() => {
            reset_enabled &&
                this.reset_symbols_to_avalanche_matrix(
                    toPositions[this.reel_index]
                );
        });

        return promises;
    }

    reset_symbols_to_avalanche_matrix(avalancheIndexes: symbolsMatrix[number]) {
        for (let i = 0; i < this.symbolsCount; i++) {
            const checkSymbol =
                avalancheIndexes[i] === null
                    ? null
                    : Config.symbols_to_index.indexOf(
                          avalancheIndexes[i]!.name
                      );

            if (this.target_symbols[i]) {
                this.target_symbols[i].cleanup();
            }
            if (checkSymbol === -1 || checkSymbol === null) {
                continue;
            }

            let correctIndex;
            if (checkSymbol === 7) correctIndex = i - 3;
            else if (checkSymbol === 6) correctIndex = i - 1;
            else correctIndex = i;

            const symbol = this.pool_of_symbols[checkSymbol][i];
            // symbol.debug_text.text = `${avalancheIndexes[i]?.id}-R`;

            symbol.use();
            symbol.container.y = correctIndex * Config.symbol_height;
            // symbol = this.pool_of_symbols[checkSymbol][i];

            this.target_symbols[i] = symbol;
        }
    }

    destroy_symbol = (index: number): Promise<void> => {
        return this.target_symbols[index].destroy();
    };

    // Анимация символов при выграше
    play_symbols_anim = (symbols_mask: number[]) => {
        for (let i = 0; i < this.symbolsCount; i++) {
            if (symbols_mask[i] === 0) {
                this.bottomSymbolsContainer.addChild(
                    this.target_symbols[i].container
                );

                this.target_symbols[i].darken();
            } else {
                this.topSymbolsContainer.addChild(
                    this.target_symbols[i].container
                );
                this.target_symbols[i].play_anim();
            }
        }
    };

    brighten_symbols() {
        for (let i = 0; i < this.symbolsCount; i++) {
            this.target_symbols[i].brighten();
        }
    }

    play_failling_symbols_anim = (symbol: rSymbol) => {
        if (Config.symbols_drop_duration === 0) return;
        this.app.stage.removeChild(symbol.info_container!);
        symbol.main_sprite.x = -(symbol.main_sprite.width / 2);
        symbol.main_sprite.y = symbol.main_sprite.height / 2;
        symbol.main_sprite.anchor.set(0, 1);

        anime({
            targets: symbol.main_sprite,
            rotation: -0.09,
            duration: 100,
            easing: "linear",
            direction: "alternate",
            loop: 2,
            complete: () => {
                symbol.main_sprite.x = 0;
                symbol.main_sprite.y = 0;
                symbol.main_sprite.anchor.set(0.5, 0.5);
            },
        });
    };
}
