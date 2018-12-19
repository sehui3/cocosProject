import Global from './Global'
import ws from "./Ws"
import PublicFunction from './PublicFunction'
cc.Class({
    extends: cc.Component,
    properties: {
        game: {
            default: null,
            type: cc.Node,
            displayName: "游戏主节点"
        },
        GuestAnim: {
            default: null,
            type: cc.Node,
            displayName: "客人动画节点"
        },
        Animation: {
            default: null,
            type: cc.Node,
            displayName: "动画节点"
        },
        Tips: {
            default: null,
            type: cc.Node,
            displayName: "提示节点"
        },
        Btn_share: {
            default: null,
            type: cc.Node,
            displayName: "分享按钮"
        },
        shareView: {
            default: null,
            type: cc.Node,
            displayName: "分享弹窗"
        },
        accelerateAnim: {
            default: null,
            type: cc.Node,
            displayName: "加速动画"
        },
        acceleratePer: {
            default: null,
            type: cc.Sprite,
            displayName: "加速进度"
        },
    },

    onLoad() {
        let self = this;
        this.outTime = 0;
        this.nextTime = 0;
        this.timer = 0;
        this.accelerateTime = 0;
        this.accTime = 15;//设定的加速时间
        this.isShare = false;//是否正在分享
        if (CC_WECHATGAME) {
            wx.onShow(() => { self.ComeBack() });
            wx.onHide(() => { self.GoOut(); });
        }
    },

    //回到前台
    ComeBack() {
        console.log("回到前台");
        if (this.isShare) {
            this.isShare = false;
            let inTime = Date.now();
            //三秒假分享
            if (inTime - this.outTime < 1000 * 3) {
                this.Tips.getComponent("Tips").ShowTips("请分享到群获得奖励。");
                return;
            }
            else {
                this.ShareSuccess();
            }
        }
    },

    GoOut() { },

    //分享的按钮慢慢的飘出来
    ShowShareBtn() {
        if (!this.Btn_share.active) {
            this.Btn_share.active = true;
            this.Btn_share.x = 500;
            this.Btn_share.stopAllActions();
            this.Btn_share.runAction(cc.moveTo(2.5, cc.v2(320, this.Btn_share.y)));
        }
    },

    //打开分享的页面
    OpenShareView() {
        this.shareView.active = true;
    },

    //关闭分享的页面
    CloseShareView() {
        this.shareView.active = false;
    },

    //去分享
    ToShare() {
        if (CC_WECHATGAME) {
            this.isShare = true;
            this.outTime = Date.now();
            ws.share({ pos: 'jiangli' });
        }
        else {
            this.ShareSuccess();
        }
    },

    //不分享
    NotShare() {
        this.CloseShareView();
        this.nextTime = 3 * 60;//下次好了，三分钟后再弹出分享
        this.Btn_share.active = false;
    },

    //分享成功
    ShareSuccess() {
        this.CloseShareView();
        this.nextTime = 90;//分享成功，90秒后再弹出分享
        this.Btn_share.active = false;
        if (Global.gameData.hasShare == true) {
            let probability = [0.3, 0.4, 0.3];
            let max = Global.gameData.Level * 2 + 13 + Global.gameData.Power_plus;
            max = max < 120 ? max : 120;
            if (Global.gameData.Power == max) {
                probability = [0.45, 0.55, 0];
            }
            let ran = Math.random();
            for (let i = 0; i < 3; i++) {
                if (ran < probability[i]) {
                    this.GetPrize(i + 1);
                    break;
                }
                ran -= probability[i];
            }
        }
        else {
            this.GetPrize(1);
        }
    },

    //分享的奖励，1是大量发生，2是金币，3是体力
    GetPrize(num) {
        Global.gameData.hasShare = true;
        if (num == 1) {
            this.GetAccelerate();
        }
        else if (num == 2) {
            let total = 0;
            for (let i = 0; i < Global.gameData.food.length; i++) {
                if (Global.gameData.food[i] > 0) {
                    total++;
                }
                else {
                    let lock = PublicFunction.CheckFoodLock(i + 1);//未解锁
                    if (!lock) {
                        total++;
                    }
                }
            }
            console.log("已解锁" + total);
            this.Animation.getComponent("Animation").FlyCoin(cc.v2(320, 500), total * 25 * 2, true);
        }
        else if (num == 3) {
            this.game.getComponent("Game").RefreshPower(120);
            this.Tips.getComponent("Tips").ShowTips("邀请后体力恢复了！");
        }
    },

    //获得加速，神坛也有可能触发
    GetAccelerate() {
        //制作料理不消耗体力金币，坐下点餐一秒进食，15秒
        console.log("加速");
        this.game.getComponent("sound").PayBG2();
        Global.isAccelerate = true;
        this.accelerateTime = 0;
        this.accelerateAnim.active = true;
        this.acceleratePer.fillRange = 0;
        this.accelerateAnim.stopAllActions();
        let delay = 0.15;
        this.accelerateAnim.runAction(cc.repeat(cc.sequence(cc.callFunc(() => {
            this.acceleratePer.fillRange += 1 / (this.accTime / delay);
        }), cc.delayTime(delay)), this.accTime / delay));
    },

    update(dt) {
        //如果以后实装了神坛要把这个改到下面
        if (!Global.config.allow_share) return;
        this.timer += dt;
        if (this.timer > 1) {
            this.timer--;
            if (Global.isAccelerate) {
                this.accelerateTime++;
                this.accelerateAnim.getChildByName("anim").active = !this.accelerateAnim.getChildByName("anim").active;
                this.GuestAnim.getComponent("GuestAnim").SharePrize();
                this.Animation.getComponent("Animation").FlyRibbon(false);
                if (this.accelerateTime > this.accTime) {
                    Global.isAccelerate = false;
                    this.accelerateAnim.active = false;
                    this.game.getComponent("sound").PayBG();
                }
            }
            if (Global.guestNum < 2) return;
            else {
                if (this.nextTime <= 0) {
                    this.ShowShareBtn();
                }
                else {
                    this.nextTime--;
                }
            }
        }
    }
})