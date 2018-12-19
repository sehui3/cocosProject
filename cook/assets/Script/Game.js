import Global from './Global'
import PublicFunction from './PublicFunction'
import ws from "./Ws"

cc.Class({
    extends: cc.Component,

    properties: {
        GuestAnim: {
            default: null,
            type: cc.Node,
            displayName: "客人动画节点"
        },
        Owner: {
            default: null,
            type: cc.Node,
            displayName: "主人节点"
        },
        Mission: {
            default: null,
            type: cc.Node,
            displayName: "任务节点"
        },
        BtnGroup: {
            default: null,
            type: cc.Node,
            displayName: "按钮节点"
        },
        dayLabel: {
            default: null,
            type: cc.Label,
            displayName: "日期"
        },
        timeLabel: {
            default: null,
            type: cc.Label,
            displayName: "当日倒计时"
        },
        moneyLabel: {
            default: null,
            type: cc.Label,
            displayName: "金币"
        },
        diamondLabel: {
            default: null,
            type: cc.Label,
            displayName: "钻石"
        },
        levelLabel: {
            default: null,
            type: cc.Label,
            displayName: "等级"
        },
        expBar: {
            default: null,
            type: cc.Sprite,
            displayName: "经验条"
        },
        nowPowerLabel: {
            default: null,
            type: cc.Label,
            displayName: "当前体力"
        },
        nextPowerLabel: {
            default: null,
            type: cc.Label,
            displayName: "回体力倒计时"
        },
        powerBar: {
            default: null,
            type: cc.Sprite,
            displayName: "体力条"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let self = this;
        if (CC_WECHATGAME) {
            ws.onShow(() => { self.ComeBack() });
            ws.onHide(() => { self.GoOut(); });
        }
        this.nowtime = new Date().getTime();//获取时间
        this.sound = cc.find("Canvas/main").getComponent("sound");
        //背景音乐
        if (Global.gameData.musicEnabled) {
            this.sound.PayBG();
        }
        this.anim = cc.find("Canvas/main/Guest/anim");
        this.guide = cc.find("Canvas/Guide");
        if (Global.gameData.onePlay == true) {
            Global.isGuide = true;
            this.guide.active = true;
            this.anim.active = false;//新手还没走完引导时，按照引导步骤打开客人进场
        }
        this.CheckLoseData();
    },

    start() {
        let self = this;
        PublicFunction.DateCheck();
        this.secondTime = 0;
        this.OnePowerTime = 0.5;//恢复一点体力所需时间
        this.node.on('refresh', function (event) {
            self.Refresh();
            event.stopPropagation();
        });
        this.RefreshFoodLevel();
        this.Refresh();
    },

    //第二版新增的字段
    CheckLoseData() {
        if (!Global.gameData.chineseFood || Global.gameData.chineseFood.length == 0) {
            Global.gameData.chineseFood = [];
            for (let i = 0; i < 128; i++) {
                Global.gameData.chineseFood.push(0);
            }
            Global.gameData.chineseFoodUnlock = [];
            Global.gameData.chineseFoodScroll = [];
            Global.gameData.ingredient = [];
            Global.gameData.Researching = [];
            for (let i = 0; i < 46; i++) {
                Global.gameData.ingredient.push(0);
            }
            Global.gameData.ingredientUnlock = [];
            // Global.gameData.Diamond = 0;
            Global.gameData.MissionNum = 1;
            Global.gameData.MissionData = [];
            Global.gameData.unlockButton = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];
        }
    },

    //回到前台
    ComeBack() {
        console.log("回到前台");
    },

    set(data) {
        ws.data = data;
        let str = JSON.stringify(ws.data);

        wx.setStorage({
            key: ws.options.DATA_KEY,
            data: JSON.parse(str),
        });
        ws.post({
            url: '/data',
            data: JSON.parse(str),
        });
    },
    GoOut() {
        if (Global.hasInit) {
            Global.gameData.updateTimestamp = Date.now();
            //ws.setAllData(Global.gameData, true);
            this.set(Global.gameData);
        }
    },

    Refresh() {
        this.RefreshEquip();
        this.RefreshPlace();
        this.RefreshTable();
        this.RefreshGrandma();
        this.RefreshNumber();
        this.RefreshBtnGroup();
        this.RefreshMission();
    },

    //刷新主人的设备
    RefreshEquip() {
        this.Owner.children[0].getComponent("Owner").RefreshEquip();
    },

    //刷新放置台
    RefreshPlace() {
        this.Owner.children[0].getComponent("Owner").RefreshPlace();
    },

    //刷新桌子的显示
    RefreshTable() {
        this.GuestAnim.getComponent("GuestAnim").RefreshTable();
    },

    //刷新老奶奶状态
    RefreshGrandma() {
        this.Owner.children[0].getComponent("Owner").RefreshGrandma();
    },

    //刷新任务状态
    RefreshMission() {
        this.Mission.children[0].getComponent("Mission").RefreshMission();
    },

    //刷新所有食物的等级，一般只在开始调用一次
    RefreshFoodLevel() {
        PublicFunction.ComputeAllFoodLevel();
    },

    //刷新金币，等级，经验
    RefreshNumber() {
        this.moneyLabel.string = Global.gameData.Money;
        this.diamondLabel.string = Global.gameData.Diamond;
        this.levelLabel.string = "店家等级:" + Global.gameData.Level;
        let maxExp = PublicFunction.GetMaxExp();
        this.expBar.fillRange = Global.gameData.Exp / maxExp;
    },

    //刷新按钮上面的new
    RefreshBtnGroup() {
        this.BtnGroup.getChildByName("Btn_food").getChildByName("new").active = false;
        this.BtnGroup.getChildByName("Btn_guest").getChildByName("new").active = false;
        this.BtnGroup.getChildByName("Btn_equip").getChildByName("new").active = false;
        //料理
        for (let i = 0; i < Global.FoodList.length; i++) {
            let lock = PublicFunction.CheckFoodLock(i + 1, 1);//未解锁
            if (!lock && Global.gameData.food[i] == 0) {
                this.BtnGroup.getChildByName("Btn_food").getChildByName("new").active = true;
                break;
            }
        }
        for (let i = 0; i < Global.ChineseFoodList.length; i++) {
            let lock = PublicFunction.CheckFoodLock(i + 100 + 1, 2);//未解锁
            if (!lock && Global.gameData.chineseFood[i] == 0) {
                this.BtnGroup.getChildByName("Btn_food").getChildByName("new").active = true;
                break;
            }
        }
        //设备
        if (Global.gameData.unlockButton[8] == 1) {
            this.BtnGroup.getChildByName("Btn_equip").getChildByName("lock").active = false;
            let equipList = Global.EquipList;
            for (let i = 0; i < equipList.length; i++) {
                let level = parseInt(equipList[i].Level);
                if (Global.gameData.equip[i] == 0 && Global.gameData.Level >= level) {
                    this.BtnGroup.getChildByName("Btn_equip").getChildByName("new").active = true;
                    break;
                }
            }
        }
        else {
            this.BtnGroup.getChildByName("Btn_equip").getChildByName("lock").active = true;
        }
        this.BtnGroup.getChildByName("Btn_handbook").getChildByName("lock").active = Global.gameData.unlockButton[9] == 0;
        this.BtnGroup.getChildByName("Btn_explore").getChildByName("lock").active = Global.gameData.unlockButton[10] == 0;
        this.BtnGroup.getChildByName("Btn_research").getChildByName("lock").active = Global.gameData.unlockButton[11] == 0;
    },

    //刷新体力
    RefreshPower: function (num = 0) {
        let max = Global.gameData.Level * 2 + 13 + Global.gameData.Power_plus;
        max = max < 120 ? max : 120;
        num = parseInt(num);
        let p = Global.gameData.Power;
        if (num < 0) {
            if (p == max) {//在体力满了后使用，会设置回复起始时间
                Global.gameData.power_time = this.nowtime;
            }
            //判断是否有消耗体力的任务
            if (Global.gameData.MissionData.length > 0 && Global.gameData.MissionData[0].type1 == "使用" && Global.gameData.MissionData[0].type2 == "体力") {
                Global.gameData.MissionData[0].nowNum -= num;
                this.RefreshMission();
            }
        }
        if (Global.gameData.Power + num >= max) {
            Global.gameData.Power = max;
        }
        else {
            Global.gameData.Power += num;
        }

        if (Global.gameData.Power == max) {
            this.nextPowerLabel.string = "00:00";
        }
        else {
            //先假设两分钟回一点吧，数值还没给
            let arr = PublicFunction.TransTimeNum(this.OnePowerTime, this.nowtime - Global.gameData.power_time);
            this.nextPowerLabel.string = arr == null ? "00:00" : ("0" + arr[0] + ":" + (arr[1] > 9 ? arr[1] : ("0" + arr[1])));
        }
        //刷新体力显示和体力条
        this.nowPowerLabel.string = (Global.gameData.Power < 100 ? "0" : "") + (Global.gameData.Power < 10 ? "0" + Global.gameData.Power : Global.gameData.Power) + "/" + (max < 100 ? "0" : "") + max;
        this.powerBar.fillRange = Global.gameData.Power / max;
    },

    //刷新日期
    RefreshDay: function () {
        if (!this.hour && !this.minute && !this.second) {
            let spendtime = this.nowtime - Global.gameData.RegisterTimestamp;
            this.hour = Math.floor(spendtime / (1000 * 60 * 60));
            spendtime -= this.hour * (1000 * 60 * 60);
            this.minute = Math.floor(spendtime / (1000 * 60));
            spendtime -= this.minute * (1000 * 60);
            this.second = Math.floor(spendtime / 1000);
            console.log(this.nowtime, this.hour, this.minute, this.second);
        }
        this.second++;
        if (this.second >= 60) {
            this.second = 0;
            this.minute++;
            if (this.minute >= 60) {
                this.minute = 0;
                this.hour++;
            }
        }

        switch (this.hour % 7) {
            case 0: this.dayLabel.string = "月曜日"; break;
            case 1: this.dayLabel.string = "火曜日"; break;
            case 2: this.dayLabel.string = "水曜日"; break;
            case 3: this.dayLabel.string = "木曜日"; break;
            case 4: this.dayLabel.string = "金曜日"; break;
            case 5: this.dayLabel.string = "土曜日"; break;
            case 6: this.dayLabel.string = "日曜日"; break;
        }
        let min = 59 - this.minute;
        let sec = 59 - this.second;
        this.timeLabel.string = "00:" + (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);//当日倒计时
    },

    update(dt) {
        this.secondTime += dt;
        if (this.secondTime >= 1) {
            this.secondTime--;
            this.nowtime += 1000;
            //体力
            let powermax = Global.gameData.Level * 2 + 13 + Global.gameData.Power_plus;
            powermax = powermax < 120 ? powermax : 120;
            if (Global.gameData.Power < powermax) {
                let pt = Math.floor((this.nowtime - Global.gameData.power_time) / (this.OnePowerTime * 1000 * 60));//计算该时间内回复了多少体力
                this.RefreshPower(pt);
                if (pt > 0) {//如果离线后仍然不满
                    Global.gameData.power_time += pt * (this.OnePowerTime * 1000 * 60);
                }
            }
            else {
                this.RefreshPower(0);
            }

            this.RefreshDay();
        }
    },
});
