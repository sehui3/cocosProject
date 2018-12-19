import Global from './Global'
import PublicFunction from './PublicFunction'

cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
            displayName: "料理节点"
        },
        JapaneseBtn: {
            default: null,
            type: cc.Node,
            displayName: "日本料理按钮"
        },
        ChineseBtn: {
            default: null,
            type: cc.Node,
            displayName: "中华料理按钮"
        },
        scrollView: {
            default: null,
            type: cc.Node,
            displayName: "滚动页"
        },
        scrollBar: {
            default: null,
            type: cc.Node,
            displayName: "滚动条"
        },
        handle: {
            default: null,
            type: cc.Node,
            displayName: "滑块"
        },
        topTitle: {
            default: null,
            type: cc.Node,
            displayName: "顶部"
        },
        downPlace: {
            default: null,
            type: cc.Node,
            displayName: "小料理台"
        },
        confirmNode: {
            default: null,
            type: cc.Node,
            displayName: "确认制作页面"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.chooseTitle = -1;
        this.nowFoodList = [];
        this.isChinese = false;
    },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
    },

    //刷新放置台
    RefreshPlace() {
        this.downPlace.getChildByName("place2").active = Global.gameData.equip[0] == 1;
        this.downPlace.getChildByName("place3").active = Global.gameData.equip[1] == 1;
        for (let j = 0; j < 3; j++) {
            let parent = this.downPlace.getChildByName("place" + (j + 1));
            for (let i = 0; i < 2; i++) {
                //数量不为0时才显示
                if (Global.gameData.PlaceFood[i + j * 2][1] != 0) {
                    parent.getChildByName("food" + (i + 1 + j * 2)).active = true;
                    let id = Global.gameData.PlaceFood[i + j * 2][0];
                    //100以下是日本料理，100以上是中国料理
                    if (id < 100) {
                        let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
                        PublicFunction.LoadImage("food", image, parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image"));
                        parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image").scale = 0.6;
                    }
                    else {
                        let image = Global.ChineseFoodList[id - 100 - 1].Name;
                        PublicFunction.LoadImage("chineseFood", image, parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image"));
                        parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image").scale = 0.3;
                    }
                    parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("num").getComponent(cc.Label).string = Global.gameData.PlaceFood[i + j * 2][1];
                }
                else {
                    parent.getChildByName("food" + (i + 1 + j * 2)).active = false;
                }
            }
        }
    },

    //customEventData食物类型，0全部
    ChangeTitle(event, customEventData) {
        if (customEventData == null) {
            //第一次打开
            if (this.chooseTitle == -1) {
                this.chooseTitle = 0;
                this.topTitle.getChildByName("Btn_all").getComponent(cc.Toggle).isChecked = true;
            }
        }
        //普通的切换
        else {
            this.chooseTitle = parseInt(customEventData);
        }
        this.nowFoodList = [];
        if (this.isChinese) {
            for (let i = 0; i < Global.ChineseFoodList.length; i++) {
                let thisFood = Global.ChineseFoodList[i];
                //两种情况不显示，未解锁，或者当前选择的类型跟该食物不同
                if (PublicFunction.CheckFoodLock(thisFood.ID, 2) || (this.chooseTitle != 0 && this.chooseTitle != thisFood.Type)) {
                    continue;
                }
                else {
                    this.nowFoodList.push(thisFood);
                }
            }
        }
        else {
            for (let i = 0; i < Global.FoodList.length; i++) {
                let thisFood = Global.FoodList[i];
                let preid = parseInt(thisFood.Pre_ID);//上一级食物id
                //两种情况不显示，上上级未解锁，或者当前选择的类型跟该食物不同
                if ((preid != 0 && PublicFunction.CheckFoodLock(preid)) || (this.chooseTitle != 0 && this.chooseTitle != thisFood.Type)) {
                    continue;
                }
                else {
                    this.nowFoodList.push(thisFood);
                }
            }
        }
        this.scrollView.getComponent("FoodScrollView").len = this.nowFoodList.length;
        this.scrollView.getComponent("FoodScrollView").init(0, this.itemSetter.bind(this));
        this.RefreshPlace();
    },

    itemSetter: function (node, i) {
        let thisFood = this.nowFoodList[i];
        node.getComponent("foodItem").Init(thisFood);
    },

    //制作食物
    MakeFood() {
        //点击决定音效
        this.sound.PaySound(this.sound.openBtnSound);
        let id = Global.MakeFoodID;//全局，记录当前要制作的料理id
        let data;
        //100以下是日本料理，100以上是中国料理
        if (id < 100) {
            data = Global.FoodList[id - 1];//查表
        }
        else {
            data = Global.ChineseFoodList[id - 100 - 1];//查表
        }
        let num = parseInt(data.Num);
        let cost = parseInt(data.Cost);
        let power = parseInt(data.Power);
        let type = parseInt(data.Type);
        let place = PublicFunction.CheckMakeFood(id);
        if (place == -1) {
            cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("放置料理的放置处不足");
            return;
        }
        if (!Global.isAccelerate) {
            if (Global.gameData.Power < power) {
                cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("您的体力不足!");
                return;
            }
            if (Global.gameData.Money < cost) {
                cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("您的金币不足!");
                return;
            }
            cc.find("Canvas/main").getComponent("Game").RefreshPower(-1 * power);
            Global.gameData.Money -= cost;
            if (Global.gameData.MissionData.length > 0 && Global.gameData.MissionData[0].type1 == "使用") {
                if (Global.gameData.MissionData[0].type2 == "金币") {
                    Global.gameData.MissionData[0].nowNum += cost;
                }
            }
        }
        Global.gameData.PlaceFood[place][0] = id;//放置台相应的位置
        let worktime = PublicFunction.CheckWorkTime(cost, type);
        Global.gameData.CookingFood.push([id, worktime, place, num]);
        console.log(Global.gameData.CookingFood)
        this.CloseBG();
        //发送刷新事件
        this.node.dispatchEvent(new cc.Event.EventCustom('refresh', true));
    },

    OnJapaneseClick() {
        if (this.isChinese) {
            this.topTitle.getChildByName("Btn_rice").active = true;
            this.ChineseBtn.getChildByName("on").active = false;
            this.JapaneseBtn.getChildByName("on").active = true;
            this.isChinese = false;
            this.ChangeTitle(null, null);
        }
    },

    OnChineseClick() {
        if (!this.isChinese) {
            this.topTitle.getChildByName("Btn_rice").active = false;
            this.ChineseBtn.getChildByName("on").active = true;
            this.JapaneseBtn.getChildByName("on").active = false;
            this.isChinese = true;
            this.ChangeTitle(null, null);
        }
    },

    OpenBG() {
        this.target.active = true;
        this.target.scale = 0;
        this.target.stopAllActions();
        this.target.runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.callFunc(() => { this.ChangeTitle(null, null); })));
    },

    CloseBG(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target.active = false;
        this.CloseBG2();
    },

    OpenBG2() {
        //打开决定页面音效
        this.sound.PaySound(this.sound.openBtnSound);
        this.confirmNode.active = true;
        let id = Global.MakeFoodID;//全局，记录当前要制作的料理id
        //100以下是日本料理，100以上是中国料理
        let thisFood;
        let level;
        if (id < 100) {
            thisFood = Global.FoodList[id - 1];//查表
            //图片
            let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
            PublicFunction.LoadImage("food", image, this.confirmNode.getChildByName("image"));
            this.confirmNode.getChildByName("image").scale = 1.5;
            level = Global.MyFoodLevel[id - 1];
        }
        else {
            thisFood = Global.ChineseFoodList[id - 100 - 1];//查表
            //图片
            let image = thisFood.Name;
            PublicFunction.LoadImage("chineseFood", image, this.confirmNode.getChildByName("image"));
            this.confirmNode.getChildByName("image").scale = 0.75;
            level = Global.MyChineseFoodLevel[id - 100 - 1];
        }
        this.confirmNode.getChildByName("name").getComponent(cc.Label).string = thisFood.Name;
        //星级
        for (let i = 0; i < this.confirmNode.getChildByName("star").childrenCount; i++) {
            this.confirmNode.getChildByName("star").children[i].active = parseInt(thisFood.Star) == i + 1;
        }
        //这个是制作一次可以产生的料理数量
        this.confirmNode.getChildByName("num").getComponent(cc.Label).string = thisFood.Num;
        this.confirmNode.getChildByName("level").getComponent(cc.Label).string = level[0];
        this.confirmNode.getChildByName("next").getComponent(cc.Label).string = (level[1] < 10 ? "0" + level[1] : level[1]) + "/" + (level[2] < 10 ? "0" + level[2] : level[2]);
        this.confirmNode.getChildByName("cost").getComponent(cc.Label).string = thisFood.Cost;
        this.confirmNode.getChildByName("power").getComponent(cc.Label).string = thisFood.Power;
        let str = "";
        let detail = thisFood.Detail;
        for (let i = 0; i < detail.length; i++) {
            str += detail[i];
            if (i == detail.length - 1) break;
            if (detail[i] == '。' || detail[i] == '！' || detail[i] == '？' || detail[i] == '、') {
                str += "\n";
            }
        }
        this.confirmNode.getChildByName("detail").getComponent(cc.Label).string = str;
    },

    CloseBG2(e) {
        if (e) {
            //关闭决定页面音效
            this.sound.PaySound(this.sound.closBtnSound);
        }
        Global.makeFood = undefined;
        this.confirmNode.active = false;
    },
});
