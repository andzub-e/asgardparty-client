import { LogicState } from "./logic_state";

import { HistoryRes, ServerState, WagerBody } from "./Models";
import { ECL } from "ecl";
import { SessionConfig } from "./SessionConfig";
import { SpinResult } from "./Models";
import { FreeSpin } from "ecl/dist/PFR";
import { waitForEvent } from "./Events";

export let make_spin: () => Promise<SpinResult>;
export let get_state: () => Promise<ServerState>;
export let get_history: (page: number, count: number) => Promise<HistoryRes>;
export let update_spins_indexes: () => Promise<void>;

const IS_REAL_SERVER = true;

if (IS_REAL_SERVER) {
    get_state = async () => {
        const body = JSON.stringify({
            operator: ECL.urlD.getOperator(),
            game: ECL.urlD.getGameId() || "test",
            params: ECL.urlD.getOperatorParams(),
        });

        console.log(JSON.parse(body));

        const result = await ECL.net.custom_fetch({
            method: "POST",
            uri: `${SessionConfig.API_ADDRESS}core/state`,
            timeout: 30000,
            body,
        });

        return result.data as ServerState;
    };

    make_spin = async () => {
        let free_spin_id: FreeSpin | undefined;

        if (LogicState.game_state === "base" && ECL.PFR.is_free_spinning) {
            free_spin_id = ECL.PFR.pop_free_spin();
        }

        LogicState.free_spin_id = free_spin_id;

        const body: WagerBody = {
            currency: ECL.urlD.getCurrencyKey(),
            session_token: LogicState.server_state!.session_token,
            freespin_id: free_spin_id && free_spin_id.id,
            wager: LogicState.getBet(),
        };

        const result = await ECL.net.custom_fetch({
            method: "POST",
            uri: `${SessionConfig.API_ADDRESS}core/wager`,
            body: JSON.stringify(body),
            timeout: 30000,
        });

        return Promise.resolve(result.data);
    };

    get_history = async (page: number, count: number) => {
        const result = await ECL.net.custom_fetch({
            method: "GET",
            uri: `${
                SessionConfig.API_ADDRESS
            }core/spins_history?session_token=${
                LogicState.spin_result!.session_token
            }&count=${count}&page=${page}&game=test`,
            timeout: 30000,
        });

        return result.data as HistoryRes;
    };

    update_spins_indexes = async () => {
        try {
            const res = await ECL.net.custom_fetch({
                method: "POST",
                uri: `${SessionConfig.API_ADDRESS}core/spin_indexes/update`,
                body: JSON.stringify({
                    base_spin_index: LogicState.currentSpinStage - 1,
                    bonus_spin_index: LogicState.currentBonusSpinStep,
                    session_token: LogicState.server_state!.session_token,
                }),
            });

            console.log(res);
            return res.data;
        } catch (err) {
            await waitForEvent("online", true);
            update_spins_indexes();
        }
    };
}

// prettier-ignore
make_spin = async () => {
    let free_spin_id: FreeSpin | undefined;

    if (LogicState.game_state === "base" && ECL.PFR.is_free_spinning) {
        free_spin_id = ECL.PFR.pop_free_spin();
    }

    LogicState.free_spin_id = free_spin_id;

    const body: WagerBody = {
        currency: ECL.urlD.getCurrencyKey(),
        session_token: LogicState.server_state!.session_token,
        freespin_id: free_spin_id && free_spin_id.id,
        wager: LogicState.getBet(),
    };

    const result = await ECL.net.custom_fetch({
        method: "POST",
        uri: `${SessionConfig.API_ADDRESS}core/wager`,
        body: JSON.stringify(body),
        timeout: 30000,
    });
    return Promise.resolve(result.data);
};
