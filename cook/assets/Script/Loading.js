import Global from './Global'
import Login from './Login'
import ws from "./Ws"

cc.Class({
    extends: cc.Component,

    properties: {
        startBtn: {
            default: null,
            type: cc.Node,
            displayName: "开始按钮"
        },
        loadingBar: {
            default: null,
            type: cc.Node,
            displayName: "进度条"
        },
        loadingNum: {
            default: null,
            type: cc.Label,
            displayName: "百分比"
        },
        text: {
            default: null,
            type: cc.Label,
            displayName: "文字"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    Load: function (path, cb) {
        let self = this;
        cc.loader.loadRes(path, function (err, res) {
            if (err) {
                cc.error(err.message || err);
            }
            else if (typeof cb == "function") {
                cb(res.json);
                self.isLoad--;
            }
        });
    },

    GetEquipList: function (res) {
        Global.EquipList = res;
    },

    GetFoodList: function (res) {
        Global.FoodList = res;
    },

    GetChineseFoodList: function (res) {
        Global.ChineseFoodList = res;
    },

    GetIngredientList: function (res) {
        Global.IngredientList = res;
    },

    //这一堆是剧情
    GetgrandpaStory: function (res) {
        Global.story.grandpa = res;
    },

    GetbobbyStory: function (res) {
        Global.story.bobby = res;
    },

    GetboyStory: function (res) {
        Global.story.boy = res;
    },

    GetgirlStory: function (res) {
        Global.story.girl = res;
    },

    GetmonkStory: function (res) {
        Global.story.monk = res;
    },

    GetdosserStory: function (res) {
        Global.story.dosser = res;
    },

    GetsisStory: function (res) {
        Global.story.sis = res;
    },

    GetoldManStory: function (res) {
        Global.story.oldMan = res;
    },

    GetdoctorStory: function (res) {
        Global.story.doctor = res;
    },

    GetlastStory: function (res) {
        Global.story.laststory = res;
    },

    //剧情解锁条件
    GetStoryUnLock: function (res) {
        Global.StoryUnLock = res;
    },

    //任务列表
    GetMissionList: function (res) {
        Global.MissionList = res;
    },

    LoadAtlas: function (path, cb) {
        let self = this;
        cc.loader.loadRes(path, cc.SpriteAtlas, function (err, atlas) {
            if (err) {
                cc.error(err.message || err);
            }
            else if (typeof cb == "function") {
                cb(atlas);
                self.isLoad--;
            }
        });
    },

    GetFoodAtlas: function (res) {
        Global.FoodAtlas = res;
    },

    GetEquipAtlas: function (res) {
        Global.EquipAtlas = res;
    },

    onLoad() {
        // 移除左下角信息
        cc.debug.setDisplayStats(false);
        this.timer = 0;
        this.isLoad = 18;//需要加载的JS文件数
        this.isLogin = false;//是否已经登录
        this.isGoingMain = true;//是否可以跳转了
        this.isLoadingFinish = false;//是否已经预加载完成

        if (CC_WECHATGAME) {
            Login.initWeixin();
        }
        else {
            this.isLogin = true;
        }
    },

    start() {
        this.changeText();
        cc.director.preloadScene("main", (completedCount, totalCount, c) => {
            let pre = completedCount / totalCount;
            this.loadingBar.width = pre * 640;
            this.loadingNum.string = parseInt(pre * 100) + "%";
            if (!this.isLoadingFinish && (completedCount == totalCount)) {
                this.isLoadingFinish = true;
            }
        }, (a, b) => { });
        this.Load("./json/equipList", this.GetEquipList);//设备
        this.Load("./json/foodList", this.GetFoodList);//日本料理
        this.Load("./json/chineseFoodList", this.GetChineseFoodList);//中国料理
        this.Load("./json/ingredientList", this.GetIngredientList);//食材
        this.Load("./json/grandpaStory", this.GetgrandpaStory);
        this.Load("./json/bobbyStory", this.GetbobbyStory);
        this.Load("./json/boyStory", this.GetboyStory);
        this.Load("./json/girlStory", this.GetgirlStory);
        this.Load("./json/monkStory", this.GetmonkStory);
        this.Load("./json/dosserStory", this.GetdosserStory);
        this.Load("./json/sisStory", this.GetsisStory);
        this.Load("./json/oldManStory", this.GetoldManStory);
        this.Load("./json/doctorStory", this.GetdoctorStory);
        this.Load("./json/laststory", this.GetlastStory);
        this.Load("./json/StoryUnLock", this.GetStoryUnLock);
        this.Load("./json/missionList", this.GetMissionList);

        this.LoadAtlas("./image/FoodAtlas", this.GetFoodAtlas);
        this.LoadAtlas("./image/EquipAtlas", this.GetEquipAtlas);
    },

    GotoMain() {
        if (Global.gameData.RegisterTimestamp == 0) {
            Global.gameData.RegisterTimestamp = Date.now();
        }
        cc.director.loadScene("main");
    },

    playAnim() {
        if (!this.startBtn.active) {
            let self = this;
            this.startBtn.active = true;
            this.startBtn.children[0].runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1.5, 1.2), cc.scaleTo(1.5, 1), cc.callFunc(() => {
                self.changeText();
            }))));
        }
    },

    changeText() {
        //文字
        let ran = Math.random() * 3;
        if (ran > 2) {
            this.text.string = "快进来老奶奶的食堂看看吧！";
        }
        else if (ran > 1) {
            this.text.string = "每一段感人故事的背后都蕴含着...";
        }
        else {
            this.text.string = "想听老奶奶动人的食堂故事吗？";
        }
    },

    update(dt) {
        this.timer += dt;
        if (this.timer > 1) {
            this.timer = 0;
            if (this.isLoad == 0 && this.isLogin && this.isLoadingFinish) {
                this.playAnim();
                if (this.isGoingMain) {
                    this.isGoingMain = false;
                    this.GotoMain();
                }
            }
        }
    },
});
