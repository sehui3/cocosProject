import Global from "./Global";
import SeekConfig from "./SeekConfig"
import PublicFunction from "./PublicFunction";
cc.Class({
    extends: cc.Component,

    properties: {
        explore:cc.Node,
        sites:cc.Node,//场景节点
        seeker:cc.Prefab,//探索员预制
        content:cc.Node,//场景页里已经邀请到的探索员
        headIcon:{
            default:[],
            type:cc.SpriteFrame,
        },
        people:cc.Node,//走起台上的人
        peopIcon:{//走起台上的人图片
            default:[],
            type:cc.SpriteFrame,
        },
        brawn:cc.Label,//所需体力
        recruit:cc.Node,//招募弹框
        baseScrollView:cc.Node,//招募
        siteDetail:cc.Node,//场地升级弹窗
        upSiteCoin:cc.Label,//场地升级所需金币
        seekName:cc.Label,//场地名称
        seekLv:cc.Label,//场地等级
        walkCoin:cc.Label,//走起金币

        Materials:cc.Prefab,//场地对应食材预制
        //等级颜色图片
        lvIcon:{
          default:[],
          type:cc.SpriteFrame,
        },
        lvPrefab:cc.Prefab,//等级预制体
        slider:cc.Node,
        sliderBG:cc.Node,
        workPrefab:cc.Node,//倒计时弹框
        time_src:cc.Label,//倒计时
        workDesc:cc.Label,
        diamond:cc.Label,//钻石
        seasonLab:cc.Label,//场地明细里季节加成文字
        seasonDesc:cc.Label,//场地详情里加成描述
        seasonNode:cc.Node,//四季节点
        closeExporeBtn:cc.Node,//场景关闭按钮
        closeSiteBtn:cc.Node,//场景关闭按钮
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log(Global.gameData)

        this.modelComp = cc.find("Canvas/main/Explore/Explore/bg/model").getComponent("model");
        this.sliderProgress = this.slider.getChildByName("bj");

        this.sliderHandle = this.slider.getChildByName("Handle");
        this.sliderHandle.on(cc.Node.EventType.TOUCH_MOVE, this.onSlider, this);
        //季节
        this.seasonCut();

    },
    //滑块华东监听事件
    onSlider(e) {
        let x = e.getDelta().x;
        let next = e.target.x + x;
        if (next < this.leftX) {
            next = this.leftX
        }
        if (next > this.rightX) {
            next = this.rightX;
        }
        e.target.x = next;
        let index = 0;
        for (let i in this.allPosArr) {
            if (next >= this.allPosArr[i]) {
                index = parseInt(i);
            }
        }
        index += this.arr[0];
        this._brawn= index;
        this.brawn.string = index;
        //改变绿色进度条的长度
        let a = new cc.v2(this.initSliderProgressX,0);
        let b = new cc.v2(next,0);
        let len = b.sub(a).mag();
        this.sliderProgress.width = len;
        //根据选择的体力 遍历可探索菜中的最大等级 算出走起金币
        var pro = this.keyizuoConf;
        for(var i=0;i<pro.length;i++){
            if(index>= pro[i].brawn){
                this.walkCoin.string = pro[i].coin;
                console.log(pro[i].coin)
            }

        }
    },


    start () {

    },
    //倒计时
    startTimer(){
        this.schedule(e=>{
            var diamondTime = 0;
            for(let i in Global.gameData.seekLv){
                let curSiteData = Global.gameData.seekLv[i];
                if(curSiteData.unlock && curSiteData.work){

                    if(curSiteData.timer <=0){
                        console.log("t探索完成");
                        //季节加成
                        var seasonSite = SeekConfig.seasonAdd[this.curSeason].indexOf(SeekConfig.seekCode[i].name);
                        var image = this.modelComp.swank.getChildByName("image");
                        image.removeAllChildren();
                        //循环当前能获取的菜 返回能获取到的数量
                        for(var k =0;k<this.modelComp.productResult.length;k++){
                            var swankItem = cc.instantiate(this.modelComp.swankItem);
                            var re = this.modelComp.productResult[k]
                            PublicFunction.LoadImage("ingredient",re.foodName, swankItem.getChildByName("icon"));
                            var maxPro = re.product[1];
                            console.log("加成前====",maxPro);
                            if(seasonSite != -1){
                                maxPro += PublicFunction.getMath(1,5);//加成产量
                                console.log("加成后====",maxPro);
                            }
                            var num = PublicFunction.getMath(re.product[0],maxPro);
                            swankItem.getChildByName("lab").getComponent(cc.Label).string="x"+num;
                            var id;
                            for(var j= 0; j<Global.IngredientList.length;j++){
                                if(re.foodName == Global.IngredientList[j].Name){
                                    id = parseInt(Global.IngredientList[j].ID);
                                }
                            }
                            Global.gameData.ingredient[id-1]+=num;//保存探索到的食材的数量
                            image.addChild(swankItem);
                        }
                        Global.gameData.seekLv[i].work = false;
                        for(let i2 in Global.gameData.invitaList){
                            let _seeker =  Global.gameData.invitaList[i2];
                            if(Global.gameData.seekLv[i].seeker && _seeker.openId === Global.gameData.seekLv[i].seeker.openId){
                                _seeker.site = "";
                                if(i != this.curSerial){
                                    this.content.children[i2].getComponent("seeker").init(i2);
                                }
                            }

                        }
                        Global.gameData.seekLv[i].seeker = null;
                        this.modelComp.swank.active = true;

                    }else {
                        curSiteData.timer --;
                    }
                    ////钻石抵扣 没分钟调一次
                    if(curSiteData.diamondTime <=0){
                        curSiteData.diamondTime = 60;
                        this.diamondOffset();
                    }else{
                        curSiteData.diamondTime --;
                    }

                }

                if(Global.gameData.seekLv[this.curSerial].work){
                    this.modelComp.goBtn.active = false;
                    this.workPrefab.active = true;
                    this.timeFormat()

                }else{
                    this.modelComp.goBtn.active = true;//走起按钮
                    this.workPrefab.active = false;

                }

            }
        },1);
    },
    timeFormat(){
        //把获取时间的功能封装到函数内    注意 时间要向下取整避免小数
        var conS=Global.gameData.seekLv[this.curSerial].timer;//秒
        var hour=Math.floor(conS/60/60); //  取余/60/60获取时
        var min=Math.floor(conS%3600/60);// 取余/60获取分
        var s=Math.floor(conS%60); //取总秒数的余数
        var timeStr = hour+"时"+min+"分"+s+"秒";
        this.time_src.string = timeStr;
        return timeStr;
    },
    //钻石抵扣数
    diamondOffset(){
        var num = Math.round(Global.gameData.seekLv[this.curSerial].timer/60*6);
        if(num < 1){
            num = 1;
        }
        this.diamond.string = num;
        return num;
    },
    //使用钻石
    quicken(){
        var dia = parseInt(this.diamond.string);
        if(Global.gameData.Diamond < dia){
            console.log("钻石不足");
            return;
        }
        Global.gameData.Diamond -= dia;
        console.log("使用了钻石"+dia);
        //停止倒计时
        Global.gameData.seekLv[this.curSerial].timer = 0;
    },
    //打开探索
    openExpore(){
        this.closeExporeBtn.active = true;
        this.closeSiteBtn.active = false;
      this.explore.active = true;
    },
    //关闭探索
    closeExpore(){
        this.explore.active = false;
    },
    //打开场景
    openSite(e,n){

        if(!Global.gameData.seekLv[n].unlock){
            console.log("场地未解锁");
            return;
        }
        this.closeSiteBtn.active = true;
        this.closeExporeBtn.active = false;
        if(this.type){
            this.sites.getChildByName(this.type).active = false;//隐藏上一个场景
        }
        this.curSerial = n;//场地序号
        //在工作
        if(Global.gameData.seekLv[n].work){
            this.modelComp.goBtn.active = false;//走起按钮隐藏
            this.workPrefab.active = true;//倒计时弹出
            //时间显示即时的
            this.timeFormat();
            //切换场景时 钻石倒计时数完了 刷新
            this.diamondOffset();
            //探索内容
            this.workDesc.string = SeekConfig.workDesc[n];

            this.people.active = true;
            this.people.getComponent(cc.Sprite).spriteFrame = this.peopIcon[Global.gameData.seekLv[n].seekerGender];

        }else{
            this.workPrefab.active = false;
            this.people.active = false;
            this.modelComp.goBtn.active = true;
            this.modelComp.goBtn.getComponent(cc.Button).interactable = false;//禁用但不隐藏
        }

        //根据场景序号 获取场景名称，节点名称
        var seekCode = SeekConfig.seekCode[n];
        this.sName = seekCode.name;
        this.seekName.string = this.sName;//场地名称

        this.type = seekCode.code;
        this.sites.active = true;
        this.seekNode = this.sites.getChildByName(this.type);
        this.refreshSite();
        this.getKePro();

        this.seekNode.active = true;
        this.createSeeker();



        if(!Global.startTimer){
            Global.startTimer = true;
            this.startTimer();
        }
    },
    //解锁刷新场地
    refreshSite(){
        //季节
        this.seasonCut();
        this.lv = Global.gameData.seekLv[this.curSerial].lv;
        this.seekLv.string = this.lv;//场地等级
        var seekCode = SeekConfig.seekCode[this.curSerial];
        this.seekNode = this.sites.getChildByName(this.type);
        this.MaterialsListNode = this.seekNode.getChildByName("MaterialsList");
        this.MaterialsListNode.removeAllChildren();
        this.lvListNode = this.seekNode.getChildByName("lvList");
        this.lvListNode.removeAllChildren();
        //场地配置
        this.seekConf = SeekConfig.seekSiteConfig[seekCode.name].Ingredients;
        //场地待解锁食材
        var seekIngredients = SeekConfig.seekIngredients[this.curSerial];
        this.targetNodes = [];
        this.arr = [];
        for(var i=0;i<seekIngredients.length;i++){
            this.arr.push(this.seekConf[i+1].brawn);//每个菜对应的体力值
            var ing = cc.instantiate(this.Materials);//食材
            //等级
            PublicFunction.LoadImage("ingredient",seekIngredients[i], ing);
            this.MaterialsListNode.addChild(ing);

            var lvItem = cc.instantiate(this.lvPrefab);//等级
            this.lvListNode.addChild(lvItem);

            if(Global.gameData.seekUnlockMater[this.curSerial].includes(seekIngredients[i])){
                ing.getChildByName("suo").active = false;
                this.targetNodes.push(ing);

                //已解锁的显示对应体力
                lvItem.getChildByName("level").getComponent(cc.Label).string =this.seekConf[i+1].brawn;
            }else{
                lvItem.getChildByName("level").getComponent(cc.Label).string = (i+1) +"级";
            }

            if(i == 0){
                lvItem.getComponent(cc.Sprite).spriteFrame = this.lvIcon[0];
            }else{
                lvItem.getComponent(cc.Sprite).spriteFrame = this.lvIcon[1];
            }
            //加成图标
            if(this.seasonSite !=-1){
                ing.getChildByName("add").active = true;
            }
        }




        //等级位置调整 与菜一致
        this._MaterialsList = this.MaterialsListNode.children;
        this.scheduleOnce(e=>{
            this.lvListNode.x = this.MaterialsListNode.x;
            this.lvListNode.children.forEach((e,i)=>{
                e.x = this._MaterialsList[i].x;
            })

            //调整滑块
            this.slider.width = this.MaterialsListNode.width;

            this.slider.x = this.slider.parent.convertToNodeSpaceAR(this.MaterialsListNode.convertToWorldSpaceAR(cc.v2(0,0))).x;

            this.sliderBG.width = this.slider.width;
            this.sliderBG.x = this.slider.x;
            // 绿色进度条位置
            this.sliderProgress.x = -this.slider.width / 2;
            this.initSliderProgressX = this.sliderProgress.x;

            // 获取解锁的第一个节点
            let start = this.targetNodes[0];
            // 获取解锁的最后一个节点
            let end = this.targetNodes[this.targetNodes.length - 1];
            // 最左滑动X
            this.leftX = start.x;
            // 最右滑动X
            this.rightX = end.x;
            // 两点之间长度

            // 获取所哟体力标记点的x值
            this.allPosArr = [start.x];
            this.arr.forEach((e,i)=>{
                if(this.arr[i+1]){
                    let next = this.arr[i+1];
                    let n = next - e;
                    this.towDotLength = this._MaterialsList[i].position.sub(this._MaterialsList[i+1].position).mag();
                    let per = this.towDotLength / n ;
                    per = Math.floor(per);
                    for(let j = 1 ;j <= n ;j ++){
                        let pos = this.allPosArr[this.allPosArr.length-1] + per
                        this.allPosArr.push(pos);
                    }
                }

            })
            // console.log(this.allPosArr,this.arr)

            //判断是否在工作 还原进度条拉到的位置
            if(Global.gameData.seekLv[this.curSerial].workStatus){
                let pro = Global.gameData.seekLv[this.curSerial].progress;
                console.log("pro:",pro)
                //改变绿色进度条的长度
                let a = new cc.v2(this.initSliderProgressX,0);
                let b = new cc.v2(this.allPosArr[pro],0);
                let len = b.sub(a).mag();
                this.sliderProgress.width = len;
                this.sliderHandle.x = this.allPosArr[pro];
            }else{
                console.log("未工作。。。")
                this.sliderHandle.x = this._MaterialsList[0].x;
                //this.sliderProgress.width = this.sliderHandle.width / 2;
                //改变绿色进度条的长度
                let a = new cc.v2(this.initSliderProgressX,0);
                let b = new cc.v2(this.sliderHandle.x,0);
                let len = b.sub(a).mag();
                this.sliderProgress.width = len;
                this.walkCoin.string = 200;
                this.brawn.string = this.arr[0];
                this._brawn = this.arr[0];

            }
        });



    },
    //获取可生产的菜
    getKePro(){
        // 获取到当前可生产的材料表

        // 当前场景材料表
        this.seekIngredients = SeekConfig.seekSiteConfig[this.sName].Ingredients;
        this.keyizuoConf = [];
        for(let i in this.seekIngredients){
            let _seekLv = parseInt(i);
            if(this.lv >= _seekLv){
                this.keyizuoConf.push(this.seekIngredients[i])
            }
        }

    },
    //关闭场景
    closeSite(){
        this.sites.getChildByName(this.type).active = false;
        this.sites.active = false;
        this.closeExporeBtn.active = true;
        this.closeSiteBtn.active = false;
    },
    //问号与升级
    questionByUp(){
        this.siteDetail.active = true;
        if(this.curSerial == "4" || this.curSerial == "8"){
            if(Global.gameData.seekUnlockMater[this.curSerial].length >=5){
                this.modelComp.finishIcon();
                return;
            }
        }else{
            if(Global.gameData.seekUnlockMater[this.curSerial].length >=6){
                this.modelComp.finishIcon();
                return;
            }
        }
        this.upSiteCoinNum();
    },

    //升级场地所需金币
    upSiteCoinNum(){
        var curlv = Global.gameData.seekLv[this.curSerial].lv;
        console.log(typeof curlv)
        var upCoin ;
        if(this.curSerial == "4" || this.curSerial == "8"){//猪圈和牧场只有5级
            upCoin = 1500 * Math.pow(2.5,(curlv +1 -2) );
        }else{
            upCoin = 1000 * Math.pow(2.5,(curlv +1 -2) );
        }
        upCoin = Math.round(upCoin);
        this.upSiteCoin.string = upCoin;
        return upCoin;
    },
    // 加载探索者
    createSeeker(){
        if(!this.content.childrenCount){
            var inviters = Global.gameData.invitaList;

            for(var i=0;i< inviters.length;i++){
                let seeker = cc.instantiate(this.seeker);
                this.content.addChild(seeker);
            }
            let seeker = cc.instantiate(this.seeker);
            seeker.getChildByName("add").active = true;
            seeker.getChildByName("people").active = false;
            this.content.addChild(seeker);
        }
        this.refreshSeeker();

    },
    //刷新探索者状态
    refreshSeeker(){
        for(var i = 0;i<this.content.childrenCount-1;i++){
            let seeker = this.content.children[i];
            let comp = seeker.getComponent("seeker");
            comp.exploreComp = this;
            comp.init(i);
        }

    },
    //站到走起台
    warkUp(sel,i){
        if(!sel){
            this.people.active = false;
        }else{
            this.people.getComponent(cc.Sprite).spriteFrame = this.peopIcon[i];
            this.people.active = true;
        }

    },
    //去招募
    goRecruit(){
        console.log("招募")
    },
    //打开招募页面
    openRecruit(){
        // 允许分享则出现好友模式
        let self = this;
        // if(!Global.config.allow_share)return;
        this.recruit.active = true;
        let scale = cc.scaleTo(0.3,1,1).easing(cc.easeBackOut());
        this.recruit.runAction(cc.sequence(scale,cc.callFunc(e=>{
            //接收已经接受邀请了的新用户
            /*Miniant.receiveMessage({
                success(res){
                    if(res && res.length){
                        res.forEach(user=>{
                            console.log("接收到的新用户：",user)
                            Global.gameData.friendList.push(user.data);
                        })
                    }
                    //渲染邀请列表
                    self.init(0,(node,i)=>{
                        node.getComponent(node.name).init(i)
                    })
                }
            });*/
            self.baseScrollView.getComponent("BaseScrollView").init(0,(node,i)=>{
                node.getComponent(node.name).init(i)
            })
        })));

    },
    closeRecruit(){
        let scale = cc.scaleTo(0.3,0,0).easing(cc.easeBackOut());
        this.recruit.runAction(cc.sequence(scale,cc.callFunc(e=>{
            this.recruit.active = false;
        })));
        // 提交数据
        // Miniant.storeData(Global.gameData, true);
    },
    //右箭头
    onRight(){
        var i = parseInt(this.curSerial)+1;
        if(i>8){
            return;
        }
        this.openSite(null,i)
    },
    //左箭头
    onLeft(){
        var i = parseInt(this.curSerial)-1;
        if(i<1){
            return;
        }
        this.openSite(null,i)
    },
    //季节转换
    seasonCut(){
        var updatime = Global.gameData.updateTimestamp;
        if(!this.isSameDay(Date.now(),1545203993048)){
            Global.gameData.curSeason +=1;
            if(Global.gameData.curSeason >4){
                Global.gameData.curSeason = 1;
            }
        }
        this.curSeason = SeekConfig.season[Global.gameData.curSeason];//当前季节
        this.seasonNode.children.forEach((e,i)=>{
            if(i == Global.gameData.curSeason-1){
                e.active = true;
            }else{
                e.active = false;
            }

        })
        //季节加成
        this.seasonSite = SeekConfig.seasonAdd[this.curSeason].indexOf(this.sName);//当前场景是否是当前季节加成场景
        this.seasonLab.string = this.curSeason +"季产量加成";
        if( this.seasonSite != -1){
            this.seasonDesc.string = "所有作物产量加成"
        }else{
            this.seasonDesc.string = "无产量加成的作物"
        }
    },
    // 判断是否同一天
    isSameDay(a, b) {
        let _a = new Date(a);
        _a = "" + _a.getFullYear() + (_a.getMonth() + 1) + _a.getDate();
        let _b = new Date(b)
        _b = "" + _b.getFullYear() + (_b.getMonth() + 1) + _b.getDate();
        return _a === _b;
    },
    // update (dt) {},
});
