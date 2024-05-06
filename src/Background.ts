import { LogicState } from "./logic_state";
import anime from "animejs";

export class Background {
    app: PIXI.Application;
    container: PIXI.Container;
    bg: PIXI.Sprite;
    bg_bonus: PIXI.Sprite;

    bg_anim?: PIXI.spine.Spine;
    bg_bonus_anim?: PIXI.spine.Spine;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();

        this.bg = new PIXI.Sprite(PIXI.Loader.shared.resources["bg"].texture);
        this.bg.anchor.set(0.5);
        this.bg.position.set(1440 / 2, 810 / 2);

        this.bg_bonus = new PIXI.Sprite(
            PIXI.Loader.shared.resources["bonus_bg"].texture
        );
        this.bg_bonus.anchor.set(0.5);
        this.bg_bonus.position.set(1440 / 2, 810 / 2);
        this.bg_bonus.visible = false;

        this.container.addChild(this.bg);
        this.container.addChild(this.bg_bonus);
    }

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
                    spine.alpha = 0;
                    setTimeout(() => {
                        this.play_animation(spine, animation);
                    }, ms);
                };
            },
        });
    };

    switch_to_bonus_mode = () => {
        this.bg.visible = false;
        this.bg_bonus.visible = true;
    };

    switch_to_base_mode = () => {
        this.bg_bonus.visible = false;
        this.bg.visible = true;
    };

    resize = () => {
        if (LogicState.is_mobile) {
            const appWidth = this.app.screen.width;
            const appHeight = this.app.screen.height;

            if (LogicState.is_landscape) {
                this.bg.scale.set(1);
                this.bg.texture = PIXI.Loader.shared.resources["bg"].texture;
                this.bg.position.set(appWidth / 2, appHeight / 2);

                this.bg_bonus.scale.set(1);
                this.bg_bonus.texture =
                    PIXI.Loader.shared.resources["bonus_bg"].texture;
                this.bg_bonus.position.set(appWidth / 2, appHeight / 2);
            } else {
                this.bg.position.set(appWidth / 2, appHeight / 2);
                this.bg.texture =
                    PIXI.Loader.shared.resources["bg_portrait"].texture;

                this.bg_bonus.position.set(appWidth / 2, appHeight / 2);
                this.bg_bonus.texture =
                    PIXI.Loader.shared.resources["bonus_bg_portrait"].texture;

                this.bg.scale.set(
                    appWidth / this.bg.texture.width >
                        appHeight / this.bg.texture.height
                        ? appWidth / this.bg.texture.width
                        : appHeight / this.bg.texture.height
                );

                this.bg_bonus.scale.set(
                    appWidth / this.bg_bonus.texture.width >
                        appHeight / this.bg_bonus.texture.height
                        ? appWidth / this.bg_bonus.texture.width
                        : appHeight / this.bg_bonus.texture.height
                );
            }
        }
    };
}
