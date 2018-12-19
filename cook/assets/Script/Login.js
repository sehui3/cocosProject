let Global = require("./Global")
let ws = require("./Ws")
module.exports = {
    initWeixin() {
        let self = this;
        ws.init({
            host: 'ws.lesscool.cn', // 暂时用这个域名，后面会支持api.websdk.cn这个域名
            version: '1.0.2', //
            appid: 1035, // 此项目在筋斗云的appid
            secret: '831a0e3a45de4a89b8153c851ad1a8c9', // 此项目在筋斗云的secret, 用于与后端通信签名
            share: {
                title: '', // 默认分享文案
                image: '', // 默认分享图片
            },
        })
        // 默认发起登陆
        ws.onLoginComplete(onLoginCallback);
        ws.login();
        wx.showLoading({
            title: '登录中',
            // mask: true
        });

        //这里会取WS中getCommon返回的参数，如果修改了WS要同步修改对应位置
        function onLoginCallback(res, ResData) {
            if (ws.getLoginStatus() == 'success') {
                wx.hideLoading();
                if (ws.needUserInfo()) {
                    console.log("获取用户头像信息");
                    cc.find("Canvas/loading").getComponent("Loading").isGoingMain = false;
                    let btn = wx.createUserInfoButton({
                        // 按钮参数
                        type: 'text',
                        text: '',
                        style: {
                            left: 0,
                            top: 0,
                            width: 640,
                            height: 1138,
                        }
                    });
                    btn.onTap(function (res) {
                        console.log("checkUserInfo", res);
                        ws.checkUserInfo();
                        if (res.userInfo) {
                            btn.style.hidden = true;
                            cc.find("Canvas/loading").getComponent("Loading").isGoingMain = true;
                        }
                    })
                }
                cc.find("Canvas/loading").getComponent("Loading").isLogin = true;
                Global.hasInit = true;
                console.log('login success!');
                console.log(ws.user); // 用户信息
                console.log(ws.conf); // 通用配置
                Global.config = ws.conf;
                console.log("本地", ws.data); // 用户游戏数据
                console.log("后台", ResData); // 用户游戏数据
                //如果存在后台数据
                if (ResData && ResData.updateTimestamp) {
                    //如果存在本地数据而且本地数据比后台新，则提交本地数据
                    if (ws.data && ws.data.updateTimestamp && (ws.data.updateTimestamp > ResData.updateTimestamp)) {
                        self.set(ws.data);
                        console.log("提交本地数据", ws.data);
                    }
                    //否则用后台数据替代本地数据
                    else {
                        self.set(ResData);
                        console.log("修改本地数据", ws.data);
                    }
                }
                //没有数据，上传初始数据
                else {
                    Global.gameData.updateTimestamp = Date.now();
                    ws.setAllData(Global.gameData, true);
                    console.log("上传初始数据", ws.data); // 用户游戏数据 
                }
            } else if (ws.getLoginStatus() == 'fail') {
                wx.hideLoading();
                let msg = '登录失败'
                if (res && res.code == -1) {
                    msg = '失败原因: ' + res.msg;
                }
                wx.showModal({
                    title: '登陆失败',
                    content: msg,
                    confirmText: '重新登陆',
                    cancelText: '关闭',
                    success: function (res) {
                        if (res.confirm == true) {
                            ws.login();
                            wx.showLoading({
                                title: '登录中',
                                // mask: true
                            });
                        }
                    }
                })
            }
        }
    },

    set(data) {
        ws.data = data;
        Global.gameData = data;
        let str = JSON.stringify(ws.data);

        wx.setStorage({
            key: ws.options.DATA_KEY,
            data: JSON.parse(str),
        });
        ws.post({
            url: '/data',
            data: JSON.parse(str),
        });
    },
}