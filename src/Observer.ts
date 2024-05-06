export interface Observer {
    on_state_update?: () => void;
}

export class Subject {
    observers: Observer[] = [];
    add_observer = (observer: Observer) => {
        this.observers.push(observer);
    };
    remove_observer = (observer: Observer) => {
        const observer_index = this.observers.indexOf(observer);
        if (observer_index !== -1) {
            this.observers.splice(observer_index, 1);
        } else {
            console.error("No such observer exists!");
        }
    };
    notify_all = () => {
        // console.log("New state: ", this);
        for (const o of this.observers) {
            if (o.on_state_update) {
                o.on_state_update();
            }
        }
    };
}

export class ObserverText extends PIXI.Text implements Observer {
    constructor(text: string, text_style: PIXI.TextStyle, subject: Subject) {
        super(text, text_style);
        subject.add_observer(this);
    }

    on_state_update?: () => void;
}
export class ObserverContainer extends PIXI.Container implements Observer {
    constructor(subject: Subject) {
        super();
        subject.add_observer(this);
    }

    on_state_update?: () => void;
}

export class ObserverBitmapText extends PIXI.BitmapText implements Observer {
    constructor(
        text: string,
        text_style: {
            fontName: string;
            fontSize?: number | undefined;
            align?: string | undefined;
            tint?: number | undefined;
            letterSpacing?: number | undefined;
            maxWidth?: number | undefined;
        },
        subject: Subject
    ) {
        super(text, text_style);
        subject.add_observer(this);
    }

    on_state_update?: () => void;
}
