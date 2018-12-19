let Global = require("./Global")
cc.Class({
    extends: cc.Component,

    properties: {
        Equip: {
            default: null,
            type: cc.Node,
            displayName: "设备节点"
        },
        Food: {
            default: null,
            type: cc.Node,
            displayName: "料理节点"
        },
        Signin: {
            default: null,
            type: cc.Node,
            displayName: "签到节点"
        },
        Setup: {
            default: null,
            type: cc.Node,
            displayName: "设置节点"
        },
        GuestModule: {
            default: null,
            type: cc.Node,
            displayName: "客人节点"
        },
        Handbook: {
            default: null,
            type: cc.Node,
            displayName: "图鉴节点"
        },
        Research: {
            default: null,
            type: cc.Node,
            displayName: "研制节点"
        },
        Mission: {
            default: null,
            type: cc.Node,
            displayName: "任务节点"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
    },
    OpenPrefab(target, fun, pre, isBG2 = false) {
        //打开弹窗音效
        this.sound.PaySound(this.sound.openBtnSound);
        let self = this;
        if (target.childrenCount > 0) {
            this.CloseBG();
            if (isBG2) {
                target.children[0].getComponent(fun).OpenBG2();
            }
            else {
                target.children[0].getComponent(fun).OpenBG();
            }
        }
        else {
            if (CC_WECHATGAME) {
                wx.showLoading({
                    title: '加载中',
                    // mask: true,
                })
            }
            cc.loader.loadRes("prefab/" + pre, function (err, prefab) {
                let newNode = cc.instantiate(prefab);
                target.addChild(newNode);
                console.log("添加")

                self.CloseBG();
                if (isBG2) {
                    newNode.getComponent(fun).OpenBG2();
                }
                else {
                    newNode.getComponent(fun).OpenBG();
                }
                if (CC_WECHATGAME) {
                    wx.hideLoading();
                }
            });
        }
    },

    OpenEquip() {
        this.OpenPrefab(this.Equip, "Equip", "Equip");
    },

    OpenFood() {
        this.OpenPrefab(this.Food, "Food", "Food");
    },

    OpenFoodBG2(event, customEventData) {
        Global.MakeFoodID = Global.gameData.PlaceFood[parseInt(customEventData) - 1][0];
        this.OpenPrefab(this.Food, "Food", "Food", true);
    },

    OpenSignin() {
        this.OpenPrefab(this.Signin, "Signin", "Signin");
    },

    OpenSetup() {
        this.OpenPrefab(this.Setup, "Setup", "Setup");
    },

    OpenGuest(){
        this.OpenPrefab(this.GuestModule, "GuestModule", "GuestModule");
    },

    OpenHandbook(){
        this.OpenPrefab(this.Handbook, "Handbook", "Handbook");
    },

    OpenResearch(){
        this.OpenPrefab(this.Research, "Research", "Research");
    },

    OpenMission(){
        this.OpenPrefab(this.Mission, "Mission", "Mission");
    },

    CloseBG() {
        if (this.Equip.childrenCount > 0) {
            this.Equip.children[0].getComponent("Equip").CloseBG();
        }
        if (this.Food.childrenCount > 0) {
            this.Food.children[0].getComponent("Food").CloseBG();
        }
        if (this.Setup.childrenCount > 0) {
            this.Setup.children[0].getComponent("Setup").CloseBG();
        }
        if (this.GuestModule.childrenCount > 0) {
            this.GuestModule.children[0].getComponent("GuestModule").CloseBG();
        }
        if (this.Signin.childrenCount > 0) {
            this.Signin.children[0].getComponent("Signin").CloseBG();
        }
        if (this.Handbook.childrenCount > 0) {
            this.Handbook.children[0].getComponent("Handbook").CloseBG();
        }
        if (this.Research.childrenCount > 0) {
            this.Research.children[0].getComponent("Research").CloseBG();
        }
        // if (this.Mission.childrenCount > 0) {
        //     this.Mission.children[0].getComponent("Mission").CloseBG();
        // }
    }
    // update (dt) {},
});
