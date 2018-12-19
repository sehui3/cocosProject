import Global from "./Global";
import SeekConfig from "./SeekConfig"
import PublicFunction from './PublicFunction'
cc.Class({
    extends: cc.Component,

    properties: {
        walks:cc.Node,//走起弹框
        needTime:cc.Label,//走起弹框里显示的需要的时间
        work:cc.Node,//工作弹框
        unlockIcon:cc.Node,//可解锁食材图片
        notFinish:cc.Node,//未完成节点
        finishN:cc.Node,//已完成节点
        list:cc.Node,//存放已完成的食材节点
        finishItem:cc.Prefab,//已完成食材预制体
        swank:cc.Node,//炫耀一下
        swankItem:cc.Prefab,//炫耀里面的食材
        goBtn:cc.Node,
    },


    onLoad () {
        this.exploreComp = cc.find("Canvas/main/Explore").getComponent("explore");
        // this.goBtn.getComponent(cc.Button).interactable = false;
    },
    getLastValue(){
        //场景序号
        this.curSerial = this.exploreComp.curSerial;
        // 当前场景名
        this.seekName = SeekConfig.seekCode[this.curSerial].name;
        // 当前场景材料表
        this.seekIngredients = SeekConfig.seekSiteConfig[this.seekName].Ingredients;
        // 当前体力值
        this.brawn = Global.gameData.Power;
        // 当前场景等级
        this.seekLv = Global.gameData.seekLv[this.curSerial].lv;
    },

    //走起
    openWalks(){
        this.getLastValue();
        //判断是否可走起
        if(this.brawn >0 && this.brawn <= this.exploreComp._brawn){
            console.log("当前体力值不足！")
            return;
        };
        //循环是否有可以走起的人

        this.cd;
        this.productResult= [];//选择探索的菜
        for(let i in this.exploreComp.keyizuoConf){
            let _curConf = this.exploreComp.keyizuoConf[i];
            if(_curConf.brawn <= this.exploreComp._brawn){
                this.cd = _curConf.cd*60; // 获取冷却时间
                // this.cd = 5; // 获取冷却时间
                // 拼装所需数据
                let o = {};
                o.foodName = _curConf.foodName;
                o.product = _curConf.product[this.seekLv]; // 生产区间
                o.coin = _curConf.coin;
                o.brawn = _curConf.brawn;//体力
                this.productResult.push(o);
            }
        }
        console.log(this.productResult);

        this.needTime.string = this.CountdownFun(this.cd);

        this.walks.active = true;
    },
    //确认走起 开始倒计时
    ok(){
        this.getLastValue();//获取最新的场地信息
        this.goBtn.active = false;
        let _data = Global.gameData.seekLv[this.curSerial];
        _data.work = true;//工作状态
        _data.seeker=Global.selectedSeeker;//当前场景工作者
        _data.timer = this.cd;//倒计时时间
        _data.diamondTime = 60;
        //标记探索员在哪个场景工作
        for(let i in Global.gameData.invitaList){
            let _seeker =  Global.gameData.invitaList[i];
            if(_seeker.openId === _data.seeker.openId){
                _seeker.site = this.seekName;
            }
        }
        //探索内容
        this.exploreComp.workDesc.string = SeekConfig.workDesc[this.curSerial];
        //扣减走起金币，体力
        Global.gameData.Power -= this.exploreComp._brawn;
        Global.gameData.Money -= parseInt(this.exploreComp.walkCoin.string);
        //保存工作状态 ，体力条进度，
        Global.gameData.seekLv[this.curSerial].workStatus = true;
        Global.gameData.seekLv[this.curSerial].progress = this.exploreComp._brawn;
        console.log("Global.gameData.seekLv[this.seekLv]:",Global.gameData.seekLv[this.curSerial])
        this.exploreComp.diamondOffset();//初始钻石数
        this.walks.active = false;//采集弹框
    },
    //关闭采集弹框
    closeWalks(){
        this.walks.active = false;
    },
    start () {

    },
    //倒计时
    CountdownFun(time){
        //把获取时间的功能封装到函数内    注意 时间要向下取整避免小数
        var conS=time;
        var hour=Math.floor(conS/60/60); //  取余/60/60获取时
        var min=Math.floor(conS%3600/60);// 取余/60获取分
        var s=Math.floor(conS%60); //取总秒数的余数
        console.log(hour+"时"+min+"分"+s+"秒");
        var timeStr = hour+"时"+min+"分"+s+"秒";
        return timeStr;
    },
    totwo(e){
        return e<10?"0"+e:""+e;//如果取得的数字为个数则在其前面增添一个0
    },


    //全部升级完后的图标
    finishIcon(){
        this.list.removeAllChildren();
        this.notFinish.active = false;
        this.finishN.active = true;
       var un= Global.gameData.seekUnlockMater[this.curSerial]
        for(var i=0;i<un.length;i++){
            var item = cc.instantiate(this.finishItem);
            PublicFunction.LoadImage("ingredient",un[i] , item.getChildByName("icon"));
            this.list.addChild(item);
        }
    },
    //升级场地
    upSite(){
        this.getLastValue();
        //把已解锁的食材添加进用户数据
        var foodName =  this.seekIngredients[this.seekLv+1].foodName;
        Global.gameData.seekUnlockMater[this.curSerial].push(foodName);
        var lv = this.seekLv+2;
        if(this.curSerial == "4" || this.curSerial == "8"){
            if(this.seekLv == 4){
                this.finishIcon();
            }
            if(lv >= 5){
                lv = 5;
            }
        }else {
            if(this.seekLv == 5){
                this.finishIcon();
            }
            if(lv >= 6){
                lv = 6;
            }
        }
        var upCoin = parseInt(this.exploreComp.upSiteCoin.string);
        if(Global.gameData.Money < upCoin){
            console.log("金币不足");
            return;
        }
        //替换下一个可解锁食材图片
        PublicFunction.LoadImage("ingredient", this.seekIngredients[lv].foodName, this.unlockIcon);
        Global.gameData.Money -= upCoin;//扣减金币
        Global.gameData.seekLv[this.curSerial].lv++;//增加等级
        this.exploreComp.seekLv.string = Global.gameData.seekLv[this.curSerial].lv;//场地等级
        //倒计时清掉
        Global.gameData.seekLv[this.curSerial].timer = 0;
        //显示下一级所需金币及可解锁的食材
        this.exploreComp.upSiteCoinNum();

    },
    //场地详情
    closeQuest(){
        this.exploreComp.siteDetail.active = false;
        this.notFinish.active = true;
        this.finishN.active = false;
        //刷新场地
        this.exploreComp.refreshSite();
        this.exploreComp.getKePro();
    },
    //关闭获得食材弹框
    closeSwank(){
      this.swank.active = false;
    },
    // update (dt) {},
});
