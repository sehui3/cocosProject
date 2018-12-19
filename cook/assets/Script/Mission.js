import Global from './Global'
import PublicFunction from './PublicFunction'
import SeekConfig from "./SeekConfig"

cc.Class({
    extends: cc.Component,

    properties: {
        Cat: {
            default: null,
            type: cc.Node,
            displayName: "招财猫"
        },
        Sign: {
            default: null,
            type: cc.Node,
            displayName: "感叹号"
        },
        target: {
            default: null,
            type: cc.Node,
            displayName: "任务节点"
        },
        MissionTitle: {
            default: null,
            type: cc.Label,
            displayName: "任务标题"
        },
        MissionDetail: {
            default: null,
            type: cc.Label,
            displayName: "任务详情"
        },
        MissionNeed: {
            default: null,
            type: cc.Node,
            displayName: "任务需求"
        },
        MissionPrize: {
            default: null,
            type: cc.Node,
            displayName: "任务奖励"
        },
        MissionItem: {
            default: null,
            type: cc.Prefab,
            displayName: "预制"
        },
        MissionGo: {
            default: null,
            type: cc.Node,
            displayName: "前往按钮"
        },
        MissionGet: {
            default: null,
            type: cc.Node,
            displayName: "领取按钮"
        },
        coinImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "金币"
        },
        diamondImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "钻石"
        },
        powerImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "体力"
        },
        scrollImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "菜谱"
        },
        levelImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "等级"
        },
        storyImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "对话"
        },
        shareImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "邀请"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.prizeList = [];
        this.prizeItem = [];
    },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
        this.Sign.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.5, cc.v2(0, 20)), cc.moveBy(0.5, cc.v2(0, -20)), cc.delayTime(2))));
        this.animation = cc.find("Canvas/main/Animation").getComponent("Animation");
    },

    //刷新任务状态
    RefreshMission() {
        if (this.CheckFinish()) {
            this.Sign.opacity = 255;
        }
        else {
            this.Sign.opacity = 0;
        }
        if (this.target.active) {
            this.RefreshView();
        }
    },

    //刷新任务页面
    RefreshView() {
        let missionList = Global.MissionList;
        let missionID = parseInt(Global.gameData.MissionNum);
        if (missionID > missionList.length) {
            this.CloseBG();
            return;
        }
        let missionData = Global.gameData.MissionData;
        let thisMission = missionList[missionID - 1];//当前任务
        if (missionData.length == 0) {
            this.AcceptMission(thisMission);
        }
        //标题和需求文字
        this.MissionTitle.string = "任务编号" + missionID + "要求";
        this.MissionDetail.string = thisMission.Detail;
        //需求部分
        this.ShowNeed();
        //是否显示前往按钮
        this.MissionGo.active = thisMission.Go != "";
        this.GoToView = thisMission.Go;
        this.MissionGet.active = this.CheckFinish();
        //奖励部分
        let prizeArr = thisMission.Prize.split(' ');
        this.MissionPrize.removeAllChildren();
        this.prizeList = [];
        this.prizeItem = [];
        for (let i = 0; i < prizeArr.length; i++) {
            this.ShowPrize(prizeArr[i]);
        }
    },

    //刷新需求列表
    ShowNeed() {
        let missionData = Global.gameData.MissionData;//当前任务记录
        this.MissionNeed.removeAllChildren();
        if (missionData.length == 0) return;
        for (let i = 0; i < missionData.length; i++) {
            let newnode = cc.instantiate(this.MissionItem);
            newnode.parent = this.MissionNeed;
            if (missionData[i].type1 == "制作料理") {
                let id = missionData[i].id;
                let num = missionData[i].num;
                let preNum = missionData[i].nowNum;
                let nowNum;
                let per;
                if (missionData[i].type3) {
                    let image = "料理";
                    PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    let ChineseFoodList = Global.ChineseFoodList;
                    nowNum = 0;
                    for (let i = 0; i < ChineseFoodList.length; i++) {
                        let thisFood = ChineseFoodList[i];
                        let ingre = thisFood.Ingredient.split(' ');//材料列表
                        for (let j = 0; j < ingre.length; j++) {
                            let str = ingre[j].split('*');
                            if (str[0] == "猪腿肉") {
                                nowNum += Global.gameData.chineseFood[i];
                                break;
                            }
                        }
                    }
                    per = 1;
                }
                else if (missionData[i].type2 == "日本") {
                    let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
                    PublicFunction.LoadImage("food", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    nowNum = parseInt(Global.gameData.food[id - 1]);
                    per = parseInt(Global.FoodList[id - 1].Num);
                }
                else if (missionData[i].type2 == "中国") {
                    let image = Global.ChineseFoodList[id - 100 - 1].Name;
                    PublicFunction.LoadImage("chineseFood", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    nowNum = parseInt(Global.gameData.chineseFood[id - 100 - 1]);
                    per = parseInt(Global.ChineseFoodList[id - 100 - 1].Num);
                }
                else {
                    let image = "料理";
                    PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    nowNum = 0;
                    let chineseFood = Global.gameData.chineseFood;
                    let food = Global.gameData.food;
                    for (let i = 0; i < chineseFood.length; i++) {
                        nowNum += chineseFood[i];
                    }
                    for (let i = 0; i < food.length; i++) {
                        nowNum += food[i];
                    }
                    per = 1;
                }
                let str = (nowNum - preNum) * per + "/" + num;
                newnode.getChildByName("time").getComponent(cc.Label).string = str;
            }
            else if (missionData[i].type1 == "剧情") {
                newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.storyImage;
            }
            else if (missionData[i].type1 == "获得") {
                if (missionData[i].type2 == "金币") {
                    newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.coinImage;
                }
                else if (missionData[i].type2 == "食材") {
                    if (missionData[i].id) {
                        let id = missionData[i].id;
                        let image = Global.IngredientList[id - 1].Name;
                        PublicFunction.LoadImage("ingredient", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    }
                    else {
                        let image = "探索";
                        PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    }
                }
                let num = missionData[i].num;
                let nowNum = missionData[i].nowNum;
                let str = nowNum + "/" + num;
                newnode.getChildByName("time").getComponent(cc.Label).string = str;
            }
            else if (missionData[i].type1 == "设备") {
                if (missionData[i].num) {
                    let num = missionData[i].num;
                    let nowNum = 0;
                    for (let i = 0; i < Global.gameData.equip.length; i++) {
                        if (Global.gameData.equip[i] == 1) {
                            nowNum++;
                        }
                    }
                    let image = "设备";
                    PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    let str = nowNum + "/" + num;
                    newnode.getChildByName("time").getComponent(cc.Label).string = str;
                }
                else {
                    let id = missionData[i].id;
                    let image = "equip" + (id + 1);
                    PublicFunction.LoadImage("equip", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    let str = Global.gameData.equip[id] + "/1";
                    newnode.getChildByName("time").getComponent(cc.Label).string = str;
                }
            }
            else if (missionData[i].type1 == "解锁料理") {
                let image;
                if (missionData[i].type2 == "日本") {
                    image = "料理";
                }
                else if (missionData[i].type2 == "中国") {
                    image = "研制";
                }
                PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
            }
            else if (missionData[i].type1 == "邀请") {
                newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.shareImage;
            }
            else if (missionData[i].type1 == "放置处") {
                let image = "料理";
                PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
            }
            else if (missionData[i].type1 == "探索") {
                let num = missionData[i].num;
                let nowNum = missionData[i].nowNum;
                let image;
                if (missionData[i].type2) {
                    image = missionData[i].type2;
                }
                else {
                    image = "探索";
                }
                PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                let str = nowNum + "/" + num;
                newnode.getChildByName("time").getComponent(cc.Label).string = str;
            }
            else if (missionData[i].type1 == "升级") {
                let num = missionData[i].num;
                let nowNum;
                if (missionData[i].type2 == "店铺") {
                    nowNum = Global.gameData.Level;
                    newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.levelImage;
                }
                else if (missionData[i].type2 == "任意") {
                    let id = parseInt(missionData[i].id);
                    nowNum = 0;
                    for (let i = 1; i <= 8; i++) {
                        if (Global.gameData.seekLv[i].lv >= id) {
                            nowNum++;
                        }
                    }
                    let image = "探索";
                    PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                }
                else {
                    let image = missionData[i].type2;
                    PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                    let seekCode = SeekConfig.seekCode;
                    for (let j = 1; j <= 8; j++) {
                        if (missionData[i].type2 == seekCode[j].name) {
                            nowNum = Global.gameData.seekLv[j].lv;
                            break;
                        }
                    }
                }
                let str = nowNum + "/" + num;
                newnode.getChildByName("time").getComponent(cc.Label).string = str;
            }
            else if (missionData[i].type1 == "进食") {
                let id = missionData[i].id;
                let num = missionData[i].num;
                let nowNum = missionData[i].nowNum;
                if (id) {
                    let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
                    PublicFunction.LoadImage("food", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                }
                else {
                    let image = "料理";
                    PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                }
                let str = nowNum + "/" + num;
                newnode.getChildByName("time").getComponent(cc.Label).string = str;
            }
            else if (missionData[i].type1 == "料理数量") {
                let num = missionData[i].num;
                let image;
                let nowNum = 0;
                let list;
                let food;
                let type;
                if (missionData[i].type2 == "日本") {
                    image = "料理";
                    list = Global.FoodList;
                    food = Global.gameData.food;
                    type = 1;
                }
                else if (missionData[i].type2 == "中国") {
                    image = "研制";
                    list = Global.ChineseFoodList;
                    food = Global.gameData.chineseFood;
                    type = 2;
                }
                PublicFunction.LoadImage("icon", image, newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")); });
                for (let i = 0; i < list.length; i++) {
                    if (food[i] > 0 || !PublicFunction.CheckFoodLock(list[i].ID, type)) {
                        nowNum++;
                    }
                }
                let str = nowNum + "/" + num;
                newnode.getChildByName("time").getComponent(cc.Label).string = str;
            }
            else if (missionData[i].type1 == "使用") {
                if (missionData[i].type2 == "金币") {
                    newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.coinImage;
                }
                else if (missionData[i].type2 == "体力") {
                    newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.powerImage;
                }
                let num = missionData[i].num;
                let nowNum = missionData[i].nowNum;
                let str = nowNum + "/" + num;
                newnode.getChildByName("time").getComponent(cc.Label).string = str;
            }
            this.AdjustPic(newnode.getChildByName("image"));
        }
    },

    //刷新奖励列表
    ShowPrize(str) {
        let self = this;
        let newnode = cc.instantiate(this.MissionItem);
        newnode.parent = this.MissionPrize;
        let arr = str.split('*');
        //金币，钻石，食材
        if (arr.length > 1) {
            if (arr[0] == "金币") {
                newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.coinImage;
                let callback = function () {
                    // self.animation.FlyCoin(cc.v2(320, 500), parseInt(arr[1]), true);
                }
                this.prizeList.push(callback);
                this.prizeItem.push(["coin", arr[1]]);
            }
            else if (arr[0] == "钻石") {
                newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.diamondImage;
                let callback = function () {
                    Global.gameData.Diamond += parseInt(arr[1]);
                }
                this.prizeList.push(callback);
                this.prizeItem.push(["diamond", arr[1]]);
            }
            else {
                PublicFunction.LoadImage("ingredient", arr[0], newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")) });
                let getID;
                let IngredientList = Global.IngredientList;
                for (let i = 0; i < IngredientList.length; i++) {
                    if (IngredientList[i].Name == arr[0]) {
                        getID = i;
                        break;
                    }
                }
                let callback = function () {
                    Global.gameData.ingredient[getID] += parseInt(arr[1]);
                }
                this.prizeList.push(callback);
                this.prizeItem.push(["ingredient", getID, arr[1]]);
            }
            newnode.getChildByName("time").getComponent(cc.Label).string = arr[0];
            newnode.getChildByName("num").getComponent(cc.Label).string = "x" + arr[1];
        }
        else {
            arr = str.split('-');
            //菜谱，解锁
            if (arr.length > 1) {
                if (arr[0] == "解锁") {
                    PublicFunction.LoadImage("icon", arr[1], newnode.getChildByName("image"), () => { this.AdjustPic(newnode.getChildByName("image")) });
                    newnode.getChildByName("time").getComponent(cc.Label).string = arr[0];
                    let unlockID;
                    switch (arr[1]) {
                        case "池塘": unlockID = 0; break;
                        case "森林": unlockID = 1; break;
                        case "菜地": unlockID = 2; break;
                        case "猪圈": unlockID = 3; break;
                        case "菜棚": unlockID = 4; break;
                        case "鸡舍": unlockID = 5; break;
                        case "作坊": unlockID = 6; break;
                        case "牧场": unlockID = 7; break;
                        case "设备": unlockID = 8; break;
                        case "图鉴": unlockID = 9; break;
                        case "探索": unlockID = 10; break;
                        case "研制": unlockID = 11; break;
                    }
                    let callback = function () {
                        Global.gameData.unlockButton[unlockID] = 1;
                    }
                    this.prizeList.push(callback);
                }
                else if (arr[0] == "菜谱") {
                    newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.scrollImage;
                    newnode.getChildByName("time").getComponent(cc.Label).string = arr[1];
                    let callback = function () {
                        Global.gameData.chineseFoodScroll.push(arr[1]);
                    }
                    this.prizeList.push(callback);
                    this.prizeItem.push(["scroll", arr[1]]);
                }
            }
            //体力相关
            else {
                newnode.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.powerImage;
                if (str == "爱心体力储值扩大2个") {
                    newnode.getChildByName("time").getComponent(cc.Label).string = "体力储值";
                    newnode.getChildByName("num").getComponent(cc.Label).string = "x2";
                    let callback = function () {
                        Global.gameData.Power_plus += 2;
                    }
                    this.prizeList.push(callback);
                }
                else if (str == "爱心体力恢复") {
                    newnode.getChildByName("time").getComponent(cc.Label).string = "体力回满";
                    let callback = function () {
                        cc.find("Canvas/main").getComponent("Game").RefreshPower(120);
                    }
                    this.prizeList.push(callback);
                }
            }
        }
        this.AdjustPic(newnode.getChildByName("image"));
    },

    //缩小图片的大小到65以下
    AdjustPic(target) {
        let width = target.width;
        let height = target.height;
        let widthpre = 65 / width;
        let heightpre = 65 / height;
        if (widthpre < 1 || heightpre < 1) {
            target.scale = widthpre < heightpre ? widthpre : heightpre;
        }
        else if (widthpre > 1 && heightpre > 1) {
            target.scale = widthpre < heightpre ? widthpre : heightpre;
        }
    },

    //接受新任务
    AcceptMission(thisMission) {
        switch (parseInt(thisMission.ID)) {
            case 1: {
                let obj = {
                    type1: "制作料理",
                    type2: "日本",
                    id: 2,
                    num: 4,
                    nowNum: Global.gameData.food[1]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 2: {
                let obj = {
                    type1: "剧情",
                    type2: "monk",
                    id: 1,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 3: {
                let obj = {
                    type1: "获得",
                    type2: "金币",
                    num: 2500,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 4: {
                let obj = {
                    type1: "设备",
                    id: 0,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 5: {
                let obj = {
                    type1: "解锁料理",
                    type2: "日本",
                    id: 9,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 6: {
                let obj = {
                    type1: "邀请",
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 7: {
                let obj = {
                    type1: "解锁料理",
                    type2: "日本",
                    id: 4,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 8: {
                let obj = {
                    type1: "放置处",
                    num: 4,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 9: {
                let obj = {
                    type1: "剧情",
                    type2: "grandpa",
                    id: 2,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 10: {
                let obj = {
                    type1: "制作料理",
                    type2: "日本",
                    id: 4,
                    num: 4,
                    nowNum: Global.gameData.food[3]
                }
                Global.gameData.MissionData.push(obj);
                let obj2 = {
                    type1: "制作料理",
                    type2: "日本",
                    id: 9,
                    num: 4,
                    nowNum: Global.gameData.food[8]
                }
                Global.gameData.MissionData.push(obj2);
                break;
            };
            case 11: {
                let obj = {
                    type1: "探索",
                    type2: "菜棚",
                    num: 1,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 12: {
                let obj = {
                    type1: "升级",
                    type2: "店铺",
                    num: Global.gameData.Level + 1,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 13: {
                let obj = {
                    type1: "解锁料理",
                    type2: "中国",
                    id: 106,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 14: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 106,
                    num: 4,
                    nowNum: Global.gameData.chineseFood[5]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 15: {
                let obj = {
                    type1: "剧情",
                    type2: "grandpa",
                    id: 3,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 16: {
                let obj = {
                    type1: "探索",
                    type2: "鸡舍",
                    num: 1,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 17: {
                let obj1 = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 107,
                    num: 3,
                    nowNum: Global.gameData.chineseFood[6]
                }
                Global.gameData.MissionData.push(obj1);
                let obj2 = {
                    type1: "制作料理",
                    type2: "日本",
                    id: 20,
                    num: 2,
                    nowNum: Global.gameData.food[19]
                }
                Global.gameData.MissionData.push(obj2);
                break;
            };
            case 18: {
                let obj = {
                    type1: "进食",
                    type2: "girl",
                    id: 13,
                    num: 1,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 19: {
                let obj = {
                    type1: "升级",
                    type2: "菜棚",
                    num: 2,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 20: {
                let obj = {
                    type1: "获得",
                    type2: "食材",
                    id: 2,
                    num: 3,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 21: {
                let obj = {
                    type1: "解锁料理",
                    type2: "中国",
                    id: 108,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 22: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 108,
                    num: 4,
                    nowNum: Global.gameData.chineseFood[7]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 23: {
                let obj = {
                    type1: "剧情",
                    type2: "girl",
                    id: 2,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 24: {
                let obj = {
                    type1: "料理数量",
                    type2: "日本",
                    num: 10,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 25: {
                let obj = {
                    type1: "探索",
                    num: 2,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 26: {
                let obj = {
                    type1: "升级",
                    type2: "鸡舍",
                    num: 2,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 27: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 118,
                    num: 4,
                    nowNum: Global.gameData.chineseFood[17]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 28: {
                let number = 0;
                for (let i = 0; i < Global.gameData.equip.length; i++) {
                    if (Global.gameData.equip[i] == 1) {
                        number++;
                    }
                }
                let obj = {
                    type1: "设备",
                    num: number + 1,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 29: {
                let obj = {
                    type1: "剧情",
                    type2: "sis",
                    id: 3,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 30: {
                let obj = {
                    type1: "探索",
                    type2: "菜地",
                    num: 1,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 31: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 113,
                    num: 4,
                    nowNum: Global.gameData.chineseFood[12]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 32: {
                let obj1 = {
                    type1: "获得",
                    type2: "食材",
                    id: 8,
                    num: 8,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj1);
                let obj2 = {
                    type1: "获得",
                    type2: "食材",
                    id: 13,
                    num: 8,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj2);
                break;
            };
            case 33: {
                let obj = {
                    type1: "剧情",
                    type2: "doctor",
                    id: 2,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 34: {
                let obj = {
                    type1: "探索",
                    type2: "作坊",
                    num: 1,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 35: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 122,
                    num: 6,
                    nowNum: Global.gameData.chineseFood[21]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 36: {
                let obj = {
                    type1: "获得",
                    type2: "食材",
                    id: 19,
                    num: 33,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 37: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 119,
                    num: 10,
                    nowNum: Global.gameData.chineseFood[18]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 38: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 101,
                    num: 8,
                    nowNum: Global.gameData.chineseFood[0]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 39: {
                let number = 0;
                let list = Global.FoodList;
                let food = Global.gameData.food;
                for (let i = 0; i < list.length; i++) {
                    if (food[i] > 0 || !PublicFunction.CheckFoodLock(list[i].ID, 1)) {
                        number++;
                    }
                }
                let obj = {
                    type1: "料理数量",
                    type2: "日本",
                    num: number + 2,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 40: {
                let obj = {
                    type1: "剧情",
                    type2: "oldMan",
                    id: 3,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 41: {
                let obj = {
                    type1: "获得",
                    type2: "食材",
                    num: 80,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 42: {
                let obj = {
                    type1: "获得",
                    type2: "食材",
                    id: 13,
                    num: 20,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 43: {
                let obj1 = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 120,
                    num: 10,
                    nowNum: Global.gameData.chineseFood[19]
                }
                Global.gameData.MissionData.push(obj1);
                let obj2 = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 113,
                    num: 10,
                    nowNum: Global.gameData.chineseFood[12]
                }
                Global.gameData.MissionData.push(obj2);
                break;
            };
            case 44: {
                let obj = {
                    type1: "解锁料理",
                    type2: "日本",
                    id: 31,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 45: {
                let obj = {
                    type1: "探索",
                    num: 3,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 46: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 103,
                    num: 10,
                    nowNum: Global.gameData.chineseFood[2]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 47: {
                let obj = {
                    type1: "剧情",
                    type2: "dosser",
                    id: 3,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 48: {
                let obj = {
                    type1: "探索",
                    type2: "牧场",
                    num: 1,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 49: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 124,
                    num: 10,
                    nowNum: Global.gameData.chineseFood[23]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 50: {
                let obj = {
                    type1: "进食",
                    num: 12,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 51: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 160,
                    num: 8,
                    nowNum: Global.gameData.chineseFood[59]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 52: {
                let obj = {
                    type1: "获得",
                    type2: "金币",
                    num: 5000,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 53: {
                let obj = {
                    type1: "探索",
                    num: 4,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 54: {
                let obj = {
                    type1: "剧情",
                    type2: "boy",
                    id: 4,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 55: {
                let obj = {
                    type1: "获得",
                    type2: "食材",
                    id: 30,
                    num: 30,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 56: {
                let obj = {
                    type1: "获得",
                    type2: "食材",
                    num: 50,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 57: {
                let obj = {
                    type1: "使用",
                    type2: "金币",
                    num: 3000,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 58: {
                let obj = {
                    type1: "升级",
                    type2: "任意",
                    id: 2,//这个是需要升到的等级了
                    num: 4,//这个是升到这个等级的数量了
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 59: {
                let number = 0;
                let chineseFood = Global.gameData.chineseFood;
                let food = Global.gameData.food;
                for (let i = 0; i < chineseFood.length; i++) {
                    number += chineseFood[i];
                }
                for (let i = 0; i < food.length; i++) {
                    number += food[i];
                }
                let obj = {
                    type1: "制作料理",
                    num: 5,
                    nowNum: number
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 60: {
                let obj = {
                    type1: "使用",
                    type2: "金币",
                    num: 5000,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 61: {
                let obj = {
                    type1: "探索",
                    num: 5,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 62: {
                let obj = {
                    type1: "设备",
                    num: 3,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 63: {
                let obj = {
                    type1: "剧情",
                    type2: "grandpa",
                    id: 7,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 64: {
                let obj = {
                    type1: "探索",
                    type2: "鸡舍",
                    num: 2,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 65: {
                let obj = {
                    type1: "使用",
                    type2: "金币",
                    num: 8000,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 66: {
                let obj1 = {
                    type1: "探索",
                    type2: "菜地",
                    num: 2,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj1);
                let obj2 = {
                    type1: "探索",
                    type2: "牧场",
                    num: 2,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj2);
                let obj3 = {
                    type1: "探索",
                    type2: "菜棚",
                    num: 2,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj3);
                break;
            };
            case 67: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 123,
                    num: 4,
                    nowNum: Global.gameData.chineseFood[22]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 68: {
                let obj = {
                    type1: "解锁料理",
                    type2: "日本",
                    id: 44,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 69: {
                let obj = {
                    type1: "剧情",
                    type2: "bobby",
                    id: 6,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 70: {
                let obj = {
                    type1: "使用",
                    type2: "体力",
                    num: 50,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 71: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 165,
                    num: 4,
                    nowNum: Global.gameData.chineseFood[64]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 72: {
                let obj = {
                    type1: "剧情",
                    type2: "oldMan",
                    id: 6,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 73: {
                let ChineseFoodList = Global.ChineseFoodList;
                let number = 0;
                for (let i = 0; i < ChineseFoodList.length; i++) {
                    let thisFood = ChineseFoodList[i];
                    let ingre = thisFood.Ingredient.split(' ');//材料列表
                    for (let j = 0; j < ingre.length; j++) {
                        let str = ingre[j].split('*');
                        if (str[0] == "猪腿肉") {
                            number += Global.gameData.chineseFood[i];
                            break;
                        }
                    }
                }
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    type3: "猪腿肉",
                    num: 10,
                    nowNum: number
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 74: {
                let obj = {
                    type1: "获得",
                    type2: "食材",
                    num: 20,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 75: {
                let obj = {
                    type1: "探索",
                    num: 5,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 76: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 137,
                    num: 4,
                    nowNum: Global.gameData.chineseFood[36]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 77: {
                let obj = {
                    type1: "剧情",
                    type2: "dosser",
                    id: 7,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 78: {
                let ChineseFoodList = Global.ChineseFoodList;
                let number = 0;
                for (let i = 0; i < ChineseFoodList.length; i++) {
                    let thisFood = ChineseFoodList[i];
                    let ingre = thisFood.Ingredient.split(' ');//材料列表
                    for (let j = 0; j < ingre.length; j++) {
                        let str = ingre[j].split('*');
                        if (str[0] == "豆腐") {
                            number += Global.gameData.chineseFood[i];
                            break;
                        }
                    }
                }
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    type3: "豆腐",
                    num: 10,
                    nowNum: number
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 79: {
                let obj = {
                    type1: "料理数量",
                    type2: "日本",
                    num: 20,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 80: {
                let obj = {
                    type1: "制作料理",
                    type2: "中国",
                    id: 114,
                    num: 6,
                    nowNum: Global.gameData.chineseFood[13]
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 81: {
                let obj = {
                    type1: "剧情",
                    type2: "doctor",
                    id: 8,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 82: {
                let obj = {
                    type1: "使用",
                    type2: "金币",
                    num: 12000,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 83: {
                let obj = {
                    type1: "升级",
                    type2: "鸡舍",
                    num: 4,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 84: {
                let obj = {
                    type1: "升级",
                    type2: "店铺",
                    num: Global.gameData.Level + 1,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 85: {
                let obj = {
                    type1: "探索",
                    num: 6,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 86: {
                let obj = {
                    type1: "使用",
                    type2: "体力",
                    num: 60,
                    nowNum: 0
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 87: {
                let obj = {
                    type1: "料理数量",
                    type2: "日本",
                    num: 40,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
            case 88: {
                let obj = {
                    type1: "剧情",
                    type2: "grandpa",
                    id: 9,
                }
                Global.gameData.MissionData.push(obj);
                break;
            };
        }
    },

    //制作料理(日本/中国)，剧情，获得(金币/食材)，设备，解锁料理(日本/中国)
    //邀请，放置处，升级，探索，进食，料理数量(日本/中国)，使用(体力/金币)
    /*
        case : {
            let obj = {
                type1: "",
                type2: "",
                id: ,
                num: ,
                nowNum: 
            }
            Global.gameData.MissionData.push(obj);
            break;
        };
    */

    //检测这个任务是否已经完成
    CheckFinish() {
        let missionData = Global.gameData.MissionData;//当前任务记录
        if (missionData.length == 0) return false;
        for (let i = 0; i < missionData.length; i++) {
            if (missionData[i].type1 == "制作料理") {
                if (!this.IsMakeFood(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "剧情") {
                if (!this.IsStory(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "获得") {
                if (!this.IsNumber(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "设备") {
                if (!this.IsEquip(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "解锁料理") {
                if (!this.IsUnLockFood(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "邀请") {
                if (!this.IsShare(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "放置处") {
                if (!this.IsPlaceFood(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "探索") {
                if (!this.IsNumber(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "升级") {
                if (!this.IsLevel(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "进食") {
                if (!this.IsNumber(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "料理数量") {
                if (!this.IsFoodNumber(missionData[i])) {
                    return false;
                }
            }
            else if (missionData[i].type1 == "使用") {
                if (!this.IsNumber(missionData[i])) {
                    return false;
                }
            }
        }
        return true;
    },

    //制作料理任务
    IsMakeFood(missionData) {
        let id = parseInt(missionData.id);
        let num = parseInt(missionData.num);
        let nowNum = parseInt(missionData.nowNum);
        //限定食材的，一定是中国料理
        if (missionData.type3) {
            let ChineseFoodList = Global.ChineseFoodList;
            let number = 0;
            for (let i = 0; i < ChineseFoodList.length; i++) {
                let thisFood = ChineseFoodList[i];
                let ingre = thisFood.Ingredient.split(' ');//材料列表
                for (let j = 0; j < ingre.length; j++) {
                    let str = ingre[j].split('*');
                    if (str[0] == missionData.type3) {
                        number += Global.gameData.chineseFood[i];
                        break;
                    }
                }
            }
            return (number - nowNum >= num);
        }
        else {
            if (missionData.type2 == "日本") {
                let per = parseInt(Global.FoodList[id - 1].Num);
                return ((Global.gameData.food[id - 1] - nowNum) >= (num / per));
            }
            else if (missionData.type2 == "中国") {
                let per = parseInt(Global.ChineseFoodList[id - 100 - 1].Num);
                return ((Global.gameData.chineseFood[id - 100 - 1] - nowNum) >= (num / per));
            }
            else {
                let number = 0;
                let chineseFood = Global.gameData.chineseFood;
                let food = Global.gameData.food;
                for (let i = 0; i < chineseFood.length; i++) {
                    number += chineseFood[i];
                }
                for (let i = 0; i < food.length; i++) {
                    number += food[i];
                }
                return (number - nowNum >= num);
            }
        }
    },

    //解锁剧情任务
    IsStory(missionData) {
        let id = parseInt(missionData.id);
        if (missionData.type2 == "grandpa") {
            return Global.gameData.MainStory >= id;
        }
        else {
            return Global.gameData.GuestStory[missionData.type2] >= id;
        }
    },

    //获得**任务，使用**任务，探索**任务，进食**任务
    IsNumber(missionData) {
        let num = parseInt(missionData.num);
        let nowNum = parseInt(missionData.nowNum);
        return nowNum >= num;
    },

    //购买设备任务，这个id是从0开始的
    IsEquip(missionData) {
        if (missionData.num) {
            let num = parseInt(missionData.num);
            let nowNum = 0;
            for (let i = 0; i < Global.gameData.equip.length; i++) {
                if (Global.gameData.equip[i] == 1) {
                    nowNum++;
                }
            }
            return nowNum >= num;
        }
        else {
            let id = parseInt(missionData.id);
            return Global.gameData.equip[id] == 1;
        }
    },

    //解锁料理任务
    IsUnLockFood(missionData) {
        let id = parseInt(missionData.id);
        if (missionData.type2 == "日本") {
            return !PublicFunction.CheckFoodLock(id, 1);
        }
        else if (missionData.type2 == "中国") {
            return !PublicFunction.CheckFoodLock(id, 2);
        }
    },

    //邀请任务
    IsShare(missionData) {
        if (CC_WECHATGAME) {
            let nowNum = parseInt(missionData.nowNum);
            return nowNum > 0;
        }
        else {
            return true;
        }
    },

    //料理放置处任务
    IsPlaceFood(missionData) {
        let num = parseInt(missionData.num);
        let nowNum = 0;
        for (let i = 0; i < Global.gameData.PlaceFood.length; i++) {
            if (Global.gameData.PlaceFood[i][1] > 0) {
                nowNum++;
            }
        }
        return nowNum >= num;
    },

    //升级任务
    IsLevel(missionData) {
        let num = parseInt(missionData.num);
        if (missionData.type2 == "店铺") {
            return Global.gameData.Level >= num;
        }
        else if (missionData.type2 == "任意") {
            let id = parseInt(missionData.id);
            let nowNum = 0;
            for (let i = 1; i <= 8; i++) {
                if (Global.gameData.seekLv[i].lv >= id) {
                    nowNum++;
                }
            }
            return nowNum >= num;
        }
        else {
            let seekCode = SeekConfig.seekCode;
            for (let i = 1; i <= 8; i++) {
                if (missionData.type2 == seekCode[i].name) {
                    return Global.gameData.seekLv[i].lv >= num;
                }
            }
        }
    },

    //解锁料理数量任务
    IsFoodNumber(missionData) {
        let num = parseInt(missionData.num);
        let nowNum = 0;
        let list;
        let food;
        let type;
        if (missionData.type2 == "日本") {
            list = Global.FoodList;
            food = Global.gameData.food;
            type = 1;
        }
        else if (missionData.type2 == "中国") {
            list = Global.ChineseFoodList;
            food = Global.gameData.chineseFood;
            type = 2;
        }
        for (let i = 0; i < list.length; i++) {
            if (food[i] > 0 || !PublicFunction.CheckFoodLock(list[i].ID, type)) {
                nowNum++;
            }
        }
        return nowNum >= num;
    },

    //点击前往
    ClickGo() {
        console.log("go");
        if (this.GoToView == "") {
            return;
        }
        else {
            switch (this.GoToView) {
                case "Food":
                    cc.find("Canvas/main").getComponent("PrefabLoader").OpenFood();
                    break;
                case "Equip":
                    cc.find("Canvas/main").getComponent("PrefabLoader").OpenEquip();
                    break;
                case "Research":
                    cc.find("Canvas/main").getComponent("PrefabLoader").OpenResearch();
                    break;
                case "Explore": break;
            }
        }
    },

    //点击获取
    ClickGet() {
        for (let i = 0; i < this.prizeList.length; i++) {
            this.prizeList[i]();
        }
        cc.find("Canvas/main/Tips").getComponent("Tips").ShowNewItem(this.prizeItem);
        Global.gameData.MissionNum++;
        Global.gameData.MissionData = [];
        cc.find("Canvas/main").getComponent("Game").Refresh();
    },

    OpenBG() {
        let missionList = Global.MissionList;
        let missionID = parseInt(Global.gameData.MissionNum);
        if (missionID > missionList.length) {
            cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("敬请期待!");
        }
        else {
            this.target.active = true;
            this.RefreshView();
        }
    },

    CloseBG(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target.active = false;
    },
});