import { SessionConfig, SessionConfigType, Languages } from "./SessionConfig";
import { FONTS } from "./Assets";

import { ECL } from "ecl";
// import { ServerState } from "./Models";
import { check_free_spins } from "ecl/dist/PFR";
import { LogicState } from "./logic_state";
import { AUDIO_MANAGER } from "./AudioManager";
export class PrePreloader {
    readonly container: PIXI.Container;
    private readonly app: PIXI.Application;
    private loading_icon?: PIXI.Graphics;
    on_preloader_loaded_event: Event;

    constructor(app: PIXI.Application, on_preloader_loaded_event: Event) {
        this.app = app;
        this.on_preloader_loaded_event = on_preloader_loaded_event;
        this.container = new PIXI.Container();
        this.get_session_params().then(this.set_session_params);
    }

    get_session_params = (): Promise<SessionConfigType> => {
        const url =
            `${window.location.origin}${window.location.pathname}`.replace(
                "index.html",
                ""
            );

        const ASSETS_ADDRESS = `${url}assets/`;
        const API_ADDRESS = window.location.href;

        console.log("API_ADDRESS", API_ADDRESS);
        console.log("ASSETS_ADDRESS", ASSETS_ADDRESS);

        return Promise.resolve({
            ASSETS_ADDRESS: ASSETS_ADDRESS,
            API_ADDRESS: API_ADDRESS,
            LANGUAGE: ECL.urlD.getLang() as Languages,
            LOCALE: ECL.urlD.getLocale(),
            CURRENCY: ECL.urlD.getCurrencyKey(),
            enableAutoSpin: ECL.urlD.enableAutoSpin(),
            enableTurbo: ECL.urlD.enableTurboSpin(),
            enableSlamStop: ECL.urlD.enableSlamStop(),
        });
    };

    set_session_params = (params: SessionConfigType) => {
        SessionConfig.ASSETS_ADDRESS = params.ASSETS_ADDRESS;
        SessionConfig.API_ADDRESS = params.API_ADDRESS;
        SessionConfig.LANGUAGE = params.LANGUAGE;
        SessionConfig.LOCALE = params.LOCALE;
        SessionConfig.CURRENCY = params.CURRENCY;
        SessionConfig.enableAutoSpin = params.enableAutoSpin;
        SessionConfig.enableTurbo = params.enableTurbo;
        SessionConfig.enableSlamStop = params.enableSlamStop;

        // this.load_assets();

        this.uppdate_state().then(this.load_assets);
    };

    uppdate_state = async () => {
        SessionConfig.API_ADDRESS =
            process.env.API_ADDRESS ||
            "https://dev.heronbyte.com/asgardparty/api/";

        const state = await ECL.init("asgardparty", SessionConfig.API_ADDRESS);

        check_free_spins(
            "en-US",
            "USD",
            SessionConfig.API_ADDRESS,
            state.session_token
        );

        LogicState.server_state = state;
        LogicState.spin_result = state;
        LogicState.level_index = state.wager_levels.indexOf(
            state.default_wager
        );
        LogicState.balance = LogicState.box.balance = state.balance;

        LogicState.currentSpinStage = state.spins_indexes.base_spin_index;
        console.log(
            "LogicState.currentSpinStage",
            state.spins_indexes.base_spin_index
        );
        LogicState.currentBonusSpinStep = state.spins_indexes.bonus_spin_index;

        console.log("RESTORE STATE", state);

        // @ts-ignore
        window.ServerState = state;
        // @ts-ignore
        window.ECL = ECL;
    };

    load_assets = () => {
        const result = PIXI.Loader.shared
            .add(
                "load_bar_fg",
                `${SessionConfig.ASSETS_ADDRESS}load_bar_fg.png`
            )
            .add("bg_loading", `${SessionConfig.ASSETS_ADDRESS}bg_loading.jpg`);

        if (LogicState.is_mobile) {
            result
                .add(
                    "m_bg_portrait",
                    `${SessionConfig.ASSETS_ADDRESS}portrait/bg_loading.jpg`
                )
                .add(
                    "m_load_bar_fg",
                    `${SessionConfig.ASSETS_ADDRESS}load_bar_fg_mob.png`
                );
        }

        const assets_loaded_promise = new Promise<void>((resolve) => {
            result.load(() => {
                resolve();
            });
        });

        const newStyle = document.createElement("style");

        for (const font of FONTS) {
            newStyle.appendChild(
                document.createTextNode(
                    `@font-face {
            font-family: "${font}";
            src: url("${SessionConfig.ASSETS_ADDRESS}fonts/${font}.ttf") format("truetype");
        }`
                )
            );
        }

        document.head.appendChild(newStyle);

        const assets_promises = [assets_loaded_promise];

        for (const f of FONTS) {
            const div = document.createElement("div");
            div.innerHTML = ".";
            div.style.fontFamily = f;
            div.style.opacity = "0";
            document.body.appendChild(div);
        }

        AUDIO_MANAGER.init();

        Promise.all(assets_promises).then(() => {
            document.dispatchEvent(this.on_preloader_loaded_event);
        });
    };

    on_resize = () => {};
}
