import Global from './Global'
import PublicFunction from './PublicFunction'
cc.Class({
    extends: cc.Component,

    properties: {
        guest_prefab: cc.Prefab,
    },

    onLoad() {
        this.table = this.node.parent.getChildByName("Table");
        // this.peoples = ["bobby_in", "boy_in", "doctor_in", "dosser_in", "girl_in", "monk_in",
        //     "officeWorkers_in", "oldMan_in", "sis_in", "worker_in"];
        this.sound = cc.find("Canvas/main").getComponent("sound");
        this.daypeoples = [];
        this.peoples = [];
        this.unlocked = [];
        this.un = false;//是否是从解锁里随机的客人
        //随机调用、
        this.num = [15, 16, 17, 18, 19, 20];
        this.ss = this.num[this.sum(this.num)];
        this.zxTime = 0;//执行时间
        this.scheduleOnce(() => {
            if (this.days != PublicFunction.CheckWeekday()) {
                this.getPeoples();
            }
            this.eatback();
        }, 3);
    },
    SharePrize() {
        if (this.days != PublicFunction.CheckWeekday()) {
            this.getPeoples();
        }
        for (let i = 0; i < 5; i++) {
            this.eatback();
        }
    },
    start() {

    },
    //曜日变化时更新可进场的人，两部分 1.已解锁的人但不在对应日子的人有概率进场，2.对应日子的人
    getPeoples() {
        this.days = PublicFunction.CheckWeekday();
        console.log("days========", this.days)
        this.daypeoples = Global.approach[this.days].concat();//对应日子的人
        var arr2 = Global.gameData.unlocked;//已解锁的人
        this.unlocked = [];
        this.unlocked = this.removeA(this.daypeoples, arr2);//已解锁但不存在与对应日子数组里的人

    },
    //如果已解锁了新客人 那么去掉解锁里跟对应日子里的一样的人 然后在概率随机
    removeA(arr1, arr2) {
        var arr = [];
        for (var i = 0; i < arr2.length; i++) {
            arr1.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
        }
        return arr;
    },

    eatback() {

        //检索空位
        var leftArr = [];
        var rightArr = [];
        var leftStools = this.table.getChildByName("left_stool").children;
        for (var i = 1; i < 5; i++) {
            if (leftStools[i].someone == null) {
                leftArr.push(leftStools[i])
            }
        }
        var rightStools = this.table.getChildByName("right_stool").children;
        for (var i = 0; i < rightStools.length - 1; i++) {
            if (rightStools[i].someone == null) {
                rightArr.push(rightStools[i])
            }
        }
        var lie = "left";
        var nodeName = null;
        if (Global.gameData.onePlay == true && Global.gameData.unlocked.length <= 0) {//第一次进游戏，先进场的是上班族 <=2说明未解锁新客人
            this.type = "monk_in";
            lie = 'left';
            nodeName = "stool_03";
            this.table.getChildByName("left_stool").getChildByName("stool_03").someone = 1;
            Global.gameData.onePlay = false;
        } else {
            var con = leftArr.concat(rightArr);
            var select = con[this.sum(con)]
            if (leftArr.indexOf(select) != -1) {
                lie = 'left';
                nodeName = select.name;
                select.someone = 1;
            } else if (rightArr.indexOf(select) != -1) {
                lie = 'right';
                nodeName = select.name;
                select.someone = 1;
            } else {
                console.log("座位已满！！");
                return;
            }
            // 随机进场人物
            var n = this.Mathsum(1, 101);
            console.log("nnnnn===" + n)
            if (this.unlocked.length > 0 && this.unlocked.length <7 && n >= 1 && n <= 5) {//未全部解锁百分之20几率随机不在当前曜日进场的人
                this.un = true;
                var index = this.sum(this.unlocked);
                this.type = this.unlocked[index];
            }else if(this.unlocked.length >= 7 && n >=1 && n <=20){
                this.un = true;
                var index = this.sum(this.unlocked);
                this.type = this.unlocked[index];
            } else {
                this.un = false;
                this.peoples = [];
                this.peoples = this.daypeoples;
                var index = this.sum(this.peoples);
                this.type = this.peoples[index];
            }
            /*if (Global.isGuide) {
                this.type = "officeWorkers_in";
                Global.isGuide = false;
            }*/
        }
        console.log("type==", this.type);
        //判断是否是第一次来的客人
        // if (Global.gameData.unlocked.indexOf(this.type) == -1) {
        // Global.gameData.unlocked.push(this.type);
        //调用新客人动画
        // }
        //删除已经进餐厅的人防止重复出现（工人上班族除外）,吃完后要重新加回
        if ('officeWorkers_in' != this.type && 'worker_in' != this.type) {
            if (this.un) {
                this.arrayRemove(this.unlocked, this.type);
            } else {
                this.arrayRemove(this.peoples, this.type);
            }

        }
        console.log("Gun====" + Global.gameData.unlocked, "   this.un====" + this.unlocked, "  daypeoples==" + this.daypeoples, "----peop==" + this.peoples)

        //创建动画
        let guest = cc.instantiate(this.guest_prefab);
        guest.parent = this.node;
        guest.un = this.un;
        guest.getComponent("guest").guestAnim = this;
        guest.getComponent("guest").loadAnim(this.type, lie, nodeName, this.sound);
    },

    //删除数组指定元素
    arrayRemove(arr, val) {
        var index = arr.indexOf(val);
        if (index > -1) {
            arr.splice(index, 1);
        }
    },
    //根据数组长度获取随机数
    sum(arr) {
        //向下取整
        var index = Math.floor(Math.random() * arr.length)
        return index;
    },
    //获取权重，传入数字区间m-n+1，随机出m-n之间的数字
    Mathsum(m, n) {
        var num = Math.floor(Math.random() * (m - n) + n);
        if (num == n) {
            num = num - 1;
        }
        return num;
    },
    //合并数组并去重
    concat_(arr1, arr2) {
        //复制数组
        var arr = arr1.concat();
        for (var i = 0; i < arr2.length; i++) {
            arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
        }
        return arr;
    },
    //刷新桌子和空位
    RefreshTable() {
        this.table = this.node.parent.getChildByName("Table");
        var leftStools = this.table.getChildByName("left_stool").children;
        var rightStools = this.table.getChildByName("right_stool").children;

        //第一张桌子和椅子
        this.table.getChildByName("tab_01").active = Global.gameData.equip[2] == 1;
        leftStools[1].active = Global.gameData.equip[2] == 1;
        rightStools[0].active = Global.gameData.equip[2] == 1;
        if (Global.gameData.equip[2] == 0) {
            leftStools[1].someone = 2;
            rightStools[0].someone = 2;
        }
        else {
            //上一次是2，证明之前还没解锁，则设为0，否则保持不变
            leftStools[1].someone = leftStools[1].someone == 2 ? null : leftStools[1].someone;
            rightStools[0].someone = rightStools[0].someone == 2 ? null : rightStools[0].someone;
        }

        //第四张桌子和椅子
        this.table.getChildByName("tab_04").active = Global.gameData.equip[3] == 1;
        leftStools[4].active = Global.gameData.equip[3] == 1;
        rightStools[3].active = Global.gameData.equip[3] == 1;
        if (Global.gameData.equip[3] == 0) {
            leftStools[4].someone = 2;
            rightStools[3].someone = 2;
        }
        else {
            leftStools[4].someone = leftStools[4].someone == 2 ? null : leftStools[4].someone;
            rightStools[3].someone = rightStools[3].someone == 2 ? null : rightStools[3].someone;
        }

        //柜台左
        this.table.getChildByName("tab_05").active = Global.gameData.equip[7] == 1;
        rightStools[4].active = Global.gameData.equip[7] == 1;
        rightStools[5].active = Global.gameData.equip[7] == 1;
        if (Global.gameData.equip[7] == 0) {
            rightStools[4].someone = 2;
            rightStools[5].someone = 2;
        }
        else {
            rightStools[4].someone = rightStools[4].someone == 2 ? null : rightStools[4].someone;
            rightStools[5].someone = rightStools[5].someone == 2 ? null : rightStools[5].someone;
        }

        //柜台右
        this.table.getChildByName("tab_06").active = Global.gameData.equip[8] == 1;
        rightStools[6].active = Global.gameData.equip[8] == 1;
        rightStools[7].active = Global.gameData.equip[8] == 1;
        if (Global.gameData.equip[8] == 0) {
            rightStools[6].someone = 2;
            rightStools[7].someone = 2;
        }
        else {
            rightStools[6].someone = rightStools[6].someone == 2 ? null : rightStools[6].someone;
            rightStools[7].someone = rightStools[7].someone == 2 ? null : rightStools[7].someone;
        }
    },
    update(dt) {
        if (Global.isGuide && !Global.beginGame) return;
        this.zxTime += dt;
        if (this.zxTime >= this.ss) {
            this.zxTime = 0;
            this.ss = this.num[this.sum(this.num)];
            if (this.days != PublicFunction.CheckWeekday()) {
                this.getPeoples();
            }
            this.eatback();
        }
    },
});
