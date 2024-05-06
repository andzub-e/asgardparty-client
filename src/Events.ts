// import { LogicState } from "./logic_state";

export const EVENTS = {
    spin_event: new Event("spin_event"),
    slam_stop_event: new Event("slam_stop_event"),

    increase_coin_value_event: new Event("increase_coin_value_event"),
    decrease_coin_value_event: new Event("decrease_coin_value_event"),

    increase_level_event: new Event("increase_level_event"),
    decrease_level_event: new Event("decrease_level_event"),

    increase_bet_event: new Event("increase_bet_event"),
    decrease_bet_event: new Event("decrease_bet_event"),

    open_bet_panels: new Event("open_bet_panels"),
    open_bet_values: new Event("open_bet_values"),

    autoplay_btn_clicked: new Event("autoplay_btn_clicked"),
    start_autospin_event: new Event("start_autospin_event"),
    stop_event: new Event("stop_event"),
    empty_event: new Event("empty_event"),
    skip_button_pressed: new Event("skip_button_pressed"),

    toggle_turbo: new Event("toggle_turbo"),

    sound_button_clicked: new Event("sound_button_clicked"),
    sound_off_button_clicked: new Event("sound_off_button_clicked"),
    open_settings: new Event("open_settings"),
    close_settings: new Event("close_settings"),
    close_history: new Event("close_history"),
    open_history: new Event("open_history"),
    close_bet: new Event("close_bet"),
    open_bet: new Event("open_bet"),

    close_autospin_settings: new Event("close_autospin_settings"),
    slider_single_win: new Event("slider_single_win"),
    slider_cash_increases: new Event("slider_cash_increases"),
    slider_cash_decreases: new Event("slider_cash_decreases"),

    toggle_autospin_single_win_exceeds_signal: new Event(
        "toggle_autospin_single_win_exceeds_signal"
    ),

    help_event: new Event("help_btn_clicked"),
    menu_event: new Event("menu_btn_clicked"),

    help_close_event: new Event("help_close_event"),
    help_next_event: new Event("help_next_event"),
    help_prev_event: new Event("help_prev_event"),

    open_mobile_bet_panel: new Event("open_mobile_bet_panel"),

    mobile_bet_panel_slider_event: new CustomEvent(
        "mobile_bet_panel_slider_event"
    ),

    mobile_bet_panel_button_bet: new CustomEvent("mobile_bet_panel_button_bet"),

    avalanche: new Event("avalanche"),

    big_win_start: new Event("big_win_start"),
    super_big_win_start: new Event("super_big_win_start"),
    mega_big_win_start: new Event("mega_big_win_start"),
    big_win_ended: new Event("big_win_ended"),

    spin_animation_end: new Event("spin_animation_end"),

    full_screen: new Event("full_screen"),

    signals: {
        toggle_stop_autospin_on_bonus_win: "toggle_stop_autospin_on_bonus_win",
    },
    events: {
        mute_toggled: "mute_toggled",
    },
};

for (const event of Object.values(EVENTS)) {
    if (event instanceof Event) {
        document.addEventListener(event.type, () => {
            console.log(`Event "${event.type}" fired.`);
            // console.log(LogicState.is_bonus_mode);
            // console.log(LogicState.first_free_spin);
        });
    }
}

export function waitForEvent(
    event_type: string,
    isWindow = false
): Promise<any> {
    if (isWindow) {
        return new Promise((resolve) => {
            window.addEventListener(event_type, resolve, {
                once: true,
            });
        });
    } else {
        return new Promise((resolve) => {
            document.addEventListener(event_type, resolve, {
                once: true,
            });
        });
    }
}
