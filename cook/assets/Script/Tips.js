cc.Class({
    extends: cc.Component,

    properties: {
        TipsBG: {
            default: null,
            type: cc.Node,
            displayName: "提示框"
        },
        LevelUpBG: {
            default: null,
            type: cc.Node,
            displayName: "升级框"
        },
        target2: {
            default: null,
            type: cc.Node,
            displayName: "奖励节点"
        },
        bg2_background: {
            default: null,
            type: cc.Node,
            displayName: "奖励弹窗"
        },
        bg2_shareBtn: {
            default: null,
            type: cc.Node,
            displayName: "分享按钮"
        },
        bg2_prize: {
            default: [],
            type: cc.Node,
            displayName: "奖励"
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
        scrollImage: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "菜谱"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() { },

    start() {
        this.TipsBG.opacity = 0;
        this.sound = cc.find("Canvas/main").getComponent("sound");
    },

    ShowTips: function (str) {
        this.TipsBG.opacity = 255;
        this.TipsBG.y = -70;
        this.TipsBG.getComponentInChildren(cc.Label).string = str;
    },

    ShowLevelUp: function () {
        //店铺升级音效
        this.sound.PaySound(this.sound.addFoodSound);
        this.LevelUpBG.active = true;
        this.LevelUpBG.getComponentInChildren(cc.Label).string = "店铺获得升级了！\n体力将恢复全满";
        this.scheduleOnce(e => {
            this.LevelUpBG.active = false;
        }, 2)
    },

    ShowNewEquip: function (str) {
        this.LevelUpBG.active = true;
        this.LevelUpBG.getComponentInChildren(cc.Label).string = str;
        this.scheduleOnce(e => {
            this.LevelUpBG.active = false;
        }, 3)
    },

    ShowNewItem: function (list) {
        if (list.length > 0) {
            this.target2.active = true;
            for (let i = 0; i < this.bg2_prize.length; i++) {
                this.bg2_prize[i].active = false;
            }
            for (let i = 0; i < list.length; i++) {
                let node = this.bg2_prize[i];
                node.active = true;
                let name;
                let num;
                switch (list[i][0]) {
                    case "coin": {
                        name = "金币";
                        num = list[i][1];
                        node.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.coinImage;
                        break;
                    }
                    case "diamond": {
                        name = "钻石";
                        num = list[i][1];
                        node.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.diamondImage;
                        break;
                    }
                    case "ingredient": {
                        name = Global.IngredientList[list[i][1]].Name;
                        num = list[i][2];
                        PublicFunction.LoadImage("ingredient", name, node.getChildByName("image"), () => { this.AdjustPic(node.getChildByName("image")) });
                        break;
                    }
                    case "scroll": {
                        name = list[i][1];
                        num = 1;
                        node.getChildByName("image").getComponent(cc.Sprite).spriteFrame = this.scrollImage;
                        break;
                    }
                }
                node.getChildByName("name").getComponent(cc.Label).string = name;
                node.getChildByName("num").getComponent(cc.Label).string = "x" + num;
                this.AdjustPic(node.getChildByName("image"));
            }
        }
    },

    //缩小图片的大小到80以下
    AdjustPic(target) {
        let width = target.width;
        let height = target.height;
        let widthpre = 80 / width;
        let heightpre = 80 / height;
        if (widthpre < 1 || heightpre < 1) {
            target.scale = widthpre < heightpre ? widthpre : heightpre;
        }
        else if (widthpre > 1 && heightpre > 1) {
            target.scale = widthpre < heightpre ? widthpre : heightpre;
        }
    },

    //去分享
    ToShare() {
        if (CC_WECHATGAME) {
            this.isShare = true;
            ws.share({ pos: 'renwuxy' });
        }
    },

    CloseBG2(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target2.active = false;
    },

    update(dt) {
        if (this.TipsBG.y < 0) {
            this.TipsBG.y += 2;
        }
        else if (this.TipsBG.opacity > 0) {
            this.TipsBG.opacity -= 4;
        }
    },
});
