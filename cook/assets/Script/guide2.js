
import Global from "./Global";

cc.Class({
    extends: cc.Component,

    properties: {
        index: cc.Node,
        one: cc.Node,
        two: cc.Node,
        three: cc.Node,
        three_bu: cc.Node,//漏了一步 料理制作图
        four: cc.Node,
        five: cc.Node,
        six: cc.Node,
        seven: cc.Node,
        eight: cc.Node,
        nine: cc.Node,

        ten: cc.Node,
        eleven: cc.Node,
        twelve: cc.Node,
        thirteen: cc.Node,
        fourteen: cc.Node,
        sign: cc.Node,
        signbtn: cc.Node,
        detail: cc.Node,
        story: cc.Node,
        but: cc.Node,
        ban: cc.Node,
        ban2: cc.Node,

        daquan: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},




    start() {
        this.step = 1;//第一步
        this.index.active = true;
        this.prefabLoader = cc.find("Canvas/main").getComponent("PrefabLoader");
        this.mask = cc.find("Canvas/guideLayer/mask");
        this.food = cc.find("Canvas/main/Food");
        this.anim = cc.find("Canvas/main/Guest/anim");
    },
    //引导点击事件 一到4步
    onTap() {
        if (this.step === 1) {
            //第一张图片
            console.log("第一步点击");
            this.index.active = false;
            this.one.active = false;
            this.two.active = true;
            this.step++;
        } else if (this.step === 2) {
            //第二张图片
            console.log("第二步点击");
            this.two.active = false;
            this.three_bu.active = true;
            this.step++;
        } else if (this.step === 3) {
            //第三张图片
            console.log("第三步点击");
            this.three_bu.active = false;
            this.three.active = true;
            this.step++;
        } else if (this.step === 4) {
            //第四张图片
            console.log("第四步点击");
            this.but.active = false;
            var fa = cc.fadeTo(3, 0);
            var cal = cc.callFunc(() => {
                this.but.active = true;
                this.three.active = false;
            })
            this.three.runAction(cc.sequence(fa, cal))
            this.four.active = true;
            this.step++;
        } else if (this.step === 5) {

            //老奶奶接手店铺
            console.log("第五步点击");
            this.four.active = false;
            this.but.active = false;
            this.anim.active = true;//客人开始进场
            this.step++;
        } else if (this.step === 6) {
            //制作料理按钮
            console.log("第六步点击");
            this.prefabLoader.OpenFood();
            this.five.active = false;
            this.five.getChildByName("da").stopAllActions();
            this.six.active = true;
            this.action(this.six, 1, 2);
            this.step++;
        } else if (this.step === 7) {
            //制作饭团
            console.log("第七步点击");
            this.six.active = false;
            this.six.getChildByName("da").stopAllActions();
            this.seven.active = true;
            this.action(this.seven, 1, 2.5);
            this.foods = this.food.getChildByName("Food").getComponent("Food");
            Global.MakeFoodID = 1;
            this.foods.OpenBG2();
            this.step++;
        } else if (this.step === 8) {
            //决定制作
            console.log("第八步点击");
            this.seven.active = false;
            this.seven.getChildByName("da").stopAllActions();
            this.ban.active = true;
            //调用做菜
            this.foods.MakeFood();
            this.step++;
        } else if (this.step === 9) {
            //料理显示到料理台
            console.log("第九步点击");
            this.eight.active = false;//隐藏自己 显示下一步
            this.nine.active = true;
            this.action(this.nine, 0.9, 2);
            this.but.active = false;
            this.ban.active = false;
            this.ban2.active = true;
            this.step++;
        } else if (this.step === 10) {
            //点菜
            console.log("第十步点击");
            this.nine.active = false;
            this.nine.getChildByName("da").stopAllActions();
            this.ten.active = true;
            this.but.active = true;
            this.ban.active = true;
            this.step++;
        } else if (this.step === 11) {
            //加速
            console.log("第十一步点击");
            this.ten.active = false;
            this.but.active = false;
            this.ban.active = false;
            this.step++;
        } else if (this.step === 12) {
            // 结账走人后
            console.log("第十二步点击");
            this.ban.active = true;
            this.ban2.active = false;
            this.eleven.active = false;
            this.eleven.getChildByName("da").stopAllActions();
            this.eight.getChildByName("eight").getChildByName("src").getComponent(cc.Label).string = "点击存放台的料理\n"
                + "可以制作相同的料理。\n" + "试试看如何方便的\n" + "在做一次饭团吧。"
            this.eight.active = true;
            this.eight.getChildByName("da").active = true;
            this.action(this.eight, 1, 2);
            this.step++;
        } else if (this.step === 13) {
            //点击料理台的菜
            console.log("第十三步点击");
            this.eight.active = false;
            this.eight.getChildByName("da").stopAllActions();
            this.eight.getChildByName("da").active = false;
            this.twelve.active = true;
            this.action(this.twelve, 1, 2.5);
            Global.MakeFoodID = 1;
            this.foods.OpenBG2();
            this.step++;
        } else if (this.step === 14) {
            //决定制作
            console.log("第十四步点击");
            this.twelve.active = false;
            this.twelve.getChildByName("da").stopAllActions();
            // this.thirteen.active = true;
            this.nine.active = true;
            this.action(this.nine, 0.9, 2);
            this.nine.getChildByName("src").getComponent(cc.Label).string = "点击可查看与老奶奶的对话哦"
            this.but.active = false;
            this.ban.active = false;
            this.ban2.active = true;
            //调用做菜
            this.foods.MakeFood();
            this.step++;
        } else if (this.step === 15) {
            //头顶对话
            console.log("第十五步点击");
            this.ban2.active = false;
            this.nine.active = false;
            this.step++;
        } else if (this.step === 16) {
            //客人按钮
            console.log("第十六步点击");
            this.fourteen.active = false;
            this.prefabLoader.OpenGuest();
            this.detail.active = true;
            this.action(this.detail, 0.9, 2);
            this.step++;
        } else if (this.step === 17) {
            //详细
            console.log("第十七步点击");
            this.detail.active = false;
            this.ban.active = true;
            this.story.active = true;
            this.action(this.story, 0.9, 2);
            cc.find("Canvas/main/GuestModule/GuestModule").getComponent("GuestModule").OpenBG2();
            this.step++;
        } else if (this.step === 18) {
            //故事
            console.log("第十八步点击");
            this.story.active = false;
            this.ban.active = false;
            cc.find("Canvas/main/GuestModule/GuestModule").getComponent("GuestModule").PlayStory();
            this.step++;
        } else if (this.step === 19) {
            //签到
            console.log("第十九步点击");
            this.sign.active = false;
            this.signbtn.active = true;
            this.action(this.signbtn, 0.9, 2);
            this.ban.active = true;
            this.step++;
            this.prefabLoader.OpenSignin();
        } else if (this.step === 20) {
            //签到
            console.log("第二十步点击");
            this.signbtn.active = false;
            this.thirteen.active = true;
            this.but.active = true;
            cc.find("Canvas/main/Signin/Signin").getComponent("Signin").GetPrice();
            this.step++;
        } else if (this.step === 21) {
            //讲解到此完成
            console.log("第二十一步点击指引完成");
            this.thirteen.active = false;
            this.but.active = false;
            this.ban.active = false;
            this.ban2.active = false;
            Global.isGuide = false;
            Global.beginGame = true;//开始放客人进来
            this.step++;
        }
        console.log("this.step==" + this.step)
    },
    //第五步 料理按钮
    onFive() {
        this.five.active = true;
        this.action(this.five, 1, 2);
    },
    //第7步 显示料理做好时
    onSeven() {
        this.but.active = true;
        this.eight.active = true;
    },
    //第十步 结账调用显示
    onTen() {
        this.ten.active = false;
        this.eleven.active = true;
        this.action(this.eleven, 0.9, 2)
    },
    //最后 关闭对话时调用
    onFourteen() {
        this.fourteen.active = true;
        this.action(this.fourteen, 1, 2)
        // this.but.active = true;
        this.ban.active = true;
    },
    onSign() {
        this.ban.active = true;
        this.sign.active = true;
        this.action(this.sign, 0.9, 2);
    },

    action(node, sc, lo) {
        node.getChildByName("da").runAction(cc.repeatForever(cc.sequence(cc.show(), cc.scaleTo(1, sc), cc.hide(), cc.scaleTo(0, lo), cc.delayTime(0.3))));
    }
    // update (dt) {},
});
