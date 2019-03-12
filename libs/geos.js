var n = require("three");
const i = require("../config.js");
require("./utils.js");
var o = {};
       
module.exports.getColor = function (t, e) {
	var r = t + "-" + (e || ""),
	i = o[r];
	return i || (i = new n.Color(t), e && i.multiplyScalar(e), o[r] = i),
	i
},
module.exports.colorize = function (e, r, n) {
	r = n || module.exports.getColor(r);
	for (var i = 0; i < e.faces.length; ++i)
		e.faces[i].vertexColors[0] = r, e.faces[i].vertexColors[1] = r, e.faces[i].vertexColors[2] = r
};
var s,
a = function (t, e, r, i) {
	for (var o, s = new n.Vector2(e, r).multiplyScalar(i || 1), a = 0; a < t.faceVertexUvs.length; a++) {
		o = t.faceVertexUvs[a];
		for (var c = 0; c < o.length; c++)
			for (var l, p = 0; 3 > p; p++)
				(l = o[c][p].multiply(s)).x = .5 + l.x - s.x / 2
                                        
	}
},
c = function (t, e, r, n, i, o) {
	return t >= r - i && t <= r + i && e >= n - o && e <= n + o
},
l = [],
p = ["a", "b", "c", "d"];
module.exports.generatePlane = function (e, r, o, h, u, d) {
	e *= o.ratio || 1;
	var f = (o.scale ? e + "_" + r + "_" : "") + (o.scale || "") + (o.tilesX || "") + (o.tilesZ || "") + (o.noise ? h + "_" + u + "_" + d : "") + (null == o.colr ? "" : o.colr);
	if (!(s = l[f])) {
		if (s = new n.PlaneGeometry(1, 1, o.tilesX || 1, o.tilesZ || 1), o.noise) {
			for (var m = {}, g = o.margin || 0, v = 0; v < s.vertices.length; ++v) {
				var y = s.vertices[v].x,
				x = s.vertices[v].y;
				if (!o.pinEdges ||  - .5 != y && .5 != y &&  - .5 != x && .5 != x)
					if (o.objects) {
						for (var b = 0; b < o.objects.length; ++b)
							if (o.objects[b].y - o.objects[b].height <= u + .1 && o.objects[b].y + o.objects[b].height > u + o.noise && c(d + -x * e * 2, h + y * r * 2, o.objects[b].z, o.objects[b].x, o.objects[b].length + g, o.objects[b].width + g)) {
								s.vertices[v].z = Math.random() * o.noise + 1,
								m[v] = module.exports.getColor(o.colr, .65);
								break
							}
					} else
						s.vertices[v].z = Math.random() * o.noise;
				m[v] || (m[v] = module.exports.getColor(o.colr))
			}
			for (v = 0; v < s.faces.length; v++) {
				for (var w = s.faces[v], M = 0, _ = 0; 3 > _; _++)
					w.vertexColors[_] = m[w[h[_]]], 0 >= s.vertices[w[h[_]]].z && M++;
				3 <= M && delete s.faces[v]
			}
			s.faces = s.faces.filter(function (t) {
					return t
				}),
			s.elementsNeedUpdate = !0
		} else
			o.colr && module.exports.colorize(s, o.colr);
		o.scale && a(s, r / i.worldUV, e / i.worldUV, o.scale),
		s.computeVertexNormals(),
		l[f] = s
	}
	return s
};
var h = [];
module.exports.generateCube = function (e, r, o, c, l) {
    e = e || [1, 1, 1, 1, 1, 1],
    l.flipp = (r > o || c > o) && "floor_0" == l.src,
    l.flippW = r > c && "floor_0" == l.src;
    for (var p = (l.scale ? r + "_" + o + "_" + c + "_" : "") + (null == l.colr ? "" : l.colr) + (l.scale || "") + (l.flippW ? "flw" : "fnw") + (l.flipp ? "fl" : "fn") + (l.amb || "") + (l.useScale || ""), u = 0; u < e.length; ++u)
        p += "_" + e[u];
    if (!(s = h[p])) {
        l.colr = null == l.colr ? 16777215 : l.colr;
        var d = module.exports.getColor(l.colr),
        f = d;
        s = new n.Geometry;
        var m,
        g = [];
        e[0] && ((m = new n.PlaneGeometry(1, 1)).rotateY(Math.PI / 2), l.flipp && m.rotateX(Math.PI / 2), m.translate(.5, .5, 0), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, (l.flipp ? o : c) / i.worldUV, (l.flipp ? c : o) / i.worldUV, l.scale), g.push(m)),
        e[1] && ((m = new n.PlaneGeometry(1, 1)).rotateY(-Math.PI / 2), l.flipp && m.rotateX(Math.PI / 2), m.translate( - .5, .5, 0), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, (l.flipp ? o : c) / i.worldUV, (l.flipp ? c : o) / i.worldUV, l.scale), g.push(m)),
        e[2] && ((m = new n.PlaneGeometry(1, 1)).rotateX(-Math.PI / 2), l.flippW && m.rotateY(Math.PI / 2), m.translate(0, 1, 0), m.faces[0].vertexColors = [d, d, d], m.faces[1].vertexColors = [d, d, d], l.scale && a(m, (l.flippW ? c : r) / i.worldUV, (l.flippW ? r : c) / i.worldUV, l.scale), g.push(m)),
        e[3] && ((m = new n.PlaneGeometry(1, 1)).rotateX(Math.PI / 2), l.flippW && m.rotateY(Math.PI / 2), m.translate(0, 0, 0), m.faces[0].vertexColors = [f, f, f], m.faces[1].vertexColors = [f, f, f], l.scale && a(m, (l.flippW ? c : r) / i.worldUV, (l.flippW ? r : c) / i.worldUV, l.scale), g.push(m)),
        e[4] && (m = new n.PlaneGeometry(1, 1), l.flipp && m.rotateZ(Math.PI / 2), m.translate(0, .5, .5), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, (l.flipp ? o : r) / i.worldUV, (l.flipp ? r : o) / i.worldUV, l.scale), g.push(m)),
        e[5] && ((m = new n.PlaneGeometry(1, 1)).rotateY(Math.PI), l.flipp && m.rotateZ(Math.PI / 2), m.translate(0, .5,  - .5), m.faces[0].vertexColors = [d, f, d], m.faces[1].vertexColors = [f, f, d], l.scale && a(m, (l.flipp ? o : r) / i.worldUV, (l.flipp ? r : o) / i.worldUV, l.scale), g.push(m));
        for (u = 0; u < g.length; u++)
            s.merge(g[u], new n.Matrix4);
        l && l.useScale && (s.scale(r, o, c), s.translate(0, -o / 2, 0)),
        h[p] = s
    }
    return s
}