import Global from './Global'
import PublicFunction from './PublicFunction'
cc.Class({
    extends: cc.Component,
    properties: {
        game: {
            default: null,
            type: cc.Node,
            displayName: "游戏主节点"
        },
        tips: {
            default: null,
            type: cc.Node,
            displayName: "提示"
        },
        gold_prefab: {
            default: null,
            type: cc.Prefab,
            displayName: "金币预制"
        },
        goldTitle: {
            default: null,
            type: cc.Node,
            displayName: "金币标题"
        },
        levelupTitle: {
            default: null,
            type: cc.Node,
            displayName: "升级弹窗"
        },
        unlockTitle: {
            default: null,
            type: cc.Node,
            displayName: "解锁弹窗"
        },
        newguestTitle: {
            default: null,
            type: cc.Node,
            displayName: "新客人弹窗"
        },
        newstoryTitle: {
            default: null,
            type: cc.Node,
            displayName: "新剧情弹窗"
        },
        newmainTitle: {
            default: null,
            type: cc.Node,
            displayName: "新主线弹窗"
        },
        sweat_left: {
            default: null,
            type: cc.Prefab,
            displayName: "汗滴预制"
        },
        ribbon_red: {
            default: null,
            type: cc.Prefab,
            displayName: "彩带红色预制"
        },
        ribbon_blue: {
            default: null,
            type: cc.Prefab,
            displayName: "彩带蓝色预制"
        },
        ribbon_yellow: {
            default: null,
            type: cc.Prefab,
            displayName: "彩带黄色预制"
        },
    },

    start() {
        this.levelupList = [];//上层升级弹窗列表
        this.unlockList = [];//中层解锁弹窗列表
        this.newGuestList = [];//下层新客人弹窗列表
        this.newStoryList = [];//下层新对话弹窗列表
        this.newMainList = [];//下层新主线弹窗列表
        this.isPlayingLevelup = false;//正在播放升级特效
        this.isPlayingUnlock = false;//正在播放解锁特效
        this.isPlayingGuest = false;//正在播放客人相关特效
        //金币对象池
        this.goldPool = new cc.NodePool();
        for (let i = 0; i < 100; i++) {
            let newnode = cc.instantiate(this.gold_prefab);
            this.goldPool.put(newnode);
        }
        //汗滴对象池
        this.sweatPool = new cc.NodePool();
        for (let i = 0; i < 20; i++) {
            let newnode = cc.instantiate(this.sweat_left);
            this.sweatPool.put(newnode);
        }
        //彩带对象池
        this.ribbonPool = new cc.NodePool();
        let ribbons = [this.ribbon_yellow, this.ribbon_blue, this.ribbon_red];
        for (let i = 0; i < 100; i++) {
            let newnode = cc.instantiate(ribbons[i % 3]);
            this.ribbonPool.put(newnode);
        }
        //店铺升级粒子效果
        this.particle = this.node.getChildByName("particle").getComponent(cc.ParticleSystem);
        this.equiMask = this.node.getChildByName("maxMark");
        this.equiParticle = this.equiMask.getChildByName("mark").getChildByName("equiParticle").getComponent(cc.ParticleSystem);
        this.equiAnim = this.node.getChildByName("equiAnim");
        this.sound = cc.find("Canvas/main").getComponent("sound");

        this.guide = cc.find("Canvas/Guide").getComponent("guide2");
    },

    addExp() {
        let nowlevel = Global.gameData.Level;
        Global.gameData.Exp++;
        PublicFunction.CheckLevelUp();
        //升级了，恢复到最大体力
        if (Global.gameData.Level > nowlevel) {
            this.game.getComponent("Game").RefreshPower(120);
            this.tips.getComponent("Tips").ShowLevelUp();
        }
        //刷新经验条
        this.game.getComponent("Game").RefreshNumber();
    },

    //飞金币动画，从气泡中间跳到两边，停一下，飞到金币标题
    FlyCoin(BeginPosition, num, isPrize = false) {
        //不是奖励，说明是通过客人结账来的，判断是否触发主线，以及是否触发任务
        if (!isPrize) {
            PublicFunction.CheckMain();
            if (Global.gameData.MissionData.length > 0 && Global.gameData.MissionData[0].type1 == "进食") {
                if (!Global.gameData.MissionData[0].type2) {
                    Global.gameData.MissionData[0].nowNum++;
                    this.game.getComponent("Game").RefreshMission();
                }
            }
        }
        BeginPosition = this.node.convertToNodeSpaceAR(BeginPosition);
        let self = this;
        num = parseInt(num);
        let time = num / 25;
        time = time < 100 ? time : 100;
        for (let i = 0; i < time; i++) {
            let coin;
            if (this.goldPool.size() > 0) {
                coin = this.goldPool.get();
                coin.scale = 1;
                coin.opacity = 255;
            } else {
                coin = cc.instantiate(this.gold_prefab);
            }
            coin.parent = this.node;
            coin.position = BeginPosition;
            //设置跳跃后的位置，在金币气泡的周围
            let limit = Math.floor(time / 30) + 1;
            let xadd = 50 + Math.random() * 50 * limit;
            let x = BeginPosition.x + (Math.random() > 0.5 ? xadd : xadd * -1);
            let yadd = Math.random() * 50 * limit;
            let y = BeginPosition.y + (Math.random() > 0.5 ? yadd : yadd * -1);

            //跳到两边
            let jumptime = 1 + 0.05 * i / limit;
            let round = cc.rotateBy(jumptime, 360 * Math.round(jumptime));
            let jump = cc.jumpTo(jumptime, x, y, 20 + Math.random() * 50, Math.round(1.5 * jumptime));
            let jumpOut = cc.spawn(round, jump);

            //飞了
            let fly = cc.moveTo(1, this.goldTitle.position).easing(cc.easeBackIn());

            //金币发光
            let small = cc.scaleTo(1, 0);
            let fadeout = cc.fadeTo(0.5, 0);
            let light = cc.spawn(small, fadeout, cc.callFunc(() => {
                //金币音效
                this.sound.PaySound(this.sound.paySound);
            }));

            //回调
            let callback = cc.callFunc((e) => {
                e.scale = 2;
                e.opacity = 20;
                Global.gameData.Money += num / time;
                if (!isPrize) {
                    if (Global.gameData.MissionData.length > 0 && Global.gameData.MissionData[0].type1 == "获得") {
                        Global.gameData.MissionData[0].nowNum += num / time;
                    }
                    self.addExp();
                }
                else {
                    self.game.getComponent("Game").RefreshNumber();
                }
            })

            //删除
            let del = cc.callFunc((e) => {
                self.goldPool.put(e);
            })

            let seq = cc.sequence(jumpOut, cc.delayTime(0.07), fly, callback, light, del);
            coin.runAction(seq.clone());
        }
    },

    //升级或者解锁弹窗
    GetTitleMessage(top, id) {
        //层级，1是升级，2是解锁，3是新客人，4是新对话，5是新主线
        if (top == 1) {
            this.levelupList.push(id);
        }
        else if (top == 2) {
            this.unlockList.push(id);
        }
        else if (top == 3) {
            this.newGuestList.push(id);
        }
        else if (top == 4) {
            this.newStoryList.push(id);
        }
        else if (top == 5) {
            this.newMainList.push(id);
        }
        this.ShowTitleMessage();
    },

    //显示弹窗
    ShowTitleMessage() {
        if (!this.isPlayingLevelup && this.levelupList.length > 0) {
            this.levelupTitle.active = true;
            this.levelupTitle.opacity = 255;
            this.TitleFly("levelup");
        }
        if (!this.isPlayingUnlock && this.unlockList.length > 0) {
            this.unlockTitle.active = true;
            this.unlockTitle.opacity = 255;
            this.TitleFly("unlock");
        }
        if (!this.isPlayingGuest) {
            if (this.newGuestList.length > 0) {
                this.newguestTitle.active = true;
                this.newguestTitle.opacity = 255;
                this.TitleFly("newguest");
            }
            else if (this.newStoryList.length > 0) {
                this.newstoryTitle.active = true;
                this.newstoryTitle.opacity = 255;
                this.TitleFly("newstory");
            }
            else if (this.newMainList.length > 0) {
                this.newmainTitle.active = true;
                this.newmainTitle.opacity = 255;
                this.TitleFly("newmain");
            }
        }
    },

    //升级或者解锁的标题飞过去
    TitleFly(type) {
        let self = this;
        let target;//要飞的节点
        let delay = 0;//延迟时间，解锁要比升级晚一点飞出来
        if (type == "levelup") {
            target = this.levelupTitle;
            this.isPlayingLevelup = true;
            let id = this.levelupList[0];//该料理的id
            //100以下是日本料理，100以上是中国料理
            if (id < 100) {
                let thisfood = Global.FoodList[id - 1];
                //节点初始化
                target.getChildByName("name").getComponent(cc.Label).string = thisfood.Name;
                let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
                PublicFunction.LoadImage("food", image, target.getChildByName("image"));
                target.getChildByName("image").scale = 1;
            }
            else {
                let thisfood = Global.ChineseFoodList[id - 100 - 1];
                //节点初始化
                target.getChildByName("name").getComponent(cc.Label).string = thisfood.Name;
                let image = thisfood.Name;
                PublicFunction.LoadImage("chineseFood", image, target.getChildByName("image"));
                target.getChildByName("image").scale = 0.5;
            }
        }
        else if (type == "unlock") {
            //解锁新料理音效
            this.sound.PaySound(this.sound.addFoodSound);
            target = this.unlockTitle;
            this.isPlayingUnlock = true;
            let id = this.unlockList[0];//该料理的id
            let thisfood = Global.FoodList[id - 1];
            delay = 0.4;//解锁要比升级晚一点飞出来
            //节点初始化
            target.getChildByName("name").getComponent(cc.Label).string = thisfood.Name;
            let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
            PublicFunction.LoadImage("food", image, target.getChildByName("image"));
        }
        else if (type == "newguest") {
            this.sound.PaySound(this.sound.DialogueSound);
            target = this.newguestTitle;
            this.isPlayingGuest = true;
            let name = this.newGuestList[0];//客人名字
            //节点初始化
            target.getChildByName("name").getComponent(cc.Label).string = PublicFunction.GetNameStr(name);
            PublicFunction.LoadImage("head", name, target.getChildByName("image"));
        }
        else if (type == "newstory") {
            this.sound.PaySound(this.sound.DialogueSound);
            target = this.newstoryTitle;
            this.isPlayingGuest = true;
            let name = this.newStoryList[0];//客人名字
            let storyID = Global.gameData.GuestStory[name];//解锁的剧情ID
            let storyUnlock = [];//解锁剧情条件
            for (let i = 0; i < Global.StoryUnLock.length; i++) {
                if (Global.StoryUnLock[i].Name == name) {
                    storyUnlock = Global.StoryUnLock[i];
                    break;
                }
            }
            let storyName = storyUnlock["Story" + storyID];//剧情名字
            //节点初始化
            target.getChildByName("name").getComponent(cc.Label).string = storyName;
            PublicFunction.LoadImage("head", name, target.getChildByName("image"));
        }
        else if (type == "newmain") {
            this.sound.PaySound(this.sound.DialogueSound);
            target = this.newmainTitle;
            this.isPlayingGuest = true;
        }

        target.x = 800;
        //快速飞到中间，然后慢慢飞一小段，快速飞走
        let flytomid = cc.moveTo(0.5, cc.v2(50, target.y)).easing(cc.easeOut(2));
        let flyslow = cc.moveTo(0.7, cc.v2(0, target.y));
        let flytoright = cc.moveTo(0.5, cc.v2(-800, target.y)).easing(cc.easeIn(2));
        let fadeout = cc.fadeOut(0.35);
        let delayfade = cc.sequence(cc.delayTime(0.15), fadeout);
        let flyout = cc.spawn(flytoright, delayfade);
        let callback = cc.callFunc(() => {
            if (type == "levelup") {
                self.isPlayingLevelup = false;
                self.levelupList.splice(0, 1);
            }
            else if (type == "unlock") {
                self.isPlayingUnlock = false;
                self.unlockList.splice(0, 1);
            }
            else if (type == "newguest") {
                self.isPlayingGuest = false;
                self.newGuestList.splice(0, 1);
                if (Global.isGuide && self.guide.step == 6) {
                    self.guide.onFive();//调用新手引导
                }

            }
            else if (type == "newstory") {
                self.isPlayingGuest = false;
                self.newStoryList.splice(0, 1);
            }
            else if (type == "newmain") {
                self.isPlayingGuest = false;
                self.newMainList.splice(0, 1);
            }
            self.ShowTitleMessage();
        })
        let seq = cc.sequence(cc.delayTime(delay), flytomid, flyslow, flyout, callback);
        target.runAction(seq.clone());
    },
    //汗水动画
    FlySweat(node, sum, sc, x, dt) {
        let n = 1;
        var _node
        for (var i = 0; i < sum; i++) {
            if (this.sweatPool.size() > 0) {
                _node = this.sweatPool.get();
            } else {
                _node = cc.instantiate(this.sweat_left);
            }
            _node.scaleX = n;
            _node.n = n;
            n = -n;
            _node.parent = node;
            _node.x = x * n;
            var ran_x = Math.random() * 90 * n;
            var ran_y = Math.random() * 90;

            _node.scale = 0;
            _node.runAction(cc.sequence(cc.delayTime(i / 25), cc.callFunc(e => {
                e.scaleX = sc * e.n;
                e.scaleY = sc;
            }), cc.moveBy(dt, ran_x, ran_y), cc.callFunc(e => {
                // e.removeFromParent();
                e.setPosition(x, 80)
                this.sweatPool.put(e);
            })))
        }
    },

    //彩带
    FlyRibbon(playSound = true) {
        //食物升级音效
        if (playSound) {
            this.sound.PaySound(this.sound.foodUpSound);
        }
        let n = 1;
        let _node;
        let ribbons = [this.ribbon_yellow, this.ribbon_blue, this.ribbon_red];
        for (let i = 0; i <= 70; i++) {
            if (this.ribbonPool.size() > 0) {
                _node = this.ribbonPool.get();
            } else {
                _node = cc.instantiate(ribbons[i % 3]);
            }
            _node.scaleX = n;
            n = -n;
            _node.parent = this.node;
            _node.position = cc.v2(Math.random() * 320 * n, 600);
            let ran_x = Math.random() * -640 * n;
            let ran_y = Math.random() * -1138;
            _node.runAction(cc.sequence(cc.delayTime(i / 50), cc.moveBy(1.5, ran_x, ran_y), cc.callFunc(e => {
                this.ribbonPool.put(e);
            })))
        }
    },

    //店铺升级特效
    FlyParticle() {
        this.particle.resetSystem();
    },
    //添加设备
    addEqui(id) {
        let position = this.GetEquipPosition(id);
        this.equiAnim.position = position;
        this.equiMask.position = position;
        var show = cc.callFunc(() => {
            this.equiAnim.active = true;
            this.equiAnim.getComponent(cc.Animation).play()
        })
        var part = cc.callFunc(() => {
            this.equiParticle.resetSystem();
        });
        var end = cc.callFunc(e => {
            this.equiAnim.active = false;
        });
        this.node.runAction(cc.sequence(part, cc.delayTime(0.6), show, cc.delayTime(3.5), end))
    },

    //获取设备的位置
    GetEquipPosition(id) {
        let position;
        switch (id) {
            case 0: position = cc.v2(-29, -247); break;
            case 1: position = cc.v2(188, -313); break;
            case 2: position = cc.v2(104, 209); break;
            case 3: position = cc.v2(-217, 75); break;
            case 4: position = cc.v2(213, -177); break;
            case 5: position = cc.v2(-294, -82); break;
            case 6: position = cc.v2(253, 55); break;
            case 7: position = cc.v2(-165, -48); break;
            case 8: position = cc.v2(-22, 0); break;
            case 9: position = cc.v2(-245, 318); break;
        }
        return position;
    },
})