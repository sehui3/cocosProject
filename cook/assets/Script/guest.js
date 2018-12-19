import Global from './Global'
import PublicFunction from './PublicFunction'
cc.Class({
    extends: cc.Component,

    properties: {
        urge: cc.SpriteFrame,
        talk: cc.Node,
        eatBar: cc.Sprite,
        payMoney: cc.Node,
    },
    onLoad() {
        this.eatIt = [];//吃过的
        this.is_one = false;//是否第一次点
        this.eatTime = 0;//已经吃了的时间
        this.pointTime = 0;
        this.addTime = 0;//加菜后前面点的菜吃的时间，10秒后隐藏
        this.point = null;//最终点的菜
        //判断有没有白饭 有必点
        this.onePointTime = 0;//刚进来如果没有菜 一秒钟刷新一次菜台
        this.overOut = false;//判断是否能结账
    },

    start() {
        this.payMoney.getChildByName("coin").runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.3, 0, 1), cc.scaleTo(0.3, -1, 1), cc.scaleTo(0.3, 0, 1), cc.scaleTo(0.3, 1, 1))));
        this.guide = cc.find("Canvas/Guide").getComponent("guide2");
    },

    //开门动画
    openLeft() {
        this.sound.PaySound(this.sound.openSound);
        //进来开左门
        let door = cc.find("Canvas/main/Guest/door").getChildByName("left");
        var on = cc.sequence(cc.moveTo(0.6, 157, 304), cc.moveTo(0.6, 240, 278));
        door.stopAllActions();
        door.runAction(on);
    },
    openRight() {
        this.sound.PaySound(this.sound.offSound);
        //出去开右门
        let door = cc.find("Canvas/main/Guest/door").getChildByName("right");
        var on = cc.sequence(cc.moveTo(0.6, 230, 281), cc.moveTo(0.6, 152, 310));
        door.stopAllActions();
        door.runAction(on);
    },
    //加载动画，在进来之前加一步，把自己的动画加载完再动
    loadAnim(type, lie, nodeName, sound) {
        this.sound = sound;
        let animType = ["in", "out", "eat/front", "eat/back"];
        let animNum = animType.length;
        let _type = type.split("_");
        for (let i = 0; i < animType.length; i++) {
            PublicFunction.LoadImageDir(_type[0], animType[i], () => {
                animNum--;
                if (animNum == 0) {
                    this.openLeft();
                    this.runAnim(type, lie, nodeName);
                }
            });
        }
    },
    // type ===> worker_in
    //进来动画
    runAnim(type, lie, nodeName) {
        // this.openLeft();
        var tabIndex = parseInt(nodeName.split("_")[1]);
        if (tabIndex <= 8) {
            if (tabIndex > 4) {
                tabIndex -= 4;
            }
        } else {
            if (tabIndex == 9 || tabIndex == 10) {
                tabIndex = 5;
            } else {
                tabIndex = 6;
            }
        }

        let _type = type.split("_");
        this.Table = cc.find("Canvas/main/Guest/Table");
        this.tabNode = this.Table.getChildByName("tab_0" + tabIndex);
        this.road = this.Table.getChildByName(lie + "_stool").getChildByName("road")
        this.game = cc.find("Canvas/main/Guest").getComponent("guest_game");
        this.target_stool = this.Table.getChildByName(lie + "_stool").getChildByName(nodeName);//目标椅子
        this.animNode = this.node.parent;
        this.createClip(type);
        this.route_right = this.node.parent.parent.getChildByName("route_right");
        this.route_left = this.node.parent.parent.getChildByName("route_left");

        this.animation = cc.find("Canvas/main/Animation").getComponent("Animation");
        //是否新客人，除去工人和上班族
        if (Global.gameData.unlocked.indexOf(type) == -1) {
            this.animation.GetTitleMessage(3, _type[0]);
            Global.gameData.unlocked.push(type);
        }
        //走到中间
        var mid = cc.sequence(cc.moveTo(0.5, 44, 150), cc.callFunc(e => {
            if (lie == 'left') {
                this.createClip(_type[0] + "_out", () => {
                    this.node.scaleX = -1;
                });
            } else {
                this.node.scaleX = -1;
            }

        }));


        //进门后到达第一个拐角点
        var liePos = cc.v2(0, 0)
        if (lie == 'left') {
            liePos = cc.v2(-74, 193)
        } else {
            liePos = cc.v2(148, 101)
        }
        var walkLie = cc.sequence(cc.moveTo(1, liePos), cc.callFunc(e => {

            if (lie == 'left') {
                this.createClip(_type[0] + "_in", () => {
                    this.node.scaleX = 1;
                });
            } else {
                this.node.scaleX = 1;
            }
            if (nodeName != "stool_09" && nodeName != "stool_10" && nodeName != "stool_11" && nodeName != "stool_12") {
                this.node.parent = this.road;
                this.node.setPosition(0, 0)
            }
            //this.road.active = true

        }));
        //9 10 11 12 号凳子 不需要拐弯
        if (nodeName != "stool_09" && nodeName != "stool_10" && nodeName != "stool_11" && nodeName != "stool_12") {
            //直行到达拐角
            var cornerPos = this.road.convertToNodeSpaceAR(this.target_stool.getChildByName("angle").convertToWorldSpaceAR(cc.v2(0, 0)));
            var corner = cc.sequence(cc.moveTo(1, cornerPos), cc.callFunc(e => {
                if (lie == 'right') {
                    this.createClip(_type[0] + "_out", () => {
                        this.node.scaleX = -1;
                    });
                } else {
                    this.createClip(_type[0] + "_in", () => {
                        this.node.scaleX = -1;
                    });
                }
                this.node.parent = this.target_stool;
                this.node.setPosition(this.target_stool.getChildByName("angle").getPosition())
            }));
        } else {
            var corner = cc.callFunc(e => {
                this.node.setPosition(this.target_stool.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0, 0))))
                this.node.parent = this.target_stool;
            })
        }
        //终点
        var destinationPos = this.target_stool.getChildByName("sit").getPosition()
        var destination = cc.sequence(cc.moveTo(1, destinationPos), cc.callFunc(e => {

            this.node.getChildByName("anim").active = false;

            //坐下
            if (lie == 'left') {
                this.node.getChildByName("people").getComponent(cc.Sprite).spriteFrame = this.game[_type[0] + "_front"]
                this.node.getChildByName("people").scaleX = -1;
            } else {
                if (nodeName == "stool_09" || nodeName == "stool_10" || nodeName == "stool_11" || nodeName == "stool_12") {

                    this.node.getChildByName("people").getComponent(cc.Sprite).spriteFrame = this.game[_type[0] + "_front"]
                    this.node.getChildByName("people").scaleX = 1;
                } else {
                    this.node.getChildByName("people").getComponent(cc.Sprite).spriteFrame = this.game[_type[0] + "_back"]
                    this.node.getChildByName("people").scaleX = -1;
                }

            }

            if ("left" === lie) {
                this.node.parent = this.tabNode;
                this.node.setPosition(this.tabNode.getChildByName(lie).getPosition());
            } else {
                if (tabIndex == 5 || tabIndex == 6) {
                    var li = null;
                    if (tabIndex == 9 || tabIndex == 10) {
                        li = tabIndex == 9 ? "right" : "left"
                    } else {
                        li = tabIndex == 11 ? "right" : "left"
                    }
                    this.node.setPosition(this.tabNode.getChildByName(li).convertToNodeSpaceAR(this.target_stool.getChildByName("angle").convertToWorldSpaceAR(cc.v2(0, 0))));
                    this.node.parent = this.tabNode;

                } else {
                    this.node.setPosition(0, 0);
                }

            }

            this.node.getChildByName("people").active = true;

        }));
        let waitTime = Global.gameData.equip[5] == 1 ? 1.5 : 3;
        if (Global.isAccelerate) {
            waitTime = 0;
        }
        // 到达终点 等待一会点菜
        var openEat = cc.sequence(cc.delayTime(waitTime), cc.callFunc(e => {
            this.type = _type[0];
            this.lie = lie;
            this.nodeName = nodeName;
            this.classification();
            this.showFood();
        }));
        this.node.runAction(cc.sequence(cc.delayTime(0.3), mid, walkLie, corner, destination, openEat))
    },
    //出去动画
    runOutAinm() {
        this.node.getChildByName("people").active = false;
        this.talk.active = false;
        //先把人设到起始点
        //改父节点为凳子的,设置坐标为凳子下sit的
        this.node.parent = this.road;
        var sit_wpos = this.target_stool.getChildByName("sit").convertToWorldSpaceAR(cc.v2(0, 0));
        this.node.setPosition(this.road.convertToNodeSpaceAR(sit_wpos));
        // console.log(this.node.parent, this.tabNode.convertToNodeSpaceAR(sit_wpos));

        //创建动画 nodeName = stool_10
        if (this.lie == 'left') {
            this.createClip(this.type + "_out")
            this.node.scaleX = -1;
        } else {
            if (this.nodeName == "stool_09" || this.nodeName == "stool_10" || this.nodeName == "stool_11" || this.nodeName == "stool_12") {
                this.createClip(this.type + "_out", () => {
                    this.node.scaleX = 1;
                });
            } else {
                this.createClip(this.type + "_in", () => {
                    this.node.scaleX = -1;
                });
            }

        }
        console.log("nodeName====", this.nodeName)
        //把座位置空
        this.Table.getChildByName(this.lie + "_stool").getChildByName(this.nodeName).someone = null;
        // return
        //直行到门口拐角点
        //9 10 11 12 号凳子 不需要拐弯
        if (this.nodeName != "stool_09" && this.nodeName != "stool_10" && this.nodeName != "stool_11" && this.nodeName != "stool_12") {

            //开始行走到凳子旁的拐角点angle 转向到门口
            var anglePos = this.road.convertToNodeSpaceAR(this.target_stool.getChildByName("angle").convertToWorldSpaceAR(cc.v2(0, 0)))
            var walkLie = cc.sequence(cc.moveTo(1, anglePos), cc.callFunc(e => {
                if (this.lie == 'left') {
                    this.createClip(this.type + "_out", () => {
                        this.node.scaleX = 1;
                    });
                } else {
                    this.createClip(this.type + "_out", () => {
                        this.node.scaleX = 1;
                    });
                }
            }));
        }
        // this.node.runAction(walkLie)
        // return
        //直行到达门口拐角 走到中间
        var cornerPos = this.road.convertToNodeSpaceAR(this.animNode.getChildByName(this.lie).convertToWorldSpaceAR(cc.v2(0, 0)));
        var corner = cc.sequence(cc.moveTo(2, cornerPos), cc.callFunc(e => {
            if (this.lie == 'right') {
                this.createClip(this.type + "_out", () => {
                    this.node.scaleX = -1;
                });
                //右边需要更改父节点到左边凳子父节点 这样就不会踩着第一张桌子出去
                this.node.parent = this.Table.getChildByName("left_stool");
                this.node.setPosition(this.Table.getChildByName("left_stool").convertToNodeSpaceAR(this.animNode.getChildByName("right").convertToWorldSpaceAR(cc.v2(0, 0))))
            } else {
                this.createClip(this.type + "_in", () => {
                    this.node.scaleX = -1;
                });
            }
        }));
        // this.node.runAction(cc.sequence(walkLie, corner/*, mid, over*/))
        // return
        //走到中间
        var wpos = this.animNode.getChildByName("outLeft").convertToWorldSpaceAR(cc.v2(0, 0));
        var midPos = this.road.convertToNodeSpaceAR(wpos);
        if ('right' == this.lie) {
            midPos = this.Table.getChildByName("left_stool").convertToNodeSpaceAR(wpos)
        }
        var mid = cc.sequence(cc.moveTo(1, midPos), cc.callFunc(e => {
            if (this.lie == 'left') {
                this.createClip(this.type + "_out", () => {
                    this.node.scaleX = 1;
                });
            } else {
                this.node.scaleX = 1;
            }
        }));
        //开右门
        var openOut = cc.callFunc(() => {
            this.openRight();
        })

        //走到门外
        var outSide_wpos = this.animNode.getChildByName("outSide").convertToWorldSpaceAR(cc.v2(0, 0));
        var outSidePos = this.road.convertToNodeSpaceAR(outSide_wpos)
        if ('right' == this.lie) {
            outSidePos = this.Table.getChildByName("left_stool").convertToNodeSpaceAR(outSide_wpos)
        }
        var over = cc.sequence(openOut, cc.moveTo(0.8, outSidePos), cc.callFunc(() => {
            this.node.parent = this.animNode;
            //把人加回数组
            if ("officeWorkers" != this.type && "worker" != this.type) {
                if (this.node.un) {
                    this.guestAnim.unlocked.push(this.type + "_in")
                } else {
                    this.guestAnim.peoples.push(this.type + "_in");
                }
            }
            // console.log(this.guestAnim.peoples,"type=="+this.type,"this.node.un=="+this.node.un);
            //删除预制体
            this.node.removeFromParent();
        }))
        if (this.nodeName != "stool_09" && this.nodeName != "stool_10" && this.nodeName != "stool_11" && this.nodeName != "stool_12") {
            this.node.runAction(cc.sequence(walkLie, corner, mid, over))
        } else {
            this.node.runAction(cc.sequence(corner, mid, over))
        }
    },
    //创建动画
    createClip(type, cb) {
        let _type = type.split("_");
        let man_type = _type[0];
        let anim_type = _type[1];
        let lie = null;
        if (_type.length > 2) {
            lie = _type[2];
        }

        if (lie != null) {
            anim_type = anim_type + "/" + lie;
        }
        PublicFunction.LoadImageDir(man_type, anim_type, (assets) => {
            // 显示动画节点
            this.node.getChildByName("anim").active = true;
            // 创建动画组件
            this.anim = this.node.getChildByName("anim").getComponent(cc.Animation);
            // console.log(assets)
            var clip = cc.AnimationClip.createWithSpriteFrames(assets, 5);
            clip.name = type;
            //console.log(clip.name);
            clip.wrapMode = cc.WrapMode.Loop;
            this.anim.addClip(clip);

            this.anim.play(clip.name)

            typeof cb === "function" && cb()
        })
    },

    //对料理台上的菜进行分类
    classification() {
        let order = PublicFunction.CheckOrder(this.type, this.eatIt);
        console.log(order);
        if (order != 0) {
            this.point = order;
        }
    },
    //判断有没有自己喜好的
    choice(arr, lake) {
        for (var i in lake) {
            if (arr.indexOf(lake[i]) != -1) {
                return lake[i];
            } else {
                var n = this.sum(arr);
                return arr[n];
            }
        }
    },
    //根据数组长度获取随机数
    sum(arr) {
        //向下取整
        var index = Math.floor(Math.random() * arr.length)
        return index;
    },

    //弹出点的菜
    showFood() {
        let urgeNode = this.node.getChildByName("urge");
        urgeNode.active = false;
        urgeNode.getChildByName("ur").stopAllActions();
        //弹出菜框
        this.kuang = this.node.getChildByName("kuang");
        this.kuang.active = true;
        this.waitTime = 0;
        if (this.point) {
            this.sound.PaySound(this.sound.bubblingSound);
            urgeNode.active = false;
            //100以下是日本料理，100以上是中国料理
            if (this.point < 100) {
                let image = "UI_ryouri" + (this.point < 10 ? "0" + this.point : this.point);
                PublicFunction.LoadImage("food", image, this.kuang.getChildByName("food"));
                this.kuang.getChildByName("food").scale = 1;
            }
            else {
                let image = Global.ChineseFoodList[this.point - 100 - 1].Name;
                PublicFunction.LoadImage("chineseFood", image, this.kuang.getChildByName("food"));
                this.kuang.getChildByName("food").scale = 0.5;
            }
        }
        else {
            this.kuang.active = false;
            let total = 0;
            for (let i = 0; i < Global.gameData.PlaceFood.length; i++) {
                total += Global.gameData.PlaceFood[i][1];
            }

            if (this.eatIt.length <= 0) {//没菜 弹催菜
                urgeNode.active = true;
                //进行晃动
                var gui = cc.callFunc(() => {
                    urgeNode.getChildByName("ur").setPosition(0, 0);
                })
                var seq = cc.sequence(gui, cc.moveTo(0.1, 0, 5), cc.moveTo(0.1, -5, 0), cc.moveTo(0.1, 0, -5), cc.moveTo(0.1, 5, 0), gui);
                var bli = cc.sequence(cc.fadeTo(0.5, 255), cc.fadeTo(0.5, 80), cc.fadeTo(0.5, 255));
                urgeNode.getChildByName("ur").runAction(cc.sequence(seq, bli))
                // this.kuang.getChildByName("food").getComponent(cc.Sprite).spriteFrame = this.urge;
                this.is_one = true;
            }
            if (total > 0) {
                this.kuang.active = false;
                urgeNode.getChildByName("ur").setPosition(0, 0);
                urgeNode.active = false;
                urgeNode.stopAllActions();
            }
        }
    },
    //上菜
    clickFood() {
        if (this.overOut == false) {
            // 判断有没有菜
            if (this.point == null) {
                //没有菜
                console.log("没有菜。。")
                return;
            }
            this.sound.PaySound(this.sound.pointSound);
            //更新好感度, 需要判断达到解锁新对话并且需要特定食物时的时候好感度只+1
            let canplay = PublicFunction.AddMood(this.type, this.point);
            if (!this.canPlayStory && canplay) {
                //显示新剧情的动画
                this.canPlayStory = true;
                Global.gameData.GuestStory[this.type]++;
                this.animation.GetTitleMessage(4, this.type);
            }

            //隐藏等待的图
            this.node.getChildByName("people").active = false;
            this.kuang.active = false;
            this.li = "_m";
            if (this.Table.getChildByName(this.nodeName + "_m").active == false) {
                this.li = "_m"
            } else if (this.Table.getChildByName(this.nodeName + "_l").active == false) {
                this.li = "_l"
            } else if (this.Table.getChildByName(this.nodeName + "_r").active == false) {
                this.li = "_r"
            }

            this.Table.getChildByName(this.nodeName + this.li).active = true;
            //100以下是日本料理，100以上是中国料理
            if (this.point < 100) {
                let image = "UI_ryouri" + (this.point < 10 ? "0" + this.point : this.point);
                PublicFunction.LoadImage("food", image, this.Table.getChildByName(this.nodeName + this.li));
                this.Table.getChildByName(this.nodeName + this.li).scale = 0.3;
            }
            else {
                let image = Global.ChineseFoodList[this.point - 100 - 1].Name;
                PublicFunction.LoadImage("chineseFood", image, this.Table.getChildByName(this.nodeName + this.li));
                this.Table.getChildByName(this.nodeName + this.li).scale = 0.15;
            }
            if (Global.isGuide && this.guide.step == 10) {
                this.guide.onTap();
            }
            //减掉台上的料理数量
            for (var i in Global.gameData.PlaceFood) {
                if (Global.gameData.PlaceFood[i][0] == this.point) {
                    //修改其他人已点的缓存
                    let index = Global.OtherOrder.indexOf(this.point);
                    Global.OtherOrder.splice(index, 1);
                    this.eatIt.push(this.point);
                    //修改放置台
                    Global.gameData.PlaceFood[i][1] -= 1;
                    if (Global.gameData.PlaceFood[i][1] <= 0) {
                        Global.gameData.PlaceFood[i][1] = 0;
                        let del = true;
                        //判断，如果这个食物的数量小于0，并且没有正在煮的，则置0
                        for (let j = 0; j < Global.gameData.CookingFood.length; j++) {
                            if (Global.gameData.CookingFood[j][0] == this.point) {
                                del = false;
                                break;
                            }
                        }
                        if (del) {
                            Global.gameData.PlaceFood[i][0] = 0;
                        }
                    }
                }
            }
            this.point = null;

            //刷新进度条
            this.node.getChildByName("bar").active = true;
            let totalTime = this.eatIt.length * (Global.gameData.equip[6] == 1 ? 5 : 10);
            if (Global.isAccelerate) {
                totalTime = this.eatIt.length;
            }
            this.eatBar.fillRange = this.eatTime / totalTime;
            //发送刷新事件
            this.node.dispatchEvent(new cc.Event.EventCustom('refresh', true));
            //吃变量
            this.startEat = true;
            //吃动画
            this.eatAinm();
        }
    },
    //切换等待图
    waitStatus() {
        var people = this.node.getChildByName("people");
        if (this.lie == 'left') {
            people.getComponent(cc.Sprite).spriteFrame = this.game[this.type + "_front"]
            people.scaleX = 1;
        } else {
            if (this.nodeName == "stool_09" || this.nodeName == "stool_10" || this.nodeName == "stool_11" || this.nodeName == "stool_12") {
                people.getComponent(cc.Sprite).spriteFrame = this.game[this.type + "_front"]
                people.scaleX = 1;
            } else {
                people.getComponent(cc.Sprite).spriteFrame = this.game[this.type + "_back"]
                people.scaleX = 1;
            }

        }
        this.node.getChildByName("anim").active = false;
        people.active = true;
    },
    //切换吃动画
    eatAinm() {
        if (this.lie == 'right') {
            if (this.nodeName == "stool_09" || this.nodeName == "stool_10" || this.nodeName == "stool_11" || this.nodeName == "stool_12") {
                this.createClip(this.type + "_eat_front");
                this.node.scaleX = 1;
            } else {
                this.createClip(this.type + "_eat_back");
                this.node.scaleX = 1;
            }
        } else {
            this.createClip(this.type + "_eat_front");
            this.node.scaleX = 1;
        }
    },
    //弹出结账金币
    checkout() {
        if (Global.isGuide && this.guide.step == 12) {
            this.guide.onTen();
        }
        //结账
        this.node.getChildByName("bar").active = false;
        this.overOut = true;
        this.waitStatus();
        this.payMoney.active = true;
        console.log("结账！！！！！")
    },
    //收钱
    GetMoney: function () {
        if (Global.isGuide && this.guide.step == 12) {
            this.guide.onTap();
        }
        this.sound.PaySound(this.sound.paySound);
        Global.guestNum++;
        //调用金币动画 然后出门
        console.log("结账")
        if (this.canPlayStory) {
            //显示剧情的气泡
            let step1 = cc.scaleTo(0.3, 1.2, 0.7);
            let step2 = cc.scaleTo(0.3, 0.8, 1.2);
            let step3 = cc.scaleTo(0.3, 1.2, 0.7);
            let step4 = cc.scaleTo(0.1, 1.2, 1);
            let step5 = cc.scaleTo(0.1, 1, 1);
            this.talk.active = true;
            this.talk.runAction(cc.repeatForever(cc.sequence(step1, step2, step3, step4, step5, cc.delayTime(2))));
        }
        else {
            this.runOutAinm();
        }
        cc.find("Canvas/main/Owner/Owner").getComponent("Owner").PlayWash();
        let total = 0;
        for (let i = 0; i < this.eatIt.length; i++) {
            //100以下是日本料理，100以上是中国料理
            if (this.eatIt[i] < 100) {
                total += parseInt(Global.FoodList[this.eatIt[i] - 1].Price);//找到当前食物的价格
            }
            else {
                total += parseInt(Global.ChineseFoodList[this.eatIt[i] - 100 - 1].Price);//找到当前食物的价格
            }
        }
        let position = this.payMoney.parent.convertToWorldSpaceAR(this.payMoney.position);
        this.animation.FlyCoin(position, total);
        this.payMoney.active = false;
    },
    PlayStory() {
        console.log("playstory");
        cc.find("Canvas/main/Story/Story").getComponent("Story").PlayStory(this.type, Global.gameData.GuestStory[this.type] - 1, () => { this.runOutAinm(); }, false);
    },
    //点击减时间
    onClick() {
        this.sound.PaySound(this.sound.addSound);
        this.eatTime++;
        console.log("加速")
        //播放加速动画
        this.animation.FlySweat(this.node, 2, 0.2, 20, 1);
    },

    update(dt) {
        this.__a(dt)
    },

    __a(dt) {
        if (this.startEat) {
            this.pointTime += dt;
            if (this.eatBar.fillRange >= 1) {
                this.startEat = false;
                //停止吃动画 换成等菜图
                if (this.point && this.kuang.active == true) {
                    this.waitStatus();
                } else {
                    //结账
                    this.checkout();
                }
                this.Table.getChildByName(this.nodeName + "_m").active = false;
                this.Table.getChildByName(this.nodeName + "_r").active = false;
                this.Table.getChildByName(this.nodeName + "_l").active = false;
                return;
            }
            this.addTime += dt;
            if (this.addTime >= 10) {
                this.Table.getChildByName(this.nodeName + this.li).active = false;
                this.addTime = 0;
            }
            this.eatTime += dt;
            let totalTime = this.eatIt.length * (Global.gameData.equip[6] == 1 ? 5 : 10);
            if (Global.isAccelerate) {
                totalTime = this.eatIt.length;
            }
            this.eatBar.fillRange = this.eatTime / totalTime;
            if (this.pointTime >= 1 && this.eatBar.fillRange >= 0.6 && this.eatIt.length < 3) {
                //重新查看菜台是否有可点的菜
                this.pointTime = 0;
                if (this.node.getChildByName("people").active == false && this.kuang.active == false) {
                    this.classification();
                    if (this.point) {
                        //有 继续调用弹出菜筐
                        console.log("update:point =", this.point, "eatIt:", this.eatIt)
                        this.showFood();
                    }
                }
            }
        }
        //第一次进来没有菜
        if (this.is_one && this.point == null) {
            this.onePointTime += dt;
            if (this.onePointTime >= 1) {
                //重新查看菜台是否有可点的菜
                this.onePointTime = 0;
                this.classification();
                if (this.point) {
                    //有 调用弹出菜筐
                    this.is_one = false;
                }
                this.showFood();
            }
        }
    },
}

);
