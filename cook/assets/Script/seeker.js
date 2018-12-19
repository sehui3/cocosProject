import Global from "./Global";
cc.Class({
    extends: cc.Component,

    properties: {
        userName:cc.Label,
        headIcon:cc.Sprite,
        tick:cc.Node,
        ban:cc.Node,
        siteName:cc.Label,
        cd:cc.Node,
    },


    onLoad () {
        this.modelComp = cc.find("Canvas/main/Explore/Explore/bg/model").getComponent("model");
        this.exploreComp = cc.find("Canvas/main/Explore").getComponent("explore");
    },

    init(i){
        console.log("=======================",i)
        this._index = i;
        var inviters = Global.gameData.invitaList;
        this._seeker = inviters[i];
        this.gender = inviters[i].gender;
        this.siteNameStr = inviters[i].site;
        if(i == 0){//小小马的头像
            this.headIcon.spriteFrame = this.exploreComp.headIcon[0];
        }else{
            //加载其他人头像
        }
        this.userName.string = inviters[i].name;

        this.siteName.string = "";
        this.tick.active = false;
        this.ban.active = false;

        if(inviters[i].site){
            if(this.exploreComp.sName == this.siteNameStr ){//在当前场景显示打钩
                this.tick.active = true;
                this.ban.active = false;
                this.siteName.string ="";
                this.modelComp.goBtn.active = false;
            }else{//不在当前场景显示在哪个场景工作
                this.tick.active = false;
                this.ban.active = true;
                this.siteName.string = "在"+inviters[i].site;
                this.modelComp.goBtn.active = true;
            }
        }
    },

    start () {

    },
    selected(){

        if(this.siteNameStr && this.exploreComp.sName !== this.siteNameStr){
            //cd动画
            this.cd.active = true;
            var move = cc.sequence(cc.show(),cc.moveBy(0.5,0,38),cc.hide(),cc.moveBy(0,0,-30));
            this.cd.runAction(move);
            return;
        }

        //当前场景处于工作状态 不能在点击
        if(Global.gameData.seekLv[this.exploreComp.curSerial].work){
            return;
        }
        if(this.siteNameStr)return;

        this.tick.active = !this.tick.active;

        // 选中互斥
        if(this.tick.active){
            if(this.node.parent.tickIndex !== this._index && this.node.parent.tickIndex != undefined){
                this.node.parent.children[this.node.parent.tickIndex].getComponent("seeker").tick.active = false;
            }
            this.node.parent.tickIndex = this._index;
        }



        if(this.tick.active){
            this.modelComp.goBtn.getComponent(cc.Button).interactable = true;
        }else{
            this.modelComp.goBtn.getComponent(cc.Button).interactable = false;
        }
        if(this.gender == "4"){
            this.index = 0;
        }else{
            this.index = this.gender == "1"?2:1;
        }
        Global.selectedSeekerNode = this.node;
        Global.selectedSeeker = this._seeker;
        Global.gameData.seekLv[this.exploreComp.curSerial].seekerGender = this.index;
        this.exploreComp.warkUp(this.tick.active,this.index)
    },
    //点加号
    onInvita(){
        this.exploreComp.openRecruit();
    },
    // update (dt) {},
});
