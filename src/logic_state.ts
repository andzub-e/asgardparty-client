import { FreeSpin } from "ecl/dist/PFR";
import { Config } from "./Config";
import {
    AppState,
    GameState,
    New_reel_figure,
    OldFormSpin,
    Payout,
    ServerState,
    SlotMachineState,
    Spin,
    SpinStepResult,
    symbolsMatrix,
} from "./Models";
import { Subject } from "./Observer";
import { Reel } from "./SlotMachine/Reel";
import { TopReel } from "./SlotMachine/TopReel";
import { numberNullRectangularMatrix } from "./types";
import { getEmptyReelsMatrix } from "./Util";

declare const __ENVIRONMENT__: string;
interface before_bonus {
    currentStep: number;
    spinSave: OldFormSpin | null;
}

interface total {
    balance: number;
    win: number;
}
export class LogicStateClass extends Subject {
    currentSpinStage = 0;
    /** Текущий Спин бонуса */
    currentBonusSpinStep = 0;

    box: total = {
        balance: 0,
        win: 0,
    };
    payout: Payout = { amount: 0, values: null };

    reels_target_symbols: Reel[] = [];
    top_reels_target_symbols?: TopReel;

    stage_win = 0;

    before_bonus: before_bonus = {
        currentStep: 0,
        spinSave: null,
    };

    current_multipliers = 0;

    symbols?: symbolsMatrix;
    /** Бонусные Спины текущего Базового Спина  */
    originBonus: Spin[] = [];

    is_mystery = false;

    historyStep?: SpinStepResult;
    free_spin_id: FreeSpin | undefined;

    is_error = false;

    server_state?: ServerState;
    spin_result?: ServerState;

    end_fs_after_restore = false;

    is_mobile = false;
    is_landscape = true;
    is_bonus_mode = false;
    balance = 1000000;
    win = 0;
    win_bonus_total = 0;
    coin_value_index = 2;
    level_index = 2;
    private _app_state: AppState = "pre_pre_loader";
    private _game_state: GameState = "base";
    private _sm_state: SlotMachineState = "idle";
    is_autoplay = false;
    should_be_autoplay = false;
    autoplay_spins_remaining = 0;
    autoplay_start_balance = 0;

    isMainScreen = true;

    autospin_single_win_exceeds = 10;
    autospin_cash_increases = 10;
    autospin_cash_decreases = 10;

    autospin_single_win_exceeds_flag = false;
    autospin_cash_increases_flag = false;
    autospin_cash_decreases_flag = false;
    autospin_any_win_flag = false;
    autospin_bonus_win_flag = false;

    autoplay_loss_limit: number | null = null;
    autoplay_win_above: number | null = null;
    autoplay_stop_on_fs = false;
    is_infinite_autoplay = false;

    spin_mode: "base" | "turbo" = "base";
    slam_stop = false;
    skip_button_pressed = false;

    total_win = 0;

    free_spins_left = 0;
    free_spins_total_win = 0;
    first_free_spin = false;

    is_music_on = true;
    are_sound_fx_on = true;
    music_volume = 1;
    sound_fx_volume = 1;
    // sound_button_pressed = false;

    is_fullscreen = false;

    avalancheIndexes: symbolsMatrix = [];
    avalancheMystery: symbolsMatrix = [];

    // avalancheIndexes: any = [];

    current_mystery_fall: symbolsMatrix = [];
    current_new_reel_figures: New_reel_figure[] = [];

    avalancheIndexesTopReels: symbolsMatrix = [];
    current_mystery_changed_indexes: numberNullRectangularMatrix = [];
    current_mystery_top_changed_indexes: numberNullRectangularMatrix = [];
    current_mystery_matrix: numberNullRectangularMatrix = [];
    start_symbols = [0, 1, 2, 14, 15, 16, 17, 18, 19];

    current_reels_indexes: numberNullRectangularMatrix =
        getEmptyReelsMatrix().map((reel) =>
            reel.map(
                () =>
                    this.start_symbols[
                        Math.floor(Math.random() * this.start_symbols.length)
                    ]
            )
        );

    current_top_reels_indexes: symbolsMatrix = [[null, null, null]];
    current_reels_symbols: symbolsMatrix = getEmptyReelsMatrix();
    current_falled_symbols: symbolsMatrix = getEmptyReelsMatrix();

    win_matrix: number[] | null = null;

    get app_state() {
        return this._app_state;
    }

    set app_state(new_state: AppState) {
        this._app_state = new_state;
        this.notify_all();
    }

    get game_state() {
        return this._game_state;
    }

    set game_state(new_state: GameState) {
        this._game_state = new_state;
        this.notify_all();
    }

    get sm_state() {
        return this._sm_state;
    }

    set sm_state(new_state: SlotMachineState) {
        this._sm_state = new_state;
        console.log(new_state);
        this.notify_all();
    }

    constructor() {
        super();

        document.addEventListener("increase_bet_event", this.increaseBet);
        document.addEventListener("decrease_bet_event", this.decreaseBet);
    }

    increaseBet = () => {
        if (
            this.level_index <
            LogicState.server_state!.wager_levels.length - 1
        ) {
            this.level_index++;
        }
        this.notify_all();
    };

    decreaseBet = () => {
        if (this.level_index > 0) {
            this.level_index--;
        }
        this.notify_all();
    };

    getCoinValue = () => {
        return Config.available_coin_values[this.coin_value_index];
    };

    getLevel = () => {
        return Config.available_levels[this.level_index];
    };

    getBet = () => {
        return this.server_state!.wager_levels[this.level_index];
    };
    pressed_button = false;
}

export const LogicState = new LogicStateClass();

export const change_app_state = (new_state: AppState) => {
    LogicState.app_state = new_state;
    // log_state("SWITCH APP STATE", new_state);
};

// const log_state = (action: string, payload: AppState) => {
//     console.log(`Action: `);
//     console.log(action);
//     console.log(`Payload: `);
//     console.log(payload);
//     console.log(`New state: `);
//     console.log(LogicState);
// };
