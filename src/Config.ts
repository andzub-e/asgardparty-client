const symbolsScale = 1;

const regularSymbolsSize = new PIXI.Point(
    104 * symbolsScale,
    103 * symbolsScale
);
const regularSymbolsOffset = new PIXI.Point();

export const Config = {
    game_width: 1440,
    game_height: 810,
    number_of_columns: 5,
    info_wins_keys: [
        "15\n20\n30\n40\n50",
        "5\n7\n12\n20\n30",
        "15\n20\n30\n40\n50",
        "5\n7\n12\n20\n30",
        "10\n12\n20\n35\n55",
        "10\n12\n20\n35\n55",
    ],
    info_textures_keys: [
        "Mid2_Symbol_1х1.png",
        "Low2_Symbol.png",
        "Mid1_Symbol_1х1.png",
        "Low1_Symbol.png",
        "Low4_Symbol.png",
        "Low3_Symbol.png",
    ],
    main_textures_keys: [
        "Wild_Symbol.png",
        "Bonus_Symbol.png",

        "Mystery_Symbol_1х1.png",
        "Mystery_Symbol_2х2.png",
        "Mystery_Symbol_3х3.png",
        "Mystery_Symbol_4х4.png",

        "Hi2_Symbol.png",
        "Hi1_Symbol.png",

        "Hi3_Symbol_2x3.png",
        "Hi3_Symbol_1x2.png",

        "Mid1_Symbol_3х3.png",
        "Mid2_Symbol_3х3.png",

        "Mid1_Symbol_2х2.png",
        "Mid2_Symbol_2х2.png",

        "Mid1_Symbol_1х1.png",
        "Mid2_Symbol_1х1.png",

        "Low3_Symbol.png",
        "Low2_Symbol.png",
        "Low4_Symbol.png",
        "Low1_Symbol.png",
    ],
    inactive_textures_keys: [
        "Wild_Symbol.png",
        "Bonus_Symbol.png",

        "Mystery_Symbol_1х1.png",
        "Mystery_Symbol_2х2.png",
        "Mystery_Symbol_3х3.png",
        "Mystery_Symbol_4х4.png",

        "Hi2_Symbol.png",
        "Hi1_Symbol.png",

        "Hi3_Symbol_2x3.png",
        "Hi3_Symbol_1x2.png",

        "Mid1_Symbol_3х3.png",
        "Mid2_Symbol_3х3.png",

        "Mid1_Symbol_2х2.png",
        "Mid2_Symbol_2х2.png",

        "Mid1_Symbol_1х1.png",
        "Mid2_Symbol_1х1.png",

        "Low3_Symbol.png",
        "Low2_Symbol.png",
        "Low4_Symbol.png",
        "Low1_Symbol.png",
    ],
    symbols_sizes: [
        regularSymbolsSize, // Wild

        regularSymbolsSize, // Bonus

        regularSymbolsSize, // Mystery 1*1
        { x: regularSymbolsSize.x * 2, y: regularSymbolsSize.y * 2 }, // Mystery 2*2
        { x: regularSymbolsSize.x * 3, y: regularSymbolsSize.y * 3 }, // Mystery 3*3
        { x: regularSymbolsSize.x * 4, y: regularSymbolsSize.y * 4 }, // Mystery 4*4

        { x: regularSymbolsSize.x * 3, y: regularSymbolsSize.y * 3 }, // Hi2

        {
            x: regularSymbolsSize.x * 3,
            y: regularSymbolsSize.y * 4,
        }, // Hi1

        { x: regularSymbolsSize.x * 2, y: regularSymbolsSize.y * 4 }, // Hi3 2*4
        { x: regularSymbolsSize.x, y: regularSymbolsSize.y * 2 }, // Hi3 1*2

        { x: regularSymbolsSize.x * 3, y: regularSymbolsSize.y * 3 }, // Mid1 3*3
        { x: regularSymbolsSize.x * 3, y: regularSymbolsSize.y * 3 }, // Mid2 3*3
        { x: regularSymbolsSize.x * 2, y: regularSymbolsSize.y * 2 }, // Mid1 2*2
        { x: regularSymbolsSize.x * 2, y: regularSymbolsSize.y * 2 }, // Mid2 2*2
        regularSymbolsSize, // Mid1 1*1
        regularSymbolsSize, // Mid2 1*1

        regularSymbolsSize, // Low 1
        regularSymbolsSize, // Low 2
        regularSymbolsSize, // Low 3
        regularSymbolsSize, // Low 4
    ],
    symbols_offsets: [
        regularSymbolsOffset, // Wild

        regularSymbolsOffset, // Bonus

        regularSymbolsOffset, // Mystery 1*1
        new PIXI.Point(regularSymbolsSize.x * 0.5, regularSymbolsSize.y * 0.5), // Mystery 2*2
        new PIXI.Point(regularSymbolsSize.x * 1, regularSymbolsSize.y * 1), // Mystery 3*3
        new PIXI.Point(regularSymbolsSize.x * 1.5, regularSymbolsSize.y * 1.5), // Mystery 4*4

        new PIXI.Point(regularSymbolsSize.x * 1, regularSymbolsSize.y * 1), // Hi2

        new PIXI.Point(
            regularSymbolsSize.x * 1,
            regularSymbolsSize.y * 1.45 + 15
        ), // Hi1

        new PIXI.Point(regularSymbolsSize.x * 0.5, regularSymbolsSize.y * 1.5), // Hi3 2*4
        new PIXI.Point(0, regularSymbolsSize.y * 0.5), //Hi3 1*2

        new PIXI.Point(regularSymbolsSize.x * 1, regularSymbolsSize.y * 1), // Mid1 3*3
        new PIXI.Point(regularSymbolsSize.x * 1, regularSymbolsSize.y * 1), // Mid2 3*3
        new PIXI.Point(regularSymbolsSize.x * 0.5, regularSymbolsSize.y * 0.5), // Mid1 2*2
        new PIXI.Point(regularSymbolsSize.x * 0.5, regularSymbolsSize.y * 0.5), // Mid2 2*2
        regularSymbolsOffset, // Mid1 1*1
        regularSymbolsOffset, // Mid2 1*1

        regularSymbolsOffset, // Low 1
        regularSymbolsOffset, // Low 2
        regularSymbolsOffset, // Low 3
        regularSymbolsOffset, // Low 4
    ],
    symbolsForms: [
        // "0" - filled, "void" - free
        [[0]], // Wild

        [[0]], // Bonus

        [[0]], // Mystery 1*1
        [
            // Mystery 2*2
            [0, 0],
            [0, 0],
        ],
        [
            // Mystery 3*3
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ],
        [
            // Mystery 4*4
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],

        [
            // Hi2
            [, 0],
            [0, 0, 0],
            [, 0],
        ],

        [
            // Hi 1
            [, 0],
            [, 0],
            [, 0],
            [0, 0, 0],
        ],

        [
            // Hi3 2*4
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
        ],

        [
            //Hi3 1*2
            [0],
            [0],
        ],

        [
            // Mid1 1*3
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ],
        [
            // Mid2 2*3
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ],
        [
            // Mid1 1*2
            [0, 0],
            [0, 0],
        ],
        [
            // Mid2 2*2
            [0, 0],
            [0, 0],
        ],
        [[0]], // Mid1 1*1
        [[0]], // Mid2 2*1

        [[0]], // Low 1
        [[0]], // Low 2
        [[0]], // Low 3
        [[0]], // Low 4
    ] as Array<Array<Array<0 | undefined>>>,
    /**
     * The start points for each symbol form.
     * Start point for every form will be calculated as
     * the lower and the lefter fill point on symbol form
     *
     * @example
     * Start point for symbol with hammer form
     * [ symbol form
     *  [,  0, ],
     *  [,  0, ],
     *  [,  0, ],
     *  [0, 0, 0],
     * ]
     * will be {x: 0, y: 3}
     * Start point for symbol with cross form
     * [ symbol form
     *  [,  0,  ],
     *  [0, 0, 0],
     *  [,  0,  ],
     * ]
     * will be {x: 1, y: 2}
     *  [[1,0,1],[0,0,0],[1,0,1]]
     */
    // symbolsFormsStartPoints: [] as PIXI.Point[], // Calculates below
    symbolsWeights: [
        70, // Wild

        70, // Bonus

        100, // Mystery 1*1
        100, // Mystery 2*2
        100, // Mystery 3*3
        100, // Mystery 4*4

        120, // Hi2

        120, // Hi1

        120, // Hi3 2*4
        120, // Hi3 1*2

        140, // Mid1 3*3
        140, // Mid2 3*3
        140, // Mid1 2*2
        140, // Mid2 2*2
        140, // Mid1 1*1
        140, // Mid2 1*1

        150, // Low 1
        150, // Low 2
        180, // Low 3
        190, // Low 4
    ],
    symbols_to_index: [
        "w", // Wild
        "f", // Bonus
        "m1", // Mystery 1*1
        "m2", // Mystery 2*2
        "m3", // Mystery 3*3
        "m4", // Mystery 4*4
        "c", // Hi2
        "h", // Hi1
        "r2", // Hi3 2*4
        "r1", // Hi3 1*2
        "m13", // Mid1 3*3
        "m23", // Mid2 3*3
        "m12", // Mid1 2*2
        "m22", // Mid2 2*2
        "m11", // Mid1 1*1
        "m21", // Mid2 1*1
        "l1", // Low 1
        "l2", // Low 2
        "l3", // Low 3
        "l4", // Low 4
    ],
    symbolsWinsMaps: [
        // Symbols can get win with other symbols
        [0, 6],
        [0, 7],
        [0, 8, 9],
        [0, 10, 12, 14],
        [0, 11, 13, 15],
        [0, 16],
        [0, 17],
        [0, 18],
        [0, 19],
    ],

    symbol_animations_keys: [
        {
            asset_name: "wild_symbol",
            animation_name: "animation",
            offset: [52, 52],
            scale: symbolsScale,
        },
        {
            asset_name: "bonus_symbol",
            animation_name: "animation",
            offset: [52, 52],
            scale: symbolsScale,
        },
        {
            asset_name: "mystery_symbol",
            animation_name: "animation",
            offset: [0, -3],
            scale: symbolsScale / 4,
        },
        {
            asset_name: "mystery_symbol",
            animation_name: "animation",
            offset: [0, -110],
            scale: symbolsScale / 2,
        },
        {
            asset_name: "mystery_symbol",
            animation_name: "animation",
            offset: [0, -215],
            scale: (symbolsScale * 3) / 4,
        },
        {
            asset_name: "mystery_symbol",
            animation_name: "animation",
            offset: [0, -322],
            scale: symbolsScale,
        },
        {
            asset_name: "сross_symbol",
            animation_name: "animation",
            offset: [-112, -220],
            scale: symbolsScale,
        },
        {
            asset_name: "hammer_symbol",
            animation_name: "animation",
            offset: [-5, -306],
            scale: symbolsScale,
        },
        {
            asset_name: "thor_symbol",
            animation_name: "animation",
            offset: [-5, -315],
            scale: symbolsScale,
        },
        {
            asset_name: "thor_symbol",
            animation_name: "animation",
            offset: [-2, -105],
            scale: symbolsScale / 2,
        },
        {
            asset_name: "mid1_symbol",
            animation_name: "animation",
            offset: [1, -205],
            scale: symbolsScale,
        },
        {
            asset_name: "mid2_symbol",
            animation_name: "animation",
            offset: [4, -211],
            scale: symbolsScale,
        },
        {
            asset_name: "mid1_symbol",
            animation_name: "animation",
            offset: [0, -103],
            scale: (symbolsScale * 2) / 3,
        },
        {
            asset_name: "mid2_symbol",
            animation_name: "animation",
            offset: [3, -108],
            scale: (symbolsScale * 2) / 3,
        },
        {
            asset_name: "mid1_symbol",
            animation_name: "animation",
            offset: [0, 0],
            scale: symbolsScale / 3,
        },
        {
            asset_name: "mid2_symbol",
            animation_name: "animation",
            offset: [1, -1],
            scale: symbolsScale / 3,
        },
        {
            asset_name: "low2_symbol",
            animation_name: "animation",
            offset: [-1, -14],
            scale: symbolsScale,
        },
        {
            asset_name: "low4_symbol",
            animation_name: "animation",
            offset: [2, -6],
            scale: symbolsScale,
        },
        {
            asset_name: "low3_symbol",
            animation_name: "animation",
            offset: [-5, -10],
            scale: symbolsScale,
        },
        {
            asset_name: "low1_symbol",
            animation_name: "animation",
            offset: [-4, -10],
            scale: symbolsScale,
        },
    ],

    wild_anim_index: 4,

    wild_index: 0,
    scatter_index: 1,

    scatters_amount_for_bonus_game: 3,

    mystery_indexes: [2, 3, 4, 5],

    reels_count: 7,
    symbols_count: 5 + 4,
    out_of_top_symbols_count: 4,
    cell_width: 104,
    cell_height: 103,
    symbol_width: regularSymbolsSize.x,
    symbol_height: regularSymbolsSize.y,
    reels_x: (1440 - 191 * 5) / 2,
    reels_y: 120,
    reels_margin: 0,
    symbols_drop_delay: 100,
    reels_drop_delay: 100,
    symbols_drop_duration: 300,
    multiplier_switch_duration: 200,
    show_all_paylines_duration: 2000,
    show_single_payline_duration: 1000,
    big_win_countup_duration: 5000,
    bonus_mode_transition_duration: 1000,
    big_win_congrats_showup_duration: 1000,
    available_levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    available_coin_values: [1, 10, 100, 1000, 10000],
    available_autoplay_values: [10, 20, 50, 75, 100],
    available_loss_limit_values: [10, 20, 50, 100, 1000, 2000, 5000],
    stop_on_win_above_values: [10, 20, 50, 100, 1000, 2000, 5000],
    big_win_ratios: {
        big_win: 15,
        super_big_win: 30,
        mega_big_win: 60,
    },
    paylines: [
        // @TODO remove
        [1, 1, 1, 1, 1], //Line 1
        [0, 0, 0, 0, 0], //Line 2
        [2, 2, 2, 2, 2], //Line 3
        [0, 1, 2, 1, 0], //Line 4
        [2, 1, 0, 1, 2], //Line 5
        [0, 0, 1, 0, 0], //Line 6
        [2, 2, 1, 2, 2], //Line 7
        [1, 2, 2, 2, 1], //Line 8
        [1, 0, 0, 0, 1], //Line 9
        [1, 0, 1, 0, 1], //Line 10
        [1, 2, 1, 2, 1], //Line 11
        [0, 1, 0, 1, 0], //Line 12
        [2, 1, 2, 1, 2], //Line 13
        [1, 1, 0, 1, 1], //Line 14
        [1, 1, 2, 1, 1], //Line 15
        [0, 1, 1, 1, 0], //Line 16
        [2, 1, 1, 1, 2], //Line 17
        [0, 1, 2, 2, 2], //Line 18
        [2, 1, 0, 0, 0], //Line 19
        [0, 2, 0, 2, 0], //Line 20
    ],
    payouts: [
        [3, 10, 25], //Symbol 0 @TODO make correct payoutss
        [4, 15, 50], //Symbol 1
        [5, 20, 75], //Symbol 2
        [10, 25, 200], //Symbol 3
        [15, 50, 500], //Symbol 4
        [20, 75, 1000], //Symbol 5
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
        [45, 100, 2500], //Symbol new
    ],
    payments_keys_by_indexes: {
        A: [17],
        B: [19],
        C: [18],
        D: [16],
        O: [11, 13, 15],
        P: [10, 12, 14],
        X: [8, 9],
        Y: [6],
        Z: [7],
    },

    payments: {
        0: [1, 2, 3, 5],
        1: [1, 2, 3, 5],
        2: [1, 2, 3, 5],
        4: [1, 2, 3, 5],
        3: [2, 3, 4, 7],
        5: [2, 3, 4, 7],
        6: [3, 4, 5, 8],
        7: [3, 4, 5, 8],
        8: [5, 6, 8, 15],
    },

    autospin_any_win_exceeds_values: [0, 1],
    autospin_free_spins_won_exceeds_values: [0, 1],
    autospin_single_win_exceeds_values: [
        0, 2, 3, 4, 5, 10, 15, 20, 25, 30, 50, 100,
    ],
    autospin_cash_increases_values: [
        0, 2, 3, 4, 5, 10, 15, 20, 25, 30, 50, 100,
    ],
    autospin_cash_decreases_values: [
        0, 2, 3, 4, 5, 10, 15, 20, 25, 30, 50, 100,
    ],
    pressed_button: 0,
    show_win_by_win_animations_duration: 1500,
    show_win_animations_duration: 2000,
    multiplier_count: 0,
    symbolsWins: {
        0: "Wild substitutes\nfor all symbols,\nexcept Mystery\nand Bonus.",
        1: "Landing three\nBonuses will\ntrigger FreeSpins.",
        2: "Mystery symbols\nreveal same\nrandomly chosen\nsymbol.",
        3: "Mystery symbols\nreveal same\nrandomly chosen\nsymbol.",
        4: "Mystery symbols\nreveal same\nrandomly chosen\nsymbol.",
        5: "Mystery symbols\nreveal same\nrandomly chosen\nsymbol.",
        6: [5, 6, 8, 15],
        7: [3, 4, 5, 8],
        8: [3, 4, 5, 8],
        9: [3, 4, 5, 8],
        10: [2, 3, 4, 7],
        11: [2, 3, 4, 7],
        12: [2, 3, 4, 7],
        13: [2, 3, 4, 7],
        14: [2, 3, 4, 7],
        15: [2, 3, 4, 7],
        16: [1, 2, 3, 5],
        17: [1, 2, 3, 5],
        18: [1, 2, 3, 5],
        19: [1, 2, 3, 5],
    },
};
