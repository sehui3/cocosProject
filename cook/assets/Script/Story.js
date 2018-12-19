import Global from './Global'
import PublicFunction from './PublicFunction'

cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node,
            displayName: "故事节点"
        },
        LeftHead: {
            default: null,
            type: cc.Sprite,
            displayName: "左边头像"
        },
        RightHead: {
            default: null,
            type: cc.Sprite,
            displayName: "右边头像"
        },
        RightName: {
            default: null,
            type: cc.Label,
            displayName: "右边名字"
        },
        Btn_skip: {
            default: null,
            type: cc.Node,
            displayName: "跳过按钮"
        },
        TalkContent: {
            default: null,
            type: cc.Node,
            displayName: "对话列表"
        },
        LeftTalk: {
            default: null,
            type: cc.Prefab,
            displayName: "左边气泡"
        },
        RightTalk: {
            default: null,
            type: cc.Prefab,
            displayName: "右边气泡"
        },
        Btn_fin: {
            default: null,
            type: cc.Node,
            displayName: "关闭按钮"
        },
        Btn_tanzaku: {
            default: null,
            type: cc.Node,
            displayName: "短签按钮"
        },
        TanzakuNode: {
            default: null,
            type: cc.Node,
            displayName: "短签页面"
        },
        problem: {
            default: null,
            type: cc.Node,
            displayName: "问号"
        },
        forehead: {
            default: null,
            type: cc.Node,
            displayName: "额头"
        },
        question: {
            default: null,
            type: cc.Node,
            displayName: "疑问"
        },
        note: {
            default: null,
            type: cc.Node,
            displayName: "音符"
        },
        lot: {
            default: null,
            type: cc.Node,
            displayName: "很多汗"
        },
        whoopee: {
            default: null,
            type: cc.Node,
            displayName: "哈哈"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() { },

    start() {
        this.animation = cc.find("Canvas/main/Animation").getComponent("Animation");
        this.sound = cc.find("Canvas/main").getComponent("sound");
        this.guide = cc.find("Canvas/Guide").getComponent("guide2");
        this.nowTarget = null;
        this.nowStr = null;
        this.num = 0;
    },

    ClickSkip() {
        console.log("skip");
        while (this.canCopyBtn) {
            this.NextStory();
            this.stopAction();
        }
    },

    PlayStory(name, id, callback = undefined, showSkip = true) {
        //判断剧情是否解锁
        id = parseInt(id);
        this.peopleName = name;
        if (Global.gameData.GuestStory[name] > id || (name == "grandpa" && Global.gameData.MainStory > id)) {
            this.Btn_skip.active = showSkip;
            this.story = Global.story[name][id];
            if (name == "grandpa" && id == Global.story[name].length) {
                console.log("laststory");
                this.story = Global.story["laststory"][0];
            }
            this.talk = 1;
            if (this.story) {
                this.callback = callback;
                this.RightName.string = PublicFunction.GetNameStr(name);
                this.canCopyBtn = true;
                PublicFunction.LoadImage("head", name, this.RightHead, () => {
                    this.OpenBG();
                    this.NextStory();
                });
            }
        }
    },

    NextStory() {
        this.stopAction();
        if (this.story["Story" + this.talk]) {
            let name = this.story["Head" + this.talk];
            if (name) {
                if (name == "0") {
                    this.RightHead.spriteFrame = undefined;
                    this.RightName.string = "";
                }
                else {
                    this.RightName.string = PublicFunction.GetNameStr(name);
                    PublicFunction.LoadImage("head", name, this.RightHead);
                }
            }
            let newNode;
            let black = cc.color(95, 95, 95);
            let white = cc.color(255, 255, 255);
            if (this.story["Position" + this.talk] == 1) {
                newNode = cc.instantiate(this.LeftTalk);
                this.LeftHead.node.color = white;
                this.RightHead.node.color = black;
            }
            else {
                newNode = cc.instantiate(this.RightTalk);
                this.LeftHead.node.color = black;
                this.RightHead.node.color = white;
            }
            newNode.parent = this.TalkContent;
            let str = this.story["Story" + this.talk];
            let arr = str.split("\n");
            let line = 0;
            for (let i = 0; i < arr.length; i++) {
                if (line < arr[i].length) {
                    line = arr[i].length;
                }
            }
            this.ShowOneByOne(newNode, str);
            this.CheckAction(str, this.story["Position" + this.talk]);
            newNode.children[0].width = newNode.getComponentInChildren(cc.Label).fontSize * line;
            newNode.children[0].height = newNode.getComponentInChildren(cc.Label).lineHeight * arr.length;
            newNode.width = newNode.getComponentInChildren(cc.Label).fontSize * line + 20;
            newNode.height = newNode.getComponentInChildren(cc.Label).lineHeight * arr.length + 40;
            this.talk++;
        }
        else if (this.canCopyBtn) {
            this.canCopyBtn = false;
            let newNode;
            if (this.story.ID == Global.maxStory[this.peopleName] && this.peopleName != "grandpa") {
                newNode = cc.instantiate(this.Btn_tanzaku);
            }
            else {
                newNode = cc.instantiate(this.Btn_fin);
            }
            newNode.active = true;
            newNode.parent = this.TalkContent;
        }
        else {
            return false;
        }
    },

    ShowOneByOne(target, str) {
        if (this.nowTarget && this.nowStr) {
            this.nowTarget.getComponentInChildren(cc.Label).string = this.nowStr;
        }
        this.nowTarget = target;
        this.nowStr = str;
        this.num = 0;
    },

    OpenBG() {
        if (this.guide.step == 15) {
            //调用15步 关闭对话提示
            this.guide.onTap();
        }
        this.target.active = true;
        this.TalkContent.removeAllChildren();
    },

    CloseBG() {
        if (this.guide.step == 16) {
            //显示对话提示
            this.guide.onFourteen();
        }
        if (this.callback) {
            this.callback();
            this.callback = undefined;
        }
        this.CloseBG2();
        this.story = undefined;
        this.talk = undefined;
        this.target.active = false;
        this.peopleName = undefined;
    },

    //显示短签
    OpenBG2(name) {
        if (this.peopleName) {
            name = this.peopleName;
        }
        this.TanzakuNode.active = true;
        this.TanzakuNode.getChildByName("close").active = false;
        this.TanzakuNode.getChildByName("image").opacity = 0;
        PublicFunction.LoadImage("tanzaku", name, this.TanzakuNode.getChildByName("image"));
        this.TanzakuNode.getChildByName("image").runAction(cc.sequence(cc.fadeIn(2), cc.callFunc(() => {
            this.TanzakuNode.getChildByName("close").active = true;
        })))
    },

    CloseBG2() {
        this.TanzakuNode.active = false;
    },

    //检测是否有表情
    CheckAction(str, pos) {
        let lie = pos == 1 ? "left" : "right";
        let sign1 = str.indexOf("？");//问号的位置
        let sign2 = str.indexOf("！");//感叹号的位置
        let sign3 = str.indexOf("！？");//问号+感叹号的位置
        //有符号，优先显示符号
        if (sign3 != -1) {
            this.questionAction(null, lie);
            this.sound.PaySound(this.sound.questionSound);
        }
        else if (sign1 != -1 || sign2 != -1) {
            if (sign1 != -1 && sign2 != -1) {
                if (sign1 < sign2) {
                    this.problemAction(null, lie);
                    this.sound.PaySound(this.sound.problemSound);
                }
                else {
                    this.foreheadAction(null, lie);
                    this.sound.PaySound(this.sound.foreheadSound);
                }
            }
            else if (sign1 != -1) {
                this.problemAction(null, lie);
                this.sound.PaySound(this.sound.problemSound);
            }
            else {
                this.foreheadAction(null, lie);
                this.sound.PaySound(this.sound.foreheadSound);
            }
        }
        else {
            let text1 = str.indexOf("谢谢");
            let text2 = str.indexOf("开心");
            let text3 = str.indexOf("不好意思");
            let text4 = str.indexOf("呵");
            let text5 = str.indexOf("哈");
            let text6 = str.indexOf("哎唷");
            let text7 = str.indexOf("哎呀");
            let text8 = str.indexOf("那个");
            let text9 = str.indexOf("啰嗦");
            if (text1 != -1 || text2 != -1) {
                this.noteAction(null, lie);
                this.sound.PaySound(this.sound.noteSound);
            }
            else if (text3 != -1) {
                this.lotAction(null, lie);
                this.sound.PaySound(this.sound.lotSound);
            }
            else if (text4 != -1 || text5 != -1 || text6 != -1 || text7 != -1) {
                this.whoopeeAction(null, lie);
                this.sound.PaySound(this.sound.whoopeeSound);
            }
            else if (text8 != -1 || text9 != -1) {
                this.sweat(null, lie);
                this.sound.PaySound(this.sound.sweatSound);
            }
            else {
                this.sound.PaySound(this.sound.normalSound);
            }
        }
    },

    //动作表情
    //问号，？
    problemAction(e, lie) {
        this.problem.active = true;
        if (lie == 'left') {
            this.problem.setPosition(-102, 398);
        } else {
            this.problem.setPosition(112, 410);
        }
        this.problem.stopAllActions();
        var rote = cc.sequence(cc.rotateTo(0.1, -17), cc.rotateTo(0.1, 13), cc.rotateTo(0.1, 0))
        this.problem.runAction(cc.sequence(cc.moveTo(0.2, lie == 'left' ? this.problem.x + 70 : this.problem.x - 70, this.problem.y + 40), rote, cc.delayTime(0.3), cc.callFunc(() => {
            this.problem.setPosition(this.problem.getPosition());
            this.problem.active = false;
        })))
    },
    //吃惊，！？
    questionAction(e, lie) {
        this.question.active = true;
        var n = 1;
        if (lie == 'left') {
            this.question.setPosition(-63, 342);
            this.question.scaleX = 1;
            n = 1;
        } else {
            this.question.setPosition(40, 327);
            this.question.scaleX = -1;
            n = -1;
        }
        this.question.stopAllActions();
        var scale = cc.sequence(cc.scaleTo(0.1, 1.2 * n), cc.scaleTo(0.1, 1 * n))
        this.question.runAction(cc.sequence(scale, cc.delayTime(0.3), cc.callFunc(() => {
            this.question.setPosition(this.question.getPosition());
            this.question.active = false;
        })))
    },
    //额头生气，！
    foreheadAction(e, lie) {
        this.forehead.active = true;
        if (lie == 'left') {
            this.forehead.setPosition(-59, 482);
        } else {
            this.forehead.setPosition(37, 482);
        }
        this.forehead.stopAllActions();
        var seq = cc.sequence(cc.delayTime(0.2), cc.callFunc(() => {
            this.forehead.active = false;
        }));
        var rep = cc.repeat(cc.sequence(cc.moveTo(0.1, this.forehead.x, this.forehead.y + 3), cc.moveTo(0.1, this.forehead.x - 3, this.forehead.y),
            cc.moveTo(0.1, this.forehead.x, this.forehead.y + 7), cc.moveTo(0.1, this.forehead.x + 5, this.forehead.y),
            cc.moveTo(0, this.forehead.getPosition())), 2);
        this.forehead.runAction(cc.sequence(rep, seq))
    },
    //音符，谢谢，开心
    noteAction(e, lie) {
        this.note.active = true;
        if (lie == 'left') {
            this.note.setPosition(-59, 482);
        } else {
            this.note.setPosition(37, 482);
        }
        this.note.stopAllActions();
        var seq = cc.sequence(cc.delayTime(0.2), cc.callFunc(() => {
            this.note.active = false;
        }));
        var rote = cc.sequence(cc.rotateTo(0.1, 15), cc.rotateTo(0.1, -15), cc.rotateTo(0.1, 0))
        this.note.runAction(cc.sequence(rote, seq))
    },
    //很多汗，不好意思
    lotAction(e, lie) {
        this.lot.active = true;
        if (lie == 'left') {
            this.lot.setPosition(-187, 488);
            this.lot.scaleX = 1;
        } else {
            this.lot.setPosition(155, 488);
            this.lot.scaleX = -1;
        }
        this.lot.stopAllActions();
        var seq = cc.moveTo(0.2, this.lot.x, this.lot.y - 80);
        this.lot.runAction(cc.sequence(seq, cc.delayTime(0.3), cc.callFunc(() => {
            this.lot.setPosition(this.lot.getPosition());
            this.lot.active = false;
        })))
    },

    //哈哈笑的时候，呵，哈，哎唷，哎呀
    whoopeeAction(e, lie) {
        this.whoopee.active = true;
        if (lie == 'left') {
            this.whoopee.setPosition(-19, 493);
            this.whoopee.scaleY = -1;
        } else {
            this.whoopee.setPosition(13, 490);
            this.whoopee.scaleY = 1;
        }
        this.whoopee.scaleX = -1;
        this.whoopee.rotation = -90;
        this.whoopee.stopAllActions();
        var seq = cc.sequence(cc.delayTime(0.2), cc.callFunc(() => {
            this.whoopee.active = false;
        }));
        var rote = cc.sequence(cc.rotateTo(0.1, -105), cc.rotateTo(0.1, -80), cc.rotateTo(0.1, -90))
        this.whoopee.runAction(cc.sequence(cc.delayTime(0.2), rote, seq))
    },
    //汗水，那个，啰嗦
    sweat(e, lie) {
        var _node = lie == 'left' ? "lefthead" : "righthead";
        this.animation.FlySweat(this.node.getChildByName("bg").getChildByName(_node), 8, 0.5, 80, 0.5);
    },
    //停掉所有动作
    stopAction() {
        this.problem.active = false;
        this.question.active = false;
        this.forehead.active = false;
        this.note.active = false;
        this.lot.active = false;
        this.whoopee.active = false;
        this.node.getChildByName("bg").getChildByName("lefthead").removeAllChildren();
        this.node.getChildByName("bg").getChildByName("righthead").removeAllChildren();
    },

    update(dt) {
        if (this.nowTarget && this.nowStr) {
            if (this.num < this.nowStr.length) {
                this.nowTarget.getComponentInChildren(cc.Label).string += this.nowStr[this.num++];
            }
            else {
                this.nowTarget = null;
                this.nowStr = null;
            }
        }
    },
});
