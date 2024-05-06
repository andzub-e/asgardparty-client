import { rSymbol } from "./Symbol";
import { LogicState } from "../logic_state";
import { Config } from "../Config";
import anime from "animejs";
import { Reel } from "./Reel";
import { deferrify, sleep, stop_spine_animation } from "../Util";
import { New_reel_figure, symbolsMatrix } from "../Models";
import { numberNullRectangularMatrix } from "../types";

export class TopReel extends Reel {
    constructor(
        app: PIXI.Application,
        topSymbolsContainer = new PIXI.Container(),
        bottomSymbolsContainer = new PIXI.Container()
    ) {
        super(
            app,
            0,
            3,
            topSymbolsContainer,
            bottomSymbolsContainer,
            !!LogicState.current_top_reels_indexes[0][0]
        );

        // Rotate reel to get row view (right to left)
        topSymbolsContainer.rotation = bottomSymbolsContainer.rotation =
            Math.PI * -0.5;

        for (let i = 0; i < this.pool_of_symbols.length; i++) {
            const pool = this.pool_of_symbols[i];

            for (let j = 0; j < pool.length; j++) {
                const symbol = pool[j];

                symbol.container.rotation = -topSymbolsContainer.rotation;
                symbol.container.x += 5;
                symbol.container.scale.set(0.95);
            }
        }
    }

    build_destroy_anims() {
        for (let i = 0; i < this.symbolsCount; i++) {
            const anim = new PIXI.spine.Spine(
                PIXI.Loader.shared.resources["destroy"].spineData
            );
            anim.y = 1 + i * Config.symbol_height;
            anim.x = 0;
            anim.visible = false;
            this.topSymbolsContainer.addChild(anim);
            this.destroy_anims[i] = anim;

            anim.state.onComplete = () => {
                stop_spine_animation(anim);
                anim.visible = false;
            };
        }
    }

    play_destroy_animation(reel_index: number) {
        const anim = this.destroy_anims[reel_index];
        anim.visible = true;
        anim.state.setAnimation(0, "animation_org", true);
    }

    build_reel() {
        for (let i = 0; i < Config.main_textures_keys.length; i++) {
            this.pool_of_symbols[i] = [];

            for (let j = 0; j < this.symbolsCount; j++) {
                const symbol = new rSymbol(this.app, i);
                this.pool_of_symbols[i].push(symbol);
                this.topSymbolsContainer.addChild(symbol.container);
            }
        }
    }

    reset_symbols_to_avalanche_matrix(avalancheIndexes: symbolsMatrix[number]) {
        super.reset_symbols_to_avalanche_matrix(avalancheIndexes);
    }

    fall_down_top_symbols(
        topFromPositions: symbolsMatrix,
        topToPositions: symbolsMatrix
    ) {
        return super.fall_down_top_symbols(topFromPositions, topToPositions);
    }

    exchange_top_mystery_symbols = (
        cur_top_symbols: numberNullRectangularMatrix = [[0, 0, 0]],
        exchanged_top_mystery: symbolsMatrix = [[null, null, null]]
    ): Promise<void[]> => {
        const Promises = [];
        for (let i = 0; i < 3; i++) {
            const new_symbol = cur_top_symbols[0][i];
            const old_symbol = exchanged_top_mystery[0][i];

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

    place_new_symbols = (symbols: symbolsMatrix): Promise<void[]> => {
        const Promises = [];

        const current_reel_symbols = symbols;

        for (let i = 0; i < this.symbolsCount; i++) {
            const current_symbol = current_reel_symbols[0][i];

            let symbol_anim_delay;
            if (LogicState.spin_mode === "base" && !LogicState.slam_stop) {
                symbol_anim_delay =
                    this.reel_index * Config.reels_drop_delay +
                    Config.symbols_drop_delay * i;
            } else {
                symbol_anim_delay = 0;
            }

            if (current_symbol === null) {
                // Empty Symbol
                continue;
            }

            // If current symbol already plced, just skip
            if (this.target_symbols[i] && this.target_symbols[i].in_use) {
                continue;
            }

            const index = Config.symbols_to_index.indexOf(current_symbol.name);

            const symbol = this.pool_of_symbols[index][i];
            symbol.use();
            symbol.container.y =
                (i - (this.symbolsCount + Config.out_of_top_symbols_count)) *
                -Config.symbol_height;

            this.target_symbols[i] = symbol;

            this.topSymbolsContainer.addChild(symbol.container);

            const animation = anime({
                targets: symbol.container,
                y: Config.symbol_height * i,
                easing: "easeInQuad",
                delay: symbol_anim_delay,
                duration: Config.symbols_drop_duration,

                _complete: () => {
                    if (Config.pressed_button > 1) {
                        if (i === 2) {
                            // AUDIO_MANAGER.stopSpin?.play();
                            console.log("AUDIO stop spin");
                        }
                    }
                    this.play_failling_symbols_anim(symbol);
                },
                get complete() {
                    return this._complete;
                },
                set complete(value) {
                    this._complete = value;
                },
            });

            Promises.push(animation.finished);
        }

        return Promise.all(Promises);
    };

    get_current_indexes = () => {
        const result = [];
        for (let i = 0; i < 3; i++) {
            result.push({
                id: 0,
                name: Config.symbols_to_index[
                    this.target_symbols[i].symbol_type
                ],
                x: i,
                y: 0,
            });
        }

        return result as New_reel_figure[];
    };

    drop_symbols = (): Promise<void[]> => {
        const Promises = [];

        for (let i = 0; i < this.symbolsCount; i++) {
            const symbol = this.target_symbols[i];
            if (!symbol) continue;

            this.app.stage.removeChild(symbol.info_container!);

            let symbol_anim_delay;
            if (LogicState.spin_mode === "base") {
                symbol_anim_delay =
                    this.reel_index * Config.reels_drop_delay +
                    Config.symbols_drop_delay * i;
            } else {
                symbol_anim_delay = 0;
            }

            const animation = anime({
                targets: symbol.container,
                y: Config.symbol_height * (i - 4),
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
}
