import { Config } from "./Config";
import { newFigurePosition, New_reel_figure } from "./Models";

/**
 * Tetris simulator
 * used for calculating client side symbols position
 * Примечание: логика обработки фигур была частично портирована с бекенда,
 * по этому нужно синхронизировать изменения в обоих местах.
 */

const mystery_regexp = /(m1|m2|m3|m4)$/;
export class ReelWindow {
    readonly x_size: number;
    readonly y_size: number;
    figures: Map<number, New_reel_figure> = new Map();
    mask: number[][] = [];
    constructor(x_size: number, y_size: number) {
        this.x_size = x_size;
        this.y_size = y_size;
        this.mask = Array(this.x_size)
            .fill(null)
            .map(() => Array(this.y_size).fill(0));
    }

    clearMask() {
        this.mask = Array(this.x_size)
            .fill(null)
            .map(() => Array(this.y_size).fill(0));
        this.figures.forEach((figure) => {
            this.deleteFigureById(figure.id);
        });
    }

    getForm(name: string) {
        return Config.symbolsForms[Config.symbols_to_index.indexOf(name)];
    }

    deleteFigureByIds(id: number[]) {
        id.forEach((id) => {
            this.deleteFigureById(id);
        });
    }

    deleteFigureById(id: number) {
        const figure = this.figures.get(id);
        if (!figure) return;
        this.deleteFigureFromWindow(figure);
        this.figures.delete(id);
    }

    deleteFigureFromWindow(_figure: New_reel_figure) {
        const figure = this.figures.get(_figure.id);
        if (!figure) return;
        const form = this.getForm(figure.name);
        const fig_width = Math.max(...form.map((w) => w.length));
        for (let y = 0; y < form.length; y++) {
            for (let x = 0; x < fig_width; x++) {
                if (form[y][x] === 0) {
                    this.mask[figure.x + x][figure.y + y] = 0;
                }
            }
        }
        return this;
    }

    pushAllToBottom(figures: New_reel_figure[] = [...this.figures.values()]) {
        const newFiguresPosition: New_reel_figure[] = [];
        for (let y = this.y_size - 1; y >= 0; y--) {
            for (let x = 0; x < this.x_size; x++) {
                if (this.mask[x][y] === 0) continue;
                const figureID = this.mask[x][y];
                const figureIndex = figures.findIndex(
                    (fig) => fig.id === figureID
                );
                if (figureIndex === -1) continue;
                const figure = figures[figureIndex];
                const figure_start_y = figure.y;
                this.deleteFigureFromWindow(figure);

                if (this.pushFigureToBottom(figure)) {
                    if (figures[figureIndex].y !== figure_start_y) {
                        const pos: New_reel_figure = {
                            id: figure.id,
                            name: figure.name,
                            x: figure.x,
                            y: figure.y,
                        };
                        newFiguresPosition.push(pos);
                    }
                }
                this.drawFigure(figure);
            }
        }
        return newFiguresPosition;
    }

    pushFigureToBottom(figure: New_reel_figure) {
        let isPushed = false;
        const tmpFigure = Object.assign({}, figure);
        for (
            ;
            tmpFigure.y <
            this.y_size - (this.getForm(tmpFigure.name).length - 1);
            tmpFigure.y++
        ) {
            if (!this.isFreePlaceForFigure(tmpFigure)) {
                break;
            }
            figure.y = tmpFigure.y;
            isPushed = true;
        }

        return isPushed;
    }

