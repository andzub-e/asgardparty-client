import { Config } from "../Config";
import { LogicState } from "../logic_state";
import { SessionConfig } from "../SessionConfig";
import {
    numberNullRectangularMatrix,
    symbolPointsOnMatrix,
    BigWinKind,
} from "../types";
import { getEmptyReelsMatrix } from "../Util";
import { TeststandSymbol } from "./TeststandSymbol";

console.log("Teststand module loaded.");

document.body.style.display = "flex";

export const testStandConfig = {
    slot_size: 40,
    slot_margin: 2,
    slot_full_size: 44,
};

export const testStandSymbolsMatrix = getEmptyReelsMatrix();

export class Teststand {
    private lastPosition: { x: number; y: number } = {
        x: 0,
        y: 8,
    };

    private reelsSlotsBoundingClientRect: DOMRect;
    private reelsSlots: HTMLDivElement;

    private placedSymbols: TeststandSymbol[] = [];

    constructor() {
        const teststand_block = document.createElement("div");
        teststand_block.id = "teststand";
        document.body.append(teststand_block);

        const teststand_toggle = document.createElement("button");
        teststand_toggle.innerHTML = "Show cheats";
        teststand_block.appendChild(teststand_toggle);
        teststand_toggle.onclick = show_cheats;

        const teststand_content = document.createElement("div");
        teststand_content.id = "teststand_content";
        teststand_content.style.backgroundColor = "white";
        teststand_content.style.width = "830px";
        teststand_content.style.flexWrap = "wrap";

        teststand_block.appendChild(teststand_content);

        const reelsSlots = (this.reelsSlots = document.createElement("div"));
        reelsSlots.style.display = "flex";
        reelsSlots.style.flexWrap = "wrap";
        reelsSlots.style.width = `${
            (testStandConfig.slot_size + testStandConfig.slot_margin * 2) *
            Config.reels_count
        }px`;
        reelsSlots.style.height = "396px";

        const symbols_content = document.createElement("div");
        symbols_content.style.display = "flex";
        symbols_content.style.flexWrap = "wrap";
        symbols_content.style.flexDirection = "column";
        symbols_content.style.marginLeft = "20px";
        symbols_content.style.width = "500px";
        symbols_content.style.maxHeight = "500px";

        teststand_content.appendChild(reelsSlots);
        teststand_content.appendChild(symbols_content);

        const addCheatButton = (text: string, callback: () => void) => {
            const button = document.createElement("button");
            button.innerHTML = text;
            button.classList.add("cheat-button");
            teststand_content.appendChild(button);
            button.onclick = () => {
                console.log(
                    `%cCHEAT: ${text}`,
                    "background: #222; color: #bada55; font-size: 32px;"
                );
                callback();
            };
        };

        addCheatButton("Order this", () => submit_this_reels());
        addCheatButton("Order bonus game", () => submit_bonus_game_order());
        addCheatButton("Order 2x2", () => order_any_big_win("2x2"));
        addCheatButton("Order Big Win", () => order_any_big_win("Normal"));
        addCheatButton("Order Mega Big Win", () => order_any_big_win("Mega"));
        addCheatButton("Order Epic Big Win", () => order_any_big_win("Epic"));

        const submit_this_reels = () => {
            const figures: string[] = [];

            this.placedSymbols.forEach((symbol) => {
                figures.push(Config.symbols_to_index[symbol.index]);
            });

            const body = {
                session_token: LogicState.server_state!.session_token,
                figures: figures,
            };

            fetch(`${SessionConfig.API_ADDRESS}cheat/custom_figures`, {
                method: "POST",
                mode: "cors",
                cache: "no-store",
                credentials: "omit",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify(body),
            });
        };

        const order_any_big_win = (type: BigWinKind) => {
            const fill_figures = new Array(20)
                .fill(20)
                .map((_, i) => (i % 2 === 0 ? "l1" : "l2"));
            const big_wins_figures = {
                "2x2": ["h", "h", "m4", "m3"],
                Normal: ["r2", "r2", "r1"],
                Mega: ["r2", "r2", "r1", "l2", "l1", "r1", "r1"],
                Epic: ["m23", "m23", "m23", "m23"],
            };
            const body = {
                session_token: LogicState.server_state!.session_token,
                figures: [
                    ...big_wins_figures[type as keyof typeof big_wins_figures],
                    ...fill_figures,
                ],
            };

            fetch(`${SessionConfig.API_ADDRESS}cheat/custom_figures`, {
                method: "POST",
                mode: "cors",
                cache: "no-store",
                credentials: "omit",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify(body),
            });
        };

        const submit_bonus_game_order = () => {
            const body = {
                session_token: LogicState.server_state!.session_token,
                figures: ["f", "f", "f"],
            };

            fetch(`${SessionConfig.API_ADDRESS}cheat/custom_figures`, {
                method: "POST",
                mode: "cors",
                cache: "no-store",
                credentials: "omit",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify(body),
            });
        };

        const clearButton = document.createElement("button");
        clearButton.innerHTML = "Clear";
        teststand_content.appendChild(clearButton);
        clearButton.onclick = () => {
            testStandSymbolsMatrix.map((reel) => reel.fill(null));
            this.lastPosition.x = 0;
            this.lastPosition.y = 0;

            this.placedSymbols.forEach((symbol) => {
                if (
                    Array.prototype.indexOf.call(
                        reelsSlots.children,
                        symbol
                    ) !== -1
                ) {
                    reelsSlots.removeChild(symbol);
                }
            });

            this.placedSymbols.length = 0;
        };

        for (let i = 0; i < Config.reels_count; i++) {
            for (let j = 0; j < Config.symbols_count; j++) {
                const emptySlot = document.createElement("div");

                emptySlot.style.backgroundColor = "grey";
                emptySlot.style.width = `${testStandConfig.slot_size}px`;
                emptySlot.style.height = `${testStandConfig.slot_size}px`;
                emptySlot.style.margin = `${testStandConfig.slot_margin}px`;

                reelsSlots.appendChild(emptySlot);
            }
        }

        this.reelsSlotsBoundingClientRect = reelsSlots.getBoundingClientRect();

        for (let i = 0; i < Config.main_textures_keys.length; i++) {
            const symbolView = new TeststandSymbol(i);

            this.registerSymbolFromCollection(symbolView);

            symbols_content.appendChild(symbolView);
        }

        // Sort collection of symbols
        Array.from(symbols_content.children)
            .sort((a, b) => {
                const aWidth = a.getBoundingClientRect().width;
                const bWidth = b.getBoundingClientRect().width;

                if (aWidth < bWidth) {
                    return -1;
                } else if (aWidth === bWidth) {
                    return 0;
                } else {
                    return 1;
                }
            })
            .forEach((element) => {
                symbols_content.appendChild(element);
            });

        teststand_content.style.display = "none";

        function show_cheats() {
            if (teststand_content.style.display === "none") {
                teststand_content.style.display = "flex";
                teststand_toggle.innerHTML = "Hide cheats";
            } else {
                teststand_content.style.display = "none";
                teststand_toggle.innerHTML = "Show cheats";
            }
        }
    }

