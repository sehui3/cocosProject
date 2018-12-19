let Global = require("./Global")
module.exports = {
    LoadImage: function (arrayName, path, target, success, error) {
        if (arrayName == "food" && target) {
            target.getComponent(cc.Sprite).spriteFrame = Global.FoodAtlas.getSpriteFrame(path);
            success && success(target);
            return;
        }
        else if ((arrayName == "head" || arrayName == "equip") && target) {
            target.getComponent(cc.Sprite).spriteFrame = Global.EquipAtlas.getSpriteFrame(path);
            success && success(target);
            return;
        }
        if (Global.image[arrayName][path] && target) {
            target.getComponent(cc.Sprite).spriteFrame = Global.image[arrayName][path];
            success && success(target);
            return;
        }

        cc.loader.loadRes("image/" + arrayName + "/" + path, function (err, res) {
            if (err) {
                cc.error(err.message || err);
                console.log("路径", path);
                error && error();
                return;
            }
            var spf = new cc.SpriteFrame();
            spf.initWithTexture(res);
            Global.image[arrayName][path] = spf
            if (target) {
                target.getComponent(cc.Sprite).spriteFrame = spf;
            }
            success && success(target);
        });
    },

    LoadImageDir: function (man_type, anim_type, success, error) {
        if (Global.guestimage[man_type][anim_type]) {
            let assets = Global.guestimage[man_type][anim_type];
            success && success(assets);
            return;
        }

        cc.loader.loadResDir("image/guest/" + man_type + "/" + anim_type, cc.SpriteFrame, (err, assets) => {
            if (err) {
                cc.error(err.message || err);
                console.log("路径", path);
                error && error();
                return;
            }
            Global.guestimage[man_type][anim_type] = assets;
            success && success(assets);
        })
    },

    //特效为加载某个文件夹内所有图片(路径，图片数量，目标)
    LoadEffect: function (arrayName, path, number) {
        if (Global.image[arrayName][path]) {
            return;
        }
        Global.image[arrayName][path] = [];
        let imageArray = [];
        for (var i = 1; i <= number; i++) {
            imageArray.push("image/" + arrayName + "/" + path + "/" + i);
        }
        cc.loader.loadResArray(imageArray, function (err, res) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            for (var i = 0; i < res.length; i++) {
                var spf = new cc.SpriteFrame();
                spf.initWithTexture(res[i]);
                Global.image[arrayName][path].push(spf);
            }
        });
    },

    //注意这个id是从0开始的
    ComputeFoodLevel: function (id, num) {
        let levelup = [0, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10];
        let i = 0;
        let oldLevel = -1;
        //100以下是日本料理，100以上是中国料理
        if (id < 100) {
            if (Global.MyFoodLevel[id]) {
                oldLevel = Global.MyFoodLevel[id][0];
            }
            while (num >= levelup[i]) {
                num -= levelup[i];
                i++;
            }
            Global.MyFoodLevel[id] = [i, num, levelup[i]];//[level,left,need]
            if (oldLevel != -1 && Global.MyFoodLevel[id][0] > oldLevel) {
                this.FoodLevelUp(id + 1, Global.MyFoodLevel[id][0]);
            }
        }
        else {
            if (Global.MyChineseFoodLevel[id - 100]) {
                oldLevel = Global.MyChineseFoodLevel[id - 100][0];
            }
            while (num >= levelup[i]) {
                num -= levelup[i];
                i++;
            }
            Global.MyChineseFoodLevel[id - 100] = [i, num, levelup[i]];//[level,left,need]
            if (oldLevel != -1 && Global.MyChineseFoodLevel[id - 100][0] > oldLevel) {
                this.FoodLevelUp(id + 1, Global.MyChineseFoodLevel[id - 100][0]);
            }
        }
    },

    //食物升级了，检测有没有东西解锁了
    FoodLevelUp: function (id, level) {
        cc.find("Canvas/main/Animation").getComponent("Animation").GetTitleMessage(1, id);
        cc.find("Canvas/main/Animation").getComponent("Animation").FlyRibbon();
        if (id > 100) return;
        let foodList = Global.FoodList;
        for (let i = 0; i < foodList.length; i++) {
            if (foodList[i].Pre_ID == id && foodList[i].Pre_Level == level) {
                cc.find("Canvas/main/Animation").getComponent("Animation").GetTitleMessage(2, i + 1);
            }
        }
    },

    //计算所有食物的等级，一般只在开始的时候调用一次
    ComputeAllFoodLevel: function () {
        for (let i = 0; i < 64; i++) {
            this.ComputeFoodLevel(i, Global.gameData.food[i]);
        }
        for (let i = 0; i < 128; i++) {
            this.ComputeFoodLevel(i + 100, Global.gameData.chineseFood[i]);
        }
    },

    //食物是否未解锁,type 1是日本料理，2是中国料理，3是食材,ID 100以下是日本料理，100以上是中国料理
    CheckFoodLock: function (id, type = 1) {
        id = parseInt(id);
        if (type == 1) {
            let preid = parseInt(Global.FoodList[id - 1].Pre_ID);
            let prelevel = Global.MyFoodLevel[preid - 1];
            if (preid != 0 && prelevel[0] < parseInt(Global.FoodList[id - 1].Pre_Level)) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (type == 2) {
            if (Global.gameData.chineseFoodUnlock.indexOf(id) == -1) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (type == 3) {
            if (Global.gameData.ingredientUnlock.indexOf(id) == -1) {
                return true;
            }
            else {
                return false;
            }
        }
    },

    //检测是否可以制作食物
    CheckMakeFood: function (id) {
        //先遍历一遍有没有这个食物
        for (let i = 0; i < Global.gameData.PlaceFood.length; i++) {
            if (Global.gameData.PlaceFood[i][0] == id) {
                return i;
            }
        }
        //逐个放置台判断是否有空的
        if (Global.gameData.PlaceFood[0][0] == 0) {
            return 0;
        }
        else if (Global.gameData.PlaceFood[1][0] == 0) {
            return 1;
        }
        else if (Global.gameData.equip[0] == 1 && Global.gameData.PlaceFood[2][0] == 0) {
            return 2;
        }
        else if (Global.gameData.equip[0] == 1 && Global.gameData.PlaceFood[3][0] == 0) {
            return 3;
        }
        else if (Global.gameData.equip[1] == 1 && Global.gameData.PlaceFood[4][0] == 0) {
            return 4;
        }
        else if (Global.gameData.equip[1] == 1 && Global.gameData.PlaceFood[5][0] == 0) {
            return 5;
        }
        else {
            return -1;
        }
    },

    //判断制造食物要用的时间
    CheckWorkTime: function (cost, type) {
        let time = 0;
        //0,200，300 是 6 秒，400 是 10 秒
        if (type == 1) {
            switch (cost) {
                case 400: time = 10; break;
                default: time = 6; break;
            }
        }
        //0,100 是 3 秒， 200 和 300 是 6 秒，400 是 10 秒， 500 是 16 
        else if (type == 2 || type == 3) {
            switch (cost) {
                case 0:
                case 100: time = 3; break;
                case 200:
                case 300: time = 6; break;
                case 400: time = 10; break;
                case 500: time = 16; break;
            }
        }
        //0，200，300 是 3 秒，400 是 6 秒， 500 是 16 
        else {
            switch (cost) {
                case 0:
                case 200:
                case 300: time = 3; break;
                case 400: time = 6; break;
                case 500: time = 16; break;
            }
        }
        //有工作台，时间减半
        if (Global.gameData.equip[4] == 1) {
            time = time / 2;
        }
        return time;
    },

    //升级检测
    CheckLevelUp: function () {
        if (Global.gameData.Exp == this.maxExp) {
            Global.gameData.Level++;
            cc.find("Canvas/main/Animation").getComponent("Animation").FlyParticle();
            this.ComputeMaxExp();
            Global.gameData.Exp = 0;
        }
    },

    //计算当前等级最大经验
    ComputeMaxExp: function () {
        let max = 0;
        if (Global.gameData.Level == 1) {
            max = 24;
        }
        else if (Global.gameData.Level >= 2 && Global.gameData.Level <= 10) {
            max = 24 * 2 * (Global.gameData.Level - 1);
        }
        else if (Global.gameData.Level == 11) {
            max = 560;
        }
        else {
            max = 560 + 200 * (Global.gameData.Level - 10);
        }
        this.maxExp = max;
        return max;
    },

    //获取当前最大经验
    GetMaxExp: function () {
        if (this.maxExp) {
            return this.maxExp;
        }
        else {
            return this.ComputeMaxExp();
        }
    },

    //检测要点的菜
    CheckOrder: function (guest, hasOrder) {
        let foodList = Global.FoodList;
        let chineseFoodList = Global.ChineseFoodList;
        let hasOrderType = [];//已经点过了的类型
        for (let i = 0; i < hasOrder.length; i++) {
            //100以下是日本料理，100以上是中国料理
            if (hasOrder[i] < 100) {
                hasOrderType.push(foodList[hasOrder[i] - 1].Type);
            }
            else {
                hasOrderType.push(chineseFoodList[hasOrder[i] - 100 - 1].Type);
            }
        }

        let AllFood = [];//所有能点的菜
        for (let i = 0; i < Global.gameData.PlaceFood.length; i++) {
            //这里要判断一下，因为进来就会点菜，所以被别人点完了的不要算在里面
            if (Global.gameData.PlaceFood[i][0] != 0) {
                let otherorder = 0;
                for (let j = 0; j < Global.OtherOrder.length; j++) {
                    if (Global.gameData.PlaceFood[i][0] == Global.OtherOrder[j]) {
                        otherorder++;
                    }
                }
                if (Global.gameData.PlaceFood[i][1] - otherorder > 0) {
                    AllFood.push(Global.gameData.PlaceFood[i][0]);
                }
            }
        }
        //没菜
        if (AllFood.length == 0) {
            return 0;
        }

        let fancy = Global.fancy[guest];//客人的喜好
        if (fancy && fancy.length > 0) {
            for (let i = 0; i < AllFood.length; i++) {
                //有喜欢的，而且还没点过
                if (fancy.indexOf(AllFood[i]) != -1 && this.CheckCanOrder(AllFood[i], hasOrderType)) {
                    Global.OtherOrder.push(AllFood[i]);
                    return AllFood[i];//直接返回吧
                }
            }
        }

        //没有喜欢的
        for (let i = 1; i <= 4; i++) {
            //从主菜开始选，没点过的类型
            if (hasOrderType.indexOf(i.toString()) == -1) {
                let canOrder = [];
                //遍历所有菜，找到同类型的
                for (let j = 0; j < AllFood.length; j++) {
                    //100以下是日本料理，100以上是中国料理
                    if (AllFood[j] < 100) {
                        if (foodList[AllFood[j] - 1].Type == i) {
                            canOrder.push(AllFood[j]);
                        }
                    }
                    else {
                        if (chineseFoodList[AllFood[j] - 100 - 1].Type == i) {
                            canOrder.push(AllFood[j]);
                        }
                    }
                }
                //随机一个
                if (canOrder.length > 0) {
                    let index = Math.floor(Math.random() * canOrder.length);
                    Global.OtherOrder.push(canOrder[index]);
                    return canOrder[index];
                }
            }
        }

        return 0;
    },

    //检测是否可以点
    CheckCanOrder: function (id, hasOrderType) {
        if (hasOrderType.indexOf(Global.FoodList[id - 1].Type) != -1) {
            return false;
        }
        return true;
    },

    //今天是星期几
    CheckWeekday: function () {
        let hour = cc.find("Canvas/main").getComponent("Game").hour;
        return hour % 7;
    },

    //获得中文名
    GetNameStr: function (name) {
        let nameStr;
        switch (name) {
            case "grandpa": nameStr = "老爷爷"; break;
            case "bobby": nameStr = "警察先生"; break;
            case "boy": nameStr = "小小马"; break;
            case "girl": nameStr = "女学生"; break;
            case "monk": nameStr = "和尚"; break;
            case "dosser": nameStr = "流浪者"; break;
            case "sis": nameStr = "大姐姐"; break;
            case "oldMan": nameStr = "顽固老头"; break;
            case "doctor": nameStr = "医生"; break;
            case "officeWorkers": nameStr = "上班族们"; break;
            case "worker": nameStr = "工厂的老伯们"; break;
        }
        return nameStr;
    },

    //增加满足度
    AddMood: function (name, food) {
        //先检测是否触发任务完成条件
        if (Global.gameData.MissionData.length > 0 && Global.gameData.MissionData[0].type1 == "进食") {
            if (Global.gameData.MissionData[0].type2 == name && Global.gameData.MissionData[0].id == food) {
                Global.gameData.MissionData[0].nowNum++;
            }
        }
        let canPlayStory = false;//是否可以播剧情
        let nowNum = Global.gameData.GuestMood[name];//该角色当前的好感度
        if (name == "worker" || name == "officeWorkers") {
            Global.gameData.GuestMood[name] = 100;
            return;
        }
        if (nowNum == 100 && Global.gameData.GuestStory[name] == Global.maxStory[name]) return;
        let storyUnlock = [];//解锁剧情条件
        for (let i = 0; i < Global.StoryUnLock.length; i++) {
            if (Global.StoryUnLock[i].Name == name) {
                storyUnlock = Global.StoryUnLock[i];
                break;
            }
        }
        let addNum = 2;//每吃一个食物增加的好感度，会根据喜欢的食物来判断
        let finNum = nowNum + addNum;//先假设可以增加
        finNum = finNum > 100 ? 100 : finNum;
        let nowStory = Global.gameData.GuestStory[name];//该角色当前的剧情进度
        let lockMood = parseInt(storyUnlock["Mood" + (nowStory + 1)]);//当前剧情需要的好感度
        let lockFood = parseInt(storyUnlock["Food" + (nowStory + 1)]);//当前剧情需要的食物
        if (lockFood) {
            if (lockFood == food && finNum >= lockMood) {
                canPlayStory = true;//达到好感度和条件
            }
            else {
                finNum = finNum > lockMood ? lockMood : finNum;
            }
        }
        else if (finNum >= lockMood) {
            canPlayStory = true;//达到好感度
        }
        Global.gameData.GuestMood[name] = finNum;
        return canPlayStory;
    },

    //检测是否会开启主线剧情
    CheckMain: function () {
        //前面六个代表的是解锁等级，后面代表的是解锁中国料理数
        let mainStoryLevel = [1, 3, 5, 7, 9, 11, 10, 30, 40, 60, 80, 90, 100, 128];
        let nowMain = Global.gameData.MainStory;
        if (nowMain == mainStoryLevel.length) return;
        //前六个剧情只判断等级
        if (nowMain < 6 && Global.gameData.Level >= mainStoryLevel[nowMain]) {
            let show = false;
            if (nowMain > 0) {
                show = true;
            }
            else {
                //至少开放了两个其他人的剧情，才播主线剧情
                let total = 0;
                let peoples = ["bobby", "boy", "doctor", "dosser", "girl", "monk", "oldMan", "sis"];
                for (let i = 0; i < peoples.length; i++) {
                    total += Global.gameData.GuestStory[peoples[i]];
                    if (total > 1) {
                        show = true;
                        break;
                    }
                }
            }
            if (show) {
                let ran = Math.random();
                if (ran < 0.5) {
                    cc.find("Canvas/main/Owner/Owner").getComponent("Owner").ShowTalk();
                }
            }
        }
        //当前解锁的中国料理大于条件
        else if (nowMain >= 6 && Global.gameData.chineseFoodUnlock.length >= mainStoryLevel[nowMain]) {
            //最后一个故事
            if (nowMain == mainStoryLevel.length - 1) {
                let show = true;
                let peoples = ["bobby", "boy", "doctor", "dosser", "girl", "monk", "oldMan", "sis"];
                for (let i = 0; i < peoples.length; i++) {
                    if (Global.gameData.GuestStory[peoples[i]] != Global.maxStory[peoples[i]]) {
                        show = false;
                        break;
                    }
                }
                if (show) {
                    cc.find("Canvas/main/Owner/Owner").getComponent("Owner").ShowTalk();
                }
            }
            else {
                let ran = Math.random();
                if (ran < 0.5) {
                    cc.find("Canvas/main/Owner/Owner").getComponent("Owner").ShowTalk();
                }
            }
        }
    },

    //登录时做日期检查，刷新是否可以签到
    DateCheck: function () {
        if (!Global.gameData.signinTimestamp) {
            Global.gameData.signinTimestamp = 0;
            Global.gameData.ActiveDay = 0;
        }
        if (new Date(Global.gameData.signinTimestamp).toDateString() === new Date().toDateString()) {
            //今天
            console.log("当天");
        }
        else {//应当是到了下一天
            Global.gameData.canSignIn = true;
            if (Global.gameData.ActiveDay == 7) {
                Global.gameData.ActiveDay = 0;
            }
            console.log("不是当天");
        }
    },

    //倒计时转换（最大分钟数，时间戳）
    TransTimeNum: function (maxMinute, str) {
        let fivemin = maxMinute * 60 * 1000;
        str = (fivemin - parseInt(str)) / 1000;
        str = str > 0 ? str : 0;
        if (str == 0) {
            return null;
        }
        let min = Math.floor(str / 60);
        let second = parseInt(str - min * 60);
        return [min, second];
    },
    //获取随机数 传入m,n 随机返回m-n
    getMath(m,n){
        var a = n+1;
        var num = Math.floor(Math.random()*(m - a) + a);
        if(num == a){
            num = num -1;
        }
        return num;
    },
}