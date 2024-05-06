export let dict: Record<string, Record<string, string>>;
export let lang: string;

export const setLanguage = async (language: string) => {
    lang = language;
    dict = await init_dictionary();
};

/**
 *
 * @param loc_path path to the csv file relative to the root of the project.
 * @returns loc sheet.
 */
export function parse(csv: string) {
    const data = CSVToArray(csv);
    const loc: Record<string, Record<string, string>> = {};

    try {
        const langs = data[0];

        for (let i = 1; i < langs.length; i++) {
            const lang = langs[i];

            loc[lang] = {};
        }

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const key = row[0];

            // start from 1 because 1 val in langs (row 0) is "name", not a lang
            for (let f = 1; f < langs.length; f++) {
                const lang = langs[f];

                const val = row[f];
                loc[lang][key] = val.replace(/\\n/g, "\n");
            }
        }

        return loc;
    } catch (err) {
        console.error(
            `Something went wrong, check if 1) Path is correct; 2) Csv file is valid. Error: ${err}`
        );

        return {};
    }
}

export async function init_dictionary() {
    const dict_data = await require("../assets/languages/localisation.csv");
    return parse(dict_data.default);
}

/* https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm */
function CSVToArray(strData: string, strDelimiter = ",") {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = strDelimiter || ",";

    // Create a regular expression to parse the CSV values.
    const objPattern = new RegExp(
        // Delimiters.
        "(\\" +
            strDelimiter +
            "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            '(?:"([^"]*(?:""[^"]*)*)"|' +
            // Standard fields.
            '([^"\\' +
            strDelimiter +
            "\\r\\n]*))",
        "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    const arrData = [[]] as string[][];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec(strData))) {
        // Get the delimiter that was found.
        const strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        let strMatchedValue = "";
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
        } else {
            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return arrData;
}

export function get_localized_text(key: TextKeys): string {
    if (dict[lang] && dict[lang][key]) {
        return dict[lang][key];
    } else {
        if (dict["en"][key]) {
            return dict["en"][key];
        } else {
            return key;
        }
    }
}

export function get_language(): string {
    return lang;
}

export type TextKeys =
    | "continue_asgard_party"
    | "popup_1"
    | "popup_2"
    | "popup_3"
    | "helpmenu_fs"
    | "continue_special_symbols"
    | "continue_special_sym_body_1"
    | "continue_special_sym_body_2"
    | "continue_lucky_triplet"
    | "continue_lucky_triplet_body"
    | "continue_winning_bet_lines"
    | "continue_win_bet_lines_body_1"
    | "continue_win_bet_lines_body_2"
    | "continue_win_bet_lines_body_3"
    | "continue_from_example"
    | "continue_button"
    | "continue_checkbox"
    | "mainui_win"
    | "mainui_bet"
    | "mainui_balance"
    | "bonus_total_win"
    | "helpmenu_autoplay_options"
    | "helpmenu_number_of_spins"
    | "helpmenu_stop_autoplay"
    | "helpmenu_on_any_win"
    | "helpmenu_if_free_spins"
    | "helpmenu_if_single_win"
    | "helpmenu_if_balance_increases"
    | "helpmenu_if_balance_decreases"
    | "helpmenu_total_bet"
    | "helpmenu_paytable"
    | "helpmenu_special_symbols"
    | "helpmenu_free_spins"
    | "helpmenu_free_spins_body"
    | "helpmenu_wild"
    | "helpmenu_wild_body"
    | "helpmenu_mystery"
    | "helpmenu_mystery_body"
    | "helpmenu_winning_bet_lines"
    | "helpmenu_win_bet_lines_body_1"
    | "helpmenu_win_bet_lines_body_2"
    | "helpmenu_win_bet_lines_body_3"
    | "helpmenu_from_example"
    | "helpmenu_win_bet_lines_body_4"
    | "helpmenu_win_bet_lines_body_5"
    | "helpmenu_sound_options"
    | "helpmenu_music_volume"
    | "helpmenu_sound_volume"
    | "helpmenu_mute"
    | "helpmenu_history"
    | "helpmenu_history_no"
    | "helpmenu_history_1"
    | "helpmenu_history_2"
    | "helpmenu_history_3"
    | "helpmenu_history_4"
    | "helpmenu_history_5"
    | "helpmenu_history_6"
    | "helpmenu_history_7"
    | "helpmenu_history_8"
    | "helpmenu_history_9"
    | "help_start"
    | "help_end"
    | "help_loading"
    | "help_settings"
    | "help_music"
    | "help_sound"
    | "helpmenu_spins"
    | "helpmenu_general_rules"
    | "helpmenu_general_rules_1"
    | "helpmenu_general_rules_2"
    | "helpmenu_general_rules_3"
    | "helpmenu_general_rules_4"
    | "helpmenu_general_rules_5"
    | "helpmenu_general_rules_6"
    | "helpmenu_general_rules_7"
    | "helpmenu_general_rules_8"
    | "helpmenu_general_rules_9"
    | "helpmenu_general_rules_10"
    | "helpmenu_general_rules_11"
    | "helpmenu_general_rules_12"
    | "helpmenu_general_rules_13"
    | "helpmenu_general_rules_14"
    | "helpmenu_general_rules_15";
