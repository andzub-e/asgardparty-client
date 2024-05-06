import { Config } from "./Config";
import { LogicState } from "./logic_state";
import {
    HistorySpin,
    newFigurePosition,
    New_reel_figure,
    OldFormSpin,
    Reels,
    Spin,
    SpinResult,
    SpinStepResult,
    Stage,
    symbolsMatrix,
} from "./Models";
import { ReelWindow, TopReelWindow } from "./ReelWindow";
import {
    freeMarixFieldType,
    numberNullRowVectorMatrix,
    symbolPointsOnMatrix,
} from "./types";
import { objectJsonCopy } from "./Util";

export enum GameState {
    base = "base",
    freespins = "freespins",
}

const freeMatrixFiedValue: freeMarixFieldType = null;

let game_state = "base";
let free_spins_left = 0;
let total_free_spins = 0;

export const modify_spin_result = (
    serverSpin: SpinResult | HistorySpin | Spin
): OldFormSpin => {
    let stages: Stage[];
    const steps: SpinStepResult[] = [];

    if ("reels" in serverSpin) {
        stages = serverSpin.reels.spins[0].stages;
    } else if ("stages" in serverSpin) {
        stages = serverSpin.stages;
        free_spins_left = serverSpin.free_spins_left as number;
    }

    reelwindow.clearMask();
    topreelwindow.clearMask();
    let prev_increment_stage_win = 0;
    stages!.forEach((stage, i) => {
        const nextStage = stages[i + 1];

        const getMysteryExchangeSymbol = (): New_reel_figure => {
            let symbol;
            if (nextStage.new_reel_figures) {
                symbol = nextStage.new_reel_figures[0];
            } else {
                symbol = nextStage.new_top_figures[0];
            }
            return symbol;
        };

        const ids_to_destroy =
            stage.payouts.values
                ?.reduce(
                    (acc, curVal) => acc.concat(curVal.figures),
                    [] as number[]
                )
                .filter((element, index, wins) => {
                    return wins.indexOf(element) === index;
                }) || [];

        /**
         * Ниже есть закоментированный код, который был оставлен с заботой
         * о будущих разработчиках, чтобы они не тратили время на то, чтобы
         * понять, что происходит в этом коде, и с минимальными затратами времени
         * могли дополнить млм изменить обработку уровней спинов.
         * Раскомментировав этот код, можно увидеть в консоли, как происходит обработка
         * добавления, падения, дестроя, и замена мистери символов.
         */

        /** @SIMULATION_TOP_REELS */

        const new_top_figures = objectJsonCopy(stage.new_top_figures || []);

        topreelwindow.addFigures(new_top_figures);
        const top_symbols_placed = topToMatrix(
            objectJsonCopy([...topreelwindow.figures.values()])
        );
        // topreelwindow.PrintMask(undefined, 'top_symbols_placed')

        const top_falled_mystery = topToMatrix(
            objectJsonCopy(topreelwindow.pushAllToLeft())
        );

        const top_falled_all = topToMatrix(
            objectJsonCopy([...topreelwindow.figures.values()])
        );
        // topreelwindow.PrintMask(undefined, 'top_falled_all')

        topreelwindow.deleteFigureByIds(ids_to_destroy);
        topreelwindow.pushAllToLeft();
        // topreelwindow.PrintMask(undefined, 'destroy + fall')

        const top_exchanged_mystery_matrix = topSymToIndexMatrix(
            topToMatrix(topreelwindow.getMysteryPositions())
        );
        const top_exchanged_mystery = top_exchanged_mystery_matrix.map((row) =>
            row.map((symbol) =>
                symbol
                    ? Config.symbols_to_index.indexOf(
                          getMysteryExchangeSymbol().name
                      )
                    : null
            )
        );

        const top_mysteries = topreelwindow
            .getMysteryPositions()
            .reduce((acc, curVal) => acc.concat(curVal.id), [] as number[]);
        topreelwindow.deleteFigureByIds(top_mysteries);

        const top_exchanged_mysteries_from_next_stage =
            nextStage?.new_top_figures?.filter(
                (el) => top_exchanged_mystery[0][el.x] !== null
            ) || [];
        const top_reel_final = topToMatrix(
            objectJsonCopy(
                [...topreelwindow.figures.values()].concat(
                    top_exchanged_mysteries_from_next_stage
                )
            )
        );

        /** @SIMULATION_MAIN_REELS */
        reelwindow.addFigures(stage.new_reel_figures || []);
        const symbols_placed = toMatrix(
            objectJsonCopy([...reelwindow.figures.values()])
        );
        // reelwindow.PrintMask(undefined, 'symbols_placed')

        const falled_mystery = toMatrix(
            objectJsonCopy(reelwindow.pushAllToBottom())
        );
        // reelwindow.PrintMask(undefined, 'falled_mystery')

        const falled_all = toMatrix(
            objectJsonCopy([...reelwindow.figures.values()])
        );
        // reelwindow.PrintMask(undefined, 'falled_all')

        reelwindow.deleteFigureByIds(ids_to_destroy);
        reelwindow.pushAllToBottom();
        // reelwindow.PrintMask(undefined, 'destroy + fall')

        const exchanged_mystery_matrix = SymToIndexMatrix(
            toMatrix(reelwindow.getMysteryPositions())
        );
        const exchanged_mystery = exchanged_mystery_matrix.map((row) =>
            row.map((symbol) =>
                symbol
                    ? Config.symbols_to_index.indexOf(
                          getMysteryExchangeSymbol().name
                      )
                    : null
            )
        );

        const mysteries = reelwindow
            .getMysteryPositions()
            .reduce((acc, curVal) => acc.concat(curVal.id), [] as number[]);
        reelwindow.deleteFigureByIds(mysteries);

        const exchanged_mysteries_from_next_stage =
            nextStage?.new_reel_figures?.filter(
                (el) => exchanged_mystery[el.x][el.y] !== null
            ) || [];
        const reel_final = toMatrix(
            objectJsonCopy(
                [...reelwindow.figures.values()].concat(
                    exchanged_mysteries_from_next_stage
                )
            )
        );

        let stage_win = 0;
        stage_win = stage.payouts.amount;
        const bonus_game: Reels | null = stage.bonus_game;

        if (stage.bonus_game) {
            free_spins_left =
                (stage.bonus_game.spins[
                    Math.max(0, LogicState.currentBonusSpinStep - 1)
                ]?.free_spins_left as number) || 0;
            total_free_spins = stage.bonus_game.spins.length;
            // В каждый бонусный стейдж указываем сумупредыдущих стейджей и спинов
            stage.bonus_game.spins.reduce((sum, spin) => {
                spin.stages.forEach((bonusStage) => {
                    sum += bonusStage.payouts.amount;
                    bonusStage.prev_bonus_stages_win = sum;
                });
                return sum;
            }, stage.payouts.amount);
        }

        const result: SpinStepResult = {
            multiplier: stage.multiplier,
            payout: stage.payouts,
            winID: ids_to_destroy,
            prev_stages_win: prev_increment_stage_win,
            stage_win,
            free_spins_left,

            symbols_placed: symbols_placed,
            falled_all: falled_all,
            falled_mystery: falled_mystery,
            exchanged_mystery: exchanged_mystery,
            reel_final: reel_final,

            top_symbols_placed: top_symbols_placed,
            top_falled_all: top_falled_all,
            top_falled_mystery: top_falled_mystery,
            top_exchanged_mystery: top_exchanged_mystery,
            top_reel_final: top_reel_final,

            bonus_game,
            prev_bonus_stages_win: stage.prev_bonus_stages_win,
            new_figures_position: stage.new_figures_position,
        };
        steps.push(result);

        prev_increment_stage_win += stage_win;
    });

    let spinWin;

    if ("amount" in serverSpin) {
        spinWin = serverSpin.amount;
    } else if ("total_wins" in serverSpin) {
        spinWin = serverSpin.total_wins;
    } else {
        spinWin = serverSpin.reels.amount;
    }

    // console.warn("FREE SPINS: " + LogicState.free_spins_left);

    const result: OldFormSpin = {
        steps,
        balance: LogicState.balance,
        free_spins_left,
        free_spins_total_win: LogicState.free_spins_total_win,
        total_free_spins,
        win: spinWin,
    };

    if (game_state === "base") {
        if (LogicState.free_spins_left > 0) {
            game_state = "bonus";
        }
    } else {
        if (LogicState.free_spins_left === 0) {
            game_state = "base";
            free_spins_left = 0;
        }
    }

    return result;
};

