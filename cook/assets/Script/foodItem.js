import PublicFunction from './PublicFunction'
import Global from './Global'
cc.Class({
    extends: cc.Component,

    properties: {
        Level: {
            default: null,
            type: cc.Label,
            displayName: "等级"
        },
        Num: {
            default: null,
            type: cc.Label,
            displayName: "数量"
        },
        Cost: {
            default: null,
            type: cc.Label,
            displayName: "成本"
        },
        Power: {
            default: null,
            type: cc.Label,
            displayName: "体力"
        },
        Name: {
            default: null,
            type: cc.Label,
            displayName: "名字"
        },
        Image: {
            default: null,
            type: cc.Node,
            displayName: "图片"
        },
        Btn_make: {
            default: null,
            type: cc.Node,
            displayName: "制作按钮"
        },
        LockView: {
            default: null,
            type: cc.Node,
            displayName: "锁"
        },
        LockName: {
            default: null,
            type: cc.Label,
            displayName: "上一级名字"
        },
        LockLevel: {
            default: null,
            type: cc.Label,
            displayName: "上一级等级"
        },
        LockImage: {
            default: null,
            type: cc.Node,
            displayName: "上一级图片"
        },
        LockText: {
            default: null,
            type: cc.Node,
            displayName: "未解锁字"
        },
        New: {
            default: null,
            type: cc.Node,
            displayName: "新字"
        },
    },

    Init: function (thisFood) {
        this.thisFood = thisFood;
        this.ClickId = parseInt(thisFood.ID);//该食物id;
        this.Refresh();
    },

    Refresh: function () {
        // if (i >= this.nowFoodList.length) return;
        let self = this;
        let thisFood = this.thisFood;
        let id = parseInt(thisFood.ID);//该食物id
        let level;//等级
        let lock;
        //100以下是日本料理，100以上是中国料理
        if (id < 100) {
            level = Global.MyFoodLevel[id - 1];
            lock = PublicFunction.CheckFoodLock(id, 1);//未解锁
            let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
            PublicFunction.LoadImage("food", image, this.Image);
            this.Image.scale = 1;
            this.New.active = !lock && Global.gameData.food[id - 1] == 0;//new
            //显示上一级食物的信息
            if (lock) {
                let preid = parseInt(thisFood.Pre_ID);//上一级食物id
                this.LockName.string = Global.FoodList[preid - 1].Name;
                this.LockLevel.string = "Lv" + thisFood.Pre_Level;
                let preimage = "UI_ryouri" + (preid < 10 ? "0" + preid : preid);
                PublicFunction.LoadImage("food", preimage, this.LockImage);
            }
        }
        else {
            level = Global.MyChineseFoodLevel[id - 100 - 1];
            lock = PublicFunction.CheckFoodLock(id, 2);//未解锁
            let image = thisFood.Name;
            PublicFunction.LoadImage("chineseFood", image, this.Image);
            this.Image.scale = 0.5;
            this.New.active = !lock && Global.gameData.chineseFood[id - 100 - 1] == 0;//new
        }
        this.Level.string = "Lv" + level[0];
        this.Num.string = (level[1] < 10 ? "0" + level[1] : level[1]) + "/" + (level[2] < 10 ? "0" + level[2] : level[2]);
        this.Cost.string = thisFood.Cost;//成本
        this.Power.string = thisFood.Power;//消耗的体力
        this.Name.string = thisFood.Name;
        this.Btn_make.active = !lock;
        this.LockView.active = lock;
        this.Image.color = lock ? cc.color(78, 78, 78) : cc.color(255, 255, 255);
        this.LockText.active = lock;//未解锁三个字
    },

    MakeFood: function () {
        Global.MakeFoodID = this.ClickId;
        cc.find("Canvas/main/Food/Food").getComponent("Food").OpenBG2();
    },
})