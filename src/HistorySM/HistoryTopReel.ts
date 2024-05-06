import { Config } from "../Config";
import { HistoryReel } from "./HistoryReel";
import { HistorySymbol } from "./HistorySymbol";
import { SpinStepResult } from "../Models";
export class HistoryTopReel extends HistoryReel {
    constructor(
        app: PIXI.Application,
        topSymbolsContainer = new PIXI.Container(),
        bottomSymbolsContainer = new PIXI.Container()
    ) {
        super(app, 0, 3, topSymbolsContainer, bottomSymbolsContainer);

        // Rotate reel to get row view (right to left)
        topSymbolsContainer.rotation = bottomSymbolsContainer.rotation =
            Math.PI * -0.5;

        for (let i = 0; i < this.pool_of_symbols.length; i++) {
            const pool = this.pool_of_symbols[i];

            for (let j = 0; j < pool.length; j++) {
                const symbol = pool[j];

                symbol.container.rotation = -topSymbolsContainer.rotation;
            }
        }
    }

    build_reel() {
        for (let i = 0; i < Config.main_textures_keys.length; i++) {
            this.pool_of_symbols[i] = [];

            for (let j = 0; j < this.symbolsCount; j++) {
                const symbol = new HistorySymbol(this.app, i);
                this.pool_of_symbols[i].push(symbol);
                this.topSymbolsContainer.addChild(symbol.container);
            }
        }
    }

    place_new_symbols = (step: SpinStepResult, symbols: any) => {
        const current_reel_symbols = step.top_falled_all[0];

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

            symbol!.container.y = i * Config.symbol_height;

            this.target_symbols[i] = symbol;

            this.topSymbolsContainer.addChild(symbol.container);
        }
    };

    brighten_symbols() {
        for (let i = 0; i < this.symbolsCount; i++) {
            this.target_symbols[i].brighten();
        }
    }
}
