import {
    numberNullRectangularMatrix,
    numberNullRowVectorMatrix,
} from "./types";

export type AppState = "pre_pre_loader" | "pre_loader" | "continue" | "game";
export type GameState = "base" | "bonus";
export type SlotMachineState = "idle" | "spin_start" | "spinning" | "spin_end";

export interface WagerBody {
    currency: string;
    session_token: string;
    wager: number;
    freespin_id?: string;
}

export interface ServerState extends SpinResult {
    THE_EJAW_SLOT: string;
    default_wager: number;
    username: string;
    wager_levels: number[];
    spins_indexes: Spin_indexes;
}

interface Spin_indexes {
    base_spin_index: number;
    bonus_spin_index: number;
}

export interface OldFormSpin {
    steps: SpinStepResult[];
    balance: number;
    free_spins_left: number;
    free_spins_total_win: number;
    total_free_spins: number;
    win: number;
}

export interface SpinStepResult {
    falled_all: symbolsMatrix;
    symbols_placed: symbolsMatrix;
    top_falled_all: symbolsMatrix;
    exchanged_mystery: numberNullRectangularMatrix;
    top_exchanged_mystery: numberNullRectangularMatrix;
    winID: number[] | null;
    payout: Payout;
    /** final avalanche positions */
    reel_final: symbolsMatrix;
    falled_mystery: symbolsMatrix;
    top_falled_mystery: symbolsMatrix;
    top_symbols_placed: symbolsMatrix;
    top_reel_final: symbolsMatrix;
    bonus_game: null | Reels;
    multiplier: number;
    free_spins_left: number;
    stage_win: number;

    /** Сумма выиграша в предыдущих стейджах */
    prev_stages_win: number;
    /**Сумма выигранных в предыдущих спинах и стейджах. Используется только при бонуске */
    prev_bonus_stages_win: number;
    new_figures_position: newFigurePosition[];
}

export interface SpinResult {
    balance: number;
    currency: string;
    last_wager: number;
    reels: Reels;
    session_token: string;
    spins_indexes: Spin_indexes;
    total_wins: number;
    wallet_play_id: string;
    free_spins_total_win: number;
}

export interface preSpinRes {
    indexes: numberNullRectangularMatrix;
    indexes_after_mystery: numberNullRectangularMatrix;
    mystery_changed_indexes: numberNullRectangularMatrix;
    top_reels_indexes: numberNullRowVectorMatrix;
    mystery_matrix: numberNullRectangularMatrix;
}

export interface Reels {
    amount: number;
    is_autospin: boolean;
    is_cheat_stops: boolean;
    is_turbospin: boolean;
    spins: Spin[];
}

export interface Spin {
    amount: number;
    free_spins_left?: number;
    stages: Stage[];
}

export interface newFigurePosition {
    id: number;
    x: number;
    y: number;
}

export interface Win {
    amount?: number;
    payline_index: number;
    streak: number;
}

export interface Stage {
    bonus_game: Reels | null;
    multiplier: number;
    new_figures_position: newFigurePosition[];
    new_reel_figures: New_reel_figure[];
    new_top_figures: New_reel_figure[];
    payouts: Payout;

    prev_bonus_stages_win: number;
}

export interface New_reel_figure {
    id: number;
    name: string;
    x: number;
    y: number;
}

export type nameMatrix = Array<Array<string | null>>;
export type symbolsMatrix = Array<Array<New_reel_figure | null>>;

export interface Payout {
    amount: number;
    values: Value[] | null;
}

export interface Value {
    amount: number;
    count: number;
    figures: number[];
    symbol: string;
}

export interface HistoryRes {
    spins_history: HistorySpin[];
    count: number;
    current_page: number;
    last_page: number;
    total: number;
}

export interface HistorySpin {
    balance: number;
    base_pay: number;
    bet: number;
    bonus_pay: number;
    currency: string;
    final_balance: number;
    finish_time: number;
    freespin_id: string;
    game: string;
    id: string;
    reels: Reels;
    round_id: string;
    start_time: number;
    transaction_id: string;
}
