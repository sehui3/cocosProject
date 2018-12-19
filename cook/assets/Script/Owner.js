import Global from './Global'
import PublicFunction from './PublicFunction'

cc.Class({
    extends: cc.Component,

    properties: {
        Cashier: {
            default: null,
            type: cc.Node,
            displayName: "收银台"
        },
        Desk: {
            default: null,
            type: cc.Node,
            displayName: "工作台"
        },
        Box: {
            default: null,
            type: cc.Node,
            displayName: "纸箱"
        },
        Paper: {
            default: null,
            type: cc.Node,
            displayName: "报纸"
        },
        Fridge: {
            default: null,
            type: cc.Node,
            displayName: "冰箱"
        },
        Place: {
            default: null,
            type: cc.Node,
            displayName: "放置台"
        },
        Altar: {
            default: null,
            type: cc.Node,
            displayName: "神坛"
        },
        Grandma: {
            default: null,
            type: cc.Node,
            displayName: "老奶奶"
        },
        clock: {
            default: null,
            type: cc.Node,
            displayName: "时钟倒计时"
        },
        talk: {
            default: null,
            type: cc.Node,
            displayName: "对话"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.timer = 0;
        this.isCook = false;
        this.GetAnimaTime();
    },

    start() {
        this.clock.getChildByName("point").runAction(cc.repeatForever(cc.rotateBy(3, 360)));
        this.sound = cc.find("Canvas/main").getComponent("sound");
        this.guide = cc.find("Canvas/Guide").getComponent("guide2");
    },

    //获取动画的时间，update要用
    GetAnimaTime() {
        let anim = this.Grandma.getComponent(cc.Animation).getClips();
        for (let i = 0; i < anim.length; i++) {
            switch (anim[i].name) {
                case "grandma_sleep": this.sleepTime = anim[i].duration / anim[i].speed; break;
                case "grandma_tea": this.teaTime = anim[i].duration / anim[i].speed; break;
                case "grandma_idle": this.idleTime = anim[i].duration / anim[i].speed; break;
                case "grandma_wash": this.washTime = anim[i].duration / anim[i].speed; break;
                case "grandma_cook": this.cookTime = anim[i].duration / anim[i].speed; break;
            }
        }
    },

    //刷新老奶奶状态和位置
    RefreshGrandma: function () {
        switch (Global.OwnerStage) {
            case "sleep": this.PlaySleep(); break;
            case "tea": this.PlayTea(); break;
            case "idle": this.PlayIdle(); break;
            case "wash": this.PlayWash(); break;
            case "cook": this.PlayCook(); break;
        }
    },

    //睡觉
    PlaySleep() {
        this.isCook = false;
        this.clock.active = false;
        Global.OwnerStage = "sleep";
        let anim = this.Grandma.getComponent(cc.Animation);
        anim.play('grandma_sleep');
    },

    //喝茶
    PlayTea() {
        this.isCook = false;
        this.clock.active = false;
        Global.OwnerStage = "tea";
        let anim = this.Grandma.getComponent(cc.Animation);
        anim.play('grandma_tea');
    },

    //空闲
    PlayIdle() {
        this.isCook = false;
        this.clock.active = false;
        Global.OwnerStage = "idle";
        let anim = this.Grandma.getComponent(cc.Animation);
        anim.play('grandma_idle');
    },

    //洗碗
    PlayWash() {
        if (Global.OwnerStage != "cook" && Global.OwnerStage != "wash") {
            this.timer = 0;
            let left = cc.v2(14.6, -117.8);
            this.Grandma.position = left;
            this.isCook = false;
            this.clock.active = false;
            Global.OwnerStage = "wash";
            let anim = this.Grandma.getComponent(cc.Animation);
            anim.play('grandma_wash');
            //音效
            this.sound.PaySound(this.sound.washSound);
        }
    },

    //煮饭
    PlayCook() {
        this.clock.active = true;
        let right = cc.v2(69.4, -84.2);
        this.Grandma.position = right;
        Global.OwnerStage = "cook";
        let anim = this.Grandma.getComponent(cc.Animation);
        anim.play('grandma_cook');
        //音效
        this.sound.PaySound(this.sound.boiledSound);
    },

    //刷新设备
    //放置台1，放置台2，桌椅1，桌椅2，工作台，冰箱，收银台，柜台1，柜台2，神坛
    RefreshEquip() {
        this.Place.getChildByName("place2").active = Global.gameData.equip[0] == 1;//放置台1
        this.Paper.active = Global.gameData.equip[0] == 0;//报纸，有放置台1时隐藏
        this.Place.getChildByName("place3").active = Global.gameData.equip[1] == 1;//放置台2
        this.Desk.active = Global.gameData.equip[4] == 1;//工作台
        this.Box.active = Global.gameData.equip[4] == 0;//纸箱，有工作台时隐藏
        this.Fridge.children[0].active = Global.gameData.equip[5] == 0;//没有冰箱
        this.Fridge.children[1].active = Global.gameData.equip[5] == 1;//冰箱
        this.Cashier.active = Global.gameData.equip[6] == 1;//收银台
        this.Altar.active = Global.gameData.equip[9] == 1;//神坛，功能暂时没有
    },

    //刷新放置台
    RefreshPlace() {
        for (let j = 0; j < 3; j++) {
            let parent = this.Place.getChildByName("place" + (j + 1));
            for (let i = 0; i < 2; i++) {
                //数量不为0时才显示
                if (Global.gameData.PlaceFood[i + j * 2][1] != 0) {
                    parent.getChildByName("food" + (i + 1 + j * 2)).active = true;
                    let id = Global.gameData.PlaceFood[i + j * 2][0];
                    //100以下是日本料理，100以上是中国料理
                    if (id < 100) {
                        let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
                        PublicFunction.LoadImage("food", image, parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image"));
                        parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image").scale = 0.6;
                    }
                    else {
                        let image = Global.ChineseFoodList[id - 100 - 1].Name;
                        PublicFunction.LoadImage("chineseFood", image, parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image"));
                        parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("image").scale = 0.3;
                    }
                    parent.getChildByName("food" + (i + 1 + j * 2)).getChildByName("num").getComponent(cc.Label).string = Global.gameData.PlaceFood[i + j * 2][1];
                }
                else {
                    parent.getChildByName("food" + (i + 1 + j * 2)).active = false;
                }
            }
        }
        cc.find("Canvas/main").getComponent("Game").RefreshBtnGroup();
        cc.find("Canvas/main").getComponent("Game").RefreshMission();
    },

    //显示对话框
    ShowTalk() {
        if (!this.talk.active) {
            this.talk.active = true;
            this.talk.stopAllActions();
            this.talk.scale = 1;
            let step1 = cc.scaleTo(0.3, 1.2, 0.7);
            let step2 = cc.scaleTo(0.3, 0.8, 1.2);
            let step3 = cc.scaleTo(0.3, 1.2, 0.7);
            let step4 = cc.scaleTo(0.1, 1.2, 1);
            let step5 = cc.scaleTo(0.1, 1, 1);
            this.talk.runAction(cc.repeatForever(cc.sequence(step1, step2, step3, step4, step5, cc.delayTime(2))));
            cc.find("Canvas/main/Animation").getComponent("Animation").GetTitleMessage(5, 1);
        }
    },

    //主线剧情
    PlayStory() {
        console.log("playstory");
        Global.gameData.MainStory++;
        cc.find("Canvas/main/Story/Story").getComponent("Story").PlayStory("grandpa", Global.gameData.MainStory - 1, () => { this.HideTalk(); }, false);
    },

    //隐藏对话框
    HideTalk() {
        this.talk.active = false;
    },

    update(dt) {
        //当前不在工作
        if (!this.isCook) {
            //突然有了需要制作的食物
            if (Global.gameData.CookingFood.length > 0) {
                this.isCook = true;
                this.PlayCook();
                this.timer = 0;
            }
            //洗碗=》闲置=》喝茶=》睡觉
            else if (Global.OwnerStage == "wash") {
                this.timer += dt;
                if (this.timer >= 3 * this.washTime) {
                    this.PlayIdle();
                    this.timer = 0;
                }
            }
            else if (Global.OwnerStage == "idle") {
                this.timer += dt;
                if (this.timer >= 8 * this.idleTime) {
                    this.PlayTea();
                    this.timer = 0;
                }
            }
            else if (Global.OwnerStage == "tea") {
                this.timer += dt;
                if (this.timer >= 6 * this.teaTime) {
                    this.PlaySleep();
                    this.timer = 0;
                }
            }
        }
        //当前正在工作
        else {
            this.timer += dt;
            this.clock.getComponentInChildren(cc.Label).string = Global.gameData.CookingFood.length;
            this.clock.getChildByName("time").getComponent(cc.Sprite).fillRange = this.timer / Global.gameData.CookingFood[0][1];
            if (this.timer >= Global.gameData.CookingFood[0][1]) {
                //[id, worktime, place, num]
                let nowfood = Global.gameData.CookingFood[0];
                Global.gameData.PlaceFood[nowfood[2]][1] += nowfood[3];//放置台相应的位置的数量
                this.sound.PaySound(this.sound.putFoodSound);//添加菜音效
                //100以下是日本料理，100以上是中国料理
                if (nowfood[0] < 100) {
                    Global.gameData.food[nowfood[0] - 1]++;//自己制作过的食物
                    PublicFunction.ComputeFoodLevel(nowfood[0] - 1, Global.gameData.food[nowfood[0] - 1]);
                }
                else {
                    Global.gameData.chineseFood[nowfood[0] - 100 - 1]++;//自己制作过的食物
                    PublicFunction.ComputeFoodLevel(nowfood[0] - 1, Global.gameData.chineseFood[nowfood[0] - 100 - 1]);
                }
                this.RefreshPlace();//刷新放置台
                Global.gameData.CookingFood.splice(0, 1);
                //显示指引
                if (Global.isGuide && this.guide.step == 9) {
                    this.guide.onSeven();
                }
                this.timer = 0;
                if (Global.gameData.CookingFood.length == 0) {
                    this.PlayIdle();//煮完了，切换回空闲状态
                }
            }
        }
    }
});