export const getFormOf = (
    index: number,
    startPoint: PIXI.Point
): symbolPointsOnMatrix => {
    const points: symbolPointsOnMatrix = [];
    const form = Config.symbolsForms[index];

    for (let i = 0; i < form.length; i++) {
        const column = form[i];

        for (let j = 0; j < column.length; j++) {
            const fill = column[j];

            if (fill === undefined) {
                continue;
            } else {
                let x;
                let y;
                if (index === 6) {
                    x = j;
                    y = i - 1;
                } else if (index === 7) {
                    x = j;
                    y = i - 3;
                } else {
                    x = j;
                    y = i;
                }

                points.push({
                    x: startPoint.x + x,
                    y: startPoint.y + y,
                });
            }
        }
    }

    return points;
};

/**
 * Changes and returns indexes matrix after destory by win matrixes
 */
export const destorySymbolsInMatrixByWinMatrixes = (
    winArray: number[],
    idMatrix: symbolsMatrix
) => {
    winArray.forEach((symbolID) => {
        for (let j = 0; j < idMatrix.length; j++) {
            const reel = idMatrix[j];

            for (let k = 0; k < reel.length; k++) {
                if (reel[k]) {
                    if (reel[k]!.id === symbolID) {
                        idMatrix[j][k] = freeMatrixFiedValue;
                    }
                }
            }
        }
    });

    return idMatrix;
};

