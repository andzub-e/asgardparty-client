import { LogicState } from "./logic_state";
import { stop_spine_animation } from "./Util";
import anime from "animejs";

export class Foreground {
    app: PIXI.Application;
    container: PIXI.Container;
    logo_anim?: PIXI.spine.Spine;
    fs_panel?: PIXI.Sprite;
    bg_anim?: PIXI.spine.Spine;
    bg_bonus_anim?: PIXI.spine.Spine;

    win_line?: PIXI.spine.Spine;
    line?: PIXI.Sprite;
    rope_line?: PIXI.SimpleRope;

    light?: PIXI.spine.Spine;

    last_free_spin?: PIXI.spine.Spine;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();

        this.add_logo_anim();
        this.play_logo_anim("Asgard party");
    }

    switch_to_bonus_mode = () => {
        stop_spine_animation(this.logo_anim);
        this.play_logo_anim("Asgard party smoke");
    };

    switch_to_base_mode = () => {
        stop_spine_animation(this.logo_anim);
        this.play_logo_anim("Asgard party");
    };

    add_logo_anim = () => {
        this.logo_anim = new PIXI.spine.Spine(
            PIXI.Loader.shared.resources["logo_anim"].spineData
        );
        this.logo_anim.position.set(732.3, 99.5);
        this.logo_anim!.scale.set(0.945);
        this.logo_anim.visible = true;
        this.container.addChild(this.logo_anim);
    };

    play_logo_anim = (animation: "Asgard party" | "Asgard party smoke") => {
        this.logo_anim!.state.setAnimation(0, animation, false);

        this.logo_anim!.state.addListener({
            complete: () => {
                stop_spine_animation(this.logo_anim, 0, false);

                anime({
                    duration: 5000,
                    complete: () => {
                        this.logo_anim!.visible = true;
                        this.logo_anim!.state.setAnimation(
                            0,
                            animation,
                            // "Asgard party smoke",
                            // "Asgard party smoke stars",
                            false
                        );
                    },
                });
            },
        });
    };

    play_animation = (
        spine: PIXI.spine.Spine,
        animation: string,
        ms = 5000
    ) => {
        if (spine.visible === false) return;
        spine.alpha = 0;

        anime({
            duration: 0,
            targets: [spine],
            alpha: 1,

            complete: () => {
                spine.state.setAnimation(0, animation, false);
                spine.state.onComplete = () => {
                    anime({
                        duration: 0,
                        targets: [spine],
                        alpha: 0,
                        complete: () => {
                            setTimeout(() => {
                                this.play_animation(spine, animation);
                            }, ms);
                        },
                    });
                };
            },
        });
    };

    resize = () => {
        if (LogicState.is_mobile) {
            if (LogicState.is_landscape) {
                this.logo_anim!.position.set(733.5, 100);
                this.logo_anim!.scale.set(0.95);
            } else {
                this.logo_anim!.position.set(
                    413.5,
                    this.app.screen.height / 2 - 318
                );
                this.logo_anim!.scale.set(0.85);
            }
        }
    };
}
