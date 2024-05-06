export type freeMarixFieldType = null;
export type numberNullRowVectorMatrix = Array<number | freeMarixFieldType>;
export type numberNullRectangularMatrix = numberNullRowVectorMatrix[];

/**
 * Data of symbol point on matrix.
 * Has x,y position on matrix and bollean `symbolStart` true,
 * if symbol view will be spawned on this position slot
 *
 * @property {number} `x` position on matrix
 * @property {number} `y` position on matrix
 * @property {bool} `symbolStart` will symbol view be spawned by this point?
 */
export type symbolPointOnMatrixData = {
    x: number;
    y: number;
    // symbolStart: boolean;
};

/**
 * Array includes all points of symbol on particular reels matrix
 *
 * @example
 * array for symbol with hammer form in zero position on matrix
 * [ symbol form
 *  [,  0, ],
 *  [,  0, ],
 *  [,  0, ],
 *  [0, 0, 0],
 * ]
 * will have such values:
 * [                                   Positions illustration on matrix
 *  {x: 1, y: 0, symbolStart: false},  [x0 y0, x1 y0, x2 y0]
 *  {x: 1, y: 1, symbolStart: false},  [x0 y1, x1 y1, x2 y1]
 *  {x: 1, y: 2, symbolStart: false},  [x0 y2, x1 y2, x2 y2]
 *  {x: 0, y: 3, symbolStart: true},   [x0 y3, x1 y3, x2 y3]
 *  {x: 1, y: 3, symbolStart: false},
 *  {x: 2, y: 3, symbolStart: false},
 * ]
 */
export type symbolPointsOnMatrix = symbolPointOnMatrixData[];

export type BigWinKind = "Normal" | "Mega" | "Epic" | "2x2";