export const getIndexesMatrixAfterFallDown = (
    currentIndexes: symbolsMatrix,
    symbolsForMoove: newFigurePosition[] | null = null
) => {
    const afterFallDownSymbolsMatrix = currentIndexes;
    if (symbolsForMoove === null) return currentIndexes;
    symbolsForMoove.forEach((mSymbol) => {
        if (currentIndexes.length === 1) {
            const reel = currentIndexes[0];

            for (let i = 0; i < reel.length; i++) {
                const symbol = reel[i];
                if (symbol) {
                    if (symbol.id === mSymbol.id) {
                        afterFallDownSymbolsMatrix[0][i] = null;
                        afterFallDownSymbolsMatrix[0][mSymbol.x] = symbol;

                        symbol.x = mSymbol.x;
                    }
                }
            }
        } else {
            for (let i = 0; i < currentIndexes.length; i++) {
                const reel = currentIndexes[i];

                for (let k = 0; k < reel.length; k++) {
                    const symbol = reel[k];
                    if (symbol && symbol.id === mSymbol.id) {
                        let trueY;
                        if (symbol.name === "c") {
                            trueY = mSymbol.y + 1;
                        } else if (symbol.name === "h") {
                            trueY = mSymbol.y + 3;
                        } else {
                            trueY = mSymbol.y;
                        }

                        afterFallDownSymbolsMatrix[i][k] = null;
                        afterFallDownSymbolsMatrix[mSymbol.x][trueY] = symbol;
                        symbol.x = mSymbol.x;

                        symbol.y = trueY;
                    }
                }
            }
        }
    });

    return afterFallDownSymbolsMatrix;
};

export function printMatrix(
    matrix: Array<Array<newFigurePosition | null>> | numberNullRowVectorMatrix[]
) {
    let row = "";
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const anything = matrix[i][j];
            if (typeof anything == "number") row += anything;
            else if (anything !== null)
                row += (anything as newFigurePosition).id;
            else row += "-";
            row += "\t";
        }
        row += "\n";
    }
    console.log(row);
}

export function toMatrix(
    symbols: New_reel_figure[],
    width = Config.reels_count,
    height = Config.symbols_count
) {
    const matrix: symbolsMatrix = Array(width)
        .fill(null)
        .map(() => Array(height).fill(null));

    symbols.forEach((symbol) => {
        const sym_index = Config.symbols_to_index.indexOf(symbol.name);
        let offset = 0;
        // T и + образные символы помещаются в свободную ячейку
        if (sym_index === 7) offset = 3;
        if (sym_index === 6) offset = 1;

        const x = symbol.x;
        const y = symbol.y + offset;

        if (matrix[x][y]) {
            throw new Error(
                `Symbol already exists at ${x}:${y} ` +
                    JSON.stringify(symbol) +
                    " " +
                    JSON.stringify(matrix[x][y])
            );
        }
        matrix[x][y] = symbol;
    });
    return matrix;
}

