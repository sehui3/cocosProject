import Global from './Global'
import PublicFunction from './PublicFunction'

cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
            displayName: "签到节点"
        },
        SigninList: {
            type: cc.Node,
            default: [],
            displayName: "签到列表"
        },
        HasGetBtn: {
            default: null,
            type: cc.Node,
            displayName: "已领取"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.priceList = [
            { money: 1000 },
            { money: 3000 },
            { money: 8000 },
            { money: 12000 },
            { money: 15000 },
            { money: 20000 },
            { money: 30000 },
        ]
    },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
    },

    RefreshList() {
        if (Global.gameData.canSignIn == true) {
            this.HasGetBtn.active = false;
        }
        else {
            this.HasGetBtn.active = true;
        }
        for (let i = 0; i < this.SigninList.length; i++) {
            if (Global.gameData.ActiveDay > i) {
                this.SigninList[i].getChildByName("get").active = true;
                this.SigninList[i].getChildByName("click").active = true;
            }
            else {
                this.SigninList[i].getChildByName("get").active = false;
                this.SigninList[i].getChildByName("click").active = false;
            }
        }
    },

    //获取奖励
    GetPrice() {
        if (Global.gameData.canSignIn == true) {
            let id = Global.gameData.ActiveDay;
            let moneyNum = this.priceList[id].money;
            cc.find("Canvas/main/Animation").getComponent("Animation").FlyCoin(cc.v2(320, 1138 / 2), moneyNum, true);
            Global.gameData.canSignIn = false;
            Global.gameData.ActiveDay++;//签到的天数
            Global.gameData.signinTimestamp = Date.now();
            this.CloseBG();
            //发送刷新事件
            this.node.dispatchEvent(new cc.Event.EventCustom('refresh', true));
        }
    },

    OpenBG() {
        this.target.active = true;
        this.RefreshList();
    },

    CloseBG(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target.active = false;
    }
});
