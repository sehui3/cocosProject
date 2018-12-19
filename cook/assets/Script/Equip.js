import Global from './Global'
import PublicFunction from './PublicFunction'

cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
            displayName: "设备节点"
        },
        list: {
            default: null,
            type: cc.Node,
            displayName: "列表"
        },
        equipItem: {
            default: null,
            type: cc.Prefab,
            displayName: "组件"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() { },

    start() {
        this.sound = cc.find("Canvas/main").getComponent("sound");
    },

    //刷新列表
    RefreshList: function () {
        let self = this;
        let equipList = Global.EquipList;
        if (this.list.childrenCount != equipList.length) {
            this.list.removeAllChildren();
        }
        for (let i = 0; i < equipList.length; i++) {
            let newnode;
            if (this.list.childrenCount > i) {
                newnode = this.list.children[i];
            }
            else {
                newnode = cc.instantiate(this.equipItem);
                newnode.parent = this.list;
                newnode.getChildByName("Btn_buy").on(cc.Node.EventType.TOUCH_END, function (event) {
                    self.BuyEquip(equipList[i]);
                })
            }
            newnode.getChildByName("name").getComponent(cc.Label).string = equipList[i].Name;
            newnode.getChildByName("infor").getComponent(cc.Label).string = equipList[i].Detail;
            let white = cc.color(255, 255, 255);
            let orange = cc.color(197, 87, 35);
            let level = parseInt(equipList[i].Level);
            newnode.getChildByName("level").getComponent(cc.Label).string = level;
            newnode.getChildByName("level").color = Global.gameData.Level >= level ? white : orange;
            let money = parseInt(equipList[i].Money)
            newnode.getChildByName("money").getComponent(cc.Label).string = money;
            newnode.getChildByName("money").color = Global.gameData.Money >= money ? white : orange;
            newnode.getChildByName("new").active = Global.gameData.equip[i] == 0 && Global.gameData.Level >= level;
            newnode.getChildByName("Btn_buy").getChildByName("Btn_hasbuy").active = Global.gameData.equip[i] == 1;
            newnode.getChildByName("finish").active = Global.gameData.equip[i] == 1;
            newnode.getChildByName("lock").active = i == 1 && Global.gameData.equip[0] == 0;
            let id = parseInt(equipList[i].ID);
            PublicFunction.LoadImage("equip", "equip" + id, newnode.getChildByName("image"));
        }
    },

    BuyEquip(data) {
        let id = parseInt(data.ID) - 1;
        let money = parseInt(data.Money);
        let level = parseInt(data.Level);
        if (Global.gameData.Money < money) {
            cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("您的金钱不足!");
            return;
        }
        if (Global.gameData.Level < level) {
            cc.find("Canvas/main/Tips").getComponent("Tips").ShowTips("店铺等级不足!");
            return;
        }
        let str = "追加『" + data.Name + "』了。\n" + data.Detail + "!";
        cc.find("Canvas/main/Tips").getComponent("Tips").ShowNewEquip(str);
        cc.find("Canvas/main/Animation").getComponent("Animation").addEqui(id);
        Global.gameData.Money -= money;
        if (Global.gameData.MissionData.length > 0 && Global.gameData.MissionData[0].type1 == "使用") {
            if (Global.gameData.MissionData[0].type2 == "金币") {
                Global.gameData.MissionData[0].nowNum += money;
            }
        }
        Global.gameData.equip[id] = 1;
        this.CloseBG();
        //添加设备音效
        this.sound.PaySound(this.sound.addEquiSound);
        //发送刷新事件
        this.node.dispatchEvent(new cc.Event.EventCustom('refresh', true));
    },

    OpenBG() {
        this.target.active = true;
        this.target.scale = 0;
        this.target.stopAllActions();
        this.target.runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.callFunc(() => {
            this.RefreshList();
            this.list.parent.getComponent(cc.ScrollView).scrollToTop(0.5);
        })));
    },

    CloseBG(e) {
        if (e) {
            //关闭设备页面音效
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target.active = false;
    }
});