export function topToMatrix(symbols: New_reel_figure[], width = 1, height = 3) {
    const matrix: symbolsMatrix = Array(width)
        .fill(null)
        .map(() => Array(height).fill(null));

    symbols.forEach((symbol) => {
        const x = symbol.x;

        if (matrix[0][x]) {
            throw new Error(
                `Symbol already exists at ${0}:${x} ` +
                    JSON.stringify(symbol) +
                    " " +
                    JSON.stringify(matrix[0][x])
            );
        }
        matrix[0][x] = symbol;
    });
    return matrix;
}

export function toBinaryMatrix(symbols: New_reel_figure[]) {
    const matrix: Array<Array<null | number>> = Array(Config.reels_count)
        .fill(null)
        .map(() => Array(Config.symbols_count).fill(null));

    symbols.forEach((symbol) => {
        const sym_index = Config.symbols_to_index.indexOf(symbol.name);
        let offset = 0;
        // T и + образные символы помещаются в свободную ячейку
        if (sym_index === 7) offset = 3;
        if (sym_index === 6) offset = 1;

        const x = symbol.x;
        const y = symbol.y + offset;

        if (matrix[x][y]) {
            throw new Error(
                `Symbol already exists at ${x}:${y} ` +
                    JSON.stringify(symbol) +
                    " " +
                    JSON.stringify(matrix[x][y])
            );
        }
        matrix[x][y] = 1;
    });
    return matrix;
}

export function SymToIndexMatrix(reels: Array<Array<New_reel_figure | null>>) {
    const matrix: Array<Array<null | number>> = Array(Config.reels_count)
        .fill(null)
        .map(() => Array(Config.symbols_count).fill(null));

    reels.forEach((reel) => {
        reel.forEach((symbol) => {
            if (!symbol) return;
            const sym_index = Config.symbols_to_index.indexOf(symbol.name);
            let offset = 0;
            // T и + образные символы помещаются в свободную ячейку
            // anchor-like
            if (sym_index === 7) offset = 3;
            if (sym_index === 6) offset = 1;

            const x = symbol.x;
            const y = symbol.y + offset;

            if (matrix[x][y]) {
                throw new Error(
                    `Symbol already exists at ${x}:${y} ` +
                        JSON.stringify(symbol) +
                        " " +
                        JSON.stringify(matrix[x][y])
                );
            }
            matrix[x][y] = Config.symbols_to_index.indexOf(symbol.name);
        });
    });
    return matrix;
}

export function topSymToIndexMatrix(
    reels: Array<Array<New_reel_figure | null>>,
    width = 1,
    height = 3
) {
    const matrix: Array<Array<null | number>> = Array(width)
        .fill(null)
        .map(() => Array(height).fill(null));

    reels.forEach((reel) => {
        reel.forEach((symbol) => {
            if (!symbol) return;
            const x = symbol.x;

            if (matrix[0][x]) {
                throw new Error(
                    `Symbol already exists at ${0}:${x} ` +
                        JSON.stringify(symbol) +
                        " " +
                        JSON.stringify(matrix[0][x])
                );
            }
            matrix[0][x] = Config.symbols_to_index.indexOf(symbol.name);
        });
    });
    return matrix;
}

export function SymToBinaryMatrix(reels: Array<Array<New_reel_figure | null>>) {
    const matrix: Array<Array<null | number>> = Array(Config.reels_count)
        .fill(null)
        .map(() => Array(Config.symbols_count).fill(null));

    reels.forEach((reel) => {
        reel.forEach((symbol) => {
            if (!symbol) return;
            const sym_index = Config.symbols_to_index.indexOf(symbol.name);
            let offset = 0;
            // T и + образные символы помещаются в свободную ячейку
            if (sym_index === 7) offset = 3;
            if (sym_index === 6) offset = 1;

            const x = symbol.x;
            const y = symbol.y + offset;

            if (matrix[x][y]) {
                throw new Error(
                    `Symbol already exists at ${x}:${y} ` +
                        JSON.stringify(symbol) +
                        " " +
                        JSON.stringify(matrix[x][y])
                );
            }

            const formPoints = getFormOf(sym_index, new PIXI.Point(x, y));

            for (const point of formPoints) {
                matrix[point.x][point.y] = 1;
            }
        });
    });
    return matrix;
}

export const reelwindow = new ReelWindow(
    Config.reels_count,
    Config.symbols_count
);
export const topreelwindow = new TopReelWindow(1, 3); //3 1
