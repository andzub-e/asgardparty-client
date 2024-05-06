import { Config } from "../Config";
import { HistorySymbol } from "./HistorySymbol";
import { SpinStepResult, symbolsMatrix } from "../Models";

export class HistoryReel {
    app: PIXI.Application;
    reel_index: number;
    pool_of_symbols: HistorySymbol[][] = [];
    target_symbols: HistorySymbol[] = [];
    symbolsCount: number;

    topSymbolsContainer: PIXI.Container;
    bottomSymbolsContainer: PIXI.Container;

    constructor(
        app: PIXI.Application,
        reel_index: number,
        symbolsCount = Config.symbols_count,
        topSymbolsContainer = new PIXI.Container(),
        bottomSymbolsContainer = new PIXI.Container()
    ) {
        this.app = app;
        this.reel_index = reel_index;

        this.topSymbolsContainer = topSymbolsContainer;
        this.bottomSymbolsContainer = bottomSymbolsContainer;

        this.symbolsCount = symbolsCount;

        this.build_reel();
    }

    build_reel() {
        for (let i = 0; i < Config.main_textures_keys.length; i++) {
            this.pool_of_symbols[i] = [];
            for (let j = 0; j < this.symbolsCount; j++) {
                const symbol = new HistorySymbol(this.app, i);
                symbol.container.x =
                    this.reel_index * Config.symbol_width +
                    Config.symbol_width / 2 +
                    110;
                this.pool_of_symbols[i].push(symbol);
                this.topSymbolsContainer.addChild(symbol.container);
            }
        }
    }

    place_new_symbols = (
        step: SpinStepResult,
        symbols: Array<Array<HistorySymbol | number>>
    ) => {
        const current_reel_symbols = step.symbols_placed[this.reel_index];

        for (let i = 0; i < this.symbolsCount; i++) {
            const current_symbol = current_reel_symbols[i];
            let index = 21;
            if (current_symbol) {
                index = Config.symbols_to_index.indexOf(current_symbol!.name);
            }

            if (current_symbol === null) {
                // Empty Symbol
                continue;
            }

            // If current symbol already plced, just skip
            if (this.target_symbols[i] && this.target_symbols[i].in_use) {
                continue;
            }

            const symbol = this.pool_of_symbols[index][i];

            if (Config.mystery_indexes.indexOf(index) !== -1) {
                symbols.push([symbol, -1]);
            } else {
                symbols.push([symbol, current_symbol!.id]);
            }

            symbol!.use();

            if (index === 6) {
                symbol!.container.y = (i - 1) * Config.symbol_height;
            } else if (index === 7) {
                symbol!.container.y = (i - 3) * Config.symbol_height;
            } else {
                symbol!.container.y = i * Config.symbol_height;
            }

            this.target_symbols[i] = symbol;

            this.topSymbolsContainer.addChild(symbol.container);
        }
    };

    fall_down_top_symbols(
        step: SpinStepResult,
        fromPositions: symbolsMatrix,
        toPositions: symbolsMatrix
    ) {
        for (let i = 0; i < this.symbolsCount; i++) {
            const targetSymbol = toPositions[this.reel_index][i];
            if (!targetSymbol) continue;
            const index = Config.symbols_to_index.indexOf(targetSymbol.name);
            let correctIndex: number;
            if (index === 7) correctIndex = i - 3;
            else if (index === 6) correctIndex = i - 1;
            else correctIndex = i;
            let symbol = this.pool_of_symbols[index][i];
            if (step.symbols_placed[this.reel_index]) {
                const indexOfAvalancheId = fromPositions[
                    this.reel_index
                ].findIndex((symbol) => symbol?.id === targetSymbol.id);
                symbol = this.target_symbols[indexOfAvalancheId];
                if (indexOfAvalancheId === -1) continue;
                symbol.use();
            } else {
                debugger;
            }
            symbol.container.y = Config.symbol_height * correctIndex;
        }
    }

    brighten_symbols() {
        for (let i = 0; i < this.symbolsCount; i++) {
            this.target_symbols[i].brighten();
        }
    }
}
