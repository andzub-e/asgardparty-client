import { Container } from "pixi.js";
import { stop_spine_animation } from "./Util";
import anime from "animejs";
import { LogicState } from "./logic_state";
import { BigWin } from "./BigWin";
import { ECL } from "ecl";

export class FreeSpins {
    container: PIXI.Container;
    fift_free_spin: PIXI.spine.Spine;
    last_free_spin: PIXI.spine.Spine;
    app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new Container();
        this.container.visible = false;

        const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.tint = 0x000000;
        bg.width = 2880;
        bg.height = 2880;
        bg.position.set(-720, -720);

        bg.alpha = 0.7;
        this.container.addChild(bg);

        this.fift_free_spin = new PIXI.spine.Spine(
            PIXI.Loader.shared.resources["15_free_spin"].spineData
        );

        this.fift_free_spin.position.set(720, 400);
        this.fift_free_spin.visible = false;
        this.container.addChild(this.fift_free_spin);

        this.last_free_spin = new PIXI.spine.Spine(
            PIXI.Loader.shared.resources["last_free_spin"].spineData
        );
        this.last_free_spin.visible = false;
        this.last_free_spin.position.set(720, 400);
        this.container.addChild(this.last_free_spin);
    }

    play_free_spin_anim = () => {
        this.container.visible = true;
        this.fift_free_spin.visible = true;
        this.fift_free_spin.state.setAnimation(0, "you_won_15fs", false);
        this.fift_free_spin.state.onComplete = () => {
            stop_spine_animation(this.fift_free_spin, 0, false);
            this.container.visible = false;
        };
    };

    play_last_free_spin_anim = () => {
        const promise = new Promise<void>((resolve) => {
            this.last_free_spin.state.setAnimation(0, "animation", false);
            this.last_free_spin.state.onComplete = () => {
                stop_spine_animation(this.last_free_spin, 0, false);
                this.container.visible = false;
                resolve();
            };
        });
        this.container.visible = true;
        this.last_free_spin.visible = true;

        return promise;
    };
    // prettier-ignore
    play_won = async (win_bitmap: PIXI.Text, BigWin: BigWin, textAnim: anime.AnimeInstance) => {
        BigWin.big_win_container.interactive = true;
        let clickedCount = 0;
        textAnim.complete = () => {
            clickedCount++;
        }
        const clickHandler = () => {
            clickedCount++;
            if(clickedCount == 1) {
                textAnim.pause();
                win_bitmap.text = ECL.fmt.money(LogicState.win);
            } else {
               this.fift_free_spin.state.timeScale = 2;
            }
            
        }
        BigWin.big_win_container.on("pointerdown", clickHandler)
        BigWin.big_win_container.on("touchmove", clickHandler)

        win_bitmap.alpha = 0;
        win_bitmap.visible = true;
        anime({
            targets: win_bitmap,
            alpha: 1,
            easing: "easeInCubic",
            duration: 200,
        });
        this.fift_free_spin.visible = true;
        await new Promise(resolve => (this.fift_free_spin.state.setAnimation(0, "you_won_srart", false).onComplete = resolve) );

        while (true) {
            if (clickedCount >= 2) break;
            this.fift_free_spin.state.setAnimation( 0, "you_won_looped", false)
            await new Promise(resolve => this.fift_free_spin.state.onComplete = () => resolve(0) );
        }
        BigWin.big_win_container.removeListener("pointerdown", clickHandler)
        BigWin.big_win_container.removeListener("touchmove", clickHandler)
        BigWin.big_win_container.interactive = false;

        win_bitmap.alpha = 1;
        anime({
            targets: win_bitmap,
            alpha: 0,
            easing: "easeInCubic",
            duration: 500,
        });
        this.fift_free_spin.state.timeScale = 1
        this.fift_free_spin.state.setAnimation( 0, "you_won_end", false)
        await new Promise(resolve => this.fift_free_spin.state.onComplete = resolve);
        stop_spine_animation(this.fift_free_spin, 0, false);
    };

    resize = () => {
        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                this.fift_free_spin.position.set(720, 400);
                this.last_free_spin.position.set(720, 400);
            } else {
                this.fift_free_spin.position.set(
                    405,
                    this.app.screen.height / 2 - 150
                );
                this.last_free_spin.position.set(
                    405,
                    this.app.screen.height / 2 - 150
                );
            }
        }
    };
}
