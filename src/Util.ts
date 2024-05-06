// import { Config } from "./Config";
import { Config } from "./Config";
import { LogicState } from "./logic_state";

const reelsEmptyMatrixForClone = new Array(Config.reels_count)
    .fill(0)
    .map(() => new Array(Config.symbols_count).fill(null));

/**
 * Clamps number.
 * @param num value
 * @param min lower limit
 * @param max upper limit
 */
export function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}

/**
 * Return coin equivalent of given amount.
 * @param cents money in cents.
 */
// export function moneyToCoins(cents: number) {
//     return (cents / LogicState.getCoinValue()).toFixed(0);
// }

/**
 * Return money equivalent of given amount.
 * @param coins money in coins.
 */
export function coinsToMoney(coins: number) {
    return coins * LogicState.getCoinValue();
}

export function stop_spine_animation(
    anim: PIXI.spine.Spine | undefined | null,
    track_index = 0,
    visible = true
) {
    if (anim) {
        anim.skeleton.setToSetupPose();
        anim.state.clearTrack(track_index);
        //@ts-ignore
        anim.lastTime = 0;
        anim.visible = visible;
    }
}

export function getQueryParam(item: string) {
    const svalue = window.location.search.match(
        new RegExp("[?&]" + item + "=([^&]*)(&?)", "i")
    );
    return svalue ? svalue[1] : svalue;
}

export function getEmptyReelsMatrix() {
    return objectJsonCopy(reelsEmptyMatrixForClone);
}

/**
 * Makes all indexes above the visible symbol matrix to the null value
 */
export function removeOutOfReelsIndexesForMatrix(
    matrix: Array<Array<number | null>>
) {
    for (let i = 0; i < matrix.length; i++) {
        const reel = matrix[i];

        reel.fill(null, 0, Config.out_of_top_symbols_count);
    }
}

export function exchangeMinusOneValueToNullForMatrix(
    matrix: Array<Array<number | null>>
) {
    for (let i = 0; i < matrix.length; i++) {
        const reel = matrix[i];

        for (let j = 0; j < reel.length; j++) {
            if (reel[j] === -1) {
                reel[j] = null;
            }
        }
    }
}

export function objectJsonCopy<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
}

// For convenient logs debuggins
export function getTransposedMatrix<T>(matrix: T[][]) {
    const width = matrix[0].length;
    const height = matrix.length;
    const transposedMatrix: T[][] = [];

    for (let i = 0; i < width; i++) {
        transposedMatrix[i] = [];

        for (let j = 0; j < height; j++) {
            transposedMatrix[i].push(matrix[j][i]);
        }
    }

    return transposedMatrix;
}

export function rescale_to_width(
    target_text: PIXI.Container,
    target_width = 0,
    scale = 0
) {
    if (scale) {
        target_text.scale.set(scale);
        return scale;
    }
    const scale_value = Math.min(
        (target_text.scale.x * target_width) / target_text.width,
        1
    );
    target_text.scale.set(scale_value);

    return scale_value;
}

export function delayedCallback(callback: () => void, time: number) {
    const ticker = PIXI.Ticker.shared;
    let currentTime = 0;

    const process = (delta: number) => {
        currentTime += (1000 / 60) * delta;

        if (currentTime >= time) {
            callback();
            ticker.remove(process);
        }
    };

    ticker.add(process);
    return {
        process,
        destroy: () => {
            ticker.remove(process);
        },
    };
}

export function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        delayedCallback(resolve, ms);
    });
}

export function debug_stop(num?: unknown) {
    return new Promise<void>((resolve) => {
        const listener = () => {
            document.removeEventListener("click", listener);
            console.log(
                "%c DEBUG PLAY",
                "background: #000; color: #00FF00; font-size: 20px",
                num
            );
            resolve();
        };
        document.addEventListener("click", listener);
        console.log(
            "%c DEBUG STOP",
            "background: #000; color: #FFFF00; font-size: 20px",
            num
        );
    });
}

/**
 * Returns a promise and its callbacks outside the scope
 */
export function deferrify<T = void>() {
    let resolve: (value: T | PromiseLike<T>) => void = () => {};
    let reject: (reason?: unknown) => void = () => {};
    const promise = new Promise<T>((resolveFunc, rejectFunc) => {
        resolve = resolveFunc;
        reject = rejectFunc;
    });
    return { promise, resolve, reject };
}

/**
 * The function generates x,y points which are passed to the callback.
 * Each callback passes a new point offset from the previous point .
 * The callback function is called for each object passed in the object_array argument.
 * The developer independently determines the processing of callback arguments.
 * Useful for positioning graphics, arranging columns, rows for given graphic objects
 * @param object_array Array of incoming objects
 * @param elems_per_line Number of points in X
 * @param start_x Starting coordinate X of the first object
 * @param start_y Starting coordinate Y of the first object
 * @param space_x Distance between points X
 * @param space_y Distance between points Y
 * @param callback Callback called for each object, to set coordinates or other action
 */
export function grid_util<T>(
    object_array: T[] = [],
    elems_per_line: number,
    start_x: number,
    start_y: number,
    space_x: number,
    space_y: number,
    /**
     * @param value Object from input array
     * @param point_x Calculated X coordinate
     * @param point_y Calculated Y coordinate
     * @param index Index of the current object in the array
     */
    callback: (
        value: T,
        point_x: number,
        point_y: number,
        index: number
    ) => void
) {
    for (let i = 0, total_elems = object_array.length; total_elems > i; i++) {
        const x = i % elems_per_line;
        const y = (i / elems_per_line) | 0;
        const total_elems_at_line = Math.min(
            elems_per_line,
            total_elems - y * elems_per_line
        );
        const x_offset = x + (elems_per_line - total_elems_at_line) / 2;

        const point_x = start_x + space_x * x_offset;
        const point_y = start_y + space_y * y;

        callback(object_array[i], point_x, point_y, i);
    }
}
