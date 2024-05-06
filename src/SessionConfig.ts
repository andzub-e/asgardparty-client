export enum Languages {
    en = "en",
}

export const SessionConfig = {
    ASSETS_ADDRESS: "",
    API_ADDRESS: "",
    LANGUAGE: Languages.en,
    LOCALE: "en-US",
    CURRENCY: "USD",
    enableAutoSpin: true,
    enableTurbo: false,
    enableSlamStop: true,
};

export type SessionConfigType = typeof SessionConfig;
