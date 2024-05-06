import { ECL } from "ecl";
import "pixi-spine";
import version from "../package.json";
import { App } from "./App";
import { setLanguage } from "./linguist";
import { Teststand } from "./Teststand/Teststand";

declare const __ENVIRONMENT__: string;
declare const __TESTSTAND__: string;

function init() {
    //disable selection of outer elements
    document.getElementById("root")!.onmousedown = () => {
        return false;
    };
    //  &showcheats=true
    if (__ENVIRONMENT__ != "PROD") {
        if (ECL.urlD.getShowCheats()) {
            require("./Teststand/Teststand");
            // import("./Teststand/Teststand");

            document.addEventListener("on_game_loaded_event", () => {
                console.log("TESTAND ON");
                new Teststand();
            });
        }
    }
    const game_name = "Asgard Party";
    const full_game_name = `${game_name} v${version.version} ${__ENVIRONMENT__}`;

    console.log(full_game_name);
    document.title = full_game_name;

    const LANGUAGE = ECL.urlD.getLang();
    setLanguage(LANGUAGE);

    new App();
}

//Init the game after the page is loaded
if (document.readyState !== "loading") {
    init(); //In case the document is already rendered
} else {
    document.addEventListener("DOMContentLoaded", init);
}
