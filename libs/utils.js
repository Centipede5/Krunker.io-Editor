module.exports.keyboardMap = "   CANCEL   HELP  BACK_SPACE TAB   CLEAR ENTER ENTER_SPECIAL  SHIFT CONTROL ALT PAUSE CAPS_LOCK KANA EISU JUNJA FINAL HANJA  ESCAPE CONVERT NONCONVERT ACCEPT MODECHANGE SPACE PAGE_UP PAGE_DOWN END HOME LEFT UP RIGHT DOWN SELECT PRINT EXECUTE PRINTSCREEN INSERT DELETE  0 1 2 3 4 5 6 7 8 9 COLON SEMICOLON LESS_THAN EQUALS GREATER_THAN QUESTION_MARK AT A B C D E F G H I J K L M N O P Q R S T U V W X Y Z OS_KEY  CONTEXT_MENU  SLEEP NUMPAD0 NUMPAD1 NUMPAD2 NUMPAD3 NUMPAD4 NUMPAD5 NUMPAD6 NUMPAD7 NUMPAD8 NUMPAD9 MULTIPLY ADD SEPARATOR SUBTRACT DECIMAL DIVIDE F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12 F13 F14 F15 F16 F17 F18 F19 F20 F21 F22 F23 F24         NUM_LOCK SCROLL_LOCK WIN_OEM_FJ_JISHO WIN_OEM_FJ_MASSHOU WIN_OEM_FJ_TOUROKU WIN_OEM_FJ_LOYA WIN_OEM_FJ_ROYA          CIRCUMFLEX EXCLAMATION DOUBLE_QUOTE HASH DOLLAR PERCENT AMPERSAND UNDERSCORE OPEN_PAREN CLOSE_PAREN ASTERISK PLUS PIPE HYPHEN_MINUS OPEN_CURLY_BRACKET CLOSE_CURLY_BRACKET TILDE     VOLUME_MUTE VOLUME_DOWN VOLUME_UP   SEMICOLON EQUALS COMMA MINUS PERIOD SLASH BACK_QUOTE                           OPEN_BRACKET BACK_SLASH CLOSE_BRACKET QUOTE  META ALTGR  WIN_ICO_HELP WIN_ICO_00  WIN_ICO_CLEAR   WIN_OEM_RESET WIN_OEM_JUMP WIN_OEM_PA1 WIN_OEM_PA2 WIN_OEM_PA3 WIN_OEM_WSCTRL WIN_OEM_CUSEL WIN_OEM_ATTN WIN_OEM_FINISH WIN_OEM_COPY WIN_OEM_AUTO WIN_OEM_ENLW WIN_OEM_BACKTAB ATTN CRSEL EXSEL EREOF PLAY ZOOM  PA1 WIN_OEM_CLEAR ".split(" "),
Number.prototype.round = function (t) {
    return +this.toFixed(t)
},
String.prototype.escape = function () {
    return (this + "").replace(/[\\"']/g, "\\$&").replace(/\u0000/g, "\\0")
},
Number.prototype.roundToNearest = function (t) {
    return this > 0 ? Math.ceil(this / t) * t : this < 0 ? Math.floor(this / t) * t : this
},
module.exports.isURL = function (t) {
    try {
        return new RegExp("^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%@_.~+&:]*)*(\\?[;&a-z\\d%@_.,~+&:=-]*)?(\\#[-a-z\\d_]*)?$", "i").test(t)
    } catch (t) {}
    return !1
},
module.exports.countInArray = function (t, e) {
    for (var n = 0, r = 0; r < t.length; r++)
        t[r] === e && n++;
    return n
},
module.exports.formatNum = function (t) {
    var e = Math.floor(Math.log(Math.abs(t)) / Math.log(1e3)),
    n = "kmb"[e - 1];
    return n ? (t / Math.pow(1e3, e)).toFixed(1) + n : "" + t
},
module.exports.randInt = function (t, e) {
    return Math.floor(Math.random() * (e - t + 1)) + t
},
module.exports.randFloat = function (t, e) {
    return Math.random() * (e - t) + t
},
module.exports.getRandom = function (e) {
    return e[module.exports.randInt(0, e.length - 1)]
},
module.exports.getDistance = function (t, e, n, r) {
    return Math.sqrt((n -= t) * n + (r -= e) * r)
},
module.exports.getDistance3D = function (t, e, n, r, i, o) {
    var s = t - r,
    a = e - i,
    c = n - o;
    return Math.sqrt(s * s + a * a + c * c)
},
module.exports.getAnglesSSS = function (t, e, n) {
    var r = Math.acos((e * e + n * n - t * t) / (2 * e * n)),
    i = Math.acos((n * n + t * t - e * e) / (2 * n * t)),
    o = Math.PI - r - i;
    return [-r - Math.PI / 2, i, o]
},
module.exports.getXDir = function (e, n, r, i, o, s) {
    var a = Math.abs(n - o),
    c = module.exports.getDistance3D(e, n, r, i, o, s);
    return Math.asin(a / c) * (n > o ? -1 : 1)
},
module.exports.getAngleDist = function (t, e) {
    return Math.atan2(Math.sin(e - t), Math.cos(t - e))
},
module.exports.toRad = function (t) {
    return t * (Math.PI / 180)
},
module.exports.getDirection = function (t, e, n, r) {
    return Math.atan2(e - r, t - n)
},
module.exports.lerp = function (t, e, n) {
    return t + (e - t) * n
},
module.exports.orderByScore = function (t, e) {
    return e.score - t.score
},
module.exports.orderByKills = function (t, e) {
    return e.kills - t.kills
},
module.exports.orderByDst = function (t, e) {
    return t.dst - e.dst
},
module.exports.orderByNum = function (t, e) {
    return t - e
},
module.exports.capFirst = function (t) {
    return t.charAt(0).toUpperCase() + t.slice(1)
},
module.exports.truncateText = function (t, e) {
    return t.length > e ? t.substring(0, e) + "..." : t
},
module.exports.randomString = function (t) {
    for (var e = "", n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", r = 0; r < t; r++)
        e += n.charAt(Math.floor(Math.random() * n.length));
    return e
},
module.exports.formatNumCash = function (t) {
    return parseFloat(Math.round(100 * t) / 100).toFixed(2)
},
module.exports.getKeyName = function (e) {
    return module.exports.keyboardMap[e]
},
module.exports.getTime = function (t) {
    var e = Math.floor(t / 6e4),
    n = (t % 6e4 / 1e3).toFixed(0);
    return e + ":" + (n < 10 ? "0" : "") + n
},
module.exports.getReadableTime = function (t) {
    var e = t / 1e3 / 60,
    n = parseInt(e % 60);
    e /= 60;
    var r = parseInt(e % 24);
    e /= 24;
    var i = parseInt(e);
    return (i ? i + "d " : "") + (r ? r + "h " : "") + (n || 0) + "m "
},
module.exports.fixTo = function (t, e) {
    return parseFloat(t.toFixed(e))
},
module.exports.limit = function (t, e) {
    return t < -e ? -e : t > e ? e : t
},
module.exports.limitMM = function (t, e, n) {
    return t < e ? e : t > n ? n : t
},
module.exports.cropVal = function (t, e) {
    return t <= e && t >= -e ? 0 : t
},
module.exports.isNumber = function (t) {
    return null !== t && void 0 !== t && "number" == typeof t && !isNaN(t) && isFinite(t)
},
module.exports.arrayInts = function (e) {
    for (var n = 0; n < e.length; ++n)
        if (!module.exports.isNumber(e[n]))
            return !1;
    return !0
},
module.exports.isArray = function (t) {
    return !!t && t.constructor === Array
},
module.exports.isString = function (t) {
    return t && "string" == typeof t
},
module.exports.lineInRect = function (t, e, n, r, i, o, s, a, c, l, h, p) {
    var u = (s - t) * r,
    d = (l - t) * r,
    f = (c - n) * o,
    m = (p - n) * o,
    g = (a - e) * i,
    v = (h - e) * i,
    y = Math.max(Math.max(Math.min(u, d), Math.min(f, m)), Math.min(g, v)),
    x = Math.min(Math.min(Math.max(u, d), Math.max(f, m)), Math.max(g, v));
    return !(x < 0) && !(y > x) && y
},
module.exports.pointInBox3D = function (t, e, n, r) {
    return t >= r.x - r.width && t <= r.x + r.width && e >= r.y - r.height && e <= r.y + r.height && n >= r.z - r.length && n <= r.z + r.length
},
module.exports.pointInBox = function (t, e, n, r, i, o, s) {
    return s ? t >= n && t <= i && e >= r && e <= o : t > n && t < i && e > r && e < o
},
module.exports.sharePos = function (t, e, n) {
    return n = n || 0,
    Math.abs(t.x - e.x) <= n && Math.abs(t.y - e.y) <= n && Math.abs(t.z - e.z) <= n && Math.abs(t.d - e.d) <= n
},
module.exports.cdv = {
    x: "width",
    y: "height",
    z: "length"
},
module.exports.boxIntersection = function (e, n, r, i, o) {
    var s = module.exports.cdv[r],
    a = module.exports.cdv[i],
    c = e[r] - e[s] - .1,
    l = n[r] - n[s] - .1,
    h = e[r] + e[s] + .1,
    p = n[r] + n[s] + .1,
    u = e[i] - e[a] - .1,
    d = n[i] - n[a] - .1,
    f = e[i] + e[a] + .1,
    m = n[i] + n[a] + .1,
    g = Math.max(c, l),
    v = Math.min(h, p);
    if (v >= g) {
        var y = Math.max(u, d),
        x = Math.min(f, m);
        if (x >= y) {
            for (var b = [{
                        [r]: g,
                        [i]: y,
                        d: o[0]
                    }, {
                        [r]: v,
                        [i]: x,
                        d: o[1]
                    }, {
                        [r]: g,
                        [i]: x,
                        d: o[2]
                    }, {
                        [r]: v,
                        [i]: y,
                        d: o[3]
                    }
                ], w = b.length - 1; w >= 0; --w)
                (b[w][r] == h && b[w][r] == p || b[w][r] == c && b[w][r] == l || b[w][i] == f && b[w][i] == m || b[w][i] == u && b[w][i] == d || module.exports.pointInBox(b[w][r], b[w][i], c, u, h, f) || module.exports.pointInBox(b[w][r], b[w][i], l, d, p, m)) && b.splice(w, 1);
            return b.length ? b : null
        }
    }
    return null
},
module.exports.boxCornerIntersection = function (e, n, r, i) {
    for (var o = module.exports.cdv[r], s = module.exports.cdv[i], a = e[r] - e[o], c = n[r] - n[o], l = e[r] + e[o], h = n[r] + n[o], p = e[i] - e[s], u = n[i] - n[s], d = e[i] + e[s], f = n[i] + n[s], m = [{
                [r]: a,
                [i]: p,
                d: Math.PI / 2
            }, {
                [r]: a,
                [i]: d,
                d: Math.PI
            }, {
                [r]: l,
                [i]: p,
                d: 0
            }, {
                [r]: l,
                [i]: d,
                d: -Math.PI / 2
            }
        ], g = m.length - 1; g >= 0; --g)
        m[g].i = g, module.exports.pointInBox(m[g][r], m[g][i], c, u, h, f, !0) || m.splice(g, 1);
    return m.length ? m : null
},
module.exports.getIntersection = function (e, n, r) {
    var i = module.exports.cdv[r],
    o = e[r] - e[i],
    s = n[r] - n[i],
    a = e[r] + e[i],
    c = n[r] + n[i],
    l = Math.max(o, s),
    h = Math.min(a, c);
    if (h >= l) {
        var p = (h - l) / 2;
        return {
            [r]: l + p,
            [i]: p
        }
    }
    return null
},
module.exports.limitRectVal = function (e, n, r) {
    var i = module.exports.cdv[r];
    if (e[r] - e[i] < n[r] - n[i]) {
        var o = (n[r] - n[i] - (e[r] - e[i])) / 2;
        e[i] -= o,
        e[r] += o
    }
    e[r] + e[i] > n[r] + n[i] && (o = (e[r] + e[i] - (n[r] + n[i])) / 2, e[i] -= o, e[r] -= o)
},
module.exports.limitRect = function (e, n, r, i, o, s, a, c) {
    var l = module.exports.cdv[a],
    h = module.exports.cdv[c],
    p = {};
    if (p[a] = e, p[c] = n, p[l] = r, p[h] = i, module.exports.limitRectVal(p, s, a), module.exports.limitRectVal(p, s, c), 0 == o || o == Math.PI) {
        var u = p[l];
        p[l] = p[h],
        p[h] = u
    }
    return p
},
module.exports.progressOnLine = function (t, e, n, r, i, o) {
    var s = n - t,
    a = r - e,
    c = Math.sqrt(s * s + a * a);
    return ((s /= c) * (i - t) + (a /= c) * (o - e)) / Math.sqrt(Math.pow(n - t, 2) + Math.pow(r - e, 2))
},
module.exports.generateSID = function (t) {
    for (var e = 0, n = !0; n; ) {
        n = !1,
        e++;
        for (var r = 0; r < t.length; ++r)
            if (t[r].sid == e) {
                n = !0;
                break
            }
    }
    return e
};
var n = function (t, e) {
    return t.concat(e)
};
Array.prototype.flatMap = function (t) {
    return function (t, e) {
        return e.map(t).reduce(n, [])
    }
    (t, this)
}