import Global from './Global'
import PublicFunction from './PublicFunction'

cc.Class({
    extends: cc.Component,

    properties: {
        //这是第一个页面的
        target: {
            default: null,
            type: cc.Node,
            displayName: "客人节点"
        },
        toggleGroup: {
            default: [],
            type: cc.Node,
            displayName: "页数"
        },
        scrollView: {
            default: null,
            type: cc.Node,
            displayName: "滑动页面"
        },
        left: {
            default: null,
            type: cc.Node,
            displayName: "左箭头"
        },
        right: {
            default: null,
            type: cc.Node,
            displayName: "右箭头"
        },
        guestList: {
            default: [],
            type: cc.Node,
            displayName: "客人列表"
        },
        //这是第二个页面的
        target2: {
            default: null,
            type: cc.Node,
            displayName: "详情页面"
        },
        bg2_name: {
            default: null,
            type: cc.Label,
            displayName: "名字"
        },
        bg2_tanzaku: {
            default: null,
            type: cc.Node,
            displayName: "短签"
        },
        bg2_people: {
            default: null,
            type: cc.Node,
            displayName: "走路动画"
        },
        bg2_think: {
            default: null,
            type: cc.Node,
            displayName: "想吃"
        },
        bg2_weekday: {
            default: null,
            type: cc.Node,
            displayName: "星期几"
        },
        bg2_round: {
            default: null,
            type: cc.Node,
            displayName: "满足度"
        },
        bg2_detail: {
            default: null,
            type: cc.Label,
            displayName: "介绍"
        },
        bg2_story: {
            default: null,
            type: cc.Node,
            displayName: "剧情项"
        },
        bg2_fancy: {
            default: null,
            type: cc.Node,
            displayName: "食物"
        },
        //这是第三个页面的
        target3: {
            default: null,
            type: cc.Node,
            displayName: "主线界面"
        },
        bg3_story: {
            default: null,
            type: cc.Node,
            displayName: "主线剧情"
        },
        mask: {
            default: null,
            type: cc.Node,
            displayName: "按钮挡板"
        },
    },

    onLoad() {
        this.guide = cc.find("Canvas/Guide").getComponent("guide2");
    },

    //刷新列表
    RefreshList: function () {
        for (let i = 0; i < this.guestList.length; i++) {
            let name = this.guestList[i].name;//名字
            if (Global.gameData.GuestMood[name] > 0) {
                //颜色
                this.guestList[i].getChildByName("people").color = cc.color(255, 255, 255);
                //名字
                let nameStr = PublicFunction.GetNameStr(name);
                this.guestList[i].getChildByName("name").getComponent(cc.Label).string = nameStr;
                //动画，吃的食物
                this.createClip(name + "_eat_front", this.guestList[i].getChildByName("people"));
                this.guestList[i].getChildByName("food").active = true;
                if (name != "officeWorkers" && name != "worker") {
                    let id = Global.fancy[name][0];
                    let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
                    PublicFunction.LoadImage("food", image, this.guestList[i].getChildByName("food"));
                    //满足度
                    this.guestList[i].getChildByName("round").getChildByName("pre").getComponent(cc.Sprite).fillRange = Global.gameData.GuestMood[name] / 100;
                    this.guestList[i].getChildByName("round").getComponentInChildren(cc.Label).string = Global.gameData.GuestMood[name] + "%";
                    //按钮颜色
                    this.guestList[i].getChildByName("detail").opacity = 255;
                }
                else {
                    this.guestList[i].getChildByName("detail").active = true;
                }
            }
            //改颜色，名字，动画，满足度，按钮颜色
            else {
                this.guestList[i].getChildByName("people").color = cc.color(66, 66, 66);
                this.guestList[i].getChildByName("name").getComponent(cc.Label).string = "???";
                this.guestList[i].getChildByName("food").active = false;
                this.guestList[i].getChildByName("detail").opacity = 144;
            }
        }
    },

    //创建动画
    createClip(type, people) {
        let anim = people.getComponent(cc.Animation);
        let animList = anim.getClips();
        //判断是否有要播的动画，有就不用生成了
        for (let i = 0; i < animList.length; i++) {
            if (animList[i].name == type) {
                anim.play(type);
                return;
            }
        }
        console.log("new anima");
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
            // 创建动画组件
            // console.log(assets)
            let clip = cc.AnimationClip.createWithSpriteFrames(assets, 5);
            clip.name = type;
            //console.log(clip.name);
            clip.wrapMode = cc.WrapMode.Loop;
            anim.addClip(clip);

            anim.play(clip.name);
        })
    },

    //翻页
    ToPage(event, customEventData) {
        if (!this.sound) {
            this.sound = cc.find("Canvas/main").getComponent("sound");
        }
        this.sound.PaySound(this.sound.NextSound);
        this.page = parseInt(customEventData);
        this.toggleGroup[this.page - 1].getComponent(cc.Toggle).check();
        this.page = this.page < 1 ? 1 : this.page;
        this.page = this.page > 3 ? 3 : this.page;
        this.scrollView.stopAllActions();
        let toX = -320 - 640 * (this.page - 1);
        this.scrollView.runAction(cc.moveTo(0.5, cc.v2(toX, this.scrollView.y)));
        this.RefreshArrow();
    },

    PrePage() {
        this.ToPage(null, this.page - 1);
    },

    NextPage() {
        this.ToPage(null, this.page + 1);
    },

    //是否显示左箭头或者右箭头
    RefreshArrow() {
        this.left.active = this.page > 1;
        this.right.active = this.page < 3;
    },

    OpenBG() {
        this.target.active = true;
        this.RefreshList();
        if (!this.page) {
            if (Global.isGuide) {
                this.ToPage(null, 3);
                this.mask.active = true;
            }
            else {
                this.ToPage(null, 1);
            }
        }
    },

    CloseBG(e) {
        if (Global.isGuide && this.guide.step == 19) {
            this.guide.onSign();
        }
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.mask.active = false;
        this.target.active = false;
        this.CloseBG2();
        this.CloseBG3();
    },

    OpenBG2(event) {
        let name;
        if (Global.isGuide && this.guide.step == 17) {
            name = "monk";
        }
        else {
            name = event.target.name;
        }
        console.log(name);
        if (Global.gameData.GuestMood[name] > 0) {
            this.target2.active = true;
            this.bg2_name.string = PublicFunction.GetNameStr(name);//名字
            this.bg2_tanzaku.active = Global.gameData.GuestStory[name] == Global.maxStory[name];//是否显示短签
            this.bg2_tanzaku.off(cc.Node.EventType.TOUCH_END);
            this.bg2_tanzaku.on(cc.Node.EventType.TOUCH_END, function (event) {
                cc.find("Canvas/main/Story/Story").getComponent("Story").OpenBG2(name);
            })
            //走路动画
            this.bg2_people.stopAllActions();
            this.bg2_people.runAction(cc.repeatForever(cc.sequence(
                cc.callFunc(() => { this.createClip(name + "_in", this.bg2_people); }),
                cc.delayTime(7),
                cc.callFunc(() => { this.createClip(name + "_out", this.bg2_people); }),
                cc.delayTime(3)
            )))
            this.bg2_think.active = false;//想吃什么，根据满足度来判断
            let gray = cc.color(177, 166, 148);
            let red = cc.color(183, 83, 59);
            //星期几容易出现
            for (let i = 0; i < 7; i++) {
                if (Global.approach[i].indexOf(name + "_in") != -1) {
                    this.bg2_weekday.children[i].color = red;
                }
                else {
                    this.bg2_weekday.children[i].color = gray;
                }
            }
            //满足度
            this.bg2_round.getChildByName("pre").getComponent(cc.Sprite).fillRange = Global.gameData.GuestMood[name] / 100;
            this.bg2_round.getComponentInChildren(cc.Label).string = Global.gameData.GuestMood[name] + "%";
            let storyUnlock = [];//解锁剧情条件
            for (let i = 0; i < Global.StoryUnLock.length; i++) {
                if (Global.StoryUnLock[i].Name == name) {
                    storyUnlock = Global.StoryUnLock[i];
                    break;
                }
            }
            this.bg2_detail.string = storyUnlock.Intro;//介绍
            //有多少个剧情
            for (let i = 0; i < this.bg2_story.childrenCount; i++) {
                if (storyUnlock["Story" + (i + 1)]) {
                    let lock = parseInt(storyUnlock["Mood" + (i + 1)]);//解锁需要的满足度
                    let lockfood = parseInt(storyUnlock["Food" + (i + 1)]);//解锁需要的食物
                    this.bg2_story.children[i].active = true;
                    this.bg2_story.children[i].getChildByName("lock").active = Global.gameData.GuestStory[name] <= i;//满足度，解锁条件
                    this.bg2_story.children[i].getChildByName("lock").getComponentInChildren(cc.Label).string = "满足度\n" + lock;
                    if (lockfood) {
                        let image = "UI_ryouri" + (lockfood < 10 ? "0" + lockfood : lockfood);
                        PublicFunction.LoadImage("food", image, this.bg2_story.children[i].getChildByName("lock").getChildByName("food"));
                    }
                    else {
                        this.bg2_story.children[i].getChildByName("lock").getComponentInChildren(cc.Sprite).spriteFrame = undefined;
                    }
                    this.bg2_story.children[i].getChildByName("name").getComponent(cc.Label).string = storyUnlock["Story" + (i + 1)];
                    this.bg2_story.children[i].people = name;
                    this.bg2_story.children[i].story = i;
                }
                else {
                    this.bg2_story.children[i].active = false;
                }
            }
            //喜欢的食物
            for (let i = 0; i < 3; i++) {
                let id = Global.fancy[name][i];
                let image = "UI_ryouri" + (id < 10 ? "0" + id : id);
                PublicFunction.LoadImage("food", image, this.bg2_fancy.children[i]);
                this.bg2_fancy.children[i].getComponentInChildren(cc.Label).string = Global.FoodList[id - 1].Name;
            }
        }
    },

    CloseBG2(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target2.active = false;
    },

    OpenBG3() {
        this.target3.active = true;
        for (let i = 0; i < this.bg3_story.childrenCount; i++) {
            this.bg3_story.children[i].getComponentInChildren(cc.Label).string = "???";
            this.bg3_story.children[i].people = "grandpa";
            this.bg3_story.children[i].story = i;
            if (Global.gameData.MainStory > i) {
                let mainStory = ["老爷爷", "那个？", "小孩？", "就快要...", "父母心", "重要的事情？", "担心", "想说的事情？", "樱花", "午睡", "不足的东西", "偷偷的", "想交的东西", "谢谢"];
                this.bg3_story.children[i].getComponentInChildren(cc.Label).string = mainStory[i];
            }
        }
    },

    CloseBG3(e) {
        if (e) {
            this.sound.PaySound(this.sound.closBtnSound);
        }
        this.target3.active = false;
    },

    //跳转到播剧情界面
    PlayStory(event) {
        let people;
        let story;
        if (Global.isGuide && this.guide.step == 18) {
            people = "monk";
            story = 0;
        }
        else {
            people = event.target.people;
            story = event.target.story;
        }
        console.log(people, story);
        cc.find("Canvas/main/Story/Story").getComponent("Story").PlayStory(people, story);
    },
});
