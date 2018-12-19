const sdk = (function (e) {
    var t = {};

    function n(o) {
        if (t[o]) return t[o].exports;
        var a = t[o] = {exports: {}, id: o, loaded: !1};
        return e[o].call(a.exports, a, a.exports, n), a.loaded = !0, a.exports
    }

    n.m = e, n.c = t, n.p = "";
    return n(0)
}([function (e, t, n) {
    "use strict";
    var o, a = n(1), i = (o = a) && o.__esModule ? o : {default: o}, s = n(4), r = n(5), u = n(6), l = n(7), c = n(8), d = n(9), f = n(10), h = n(11), g = n(12), p = n(13);
    (0, n(2).initUtil)(i.default), (0, s.initHTTP)(i.default), (0, r.initUser)(i.default), (0, u.initConfig)(i.default), (0, l.initData)(i.default), (0, c.initShare)(i.default), (0, d.initProcess)(i.default), (0, f.initPayment)(i.default), (0, h.initAD)(i.default), (0, g.initHook)(i.default), (0, p.initInvite)(i.default), e.exports = window.ws = i.default
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    var o, a = Object.assign || function (e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
    }, i = n(2), s = (o = i) && o.__esModule ? o : {default: o};
    var r = {
        tmp: {},
        options: {scheme: "https://", host: "api.websdk.cn", apiVersion: "v1", USER_KEY: "ws_user", CONF_KEY: "ws_conf", DATA_KEY: "ws_data", share10: !0, commonDuration: 120},
        conf: {},
        user: {},
        data: {},
        version: "1.0.1",
        mode: "default",
        debug: !0,
        _initCallbacks: [],
        _showCallbacks: [],
        _hideCallbacks: [],
        _shareCallbacks: [],
        _openFromShareCallbacks: [],
        _openFromCodeCallbacks: [],
        _onInit: function () {
            var e = !0, t = !1, n = void 0;
            try {
                for (var o, a = this._initCallbacks[Symbol.iterator](); !(e = (o = a.next()).done); e = !0) {
                    var i = o.value;
                    i && i()
                }
            } catch (e) {
                t = !0, n = e
            } finally {
                try {
                    !e && a.return && a.return()
                } finally {
                    if (t) throw n
                }
            }
        },
        _onShow: function (e) {
            if (console.log("onShow:", e, "mode:", this.mode), "default" !== this.mode) this.mode = "default"; else {
                var t = !0, n = !1, o = void 0;
                try {
                    for (var a, i = this._showCallbacks[Symbol.iterator](); !(t = (a = i.next()).done); t = !0) {
                        var s = a.value;
                        s && s(e)
                    }
                } catch (e) {
                    n = !0, o = e
                } finally {
                    try {
                        !t && i.return && i.return()
                    } finally {
                        if (n) throw o
                    }
                }
                e.query && "share" === e.query.type ? r._openFromShare("onShow", e.query, e) : e.query && e.query.scene && "code_" === e.query.scene.substring(0, 5) && r._openFromCode("onShow", e.query.scene, e)
            }
        },
        _onHide: function (e) {
            if (console.log("onHide:", e, "mode:", this.mode), "default" === this.mode) {
                var t = !0, n = !1, o = void 0;
                try {
                    for (var a, i = this._hideCallbacks[Symbol.iterator](); !(t = (a = i.next()).done); t = !0) {
                        var s = a.value;
                        s && s(e)
                    }
                } catch (e) {
                    n = !0, o = e
                } finally {
                    try {
                        !t && i.return && i.return()
                    } finally {
                        if (n) throw o
                    }
                }
            }
        },
        _openFromShare: function (e, t, n) {
            var o = !0, a = !1, i = void 0;
            try {
                for (var s, r = this._openFromShareCallbacks[Symbol.iterator](); !(o = (s = r.next()).done); o = !0) {
                    var u = s.value;
                    u && u({from: e, query: t, options: n})
                }
            } catch (e) {
                a = !0, i = e
            } finally {
                try {
                    !o && r.return && r.return()
                } finally {
                    if (a) throw i
                }
            }
        },
        _openFromCode: function (e, t, n) {
            r.get({
                url: "/share/qrcode", data: {scene: t}, success: function (o) {
                    var a = !0, i = !1, s = void 0;
                    try {
                        for (var u, l = r._openFromCodeCallbacks[Symbol.iterator](); !(a = (u = l.next()).done); a = !0) {
                            var c = u.value;
                            c && c({from: e, scene: t, options: n, query: o.data})
                        }
                    } catch (e) {
                        i = !0, s = e
                    } finally {
                        try {
                            !a && l.return && l.return()
                        } finally {
                            if (i) throw s
                        }
                    }
                }
            })
        },
        onInit: function (e) {
            this._initCallbacks.push(e)
        },
        onShow: function (e) {
            this._showCallbacks.push(e)
        },
        onHide: function (e) {
            this._hideCallbacks.push(e)
        },
        openFromShare: function (e) {
            this._openFromShareCallbacks.push(e)
        },
        openFromCode: function (e) {
            this._openFromCodeCallbacks.push(e)
        },
        init: function (e) {
            this.options = a({}, s.default.copy(e, this.options)), this.systemInfo = wx.getSystemInfoSync(), this.launchOptions = wx.getLaunchOptionsSync(), this.user = wx.getStorageSync(this.options.USER_KEY), this.conf = wx.getStorageSync(this.options.CONF_KEY), this.data = wx.getStorageSync(this.options.DATA_KEY), this.log("conf:", this.conf), wx.onShow(this._onShow.bind(this)), wx.onHide(this._onHide.bind(this))
        },
        onLogined: function () {
            var e = this.launchOptions;
            e.query && "share" === e.query.type ? r._openFromShare("onLaunch", e.query, e) : e.query && e.query.scene && "code_" === e.query.scene.substring(0, 5) && r._openFromCode("onLaunch", e.query.scene, e), this._onInit()
        }
    };
    t.default = r
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    var o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
        return typeof e
    } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
    };
    t.initUtil = function (e) {
        e.checkSDK = function (e, t) {
            var n = this;
            return function (o, a) {
                return n.requireSDK(e) ? t.apply(n, [o]) : (n.log("微信SDK版本过低：" + n.systemInfo.SDKVersion + ",需要更新至" + e), void(a && "function" == typeof a && a([n.systemInfo.SDKVersion, e])))
            }
        }, e.requireSDK = function (e) {
            return r.compareVersion(this.systemInfo.SDKVersion, e)
        }, e.isIPhoneX = function () {
            return this.systemInfo && -1 != this.systemInfo.model.indexOf("iPhone X")
        }, e.isIOS = function () {
            return this.systemInfo && -1 != this.systemInfo.model.indexOf("iOS")
        }, e.isAndroid = function () {
            return this.systemInfo && -1 != this.systemInfo.model.indexOf("Android")
        }, e.toFixed = function (e, t) {
            for (var n = e.toFixed(t) + ""; "0" === n[n.length - 1];) if ("." === (n = n.substring(0, n.length - 1))[n.length - 1]) {
                n = n.substring(0, n.length - 1);
                break
            }
            return n
        }, e.log = function () {
            try {
                if (this.debug && console && console.log) {
                    for (var e = arguments.length, t = Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                    return console.log.apply(console, t)
                }
            } catch (e) {
            }
        }, e.setAlertCallback = function (t) {
            e._alertCallback = t
        }, e.alert = function (t) {
            e._alertCallback ? e._alertCallback(t) : wx.showModal({content: t})
        }, e.trace = function (e, t) {
            var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
            this.post({url: "/log/trace", data: {key: e, pos: t, data: n}})
        }
    };
    var a, i = n(3), s = (a = i) && a.__esModule ? a : {default: a};
    var r = {
        sign: function (e, t) {
            if ("string" == typeof e) return r.signSort(e, t);
            if ("object" == (void 0 === e ? "undefined" : o(e))) {
                var n = [];
                for (var a in e) n.push(a + "=" + e[a]);
                return r.signSort(n.join("&"), t)
            }
        }, signSort: function (e, t) {
            var n = e.split("&").sort().join("&") + "&key=" + t;
            return (0, s.default)(n).toUpperCase()
        }, S4: function () {
            return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
        }, guid: function () {
            return Date.now() + "-" + r.S4()
        }, compareVersion: function (e, t) {
            var n = parseFloat(e), o = parseFloat(t), a = e.replace(n + ".", ""), i = t.replace(o + ".", "");
            return n > o || !(n < o) && a >= i
        }, copy: function (e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, n = t || (e && e.push ? [] : {});
            for (var a in e) n[a] = "object" === o(e[a]) ? r.copy(e[a]) : e[a];
            return n
        }, randomSort: function (e) {
            for (var t, n = 0; n < e.length; n++) {
                var o = parseInt(Math.random() * e.length + "");
                t = e[o], e[o] = e[n], e[n] = t
            }
            return e
        }
    };
    t.default = r
}, function (e, t, n) {
    var o;
    "function" == typeof Symbol && Symbol.iterator;
    !function (a) {
        "use strict";

        function i(e, t) {
            var n = (65535 & e) + (65535 & t);
            return (e >> 16) + (t >> 16) + (n >> 16) << 16 | 65535 & n
        }

        function s(e, t, n, o, a, s) {
            return i((r = i(i(t, e), i(o, s))) << (u = a) | r >>> 32 - u, n);
            var r, u
        }

        function r(e, t, n, o, a, i, r) {
            return s(t & n | ~t & o, e, t, a, i, r)
        }

        function u(e, t, n, o, a, i, r) {
            return s(t & o | n & ~o, e, t, a, i, r)
        }

        function l(e, t, n, o, a, i, r) {
            return s(t ^ n ^ o, e, t, a, i, r)
        }

        function c(e, t, n, o, a, i, r) {
            return s(n ^ (t | ~o), e, t, a, i, r)
        }

        function d(e, t) {
            var n, o, a, s, d;
            e[t >> 5] |= 128 << t % 32, e[14 + (t + 64 >>> 9 << 4)] = t;
            var f = 1732584193, h = -271733879, g = -1732584194, p = 271733878;
            for (n = 0; n < e.length; n += 16) o = f, a = h, s = g, d = p, f = r(f, h, g, p, e[n], 7, -680876936), p = r(p, f, h, g, e[n + 1], 12, -389564586), g = r(g, p, f, h, e[n + 2], 17, 606105819), h = r(h, g, p, f, e[n + 3], 22, -1044525330), f = r(f, h, g, p, e[n + 4], 7, -176418897), p = r(p, f, h, g, e[n + 5], 12, 1200080426), g = r(g, p, f, h, e[n + 6], 17, -1473231341), h = r(h, g, p, f, e[n + 7], 22, -45705983), f = r(f, h, g, p, e[n + 8], 7, 1770035416), p = r(p, f, h, g, e[n + 9], 12, -1958414417), g = r(g, p, f, h, e[n + 10], 17, -42063), h = r(h, g, p, f, e[n + 11], 22, -1990404162), f = r(f, h, g, p, e[n + 12], 7, 1804603682), p = r(p, f, h, g, e[n + 13], 12, -40341101), g = r(g, p, f, h, e[n + 14], 17, -1502002290), f = u(f, h = r(h, g, p, f, e[n + 15], 22, 1236535329), g, p, e[n + 1], 5, -165796510), p = u(p, f, h, g, e[n + 6], 9, -1069501632), g = u(g, p, f, h, e[n + 11], 14, 643717713), h = u(h, g, p, f, e[n], 20, -373897302), f = u(f, h, g, p, e[n + 5], 5, -701558691), p = u(p, f, h, g, e[n + 10], 9, 38016083), g = u(g, p, f, h, e[n + 15], 14, -660478335), h = u(h, g, p, f, e[n + 4], 20, -405537848), f = u(f, h, g, p, e[n + 9], 5, 568446438), p = u(p, f, h, g, e[n + 14], 9, -1019803690), g = u(g, p, f, h, e[n + 3], 14, -187363961), h = u(h, g, p, f, e[n + 8], 20, 1163531501), f = u(f, h, g, p, e[n + 13], 5, -1444681467), p = u(p, f, h, g, e[n + 2], 9, -51403784), g = u(g, p, f, h, e[n + 7], 14, 1735328473), f = l(f, h = u(h, g, p, f, e[n + 12], 20, -1926607734), g, p, e[n + 5], 4, -378558), p = l(p, f, h, g, e[n + 8], 11, -2022574463), g = l(g, p, f, h, e[n + 11], 16, 1839030562), h = l(h, g, p, f, e[n + 14], 23, -35309556), f = l(f, h, g, p, e[n + 1], 4, -1530992060), p = l(p, f, h, g, e[n + 4], 11, 1272893353), g = l(g, p, f, h, e[n + 7], 16, -155497632), h = l(h, g, p, f, e[n + 10], 23, -1094730640), f = l(f, h, g, p, e[n + 13], 4, 681279174), p = l(p, f, h, g, e[n], 11, -358537222), g = l(g, p, f, h, e[n + 3], 16, -722521979), h = l(h, g, p, f, e[n + 6], 23, 76029189), f = l(f, h, g, p, e[n + 9], 4, -640364487), p = l(p, f, h, g, e[n + 12], 11, -421815835), g = l(g, p, f, h, e[n + 15], 16, 530742520), f = c(f, h = l(h, g, p, f, e[n + 2], 23, -995338651), g, p, e[n], 6, -198630844), p = c(p, f, h, g, e[n + 7], 10, 1126891415), g = c(g, p, f, h, e[n + 14], 15, -1416354905), h = c(h, g, p, f, e[n + 5], 21, -57434055), f = c(f, h, g, p, e[n + 12], 6, 1700485571), p = c(p, f, h, g, e[n + 3], 10, -1894986606), g = c(g, p, f, h, e[n + 10], 15, -1051523), h = c(h, g, p, f, e[n + 1], 21, -2054922799), f = c(f, h, g, p, e[n + 8], 6, 1873313359), p = c(p, f, h, g, e[n + 15], 10, -30611744), g = c(g, p, f, h, e[n + 6], 15, -1560198380), h = c(h, g, p, f, e[n + 13], 21, 1309151649), f = c(f, h, g, p, e[n + 4], 6, -145523070), p = c(p, f, h, g, e[n + 11], 10, -1120210379), g = c(g, p, f, h, e[n + 2], 15, 718787259), h = c(h, g, p, f, e[n + 9], 21, -343485551), f = i(f, o), h = i(h, a), g = i(g, s), p = i(p, d);
            return [f, h, g, p]
        }

        function f(e) {
            var t, n = "", o = 32 * e.length;
            for (t = 0; t < o; t += 8) n += String.fromCharCode(e[t >> 5] >>> t % 32 & 255);
            return n
        }

        function h(e) {
            var t, n = [];
            for (n[(e.length >> 2) - 1] = void 0, t = 0; t < n.length; t += 1) n[t] = 0;
            var o = 8 * e.length;
            for (t = 0; t < o; t += 8) n[t >> 5] |= (255 & e.charCodeAt(t / 8)) << t % 32;
            return n
        }

        function g(e) {
            var t, n, o = "";
            for (n = 0; n < e.length; n += 1) t = e.charCodeAt(n), o += "0123456789abcdef".charAt(t >>> 4 & 15) + "0123456789abcdef".charAt(15 & t);
            return o
        }

        function p(e) {
            return unescape(encodeURIComponent(e))
        }

        function v(e) {
            return function (e) {
                return f(d(h(e), 8 * e.length))
            }(p(e))
        }

        function m(e, t) {
            return function (e, t) {
                var n, o, a = h(e), i = [], s = [];
                for (i[15] = s[15] = void 0, a.length > 16 && (a = d(a, 8 * e.length)), n = 0; n < 16; n += 1) i[n] = 909522486 ^ a[n], s[n] = 1549556828 ^ a[n];
                return o = d(i.concat(h(t)), 512 + 8 * t.length), f(d(s.concat(o), 640))
            }(p(e), p(t))
        }

        function y(e, t, n) {
            return t ? n ? m(t, e) : g(m(t, e)) : n ? v(e) : g(v(e))
        }

        void 0 === (o = function () {
            return y
        }.call(t, n, t, e)) || (e.exports = o)
    }()
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.initHTTP = function (e) {
        e.request = s, e.get = r, e.post = u, e.put = l, e.delete = c, e.formatURL = d
    };
    var o = i(n(1)), a = i(n(2));

    function i(e) {
        return e && e.__esModule ? e : {default: e}
    }

    function s(e) {
        var t = e.success, n = e.fail;
        return "GET" == e.method ? e.url = d(e.url, e.data) : e.url = d(e.url), e.header || (e.header = {}), e.header.Authorization = o.default.isLogined() ? o.default.user.token : "", e.success = function (a) {
            "LOGIN_REQUIRED" === a.data.key ? (o.default.log("login required:", e.url, e, a), o.default.doLogin()) : 0 === a.data.code ? (o.default.log("success:", e.url, e, a), t && t(a.data)) : n ? (o.default.log("fail:", e.url, e, a), n(a.data)) : o.default.log("unknown:", e.url, e, a)
        }, e.fail = function (t) {
            o.default.log("error:", e.url, e, t), n && n(t)
        }, wx.request(e)
    }

    function r(e) {
        return e.method = "GET", s(e)
    }

    function u(e) {
        return e.method = "POST", s(e)
    }

    function l(e) {
        return e.method = "PUT", s(e)
    }

    function c(e) {
        return e.method = "DELETE", s(e)
    }

    function d(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
        if (e) {
            -1 == e.indexOf("?") && (e += "?");
            var n = [];
            if (o.default.isLogined() && n.push("user=" + o.default.user.id), o.default.launchOptions) {
                var i = o.default.launchOptions.query;
                i && (i.uid && n.push("uid=" + i.uid), i.channel && n.push("channel=" + i.channel), i.share_id && n.push("share_id=" + i.share_id), i.share_tid && n.push("share_tid=" + i.share_tid), i.pos && n.push("share_pos=" + i.pos), i.scene && n.push("scene=" + decodeURIComponent(i.scene)))
            }
            n.push("v=" + o.default.version), n.push("version=" + o.default.options.version), n.push("appid=" + o.default.options.appid), n.push("t=" + Date.now()), "?" !== e.charAt(e.length - 1) && "&" !== e.charAt(e.length - 1) && (e += "&");
            var s = (e += n.join("&")).split("?")[1];
            if (t) {
                var r = [];
                for (var u in t) r.push(u + "=" + t[u]);
                s += "&" + r.join("&")
            }
            if ((e += "&sign=" + a.default.sign(s, o.default.options.secret)).startsWith("/")) return o.default.options.scheme + o.default.options.host + "/" + o.default.options.apiVersion + e
        }
        return e
    }
}, function (e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.initUser = function (e) {
        e.isLogined = function () {
            return e.user && e.user.token
        }, e.getLoginStatus = function () {
            return e.isLogined() ? "success" : e.isCheckSession || e.isLogining ? "logining" : "fail"
        }, e.login = function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
            t ? e.doLogin(t) : (e.isCheckSession = !0, wx.checkSession({
                success: function () {
                    e.checkLogin(t), e.isCheckSession = !1
                }.bind(e), fail: function () {
                    e.doLogin(t), e.isCheckSession = !1
                }.bind(e)
            }))
        }, e.checkLogin = function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
            e.isLogined() ? (e.loginSuccess(), !e.requireSDK("2.0.3") && e.needUserInfo() && e.getUserInfo()) : e.doLogin(t)
        }, e.checkCode2access = function (t) {
            var n = t.session_key ? t : null;
            e.post({
                url: "/oauth/code2access_token", data: t, success: function (t) {
                    e.isLogining = !1, e.saveUser(t.data), e.checkLogin(n)
                }.bind(e), fail: e.loginFail.bind(e)
            })
        }, e.doLogin = function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
            e.isLogining || (e.isLogining = !0, e.user = null, t ? e.checkCode2access(t) : wx.login({
                success: function (t) {
                    t.code ? e.checkCode2access({code: t.code}) : e.loginFail(t)
                }.bind(e), fail: e.loginFail.bind(e)
            }))
        }, e.loginSuccess = function (t) {
            var n = e.conf && e.conf.last ? e.conf.last : 0;
            !n || Date.now() - n > 1e3 * e.options.commonDuration ? e.getCommon(t) : (e.doLoginSuccess(t,e.data), e.onLogined())
        }, e.getCommon = function (t) {
            e.get({
                url: "/common", success: function (n) {
                    console.log("getCommonSuccess")
                    e.conf = n.data.conf, e.conf.last = Date.now(), wx.setStorage({
                        key: e.options.CONF_KEY,
                        data: e.conf
                    }), e.data || (e.data = n.data.data, wx.setStorage({key: e.options.DATA_KEY, data: e.data})), e.doLoginSuccess(t,n.data.data), e.onLogined()
                }.bind(e), fail: function (t) {
                    e.loginFail(t)
                }.bind(e)
            })
        }, e.doLoginSuccess = function (t,n) {
            e.isLogining = !1, e.loginCompleteCallback && e.loginCompleteCallback(t,n), e.loginSuccessCallback && e.loginSuccessCallback(t,n)
        }, e.loginFail = function (t) {
            e.isLogining = !1, e.loginCompleteCallback && e.loginCompleteCallback(t), e.loginFailCallback && e.loginFailCallback(t)
        }, e.onLoginSuccess = function (t) {
            e.loginSuccessCallback = t
        }, e.onLoginFail = function (t) {
            e.loginFailCallback = t
        }, e.onLoginComplete = function (t) {
            e.loginCompleteCallback = t
        }, e.checkUserInfo = function () {
            e.needUserInfo() && e.getUserInfo()
        }, e.needUserInfo = function () {
            return !e.user || !e.user.nickname || !e.user.avatar
        }, e.getUserInfo = function () {
            wx.getUserInfo({
                withCredentials: !0, success: function (t) {
                    return e.post({
                        url: "/oauth/update_userinfo", data: t, success: function (t) {
                            e.saveUser(t.data), e.needUserInfo() ? e.getUserInfoFail(t) : e.getUserInfoSuccess()
                        }.bind(e), fail: e.getUserInfoFail.bind(e)
                    }), t
                }.bind(e), fail: e.getUserInfoFail.bind(e)
            })
        }, e.getUserInfoSuccess = function (e) {
        }, e.getUserInfoFail = function (e) {
        }, e.saveUser = function (t) {
            e.user = t, e.user.last = Date.parse(new Date), wx.setStorage({key: e.options.USER_KEY, data: e.user})
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.initConfig = function (e) {
        e.getConfig = s
    };
    var o, a = n(1), i = (o = a) && o.__esModule ? o : {default: o};

    function s(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
        return i.default.conf && void 0 !== i.default.conf[e] ? i.default.conf[e] : t
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.initData = function (e) {
        e.getData = s, e.setData = r, e.setAllData = u, e.incData = l, e.postData = c, e.postGameScore = d
    };
    var o, a = n(1), i = (o = a) && o.__esModule ? o : {default: o};

    function s(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        return i.default.data && void 0 !== i.default.data[e] ? i.default.data[e] : t
    }

    function r(e, t) {
        var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        i.default.data || (i.default.data = {}), i.default.data[e] = t, n && i.default.postData(e)
    }

    function u(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        i.default.data = e, t && i.default.postData()
    }

    function l(e, t) {
        var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0,
            a = i.default.getData(e, o) + t;
        return i.default.setData(e, a, n), a
    }

    function c() {
        arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        wx.setStorage({key: i.default.options.DATA_KEY, data: i.default.data}), i.default.post({url: "/data", data: i.default.data})
    }

    function d(e, t, n) {
        var o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
        i.default.post({
            url: "/score", data: {id: e, score: t, time: n, version: i.default.options.version, data: o}, success: function (e) {
                i.default.log("提交分数成功：", t, e)
            }, fail: function (e) {
                i.default.log("提交分数失败：", t, e)
            }
        })
    }
}, function (e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.initShare = function (e) {
        e.share = function (t) {
            e.shareAppMessage(this.createShareOptions(t)), this.options.share10 && (this.log("share10"), this.shareLog(t, "share10", "", {}, {}))
        }, e.createShareOptions = function (t) {
            t.pos || (t.pos = "default");
            var n = this.getShareInfo(t);
            t.shareId = n.shareId, t.title || (t.title = n.title), t.imageUrl || (t.imageUrl = n.imageUrl), t.success || (t.success = n.success), t.fail || (t.fail = n.fail), t.onHttpError || (t.onHttpError = n.onHttpError), t.tid || (t.tid = "" + Date.now());
            var o = "type=share&pos=" + t.pos + "&share_id=" + n.shareId + "&share_tid=" + t.tid;
            return this.isLogined() && (o += "&uid=" + this.user.id), t.gift && (o += "&gift=" + t.gift), t.query ? "&" == t.query.indexOf(0) ? (t.query = o + t.query, e.log("new share query: " + t.query)) : (t.query = o + "&" + t.query, e.log("new share query: " + t.query)) : t.query = o, {
                title: t.title,
                imageUrl: t.imageUrl,
                query: t.query,
                success: this.shareSuccess(t),
                fail: this.shareFail(t),
                complete: t.complete
            }
        }, e.getShareInfo = function (e) {
            var t, n = this.options.share.title, o = this.options.share.imageUrl, a = 0;
            (e.defaultTitle && (n = e.defaultTitle), this.conf && this.conf.shares) && (this.conf.shares[e.pos] ? t = this.conf.shares[e.pos] : this.conf.shares.default && (t = this.conf.shares.default), t && (t.title && (n = t.title), t.image && (o = t.image), t.id && (a = t.id)));
            return {
                title: n, imageUrl: o, shareId: a, success: function () {
                    wx.showToast({title: "分享成功！", icon: "success"})
                }, fail: function () {
                    wx.showToast({title: "分享失败！", icon: "fail"})
                }, onHttpError: function () {
                    wx.showToast({title: "网络出错！", icon: "fail"})
                }
            }
        }, e.shareSuccess = function (e) {
            return function (t) {
                console.log("shareSuccess");
                var n = !0;
                e.onShareSuccess && (n = e.onShareSuccess(t)), n && (t.shareTickets && t.shareTickets.length > 0 ? wx.getShareInfo({
                    shareTicket: t.shareTickets[0],
                    success: function (n) {
                        e.onShareTicketSuccess && e.onShareTicketSuccess(n), this.shareLog(e, "success", t.shareTickets[0], n, t)
                    }.bind(this),
                    fail: function (n) {
                        e.onShareTicketFail && e.onShareTicketFail(n), this.shareLog(e, "success", t.shareTickets[0], {}, t)
                    }.bind(this)
                }) : (e.onShareTicketFail && e.onShareTicketFail(), this.shareLog(e, "success", "", {}, t)))
            }.bind(this)
        }, e.shareFail = function (e) {
            return function (t) {
                console.log("shareFail");
                var n = !0;
                e.onShareFail && (n = e.onShareFail(t)), n && this.shareLog(e, "fail", "", {}, t)
            }.bind(this)
        }, e.shareLog = function (e, t, n, o, a) {
            this.post({
                url: "/log/share",
                data: {share_id: e.shareId, title: e.title, query: e.query, image: e.imageUrl, pos: e.pos, tid: e.tid, status: t, shareTicket: n, info: o, error: a.errMsg},
                success: function (n) {
                    "success" === t && e.success ? e.success(n, a) : "fail" === t && e.fail && e.fail(n, a)
                },
                fail: function (n) {
                    "success" === t && e.onHttpError ? e.onHttpError(n, a) : "fail" === t && e.fail && e.fail(n, a)
                }
            })
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    var o = Object.assign || function (e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
    };
    t.initProcess = function (e) {
        e.onShow(function (e) {
            u = Date.now(), r.showOptions = JSON.stringify(e)
        }), e.onHide(function (t) {
            var n = Date.now(), a = r = o({}, r, {times: r.times + 1, showDuration: u ? n - u : n - r.initStartAt, duration: n - r.initStartAt}),
                i = (a.hasInited, a.initStartAt, function (e, t) {
                    var n = {};
                    for (var o in e) t.indexOf(o) >= 0 || Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
                    return n
                }(a, ["hasInited", "initStartAt"]));
            r.hasInited ? c(i) : (r.hasInited = !0, c(o({systemInfo: JSON.stringify(e.systemInfo), launchOptions: JSON.stringify(e.launchOptions)}, i)))
        }), e.setProcess = l
    };
    var a = s(n(1)), i = s(n(2));

    function s(e) {
        return e && e.__esModule ? e : {default: e}
    }

    var r = {hasInited: !1, initStartAt: Date.now(), showOptions: "", times: 0, uuid: i.default.guid(), duration: 0, showDuration: 0, process: "init", processDuration: 0}, u = 0;

    function l(e) {
        "string" == typeof key ? (r.process = e, r.processDuration = Date.now() - r.initStartAt) : a.default.log("setProcess():  参数类型错误")
    }

    function c(e) {
        a.default.post({
            url: "/log/process", data: e, success: function (e) {
                a.default.log("提交游戏进度数据成功：", e)
            }, fail: function (e) {
                a.default.log("提交游戏进度数据失败：", e)
            }
        })
    }
}, function (e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.initPayment = function (e) {
        e.getPaymentResult = function () {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
            this.get({
                url: "/payment/result", success: function (t) {
                    this.log("获取充值数据成功", t), e && e(t.data)
                }.bind(this), fail: function (e) {
                    this.log("获取充值数据失败", e), t && t(e)
                }.bind(this)
            })
        }, e.requestMPPayment = function (t) {
            var n = this, o = t.title, a = void 0 === o ? "点击充值链接进入充值" : o, i = t.success, s = void 0 === i ? null : i, r = t.fail, u = void 0 === r ? null : r, l = t.complete,
                c = void 0 === l ? null : l;
            this.log("打开客服对话"), e.openCustomerServiceConversation({
                sessionFrom: "upgrade_panel",
                showMessageCard: !0,
                sendMessageTitle: a,
                sendMessagePath: "?type=custom_message_card&type=upgrade_panel",
                sendMessageImg: e.conf.shares.mp_payment || e.conf.shares.default.image,
                success: function (e) {
                    n.log("打开充值会话成功", e), c && c(), s && s()
                },
                fail: function (e) {
                    n.log("打开充值会话fail", e), c && c(), u && u()
                }
            })
        }, e.requestMPPayment = e.checkSDK("2.0.3", e.requestMPPayment)
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    var o = Object.assign || function (e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
    };
    t.initAD = function (e) {
        e.onShow(function () {
            for (var t in r) {
                var n = r[t];
                n.showed && e.createBanner({pos: n.pos, style: n.style, ms: n.ms})
            }
            for (var o = 0; o < l.length; o++) {
                var a = l[o];
                u[a].showed = !0, u[a].last = Date.now()
            }
            l = []
        }), e.onHide(function () {
            for (var e in r) {
                var t = r[e];
                t.showed = t.ad && t.ad.showed, t.showed && f(t.pos), t.duration > 0 && h(t)
            }
            for (var n in u) u[n].showed && (w(n), l.push(n));
            k({ads: u})
        }), e.createBanner = e.checkSDK("2.0.4", d), e.closeBanner = e.checkSDK("2.0.4", f), e.createVideo = e.checkSDK("2.0.4", p), e.isEnableVideo = g, e.getMoreGame = m, e.showMoreGame = y, e.getGameAd = _, e.hideGameAd = w, e.tapGameAd = S, e.test = function () {
            console.log(e.getMoreGame("default"))
        }
    };
    var a = s(n(1)), i = s(n(2));

    function s(e) {
        return e && e.__esModule ? e : {default: e}
    }

    var r = {}, u = {}, l = [], c = 12e4;

    function d(e) {
        var t = e.pos, n = e.style, i = void 0 === n ? null : n, s = e.ms, u = void 0 === s ? 0 : s, l = e.force, c = void 0 !== l && l, g = e.forceTimeout,
            p = void 0 === g ? 600 : g;
        if (a.default.conf && a.default.conf.banners && a.default.conf.banners[t]) {
            var v = a.default.conf.banners[t];
            if (v.enable) {
                var m = r[t];
                m && m.ad && (m.ad.showed && f(m), (c || Date.now() - m.ad.created > 1e3 * p) && function (e) {
                    if (e.ad) return e.ad.hide(), e.ad.destroy(), e.ad = null, !0
                }(m)), u || (u = a.default.getConfig("banner_ms", 120)), m || (m = {
                    adUnitId: v.adUnitId,
                    pos: t,
                    count: 0,
                    ms: u,
                    duration: 0,
                    style: i,
                    window: "*",
                    data: [],
                    created: Date.now()
                }, r[t] = m), m.count += 1, m.status = "success", m.ad || (m.ad = function (e) {
                    var t = e.banner, n = e.style, i = void 0 === n ? null : n, s = a.default.systemInfo.screenWidth,
                        u = (a.default.systemInfo.screenHeight, wx.createBannerAd({adUnitId: t.adUnitId, style: o({left: 0, top: 0, width: s, height: 180 * s / 750}, i)}));
                    return u.created = Date.now(), u.onError(function (e) {
                        t.status = "error", t.error = e, t.timeout && clearTimeout(t.timeout), t.timeout = null, t.ad.showed = null, h(t, "error"), a.default.log("banner 创建失败", t), r[t.pos] && delete r[t.pos]
                    }), u.onLoad(function (e) {
                        a.default.log("banner 加载完成", t), u.created = Date.now()
                    }), u
                }({banner: m, style: i})), m.ad.showed = Date.now(), m.ad.show(), m.ms && m.ad && (m.timeout && clearTimeout(m.timeout), m.timeout = setTimeout(function () {
                    d({pos: t, style: i, ms: u, force: !0})
                }, 1e3 * u))
            }
        } else a.default.log("createBanner 没有配置: " + t)
    }

    function f(e) {
        var t = r[e];
        if (t && t.ad && t.ad.showed) {
            var n = t.ad.style, o = n.realWidth, a = n.realHeight, i = Date.now() - t.ad.showed;
            return t.ad.hide(), t.duration += i, t.data.push({
                created: t.ad.created,
                showed: t.ad.showed,
                duration: i
            }), t.timeout && clearTimeout(t.timeout), t.timeout = null, t.ad.showed = null, t.window = o + "*" + Math.round(a), !0
        }
        return !1
    }

    function h(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "onHide", n = {
            adUnitId: e.adUnitId,
            pos: e.pos,
            ms: e.ms,
            count: e.count,
            duration: e.duration,
            data: JSON.stringify(e.data),
            window: e.window,
            status: e.status,
            error: e.error,
            commit: t
        };
        e.count = 0, e.duration = 0, e.status = "success", e.error = "", e.data = [], a.default.log("postBannerData", n), a.default.post({
            url: "/log/ad/banner",
            data: n,
            success: function (e) {
                a.default.log("提交banner数据成功：", e)
            },
            fail: function (e) {
                a.default.log("提交banner数据失败：", e)
            }
        })
    }

    function g(e) {
        return a.default.conf && a.default.conf.videos && a.default.conf.videos[e] ? !!a.default.conf.videos[e].enable : (a.default.log("createVideo 没有配置: " + e), !1)
    }

    function p(e) {
        var t = e.pos, n = e.success, o = void 0 === n ? null : n, i = e.fail, s = void 0 === i ? null : i, r = e.complete, u = void 0 === r ? null : r;
        if (!g(t)) return !1;
        var l = {adUnitId: a.default.conf.videos[t].adUnitId, pos: t, status: "success", created: Date.now(), duration: 0}, c = wx.createRewardedVideoAd({adUnitId: l.adUnitId});

        function d(e) {
            l.status = "error", l.error = e, v(l), u && u(e), s && s(e), p()
        }

        function f(e) {
            l.created = Date.now()
        }

        function h(e) {
            u && u(e), l.duration = Date.now() - l.created, e && e.isEnded || void 0 === e ? o && o({
                isEnded: !0,
                duration: l.duration
            }) : (l.status = "cancel", o && o({isEnded: !1, duration: l.duration})), v(l), p()
        }

        function p() {
            c.offError(d), c.offLoad(f), c.offClose(h)
        }

        return c.onError(d), c.onLoad(f), c.onClose(h), c.load().then(function () {
            c.show()
        }), !0
    }

    function v(e) {
        a.default.post({
            url: "/log/ad/rewardedvideo", data: e, success: function (e) {
                a.default.log("提交激励视频数据成功：", e)
            }, fail: function (e) {
                a.default.log("提交激励视频数据失败：", e)
            }
        })
    }

    function m(e) {
        var t;
        if (a.default.conf && a.default.conf.games && (a.default.conf.games[e] ? t = a.default.conf.games[e] : a.default.conf.games.default && (t = a.default.conf.games.default), t && t.length > 0)) {
            a.default.tmp.getMoreGame || (a.default.tmp.getMoreGame = {});
            var n = a.default.tmp.getMoreGame[e];
            return (!n || n >= t.length) && (n = 0), a.default.tmp.getMoreGame[e] = n + 1, t[n]
        }
    }

    function y(e) {
        var t;
        if (a.default.conf && a.default.conf.games) if (a.default.conf.games[e] ? t = a.default.conf.games[e] : a.default.conf.games.default && (t = a.default.conf.games.default), t && t.length > 0) {
            for (var n = [], o = 0; o < t.length; o++) n.push(t[o].image);
            a.default.previewImage({urls: i.default.randomSort(n)})
        } else wx.showToast({title: "没有更多游戏！", icon: "info"}); else wx.showToast({title: "没有更多游戏！", icon: "info"})
    }

    function _(e) {
        var t = e.pos, n = void 0 === t ? "default" : t, o = e.count, i = void 0 === o ? 1 : o, s = e.success, r = void 0 === s ? null : s, l = e.fail, d = void 0 === l ? null : l,
            f = !1;
        if (u && u[n]) {
            u[n].showed && w(n);
            var h = u[n];
            h.total_ms >= c && (k({ad: h}), f = !0)
        } else f = !0;
        f ? a.default.get({
            url: "/game/ad", data: {pos: n, count: i}, success: function (e) {
                0 == e.code ? ((!Array.isArray(e.data) || Array.isArray(e.data) && 0 != e.data.length) && (u[n] = {
                    pos: n,
                    data: e.data,
                    last: Date.now(),
                    duration: c,
                    total_ms: 0,
                    logs: [],
                    showed: !0
                }), r && r(e)) : d && d(e)
            }, fail: function (e) {
                d && d(e)
            }
        }) : (u[n].showed = !0, u[n].last = Date.now(), r && r({code: 0, data: u[n].data, key: "SUCCESS"}))
    }

    function w() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "default";
        !function () {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;

            function t(e) {
                var t = Date.now(), n = t - e.last;
                e.logs.push({ms: n, last: e.last, posted: !1}), e.total_ms += n, e.last = t
            }

            if (!e || u[e]) if (e) t(u[e]); else for (var n in u) t(u[n])
        }(e), u[e].showed = !1
    }

    function S(e) {
        var t = e.pos, n = e.ad, o = e.redirect, i = void 0 !== o && o, s = e.success, r = void 0 === s ? null : s, l = e.fail, c = void 0 === l ? null : l, d = e.complete,
            f = void 0 === d ? null : d, h = n;

        function g(e) {
            e.image ? a.default.previewImage({
                urls: [e.image], success: function (e) {
                    a.default.log("tapGameAD, success"), r && r(e)
                }, fail: function (e) {
                    a.default.log("tapGameAD, fail"), c && c(e)
                }, complete: function (e) {
                    a.default.log("tapGameAD, complete"), f && f(e)
                }
            }) : a.default.log("tapGameAD，ad参数内image属性缺失")
        }

        function p(e) {
            e.appid && e.path ? wx.navigateToMiniProgram({
                appId: e.appid, path: e.path, success: function (e) {
                    a.default.log("tapGameAD, success"), r && r(e)
                }, fail: function (e) {
                    a.default.log("tapGameAD, fail"), c && c(e)
                }, complete: function (e) {
                    a.default.log("tapGameAD, complete"), f && f(e)
                }
            }) : a.default.log("tapGameAD, ad参数内appid或path属性缺失")
        }

        u && u[t] && h ? (!function (e, t) {
            if (!t || !t.cid || !t.id) return !1;
            b([{pos: e, tid: t.tid, commit: "click", data: [{cid: t.cid, id: t.id, action: t.action}]}])
        }(t, h), "code" == h.action ? g(h) : "navigate" == h.action ? p(h) : i ? p(h) : g(h)) : a.default.log("tapGameAD pos无效，没有对应数据，或未传ad参数")
    }

    function b(e) {
        a.default.post({
            url: "/game/ad/log", data: e, success: function (t) {
                for (var n = 0; n < e.length; n++) {
                    var o = e[n];
                    if ("show" == o.commit && o.pos in u) for (var i = 0; i < u[o.pos].logs.length; i++) u[o.pos].logs[i].posted = !0
                }
                a.default.log("广告数据提交成功！")
            }, fail: function (e) {
                a.default.log("广告数据提交失败！")
            }
        })
    }

    function k(e) {
        var t = e.ads, n = void 0 === t ? null : t, o = e.ad, a = void 0 === o ? null : o;
        if (!n && !a) return !1;

        function i(e) {
            for (var t = [], n = 0; n < e.logs.length; n++) if (!e.logs[n].posted) {
                for (var o = {
                    pos: e.pos,
                    tid: e.data[0].tid,
                    commit: "show",
                    last: e.logs[n].last,
                    ms: e.logs[n].ms,
                    data: []
                }, a = 0; a < e.data.length; a++) o.data.push({id: e.data[a].id, cid: e.data[a].cid, action: e.data[a].action});
                t.push(o)
            }
            return t
        }

        var s = [];
        if (n) for (var r in n) s = s.concat(i(n[r])); else a && (s = i(a));
        s.length > 0 && b(s)
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0}), t.initHook = function (e) {
        e.setMode = function (t) {
            e.mode = t
        }, i(e, "previewImage"), i(e, "openCustomerServiceConversation"), i(e, "shareAppMessage")
    };
    var o, a = n(1);
    (o = a) && o.__esModule;

    function i(e, t) {
        e[t] = function () {
            var n;
            return e.mode = t, (n = wx)[t].apply(n, arguments)
        }
    }
}, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {value: !0});
    var o = Object.assign || function (e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o])
        }
        return e
    };
    t.initInvite = function (e) {
        e.getInviteCount = r, e.getInviteUsers = u, e.receiveInviteGift = l, e.receiveInviteGifts = c, e.openFromShare(f), e.openFromCode(h), e.onShareGift = g, e.requestShareGift = p, e.getWXACode = v
    };
    var a, i = n(1), s = (a = i) && a.__esModule ? a : {default: a};

    function r(e) {
        var t = e.pos, n = void 0 === t ? null : t, o = e.success, a = void 0 === o ? null : o, i = e.fail, r = void 0 === i ? null : i, u = {};
        n && (u.pos = n), s.default.get({
            url: "/invited/users/count", data: u, success: function (e) {
                a && a(e.data.count)
            }, fail: function (e) {
                r && r(e)
            }
        })
    }

    function u(e) {
        var t = e.pos, n = void 0 === t ? null : t, o = e.receive, a = void 0 === o || o, i = e.skip, r = void 0 === i ? 0 : i, u = e.limit, l = void 0 === u ? -1 : u,
            c = e.success, d = void 0 === c ? null : c, f = e.fail, h = void 0 === f ? null : f, g = {skip: r, limit: l, receive: a};
        n && (g.pos = n), s.default.get({
            url: "/invited/users", data: g, success: function (e) {
                d && d(e.data)
            }, fail: function (e) {
                h && h(e)
            }
        })
    }

    function l(e) {
        var t = e.user, n = e.pos, o = void 0 === n ? null : n, a = e.success, i = void 0 === a ? null : a, r = e.fail, u = void 0 === r ? null : r,
            l = {users: [{id: t.id, gift: t.gift}]};
        o && (l.pos = o), s.default.post({
            url: "/invited/gift/receive", data: l, success: function (e) {
                i && i(e.data.receive[0])
            }, fail: function (e) {
                u && u(e)
            }
        })
    }

    function c(e) {
        var t = e.users, n = e.pos, o = void 0 === n ? null : n, a = e.success, i = void 0 === a ? null : a, r = e.fail, u = void 0 === r ? null : r, l = {users: []}, c = !0,
            d = !1, f = void 0;
        try {
            for (var h, g = t[Symbol.iterator](); !(c = (h = g.next()).done); c = !0) {
                var p = h.value;
                l.users.push({id: p.id, gift: p.gift})
            }
        } catch (e) {
            d = !0, f = e
        } finally {
            try {
                !c && g.return && g.return()
            } finally {
                if (d) throw f
            }
        }
        o && (l.pos = o), s.default.post({
            url: "/invited/gift/receive", data: l, success: function (e) {
                i && i(e.data.receive)
            }, fail: function (e) {
                u && u(e)
            }
        })
    }

    function d(e, t) {
        if (t && t.gift) {
            var n = {type: e, gift: t.gift, uid: t.uid, share_tid: t.share_tid}, o = s.default.conf[t.gift];
            o && (n.receive = !0), s.default.post({
                url: "/share/gift/log", data: n, success: function (e) {
                    if (o) {
                        var a = e.data;
                        a.is_self && o.not_allow_self ? s.default.alert(o.not_allow_self_tip || "不能领取自己送出的礼物～") : a.user_count >= (o.date_limit || 2) ? s.default.alert(o.date_limit_tip || "今天已经领取太多次了～") : a.user_share_count >= (o.share_date_limit || 1) ? s.default.alert(o.share_date_limit_tip || "已经领取过该礼物了～") : a.count >= (o.limit || 10) ? s.default.alert(o.limit_tip || "该礼物被领光了～") : (e = {
                            gift: t.gift,
                            query: t,
                            conf: o,
                            options: n,
                            data: a
                        }, s.default._onGiftCallback && s.default._onGiftCallback(e))
                    }
                }
            })
        }
    }

    function f(e) {
        e.from;
        var t = e.query;
        e.options;
        d("share", t)
    }

    function h(e) {
        e.from, e.scene, e.options;
        d("code", e.query)
    }

    function g(e) {
        s.default._onGiftCallback = e
    }

    function p(e) {
        var t = e.gifts, n = e.success, o = void 0 === n ? null : n, a = e.fail, i = void 0 === a ? null : a;
        s.default.post({
            url: "/share/gift/receive", data: {gifts: t}, success: function (e) {
                o && o(e.data)
            }, fail: i
        })
    }

    function v(e) {
        var t = e.pos, n = e.success, a = void 0 === n ? null : n, i = e.fail, r = void 0 === i ? null : i, u = function (e, t) {
            var n = {};
            for (var o in e) t.indexOf(o) >= 0 || Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
            return n
        }(e, ["pos", "success", "fail"]);
        s.default.post({
            url: "/share/qrcode", data: o({pos: t, uid: s.default.user.id, share_tid: Date.now() + ""}, u), success: function (e) {
                a && a(e.data)
            }, fail: r
        })
    }
}]));

export default sdk;