    isFreePlaceForFigure(figure: New_reel_figure) {
        const form = this.getForm(figure.name);
        const fig_width = Math.max(...form.map((w) => w.length));
        for (let y = 0; y < form.length; y++) {
            for (let x = 0; x < fig_width; x++) {
                if (form[y][x] === 0) {
                    if (this.mask[figure.x + x][figure.y + y] !== 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    addFigures(figures: New_reel_figure[]) {
        figures.forEach((figure) => {
            if (this.figures.has(figure.id))
                throw new Error(`Figure with id ${figure.id} already exists`);
            this.figures.set(figure.id, { ...figure });
            this.drawFigure(figure);
        });
        return this;
    }

    drawFigure(figure: New_reel_figure) {
        const form = this.getForm(figure.name);
        const fig_width = Math.max(...form.map((w) => w.length));
        for (let y = 0; y < form.length; y++) {
            for (let x = 0; x < fig_width; x++) {
                if (form[y][x] === 0) {
                    this.mask[figure.x + x][figure.y + y] = figure.id;
                }
            }
        }
        return this;
    }

    getMysteryPositions(
        reelFigures: New_reel_figure[] = [...this.figures.values()]
    ) {
        const mysteryPositions = [];

        for (let y = 0; y < this.y_size; y++) {
            for (let x = 0; x < this.x_size; x++) {
                const figureID = this.mask[x][y];
                const figure = reelFigures.find((fig) => fig.id === figureID);

                if (figure && mystery_regexp.test(figure.name)) {
                    const pos = {
                        name: figure.name,
                        id: figure.id,
                        x: x,
                        y: y,
                    };
                    mysteryPositions.push(pos);
                }
            }
        }
        return mysteryPositions;
    }

    print(comment?: string) {
        console.log(comment);
        for (let y = 0; y < this.y_size; y++) {
            let row = "";
            for (let x = 0; x < this.x_size; x++) {
                if (this.mask[x][y] > 9) {
                    row += "[" + this.mask[x][y] + " ]";
                } else {
                    row += "[ " + this.mask[x][y] + " ]";
                }
            }
            console.log(row);
        }
        return this;
    }

    positionForFigureFound(figure: New_reel_figure, offsetX = 0) {
        const form = this.getForm(figure.name);
        figure.x = offsetX;
        figure.y = 4 - (form.length - 1);
        const fig_width = Math.max(...form.map((w) => w.length));
        const tmpFigure = Object.assign({}, figure);

        for (let i = 1; i <= this.x_size; i++) {
            // check that figure no out of window (right side)
            if (tmpFigure.x + fig_width > this.x_size) {
                tmpFigure.x = 0;
            }

            // if position found
            if (this.pushFigureToBottom(tmpFigure)) {
                figure.x = tmpFigure.x;
                figure.y = tmpFigure.y;
                offsetX = figure.x + fig_width;

                return true;
            }

            tmpFigure.y = figure.y;
            tmpFigure.x++;
        }

        return false;
    }

    printMask(
        matrix: Array<Array<newFigurePosition | null>> | number[][] = this.mask,
        label?: string
    ) {
        const style = (id: number) =>
            `background: hsl(${
                (id * 16807) % 2147483647
            } 50% 30%); color: #fff`;
        let row = "";
        if (label)
            row += `${label} ${
                matrix == this.mask ? `, total ${this.figures.size}` : ""
            }\n`;
        const colors: string[] = [];
        for (let x = 0; x < matrix.length; x++) {
            for (let y = 0; y < matrix[x].length; y++) {
                const anything = matrix[x][y];
                if (typeof anything == "number") {
                    row += `%c`;
                    colors.push(
                        anything !== 0 ? style(anything as number) : ""
                    );
                }
                if (typeof anything == "number") {
                    if (anything == 0) {
                        row += "-";
                    } else {
                        row += anything;
                    }
                } else if (anything !== null) {
                    row += (anything as newFigurePosition).id;
                } else {
                    row += "-";
                }
                row += "\t";
            }
            row += "\n";
        }
        console.log(row, ...colors);
    }
}

export class TopReelWindow extends ReelWindow {
    drawFigure(figure: New_reel_figure) {
        this.mask[0][figure.x] = figure.id;
        return this;
    }
    pushAllToLeft(figures: New_reel_figure[] = [...this.figures.values()]) {
        const newFiguresPosition: New_reel_figure[] = [];
        const tmpTopWindow = new Array(this.x_size).fill(0);
        let offsetX = 0;

        for (let x = 0; x < this.y_size; x++) {
            if (this.mask[0][x] === 0) continue;
            tmpTopWindow[offsetX] = this.mask[0][x];
            offsetX++;
        }
        // set new positions and save
        for (let x = 0; x < this.y_size; x++) {
            if (this.mask[0][x] === tmpTopWindow[x]) continue;
            const figureID = tmpTopWindow[x];
            if (figureID !== 0) {
                const figureIndex = figures.findIndex(
                    (fig) => fig.id === figureID
                );
                if (figureIndex === -1) continue;
                const figure = figures[figureIndex];
                const figure_start_x = figure.x;
                figure.x = x;
                const pos = {
                    id: figure.id,
                    name: figure.name,
                    x: figure.x,
                    y: figure.y,
                };
                newFiguresPosition.push(pos);
                this.mask[0][figure_start_x] = 0;
            }

            this.mask[0][x] = tmpTopWindow[x];
        }
        return newFiguresPosition;
    }

    getMysteryPositions(
        topFigures: New_reel_figure[] = [...this.figures.values()]
    ) {
        const mysteryPositions = [];
        const y = 0;

        for (let x = 0; x < this.y_size; x++) {
            const figureID = this.mask[0][x];
            const figure = topFigures.find((fig) => fig.id === figureID);

            if (figure && mystery_regexp.test(figure.name)) {
                const pos = {
                    name: figure.name,
                    id: figure.id,
                    x: x,
                    y: y,
                };
                mysteryPositions.push(pos);
            }
        }

        return mysteryPositions;
    }

    deleteFigureFromWindow(_figure: New_reel_figure): this {
        const figure = this.figures.get(_figure.id);
        if (!figure) return this;

        const form = this.getForm(figure.name);
        const fig_width = Math.max(...form.map((w) => w.length));
        for (let y = 0; y < form.length; y++) {
            for (let x = 0; x < fig_width; x++) {
                if (form[y][x] === 0) {
                    this.mask[0][figure.x + x] = 0;
                }
            }
        }
        return this;
    }
}

/* 
// test case 
// @ts-ignore
window.topreelwindow = topreelwindow;
// @ts-ignore
window.reelwindow = reelwindow;

const sym: New_reel_figure = {
    id: 1,
    name: "l1",
    x: 0,
    y: 0,
};
const sym2 = { ...sym, id: 2, name: "l2", x: 1 };
const sym3 = { ...sym, id: 3, name: "l3", x: 2 };
topreelwindow.AddFigures([sym, sym2, sym3]);
topreelwindow.DeleteFigureByIds([1]);
topreelwindow.PrintMask();
console.log("PUSHEDLEFT", topreelwindow.PushAllToLeft());
*/
