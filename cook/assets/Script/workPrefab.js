import Global from "./Global";
import SeekConfig from "./SeekConfig";
import PublicFunction from "./PublicFunction";

cc.Class({
    extends: cc.Component,

    properties: {
        time_src:cc.Label,//倒计时
        workDesc:cc.Label,
        diamond:cc.Label,//钻石
    },


    onLoad () {
        this.exploreComp = cc.find("Canvas/main/Explore").getComponent("explore");
        this.modelComp = cc.find("Canvas/main/Explore/Explore/bg/model").getComponent("model");
    },

    start () {

    },
    //节点激活时
    onEnable(){
        if(this.endTime!=null){
            var time = (Date.now() - this.endTime)/1000;
            Global.gameData.seekLv[this.ser].timer -= Math.round(time);
            if(Global.gameData.seekLv[this.ser].timer<=0){
                Global.gameData.seekLv[this.ser].timer=0;
            }
            this.on_time();
            console.log("time===",time,Math.round(time))
        }
    },
    //节点关闭时
    onDisable(){
        this.endTime = Date.now();
    },
    //time 倒计时时间，i 场地序号
    init(time,i){
        this.ser = i;
        //保存当前倒计时时间
        // Global.gameData.seekLv[i].timer = time;
        //探索内容
        this.workDesc.string = SeekConfig.workDesc[i];
        this.on_time();
        this.diamondOffset();
        //每隔一秒调一次
        this.schedule(this.on_time.bind(this),1);
        //钻石抵扣 没分钟调一次
        this.schedule(this.diamondOffset,60);
    },
    //倒计时
    on_time(){
        //把获取时间的功能封装到函数内    注意 时间要向下取整避免小数
        var conS=Global.gameData.seekLv[this.ser].timer;//秒
        var hour=Math.floor(conS/60/60); //  取余/60/60获取时
        var min=Math.floor(conS%3600/60);// 取余/60获取分
        var s=Math.floor(conS%60); //取总秒数的余数
        console.log(hour+"时"+min+"分"+s+"秒");
        if(conS<0){//倒计时完成 执行功能，
            this.exploreComp.seekNode.getChildByName("work").active = false;
            //探索完成清除所有函数
            this.unscheduleAllCallbacks();
            console.log("t探索完成");
            this.node.removeFromParent();
            var image = this.modelComp.swank.getChildByName("image");
            image.removeAllChildren();
            //循环当前能获取的菜 返回能获取到的数量
            for(var i =0;i<this.modelComp.productResult.length;i++){
               var swankItem = cc.instantiate(this.modelComp.swankItem);
                var re = this.modelComp.productResult[i]
                PublicFunction.LoadImage("ingredient",re.foodName, swankItem.getChildByName("icon"));
                var num = PublicFunction.getMath(re.product[0],re.product[1]);
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
            Global.gameData.seekLv[this.ser].work = false;
            Global.gameData.seekLv[this.ser].seeker = null;
            this.exploreComp.openSite(null,this.ser);
            this.modelComp.swank.active = true;
            return;
        }
        Global.gameData.seekLv[this.ser].timer--;
        this.time_src.string = hour+"时"+min+"分"+s+"秒";
    },
    totwo(e){
        return e<10?"0"+e:""+e;//如果取得的数字为个数则在其前面增添一个0
    },
    //钻石抵扣数
    diamondOffset(){
        var num = Math.round(Global.gameData.seekLv[this.ser].timer/60*6);
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
        Global.gameData.seekLv[this.ser].timer = 0;


        //弹出炫耀框
    },
    // update (dt) {},
});
