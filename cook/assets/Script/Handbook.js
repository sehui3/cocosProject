import Global from './Global'
import PublicFunction from './PublicFunction'

cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
            displayName: "图鉴节点"
        },
        collectNum: {
            default: null,
            type: cc.Label,
            displayName: "收集度"
        },
        pageNum: {
            default: null,
            type: cc.Label,
            displayName: "页数"
        },
        list: {
            default: null,
            type: cc.Node,
            displayName: "列表"
        },
        target2: {
            default: null,
            type: cc.Node,
            displayName: "详情节点"
        },
        detailName: {
            default: null,
            type: cc.Label,
            displayName: "名字"
        },
        detailID: {
            default: null,
            type: cc.Label,
            displayName: "ID"
        },
        detailImage: {
            default: null,
            type: cc.Node,
            displayName: "图片"
        },
        detailIngredient: {
            default: null,
            type: cc.Node,
            displayName: "食材列表"
        },
        detailText: {
            default: null,
            type: cc.Label,
            displayName: "百科"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.title = 0;
        this.page = 1;
        this.length = 0;
    },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
    },

    RefreshList() {
        this.pageNum.string = "第" + this.page + "页";
        let foodList = [];
        //1是日本料理，2是中国料理，3是食材
        if (this.title == 1) {
            foodList = Global.FoodList;
        }
        else if (this.title == 2) {
            foodList = Global.ChineseFoodList;
        }
        else if (this.title == 3) {
            foodList = Global.IngredientList;
        }
        this.length = Math.floor(foodList.length / 12) + 1;
        for (let i = 0; i < this.list.childrenCount; i++) {
            let child = this.list.children[i];
            let thisFood = foodList[(this.page - 1) * 12 + i];
            if (thisFood) {
                child.active = true;
                let id = parseInt(thisFood.ID);//该食物id
                if (this.title == 1) {
                    let image = "UI_ryouri" + (id < 10 ? "0" + id : id);//图片
                    PublicFunction.LoadImage("food", image, child.getChildByName("image"));
                    child.getChildByName("image").scale = 1;
                }
                else if (this.title == 2) {
                    let image = thisFood.Name;//图片
                    PublicFunction.LoadImage("chineseFood", image, child.getChildByName("image"));
                    child.getChildByName("image").scale = 0.5;
                }
                else if (this.title == 3) {
                    let image = thisFood.Name;//图片
                    PublicFunction.LoadImage("ingredient", image, child.getChildByName("image"));
                    child.getChildByName("image").scale = 0.8;
                }
                let lock = PublicFunction.CheckFoodLock(id, this.title);//未解锁
                child.getChildByName("image").color = lock ? cc.color(0, 0, 0) : cc.color(255, 255, 255);
                let num = id < 100 ? id : id - 100;
                child.getComponentInChildren(cc.Label).string = (num < 100 ? "0" : "") + (num < 10 ? "0" + num : num);
                child.id = id;
            }
            else {
                child.active = false;
            }
        }
    },

    //收集度,1是日本料理，2是中国料理，3是食材
    RefreshCollectNum() {
        let myfood = [];
        let num = 0;
        if (this.title == 1) {
            myfood = Global.gameData.food;
            for (let i = 0; i < myfood.length; i++) {
                if (myfood[i] != 0) {
                    num++;
                }
                else if (!PublicFunction.CheckFoodLock(i + 1)) {
                    num++;
                }
            }
        }
        else if (this.title == 2) {
            myfood = Global.ChineseFoodList;
            num = Global.gameData.chineseFoodUnlock.length;
        }
        else if (this.title == 3) {
            myfood = Global.IngredientList;
            num = Global.gameData.ingredientUnlock.length;
        }
        this.collectNum.string = "收集度 " + num + "/" + myfood.length;
    },

    PrePage() {
        if (this.page > 1) {
            this.page--;
            this.RefreshList();
        }
    },

    NextPage() {
        if (this.page < this.length) {
            this.page++;
            this.RefreshList();
        }
    },

    ClickTitle(event, customEventData) {
        if (this.title != customEventData) {
            this.title = customEventData;
            this.page = 1;
            this.RefreshList();
            this.RefreshCollectNum();
        }
    },

    OpenBG2(event) {
        let id = parseInt(event.target.id);
        if (PublicFunction.CheckFoodLock(id, this.title)) return;
        this.target2.active = true;
        let thisFood;
        //1是日本料理，2是中国料理，3是食材
        if (this.title == 1) {
            thisFood = Global.FoodList[id - 1];
            let image = "UI_ryouri" + (id < 10 ? "0" + id : id);//图片
            PublicFunction.LoadImage("food", image, this.detailImage);
            this.detailImage.scale = 1.5;
            this.detailIngredient.active = false;
        }
        else if (this.title == 2) {
            thisFood = Global.ChineseFoodList[id - 1];
            let image = thisFood.Name;//图片
            PublicFunction.LoadImage("chineseFood", image, this.detailImage);
            this.detailImage.scale = 0.75;
            this.detailIngredient.active = true;
            let ingre = thisFood.Ingredient.split(' ');
            for (let i = 0; i < this.detailIngredient.childrenCount; i++) {
                if (i < ingre.length) {
                    this.detailIngredient.children[i].active = true;
                    let str = ingre[i].split('*');
                    this.detailIngredient.children[i].getChildByName("name").getComponent(cc.Label).string = str[0];
                    this.detailIngredient.children[i].getChildByName("num").getComponent(cc.Label).string = str[1];
                    PublicFunction.LoadImage("ingredient", str[0], this.detailIngredient.children[i].getChildByName("image"));
                }
                else {
                    this.detailIngredient.children[i].active = false;
                }
            }
        }
        else if (this.title == 3) {
            thisFood = Global.IngredientList[id - 1];
            let image = thisFood.Name;//图片
            PublicFunction.LoadImage("ingredient", image, this.detailImage);
            this.detailImage.scale = 1.5;
            this.detailIngredient.active = false;
        }
        let num = id < 100 ? id : id - 100;
        this.detailID.string = (num < 100 ? "0" : "") + (num < 10 ? "0" + num : num);
        this.detailName.string = thisFood.Name;
        this.detailText.string = thisFood.Detail;
    },

    CloseBG2(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target2.active = false;
    },

    OpenBG() {
        this.target.active = true;
        if (this.title == 0) {
            this.title = 1;
            this.page = 1;
            this.RefreshList();
            this.RefreshCollectNum();
        }
    },

    CloseBG(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.CloseBG2();
        this.target.active = false;
    }
});
