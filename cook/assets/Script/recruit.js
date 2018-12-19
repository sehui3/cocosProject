import Global from "./Global";
cc.Class({
    extends: cc.Component,

    properties: {
        recBtn:cc.Node,
        friendIcon:{
            default: null,
            type: cc.Sprite,
            displayName: '朋友头像',
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    init(i){
        this.number = i;
        if(Global.gameData.invitaList.length >0 && Global.gameData.invitaList[i]){
            //头像
            // cc.loader.load({url:Global.gameData.invitaList[i].avatarUrl, type: "png"}, (err, spriteFrame) => {
            //     this.friendIcon.spriteFrame = new cc.SpriteFrame(spriteFrame);
            // });
            // if(Global.gameData.invitaList[i].receiveStatus){
            //     this.recBtn.getComponent(cc.Button).interactable = false;
            //     this.recBtn.getChildByName("lab").getComponent(cc.Label).string = '已领取';
            // }
        }else{
            // this.recBtn.active = false;//领取按钮隐藏
        }
    },
    //领取钻石
    receiveIce(){
        console.log(this.number);
        Global.gameData.p_ice_meony += 200;
        Global.gameData.invitaList[this.number].receiveStatus=true;

        this.recBtn.getComponent(cc.Button).interactable = false;
        this.recBtn.getChildByName("lab").getComponent(cc.Label).string = '已领取';
    },
    start () {

    },

    // update (dt) {},
});
