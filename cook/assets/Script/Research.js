import Global from './Global'
import PublicFunction from './PublicFunction'
import SeekConfig from './SeekConfig'
import ws from "./Ws"

cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
            displayName: "研制节点"
        },
        topTitle: {
            default: null,
            type: cc.Node,
            displayName: "顶部"
        },
        list: {
            default: null,
            type: cc.Node,
            displayName: "列表"
        },
        ItemPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: "组件"
        },
        block: {
            default: null,
            type: cc.Node,
            displayName: "空空如也"
        },
        target2: {
            default: null,
            type: cc.Node,
            displayName: "开始研制节点"
        },
        bg2_leftName: {
            default: null,
            type: cc.Label,
            displayName: "菜谱名字"
        },
        bg2_rightLayout: {
            default: null,
            type: cc.Node,
            displayName: "材料列表"
        },
        bg2_power: {
            default: null,
            type: cc.Label,
            displayName: "消耗体力"
        },
        target3: {
            default: null,
            type: cc.Node,
            displayName: "研制中节点"
        },
        bg3_name: {
            default: null,
            type: cc.Label,
            displayName: "菜名"
        },
        bg3_time: {
            default: null,
            type: cc.Label,
            displayName: "倒计时"
        },
        bg3_diamond: {
            default: null,
            type: cc.Label,
            displayName: "消耗钻石"
        },
        target4: {
            default: null,
            type: cc.Node,
            displayName: "获取途径节点"
        },
        bg4_name: {
            default: null,
            type: cc.Label,
            displayName: "获取途径名字"
        },
        bg4_level: {
            default: null,
            type: cc.Label,
            displayName: "获取途径等级"
        },
        target5: {
            default: null,
            type: cc.Node,
            displayName: "研制完成节点"
        },
        bg5_round: {
            default: null,
            type: cc.Node,
            displayName: "发光特效"
        },
        bg5_name: {
            default: null,
            type: cc.Label,
            displayName: "研制成功名字"
        },
        bg5_image: {
            default: null,
            type: cc.Node,
            displayName: "研制完成图片"
        },
        bg5_Btn_share: {
            default: null,
            type: cc.Node,
            displayName: "炫耀按钮"
        },
        bg5_Btn_close: {
            default: null,
            type: cc.Node,
            displayName: "不炫耀按钮"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.chooseTitle = 0;
        this.timer = 0;
        this.secondTime = 0;
        this.begin = false;
        if (CC_WECHATGAME) {
            wx.onShow(() => { self.ComeBack() });
        }
    },

    //回到前台
    ComeBack() {
        console.log("回到前台");
        if (this.isShare) {
            this.isShare = false;
            this.CloseBG5();
        }
    },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
        this.pool = new cc.NodePool();
    },

    //刷新列表
    RefreshList() {
        let self = this;
        //菜谱
        if (this.chooseTitle == 1) {
            let dataList = Global.gameData.chineseFoodScroll;//我的菜谱
            let ChineseFoodList = Global.ChineseFoodList;
            while (this.list.childrenCount > dataList.length) {
                //如果只需要刷新组件，就不需要放回对象池了
                this.pool.put(this.list.children[0]);
            }
            for (let i = 0; i < dataList.length; i++) {
                let newnode;
                if (i < this.list.childrenCount) {
                    newnode = this.list.children[i];
                }
                else if (this.pool.size() > 0) {
                    newnode = this.pool.get();
                    newnode.parent = this.list;
                }
                else {
                    newnode = cc.instantiate(this.ItemPrefab);
                    newnode.on(cc.Node.EventType.TOUCH_END, function (event) {
                        self.ClickItem(event);
                    });
                    newnode.parent = this.list;
                }
                newnode.getChildByName("bg2").active = false;
                newnode.getChildByName("name").getComponent(cc.Label).string = dataList[i];
                let id = 0;
                for (let j = 0; j < ChineseFoodList.length; j++) {
                    //根据名字找到相应的料理
                    if (ChineseFoodList[j].Name == dataList[i]) {
                        id = ChineseFoodList[j].ID;
                        break;
                    }
                }
                newnode.getChildByName("lock").active = false;//研制中的蒙版
                for (let j = 0; j < Global.gameData.Researching.length; j++) {
                    if (Global.gameData.Researching[j][0] == id) {
                        newnode.getChildByName("lock").active = true;//研制中的蒙版
                        break;
                    }
                }
                newnode.itemID = id;//点击事件传入ID
            }
        }
        //食材
        else if (this.chooseTitle == 2) {
            let dataList = Global.gameData.ingredient;
            let IngredientList = Global.IngredientList;
            let thislist = [];
            for (let i = 0; i < dataList.length; i++) {
                if (dataList[i] != 0) {
                    thislist.push(i);
                }
            }
            while (this.list.childrenCount > thislist.length) {
                //如果只需要刷新组件，就不需要放回对象池了
                this.pool.put(this.list.children[0]);
            }
            for (let i = 0; i < thislist.length; i++) {
                let newnode;
                if (i < this.list.childrenCount) {
                    newnode = this.list.children[i];
                }
                else if (this.pool.size() > 0) {
                    newnode = this.pool.get();
                    newnode.parent = this.list;
                }
                else {
                    newnode = cc.instantiate(this.ItemPrefab);
                    newnode.on(cc.Node.EventType.TOUCH_END, function (event) {
                        self.ClickItem(event);
                    });
                    newnode.parent = this.list;
                }
                newnode.getChildByName("bg2").active = true;
                let name = IngredientList[thislist[i]].Name//图片
                PublicFunction.LoadImage("ingredient", name, newnode.getChildByName("bg2").getChildByName("image"));
                newnode.getChildByName("bg2").getComponentInChildren(cc.Label).string = dataList[thislist[i]];
                newnode.getChildByName("name").getComponent(cc.Label).string = name;
                newnode.getChildByName("lock").active = false;
                newnode.itemID = thislist[i] + 1;//点击事件传入ID
            }
        }
        this.block.active = this.list.childrenCount == 0;
    },

    //点击空空如也
    ClickBlock() {
        if (this.chooseTitle == 1) {
            console.log("跳转到任务1");
        }
        else if (this.chooseTitle == 2) {
            console.log("跳转到任务2");
        }
    },

    //点击列表中的子节点
    ClickItem(event) {
        console.log(event.target.itemID);
        if (this.chooseTitle == 1) {
            let id = parseInt(event.target.itemID);
            this.thisFood = Global.ChineseFoodList[id - 100 - 1];
            //该食谱正在研制中
            if (event.target.getChildByName("lock").active) {
                //判断该食谱是否已经研制完成
                for (let i = 0; i < Global.gameData.Researching.length; i++) {
                    if (Global.gameData.Researching[i][0] == id) {
                        this.timer = Global.gameData.Researching[i][1] - Date.now();
                        if (this.timer <= 0) {
                            this.OpenBG5();
                        }
                        else {
                            this.OpenBG3(Global.gameData.Researching[i][0]);
                        }
                        break;
                    }
                }
            }
            else {
                this.OpenBG2();
            }
        }
    },

    //customEventData，1是菜谱，2是食材
    ChangeTitle(event, customEventData) {
        if (customEventData == null) {
            //第一次打开
            if (this.chooseTitle == 0) {
                this.chooseTitle = 1;
                this.topTitle.children[0].getComponent(cc.Toggle).isChecked = true;
            }
        }
        //普通的切换
        else {
            this.chooseTitle = parseInt(customEventData);
        }
        this.RefreshList();
        this.list.parent.getComponent(cc.ScrollView).scrollToTop(0.5);
    },

    OpenBG() {
        this.target.active = true;
        this.target.stopAllActions();
        this.target.runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.callFunc(() => { this.ChangeTitle(null, null); })));
    },

    CloseBG(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.CloseBG2();
        this.CloseBG3();
        this.target.active = false;
    },

    //开始研制
    BeginResearch() {
        let IngredientList = Global.IngredientList;
        let ingre = this.thisFood.Ingredient.split(' ');//材料列表
        //判断够不够材料
        for (let i = 0; i < ingre.length; i++) {
            let str = ingre[i].split('*');
            for (let j = 0; j < IngredientList.length; j++) {
                if (IngredientList[j].Name == str[0]) {
                    let num = Global.gameData.ingredient[j];
                    if (num < parseInt(str[1])) {
                        //提示材料不足
                        cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("食材" + str[0] + "不足，请点击食材前往探索获取");
                        return;
                    }
                }
            }
        }
        //根据星级判断所需的时间和体力
        let star = parseInt(this.thisFood.Star);
        let power = 0;
        let time = 0;
        switch (star) {
            case 1: power = 3; time = 5; break;
            case 2: power = 5; time = 10; break;
            case 3: power = 7; time = 20; break;
            case 4: power = 8; time = 30; break;
            case 5: power = 10; time = 40; break;
        }
        //判断够不够体力
        if (Global.gameData.Power < power) {
            cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("您的体力不足!");
            return;
        }
        cc.find("Canvas/main").getComponent("Game").RefreshPower(-1 * power);
        for (let i = 0; i < ingre.length; i++) {
            let str = ingre[i].split('*');
            for (let j = 0; j < IngredientList.length; j++) {
                if (IngredientList[j].Name == str[0]) {
                    //减去相应的食材
                    Global.gameData.ingredient[j] -= parseInt(str[1]);
                    break;
                }
            }
        }
        let finishTime = Date.now() + time * 1000 * 60;//完成时间
        Global.gameData.Researching.push([this.thisFood.ID, finishTime]);
        this.RefreshList();
        this.CloseBG2();
    },

    OpenBG2() {
        this.target2.active = true;
        let IngredientList = Global.IngredientList;
        //根据星级判断所需的时间和体力
        let star = parseInt(this.thisFood.Star);
        let power = 0;
        switch (star) {
            case 1: power = 3; break;
            case 2: power = 5; break;
            case 3: power = 7; break;
            case 4: power = 8; break;
            case 5: power = 10; break;
        }
        this.bg2_power.string = power;//消耗的体力
        this.bg2_leftName.string = name;//名字

        let ingre = this.thisFood.Ingredient.split(' ');//材料列表
        for (let i = 0; i < this.bg2_rightLayout.childrenCount; i++) {
            if (i < ingre.length) {
                this.bg2_rightLayout.children[i].active = true;
                let str = ingre[i].split('*');
                this.bg2_rightLayout.children[i].getChildByName("name").getComponent(cc.Label).string = str[0];//材料名字
                this.bg2_rightLayout.children[i].itemName = str[0];
                for (let j = 0; j < IngredientList.length; j++) {
                    if (IngredientList[j].Name == str[0]) {
                        let num = Global.gameData.ingredient[j];
                        this.bg2_rightLayout.children[i].getChildByName("num").getComponent(cc.Label).string = num + "/" + str[1];//材料数量
                        break;
                    }
                }
                PublicFunction.LoadImage("ingredient", str[0], this.bg2_rightLayout.children[i].getChildByName("image"));
            }
            else {
                this.bg2_rightLayout.children[i].active = false;
            }
        }
    },

    CloseBG2(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.thisFood = null;
        this.target2.active = false;
    },

    //立即完成
    FinishNow() {
        let cost = parseInt(this.bg3_diamond.string);
        if (Global.gameData.Diamond >= cost) {
            Global.gameData.Diamond -= cost;
            this.OpenBG5();
            this.CloseBG3();
            //发送刷新事件
            this.node.dispatchEvent(new cc.Event.EventCustom('refresh', true));
        }
        else {
            cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("您的钻石不足!");
        }
    },

    RefreshTime() {
        let min = Math.floor(this.timer / (1000 * 60));
        let sec = Math.floor((this.timer - min * (1000 * 60)) / 1000);
        this.bg3_time.string = "00:" + (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);//倒计时
        let num = Math.round(this.timer / 1000 / 10);
        this.bg3_diamond.string = num > 0 ? num : 1;
    },

    OpenBG3(id) {
        this.target3.active = true;
        this.bg3_name.string = "正在奋力研制" + Global.ChineseFoodList[id - 100 - 1].Name + "中";
        this.begin = true;
        this.RefreshTime();
    },

    CloseBG3(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.begin = false;
        this.thisFood = null;
        this.target3.active = false;
    },

    OpenBG4(event) {
        this.target4.active = true;
        let name = event.target.itemName;
        let seekSiteConfig = SeekConfig.seekSiteConfig;
        let seekCode = SeekConfig.seekCode;
        //先找到场地的名字
        for (let i = 1; i <= 8; i++) {
            console.log(seekCode[i].name);
            let Ingredients = seekSiteConfig[seekCode[i].name].Ingredients;//该场地产出的材料
            for (let j = 1; j <= 10; j++) {
                if (Ingredients[j]) {
                    //匹配材料的名字
                    if (Ingredients[j].foodName == name) {
                        this.bg4_name.string = seekCode[i].name;
                        return;
                    }
                }
                else {
                    break;
                }
            }
        }
    },

    CloseBG4(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target4.active = false;
    },

    //去分享
    ToShare() {
        if (CC_WECHATGAME) {
            this.isShare = true;
            ws.share({ pos: 'cxuanyao' });
        }
    },
    
    OpenBG5() {
        this.target5.active = true;
        this.bg5_round.scale = 0;
        this.bg5_round.stopAllActions();
        this.bg5_round.runAction(cc.scaleTo(0.5, 1));
        this.timer = 0;
        let name = this.thisFood.Name;//图片
        PublicFunction.LoadImage("chineseFood", name, this.bg5_image);
        this.bg5_name.string = name;
        let index = Global.gameData.chineseFoodScroll.indexOf(name);
        Global.gameData.chineseFoodScroll.splice(index, 1);
        Global.gameData.chineseFoodUnlock.push(parseInt(this.thisFood.ID));
        this.RefreshList();
    },

    CloseBG5() {
        this.target5.active = false;
    },

    update(dt) {
        if (this.begin) {
            this.secondTime += dt;
            if (this.secondTime >= 1) {
                this.secondTime--;
                this.timer -= 1000;
                if (this.timer <= 0) {
                    this.OpenBG5();
                    this.CloseBG3();
                }
                this.RefreshTime();
            }
        }
    },
});
