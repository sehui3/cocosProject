import Global from './Global'

cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
            displayName: "设置节点"
        },
        bgmNode: {
            default: null,
            type: cc.Node,
            displayName: "bgm"
        },
        seNode: {
            default: null,
            type: cc.Node,
            displayName: "se"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() { },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
    },
    //背景音乐开关
    BGSwitch() {
        if (Global.gameData.musicEnabled == true) {
            Global.gameData.musicEnabled = false;
            cc.audioEngine.stop(Global.audio.background);
            this.sound.PaySound(this.sound.openBtnSound);
        } else {
            Global.gameData.musicEnabled = true;
            this.sound.PayBG();
        }
    },
    //音效开关
    soundSwitch() {
        if (Global.gameData.soundEnabled == true) {
            this.sound.PaySound(this.sound.openBtnSound);
            Global.gameData.soundEnabled = false;
        } else {
            Global.gameData.soundEnabled = true;
        }
    },
    OpenBG() {
        this.target.active = true;
    },

    CloseBG(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target.active = false;
    }
});
