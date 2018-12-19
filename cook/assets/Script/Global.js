//用户信息
let user = {};
//图片缓存
let image = {
    equip: [],
    food: [],
    head: [],
    tanzaku: [],
    ingredient: [],
    chineseFood: [],
    icon: [],
};
let guestimage = {
    bobby: [], boy: [], doctor: [], dosser: [], girl: [], monk: [], officeWorkers: [], oldMan: [], sis: [], worker: []
};
//剧情缓存
let story = {
    "grandpa": [],
    "bobby": [],
    "boy": [],
    "girl": [],
    "monk": [],
    "dosser": [],
    "sis": [],
    "oldMan": [],
    "doctor": [],
    "laststory": [],
}
//日本料理等级缓存，不用每次都计算全部食物
let MyFoodLevel = [];
//中华料理等级缓存，不用每次都计算全部食物
let MyChineseFoodLevel = [];
//别人已经点了的食物缓存，在点菜的时候判断一下
let OtherOrder = [];
//老奶奶状态
let OwnerStage = "sleep";
//用户游戏信息
let gameData = {
    //音乐开关
    musicEnabled: true,
    //音效开关
    soundEnabled: true,
    //数据更新时间
    updateTimestamp: 0,
    //注册进来的时间
    RegisterTimestamp: 0,
    //体力恢复起始时间
    power_time: 0,
    //设备，放置台1，放置台2，桌椅1，桌椅2，工作台，冰箱，收银台，柜台1，柜台2，神坛
    equip: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //日本料理，64种，记录每种料理制作过的个数
    food: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //中国料理，128种，记录每种料理制作过的个数
    chineseFood: [],
    //已解锁的中国料理
    chineseFoodUnlock: [],
    //中国料理菜谱
    chineseFoodScroll: [],
    //研制中的菜谱
    Researching: [],
    //食材，46种，记录每种食材的数量
    ingredient: [],
    //已解锁的食材
    ingredientUnlock: [],
    //功能是否解锁，池塘，森林，菜地，猪圈，菜棚，鸡舍，作坊，牧场，设备，图鉴，探索，研制
    unlockButton: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //放置台上放置的料理，[ID，num]
    PlaceFood: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    //正在制作的料理
    CookingFood: [],
    //客人的好感度，bobby，boy，girl，monk，dosser，sis，oldMan，doctor,officeWorkers,worker
    GuestMood: {
        "bobby": 0,
        "boy": 0,
        "girl": 0,
        "monk": 0,
        "dosser": 0,
        "sis": 0,
        "oldMan": 0,
        "doctor": 0,
        "officeWorkers": 0,
        "worker": 0
    },
    //客人的故事开放流程，每看完一个+1
    GuestStory: {
        "bobby": 0,
        "boy": 0,
        "girl": 0,
        "monk": 0,
        "dosser": 0,
        "sis": 0,
        "oldMan": 0,
        "doctor": 0
    },
    //任务进度
    MissionNum: 1,
    //当前任务数据缓存
    MissionData: [],
    //主线故事开放流程，每看完一个+1
    MainStory: 0,
    //体力
    Power: 0,
    //从任务获得的额外体力上限
    Power_plus: 0,
    //经验，获得一枚金币经验+1
    Exp: 0,
    //等级
    Level: 1,
    //金钱
    Money: 1000,
    //钻石
    Diamond: 0,
    //已解锁的客人
    unlocked: [],
    //是否是第一次进游戏、
    onePlay: false,
    //是否第一次分享
    hasShare: false,
    //今天签到了没
    canSignIn: false,
    //签到第几天
    ActiveDay: 0,
    //签到时间
    signinTimestamp: 0,
    //当前季节
    curSeason: 2,
    //场地数据
    seekLv: {
        1: { lv: 1, unlock: true },
        2: { lv: 1, unlock: true },
        3: { lv: 1, unlock: true },
        4: { lv: 1, unlock: true },
        5: { lv: 1, unlock: true },
        6: { lv: 1, unlock: true },
        7: { lv: 1, unlock: true },
        8: { lv: 1, unlock: true },
    },
    //邀请到的探索员
    invitaList: [
        { name: "小小马", head: "", gender: "4", openId: 1 },
        { name: "小小马", head: "", gender: "2", openId: 2 },
        { name: "大大马", head: "", gender: "1", openId: 3 },
    ],

    //场地已解锁的食材
    seekUnlockMater: {
        1: ["贝壳"],
        2: ["白菜"],
        3: ["葱"],
        4: ["猪腿肉"],
        5: ["青菜"],
        6: ["鸡蛋"],
        7: ["面粉"],
        8: ["牛腩"],
    }
};
//客人喜好
let fancy = {
    "bobby": [17, 21, 55],
    "boy": [18, 34, 52],
    "girl": [13, 27, 54],
    "monk": [42, 59, 64],
    "dosser": [22, 45, 44],
    "sis": [16, 58, 35],
    "oldMan": [2, 5, 15],
    "doctor": [33, 50, 56],
};
//对应曜日进场的人
let approach = {
    "0": ["girl_in", "bobby_in", "monk_in", "officeWorkers_in", "worker_in"],
    "1": ["boy_in", "dosser_in", "monk_in", "officeWorkers_in", "worker_in"],
    "2": ["sis_in", "oldMan_in", "monk_in", "officeWorkers_in", "worker_in"],
    "3": ["doctor_in", "bobby_in", "monk_in", "officeWorkers_in", "worker_in"],
    "4": ["dosser_in", "girl_in", "monk_in", "officeWorkers_in", "worker_in"],
    "5": ["sis_in", "boy_in", "monk_in", "officeWorkers_in", "worker_in"],
    "6": ["doctor_in", "oldMan_in", "monk_in", "officeWorkers_in", "worker_in"],
};
//最大剧情数
let maxStory = {
    "grandpa": 14,
    "bobby": 8,
    "boy": 9,
    "girl": 8,
    "monk": 7,
    "dosser": 9,
    "sis": 8,
    "oldMan": 8,
    "doctor": 8,
};

//这次登陆有几个客人
let guestNum = 0;
//游戏配置
let config = {
    allow_share: false,
    allow_pay: false,
};

//音频ID
const audio = {
    background: null,
    volume: 1,
};

const Global = {
    user, //用户信息
    image, //图片缓存
    story, //剧情缓存
    guestimage, //客人图片缓存
    MyFoodLevel, //日本料理等级缓存
    MyChineseFoodLevel, //中华料理等级缓存
    OtherOrder, //别人已经点了的食物缓存
    OwnerStage, //老奶奶状态
    gameData, //游戏信息
    config, //游戏配置
    audio, //音频
    fancy, //客人喜好
    approach, //进场人员
    maxStory, //最大剧情数
    guestNum, //这次登陆有几个客人
};

export default Global;