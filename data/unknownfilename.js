var n,
i,
o = 0,
s = function (t) {
	this.sid = o++,
	this.uid = t.uid,
	this.width = t.w,
	this.length = t.l,
	this.height = t.h,
	this.active = !0,
	this.x = t.x,
	this.y = t.y,
	this.z = t.z,
	this.dir = t.d,
	this.src = t.src,
	this.ramp = t.ramp,
	this.ladder = t.ladder,
	this.jumpPad = t.jumpPad,
	this.noShoot = t.noShoot,
	this.stepSrc = t.s,
	this.score = t.score,
	this.kill = t.kill,
	this.dummy = t.dummy,
	this.noVis = t.noVis,
	this.complexMesh = t.complexMesh,
	this.penetrable = t.penetrable,
	this.health = t.health,
	this.startHealth = t.health,
	this.transparent = t.transparent,
	this.boost = t.boost,
	this.boostDr = t.boostDr
};
module.exports.manager = function (t, e, o) {
	var a;
	t && (n = require("./prefabs.js").prefabs, i = require("three")),
	this.objects = [],
	this.objectives = [],
	this.collision = function (t, e, r) {
		return t.x - t.width - r <= e.x + e.width && t.x + t.width + r >= e.x - e.width && t.z - t.length - r <= e.z + e.length && t.z + t.length + r >= e.z - e.length && t.y - t.height - r <= e.y + e.height && t.y + t.height + r >= e.y - e.height
	},
	this.checkPos = function (t, r, n, i, o) {
		for (var s = 0; s < this.objects.length; ++s)
			if (this.objects[s] != i && this.objects[s] != o && !this.objects[s].ramp && e.pointInBox3D(t, r, n, this.objects[s]))
				return !1;
		return !0
	},
	this.addCylinder = function (e, r, n, i, o, s) {
		t && (s.shadows = !0, t.addCylinder(e, r, n, i, o, s))
	},
	this.addObjective = function (e, r, n, o, s, a) {
		var c;
		t && ((c = t.addCube(e, r, n, o, a, s, [1, 1, 0, 0, 1, 1], {
						src: "objective_0",
						noGroup: !0,
						mat: i.MeshBasicMaterial,
						transparent: !0,
						depthWrite: !1,
						side: 2
					})).visible = !1),
		this.objectives.push({
			x: e,
			z: n,
			y: r + a / 2,
			mesh: c,
			width: o / 2,
			length: s / 2,
			height: a / 2
		})
	},
	this.addDeathZone = function (t, e, r, n, i, o) {
		this.objects.push(new s({
				x: t,
				z: r,
				y: e + o / 2,
				w: n / 2,
				l: i / 2,
				h: o / 2,
				kill: !0,
				noShoot: !0,
				complexMesh: !0
			}))
	},
	this.addScoreZone = function (t, e, r, n, i, o) {
		this.objects.push(new s({
				x: t,
				z: r,
				y: e + o / 2,
				w: n / 2,
				l: i / 2,
				h: o / 2,
				score: !0,
				noShoot: !0,
				complexMesh: !0
			}))
	},
	this.addLadder = function (r, n, c, l, h, p) {
		var u = o.ladderScale,
		d = o.ladderScale;
		if (0 == h || h == Math.PI ? d = o.ladderWidth : u = o.ladderWidth, a = new s({
					ladder: !0,
					complexMesh: !0,
					noShoot: !0,
					d: h,
					x: r + o.ladderScale * Math.cos(h),
					z: c + o.ladderScale * Math.sin(h),
					y: n,
					w: u,
					l: d,
					h: l
				}), this.objects.push(a), t && !p) {
			var f = {
				src: "floor_0",
				vertexColors: i.VertexColors,
				scale: .02,
				shadows: !0
			};
			t.addCube(a.x + o.ladderWidth * Math.sin(h), a.y, a.z + o.ladderWidth * Math.cos(h), 2 * o.ladderScale, l + 2, 2 * o.ladderScale, [1, 1, 1, 1, 1, 1], f),
			t.addCube(a.x - o.ladderWidth * Math.sin(h), a.y, a.z - o.ladderWidth * Math.cos(h), 2 * o.ladderScale, l + 2, 2 * o.ladderScale, [1, 1, 1, 1, 1, 1], f);
			for (var m = Math.floor(l / 6), g = 0; g < m; ++g)
				t.addPlane(a.x, n + 6 * (g + 1) + e.randFloat(-1, 1), a.z, o.ladderWidth, o.ladderScale, f, -h + Math.PI / 2, Math.PI / 2, e.randFloat( - .1, .1))
		}
	},
	this.addRamp = function (e, r, n, a, c, l, h, p, u, d, f) {
		var m = 0 != h && h != Math.PI,
		g = (m ? l : a) / 2,
		v = Math.sqrt(c * c + l * l),
		y = Math.asin(c / v);
		if (this.objects.push(new s({
					x: e,
					z: n,
					y: r + c / 2,
					w: a / 2,
					l: l / 2,
					h: c / 2,
					d: h,
					noShoot: !0,
					complexMesh: !0,
					boostDr: p ? y : null,
					boost: p || null,
					ramp: {
						sX: e - g * Math.cos(h),
						sZ: n - g * Math.sin(h),
						eX: e + g * Math.cos(h),
						eZ: n + g * Math.sin(h)
					}
				})), t && !d) {
			t.addRamp(e, r, n, m ? a : l, c, (m ? l : a) / 2, h, {
				src: u || "default",
				vertexColors: i.VertexColors,
				colr: f,
				scale: 1,
				shadowsR: !0
			}),
			r += o.ambOff;
			var x = (m ? a : l) / 2 - o.ambScale;
			m ? a = 2 * o.ambScale : l = 2 * o.ambScale;
			for (var b, w = 0; 2 > w; ++w)
				b = w ? 1 : -1, t.addRamp(e + x * b * Math.cos(h + Math.PI / 2), r, n + x * b * Math.sin(h + Math.PI / 2), m ? a : l, c, (m ? l : a) / 2, h, {
					src: "ambient_1",
					euler: "ZYX",
					depthWrite: !1,
					side: i.DoubleSide,
					transparent: !0
				}, w ? 0 : Math.PI)
		}
	},
	this.addBlock = function (e, r, n, o, a, c, l, h) {
		if ((h = h || {}).src = h.src || "wall_0", h.noCol || this.objects.push(new s({
					x: e,
					z: n,
					y: r + c / 2,
					w: o / 2,
					l: a / 2,
					h: c / 2,
					uid: this.objects.length,
					s: h.sound,
					src: h.src,
					noVis: h.noVis,
					health: h.health,
					transparent: h.transparent,
					penetrable: h.penetrable,
					complexMesh: h.xR || h.yR || h.zR,
					ter: !0
				})), t && !h.noVis) {
			h.vertexColors = i.VertexColors,
			h.scale = null == h.scale ? 1 : h.scale,
			h.shadows = !h.shadowsR,
			h.noGroup = !!h.health;
			var p = t.addCube(e, r, n, o, c, a, l, h);
			h.health && (this.objects[this.objects.length - 1].meshRef = p)
		}
	},
	this.addMesh = function (e, r, a, c, l, h, p, u, d) {
		r += h,
		d || this.objects.push(new s({
				complexMesh: !!n && n[u.toUpperCase()].complex,
				x: e,
				z: a,
				y: r,
				w: l,
				l: p,
				h: h,
				ter: !0
			})),
		t && t.loadMesh({
			src: u + "_0",
			emissive: n[u.toUpperCase()].emiss ? 16777215 : null,
			side: n[u.toUpperCase()].doubleSide ? i.DoubleSide : i.FrontSide,
			transparent: n[u.toUpperCase()].transparent,
			alphaTest: n[u.toUpperCase()].transparent ? .1 : null,
			shadows: n[u.toUpperCase()].castShadow,
			shadowsR: n[u.toUpperCase()].receiveShadow
		}, e, r, a, c, o[u + "Scale"], t.scene, !0)
	};
	var c = [];
	this.addNoisePlanes = function () {
		for (var e = 0; e < c.length; ++e)
			c[e][5].objects = this.objects, t.addPlane(...c[e]);
		c.length = 0
	},
	this.addPlane = function (e, r, n, o, a, l, h, p, u) {
		if ((l = l || {}).col && this.objects.push(new s({
					x: e,
					z: n,
					y: r,
					w: a,
					l: o,
					h: 0,
					s: l.sound,
					health: l.health,
					transparent: l.transparent,
					penetrable: l.penetrable,
					noVis: l.noVis
				})), t && !l.noVis) {
			l.transparent = !0,
			l.side = i.DoubleSide,
			l.vertexColors = i.VertexColors,
			l.noise && (l.pinEdges = !0, l.margin = 2, l.tilesX = Math.round(a / 6), l.tilesZ = Math.round(o / 6));
			var d = [e, r, n, a, o, l, h, (p || 0) + Math.PI / 2, u];
			if (!l.noise)
				return t.addPlane(...d);
			c.push(d)
		}
	},
	this.addAmbient = function (t, e, r, n, i, o, s, a, c) {
		this.addPlane(t, e, r, s, a, {
			src: "ambient_" + (c || 0),
			euler: "ZYX",
			depthWrite: !1
		}, n, i, o)
	},
	this.limitAmb = function (t, r, n, i, o, s, a) {
		var c = [e.cdv[i]],
		l = [e.cdv[o]];
		return t = n == -Math.PI / 2 || n == Math.PI + Math.PI / 2 ? Math.min(t, (r[o] - Math.min(s[o] - s[l], a[o] - a[l])) / 2) : n == Math.PI / 2 ? Math.min(t, (Math.max(s[o] + s[l], a[o] + a[l]) - r[o]) / 2) : 0 == n ? Math.min(t, (Math.max(s[i] + s[c], a[i] + a[c]) - r[i]) / 2) : Math.min(t, (r[i] - Math.min(s[i] - s[c], a[i] - a[c])) / 2)
	},
	this.resetAll = function () {
		for (var e = 0; e < this.objects.length; ++e)
			this.objects[e].active = !0, this.objects[e].startHealth && (this.objects[e].health = this.objects[e].startHealth), this.objects[e].meshRef && (this.objects[e].meshRef.visible = !0);
		t && t.updateShadowMap()
	},
	this.removeAll = function () {
		this.objects.length = 0,
		this.objectives.length = 0
	}
}