    getFormOf = (
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
                    points.push({
                        x: startPoint.x + j,
                        y: startPoint.y + i,
                    });
                }
            }
        }

        return points;
    };

    private symbolCanBePlacedOnMatrix(
        matrix: numberNullRectangularMatrix,
        symbolIndex: number,
        startPoint: PIXI.Point
    ) {
        let startHight = startPoint.y;

        const formPoints = this.getFormOf(symbolIndex, startPoint);

        for (let i = 0; i < formPoints.length; i++) {
            const pointData = formPoints[i];

            if (pointData.x > 6 || pointData.y > 8) {
                return false;
            }

            if (matrix[pointData.x][pointData.y] !== null) {
                return false;
            }
        }

        while (startHight > -1) {
            if (matrix[startPoint.x][startHight] !== null) {
                return false;
            }

            startHight--;
        }

        return true;
    }

    /**
     * Setups events for symbol from collection
     */
    private registerSymbolFromCollection(symbol: TeststandSymbol) {
        const {
            reelsSlotsBoundingClientRect,
            lastPosition,
            reelsSlots,
            placedSymbols,
        } = this;

        const lastPoint = lastPosition;

        symbol.addEventListener("pointerdown", () => {
            // const symbol_index = e.path[0].index;
            // console.log(symbol);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const symbol_index = Number((symbol as any).id);
            const reels = testStandSymbolsMatrix;

            let canBePlaced = false;
            let stopSearch = false;
            if (lastPosition.x >= 7) {
                lastPosition.x = 0;
            }

            for (let i = lastPoint.x; i < reels.length; i++) {
                if (stopSearch) {
                    stopSearch = false;
                    canBePlaced = false;
                    return;
                }
                for (let k = 8; k >= 0; k--) {
                    const point = new PIXI.Point(i, k);

                    canBePlaced = this.symbolCanBePlacedOnMatrix(
                        testStandSymbolsMatrix,
                        symbol_index,
                        point
                    );

                    const formPoints = this.getFormOf(symbol_index, point);

                    const inShowArea = formPoints.some((point) => point.y >= 4);

                    if (!canBePlaced) {
                        if (k === 0) {
                            lastPosition.x = 0;
                        }
                        continue;
                    } else if (inShowArea) {
                        const form = Config.symbolsForms[symbol_index];

                        this.placeSymbolOnMatrixFromPoint(
                            testStandSymbolsMatrix,
                            symbol_index,
                            point,
                            true
                        );

                        form[0].includes(undefined)
                            ? (lastPoint.x += form[0].length + 1)
                            : (lastPosition.x += form[0].length);

                        const symbolToPlace = new TeststandSymbol(symbol_index);

                        symbolToPlace.pointOnMatrix.copyFrom(point);

                        // this.registerPlacedSymbol(symbolToPlace);

                        placedSymbols.push(symbolToPlace);

                        symbolToPlace.style.position = "absolute";
                        symbolToPlace.style.left =
                            point.x * testStandConfig.slot_full_size + "px";

                        symbolToPlace.style.top =
                            point.y * testStandConfig.slot_full_size +
                            reelsSlotsBoundingClientRect.top +
                            "px";

                        reelsSlots.appendChild(symbolToPlace);

                        stopSearch = true;

                        return;
                    } else {
                        continue;
                    }
                }
            }
        });
    }

    private destorySymbolInMatrix = (
        matrix: numberNullRectangularMatrix,
        position: PIXI.Point
    ) => {
        const symbolIndex = matrix[position.x][position.y] as number;

        const points = this.getFormOf(symbolIndex, position);

        for (let i = 0; i < points.length; i++) {
            const pointData = points[i];

            matrix[pointData.x][pointData.y] = null;
        }
    };

    /**
     * Setups events for an placed symbol
     */
    private registerPlacedSymbol(symbol: TeststandSymbol) {
        const { reelsSlotsBoundingClientRect, reelsSlots, placedSymbols } =
            this;

        symbol.addEventListener("pointerdown", () => {
            console.log(symbol);
            this.destorySymbolInMatrix(
                testStandSymbolsMatrix,
                symbol.pointOnMatrix
            );

            document.addEventListener("pointerup", (e: PointerEvent) => {
                e.preventDefault();

                const symbolIndex = symbol.index;

                if (symbol) {
                    this.placeSymbolOnMatrixFromPoint(
                        testStandSymbolsMatrix,
                        symbolIndex,
                        symbol.pointOnMatrix,
                        true
                    );

                    symbol.style.position = "absolute";
                    symbol.style.left =
                        symbol.pointOnMatrix.x *
                            testStandConfig.slot_full_size +
                        "px";

                    symbol.style.top =
                        symbol.pointOnMatrix.y *
                            testStandConfig.slot_full_size +
                        reelsSlotsBoundingClientRect.top +
                        "px";
                } else {
                    reelsSlots.removeChild(symbol);
                    placedSymbols.splice(placedSymbols.indexOf(symbol, 1));
                }
            });
        });
    }

    private placeSymbolOnMatrixFromPoint(
        matrix: numberNullRectangularMatrix,
        symbolIndex: number,
        startPoint: PIXI.Point,
        includeMinusOneForBigSymbols = false
    ) {
        const formPoints = this.getFormOf(symbolIndex, startPoint);

        for (let k = 0; k < formPoints.length; k++) {
            const pointData = formPoints[k];

            if (includeMinusOneForBigSymbols) {
                if (k === 0) {
                    matrix[pointData.x][pointData.y] = symbolIndex;
                } else {
                    matrix[pointData.x][pointData.y] = -1;

                    if (symbolIndex === 6 && k === formPoints.length - 1) {
                        matrix[pointData.x + 1][pointData.y] = -1;
                        matrix[pointData.x - 1][pointData.y] = -1;
                    }
                }
            } else {
                matrix[pointData.x][pointData.y] = symbolIndex;
            }
        }
    }
}

export default {};
