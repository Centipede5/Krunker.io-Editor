var r = require("three");
const i = require("../config.js");
require("./utils.js");
var o,
s = {};
module.exports.getColor = function (t, e) {
    var n = t + "-" + (e || ""),
    i = s[n];
    return i || (i = new r.Color(t), e && i.multiplyScalar(e), s[n] = i),
    i
},
module.exports.colorize = function (e, n, r) {
    n = r || module.exports.getColor(n);
    for (var i = 0; i < e.faces.length; ++i)
        e.faces[i].vertexColors[0] = n, e.faces[i].vertexColors[1] = n, e.faces[i].vertexColors[2] = n
};
var a = function (t, e, n, i) {
    for (var o = new r.Vector2(e, n).multiplyScalar(i || 1), s = 0; s < t.faceVertexUvs.length; s++)
        for (var a = t.faceVertexUvs[s], c = 0; c < a.length; c++)
            for (var l = 0; l < 3; l++) {
                var h = a[c][l].multiply(o);
                h.x = .5 + h.x - o.x / 2
            }
},
c = function (t, e, n, r, i, o) {
    return t >= n - i && t <= n + i && e >= r - o && e <= r + o
},
l = [],
h = ["a", "b", "c", "d"];
module.exports.generatePlane = function (e, n, s) {
    e *= s.ratio || 1;
    var p = (s.scale ? e + "_" + n + "_" : "") + (s.scale || "") + (s.tilesX || "") + (s.tilesZ || "") + (void 0 != s.colr ? s.colr : "");
    if (!(o = l[p])) {
        if (o = new r.PlaneGeometry(1, 1, s.tilesX || 1, s.tilesZ || 1), s.noise) {
            for (var u = {}, d = s.margin || 0, f = 0; f < o.vertices.length; ++f) {
                var m = o.vertices[f].x,
                g = o.vertices[f].y;
                if (!s.pinEdges ||  - .5 != m && .5 != m &&  - .5 != g && .5 != g)
                    if (s.objects) {
                        for (var v = 0; v < s.objects.length; ++v)
                            if (s.objects[v].y - s.objects[v].height <= .1 && 2 * s.objects[v].height > s.noise && c(-g * e * 2, m * n * 2, s.objects[v].z, s.objects[v].x, s.objects[v].length + d, s.objects[v].width + d)) {
                                o.vertices[f].z = Math.random() * s.noise + 1,
                                u[f] = module.exports.getColor(s.colr, .65);
                                break
                            }
                    } else
                        o.vertices[f].z = Math.random() * s.noise;
                u[f] || (u[f] = module.exports.getColor(s.colr))
            }
            for (f = 0; f < o.faces.length; f++) {
                for (var y = o.faces[f], x = 0, b = 0; b < 3; b++)
                    y.vertexColors[b] = u[y[h[b]]], o.vertices[y[h[b]]].z <= 0 && x++;
                x >= 3 && delete o.faces[f]
            }
            o.faces = o.faces.filter(function (t) {
                    return t
                }),
            o.elementsNeedUpdate = !0
        } else
            s.colr && module.exports.colorize(o, s.colr);
        s.scale && a(o, n / i.worldUV, e / i.worldUV, s.scale),
        l[p] = o
    }
    return o
};
var p = [];
module.exports.generateCube = function (e, n, s, c, l) {
    e = e || [1, 1, 1, 1, 1, 1];
    for (var h = (l.scale ? n + "_" + s + "_" + c + "_" : "") + (void 0 != l.colr ? l.colr : "") + (l.scale || "") + (l.amb || "") + (l.useScale || ""), u = 0; u < e.length; ++u)
        h += "_" + e[u];
    if (!(o = p[h])) {
        l.colr = void 0 != l.colr ? l.colr : 16777215;
        var d = module.exports.getColor(l.colr),
        f = l.noAmb ? d : l.amb ? module.exports.getColor(l.colr, i.ambientVal + l.amb * (1 - i.ambientVal)) : d;
        o = new r.Geometry;
        var m,
        g = [];
        for (e[0] && ((m = new r.PlaneGeometry(1, 1)).rotateY(Math.PI / 2), m.translate(.5, .5, 0), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, c / i.worldUV, s / i.worldUV, l.scale), g.push(m)), e[1] && ((m = new r.PlaneGeometry(1, 1)).rotateY(-Math.PI / 2), m.translate( - .5, .5, 0), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, c / i.worldUV, s / i.worldUV, l.scale), g.push(m)), e[2] && ((m = new r.PlaneGeometry(1, 1)).rotateX(-Math.PI / 2), m.translate(0, 1, 0), m.faces[0].vertexColors = [d, d, d], m.faces[1].vertexColors = [d, d, d], l.scale && a(m, n / i.worldUV, c / i.worldUV, l.scale), g.push(m)), e[3] && ((m = new r.PlaneGeometry(1, 1)).rotateX(Math.PI / 2), m.translate(0, 0, 0), m.faces[0].vertexColors = [f, f, f], m.faces[1].vertexColors = [f, f, f], l.scale && a(m, n / i.worldUV, c / i.worldUV, l.scale), g.push(m)), e[4] && ((m = new r.PlaneGeometry(1, 1)).translate(0, .5, .5), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, n / i.worldUV, s / i.worldUV, l.scale), g.push(m)), e[5] && ((m = new r.PlaneGeometry(1, 1)).rotateY(Math.PI), m.translate(0, .5,  - .5), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, n / i.worldUV, s / i.worldUV, l.scale), g.push(m)), u = 0; u < g.length; u++)
            o.merge(g[u], new r.Matrix4);
        l && l.useScale && (o.scale(n, s, c), o.translate(0, -s / 2, 0)),
        p[h] = o
    }
    return o
}