var n,
i = require("../config.js"),
o = require("three");
module.exports = function (e, i, o) {
	var s = require("./geos.js"),
	a = new e.LoadingManager,
	c = new e.OBJLoader(a);
	this.cubeGeo = new e.BoxGeometry(1, 1, 1),
	this.getCubeMesh = function () {
		return new e.Mesh(this.cubeGeo)
	};
	var l = new e.PlaneGeometry(1, 1);
	new e.CylinderGeometry(.1, 1, 1, 4, 1, !1, Math.PI / 4).computeFlatVertexNormals();
	var h = new e.TextureLoader,
	p = new e.MeshBasicMaterial({
			color: 16777215
		}),
	u = new e.MeshBasicMaterial({
			color: 65280
		}),
	d = {},
	f = {},
	m = {},
	g = this,
	v = {};
	this.frustum = new e.Frustum;
	var y = new e.Matrix4;
	this.camera = new e.PerspectiveCamera(0, window.innerWidth / window.innerHeight, .1, 8e3),
	this.weaponLean = 1,
	this.init = function (r) {
		this.scene = new e.Scene,
		module.exports.initScene.call(this, r),
		this.sunPlane = this.addPlane(0, 5e3, -4500, 750, 750, {
				src: "sun_0",
				noFog: !0,
				transparent: !0,
				mat: e.MeshBasicMaterial,
				noGroup: !0
			}, 0, i.getDirection(-4500, 5e3, 0, 0)),
		this.initShaders()
	};
	var x = 0;
	this.flash = function (t, e) {
		flashOverlay.style.display = "block",
		flashOverlay.style.left = 100 * t + "%",
		flashOverlay.style.top = 100 * (1 - e) + "%",
		x = 100
	},
	this.updateLightMap = function (t) {
		this.skyLight && (this.skyLight.shadow.camera.right = t.shadWidth, this.skyLight.shadow.camera.left = -t.shadWidth, this.skyLight.shadow.camera.top = t.shadLength, this.skyLight.shadow.camera.bottom = -t.shadLength)
	},
	this.useDepthMap = 0,
	this.toggleDepthMap = function (r) {
		if (this.useDepthMap = r, this.scene) {
			var i = r && "0" != r;
			this.scene.overrideMaterial = i ? p : null,
			i ? (this.scene.fog = new e.Fog(0, 0, r), this.renderer.setClearColor(0)) : module.exports.initScene.call(this, n)
		}
	},
	this.greenScreen = !1,
	this.updateGreenScreen = function (t) {
		g.greenScreen && !t.noGreen ? (t.realMat = t.material, t.material = u) : t.material = t.realMat || t.material
	},
	this.toggleGreenscreen = function (t) {
		this.greenScreen = t,
		this.scene && (t ? (this.renderer.setClearColor(65280), this.scene.fog.near = .1, this.scene.fog.far = 0) : (this.scene.fog.near = 1, this.scene.fog.far = n.fogD, this.renderer.setClearColor(n.sky)), this.scene.traverse(function (t) {
				g.updateGreenScreen(t)
			}))
	},
	this.renderer = new e.WebGLRenderer({
			precision: "mediump",
			powerPreference: "high-performance",
			antialias: !1
		}),
	this.renderer.shadowMap.enabled = !0,
	this.renderer.shadowMap.autoUpdate = !1,
	this.renderer.shadowMap.type = e.BasicShadowMap,
	this.renderer.setPixelRatio(window.devicePixelRatio),
	this.renderer.setSize(window.innerWidth, window.innerHeight),
	this.renderer.autoClear = !1,
	document.body.appendChild(this.renderer.domElement),
	this.updateShadowMap = function () {
		this.renderer.shadowMap.needsUpdate = !0
	},
	window.effectComposer,
	this.bloomPass,
	this.postprocessing = {
		enabled: !0
	},
	this.initShaders = function () {
		var t = new e.RenderPass(this.scene, this.camera);
		this.bloomPass = new e.UnrealBloomPass(new e.Vector2(window.innerWidth, window.innerHeight), 1.5, .4, .85),
		this.bloomPass.renderToScreen = !0,
		this.bloomPass.strength = this.postprocessing.bloomStrength,
		this.bloomPass.radius = this.postprocessing.bloomRadius,
		this.bloomPass.threshold = this.postprocessing.bloomTresh,
		window.effectComposer = new e.EffectComposer(this.renderer),
		window.effectComposer.addPass(t),
		window.effectComposer.addPass(this.bloomPass),
		this.resizeShaders()
	},
	this.resizeShaders = function () {
		if (this.bloomPass && this.bloomPass.setSize(window.innerWidth, window.innerHeight), window.effectComposer) {
			var t = this.renderer.getPixelRatio(),
			e = Math.floor(window.innerWidth / t) || 1,
			r = Math.floor(window.innerHeight / t) || 1;
			window.effectComposer.setSize(e, r)
		}
	},
	this.zoom = function (t) {
		this.camera.fov = this.fov / t,
		this.camera.updateProjectionMatrix()
	},
	this.setFov = function (t) {
		this.fov = t,
		this.camera.fov = t
	},
	this.setFov(o.fov),
	this.resize = function () {
		this.camera.aspect = window.innerWidth / window.innerHeight,
		this.camera.updateProjectionMatrix(),
		this.renderer.setSize(window.innerWidth, window.innerHeight),
		this.resizeShaders()
	},
	this.setResMlt = function (t) {
		this.renderer.setPixelRatio(window.devicePixelRatio * t),
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	},
	this.updateFrustum = function () {
		this.frustum.setFromMatrix(y.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse))
	};
	var b = 0,
	w = 0;
	this.shakeX = 0,
	this.shakeY = 0,
	this.updateShake = function (t) {
		b && (b *= Math.pow(.99, t), w += i.randFloat(-Math.PI, Math.PI), this.shakeX = Math.cos(w) * b, this.shakeY = Math.sin(w) * b, .01 >= b && (b = 0, this.shakeX = this.shakeY = 0))
	},
	this.shake = function (t) {
		b = t
	},
	this.render = function (t) {
		this.scene && (this.postprocessing.enabled ? window.effectComposer.render() : (this.renderer.clear(), this.renderer.render(this.scene, this.camera)), x && (0 >= (x -= t) && (x = 0, flashOverlay.style.display = "none")), this.updateShake(t))
	},
	this.updateTexture = function (t, r) {
		var n = m[t];
		n ? n.image = r : (n = new e.Texture(r), m[t] = n),
		n.needsUpdate = !0
	},
	this.loadTexture = function (t, r, n, i) {
		return m[r] ? m[r].mats ? m[r].mats.push(t) : (t[i || "map"] = m[r], t.needsUpdate = !0) : (m[r] = {
				mats: [t]
			}, n = n || {}, h.load("/textures/" + r + ".png", function (t) {
				t.wrapS = e.RepeatWrapping,
				t.wrapT = e.RepeatWrapping,
				t.repeat.set(n.repeatX || 1, n.repeatY || 1),
				t.minFilter = e.NearestFilter,
				t.magFilter = e.NearestFilter,
				t.needsUpdate = !0;
				for (var o = 0; o < m[r].mats.length; ++o)
					m[r].mats[o][i || "map"] = t, m[r].mats[o].needsUpdate = !0;
				m[r] = t
			})),
		t
	},
	this.getMat = function (t, r) {
		var n = (r && r.texSrc || t) + (r ? (r.rotation || "x") + (r.noFog || "y") + (r.opacity || "z") + (r.color || "b") + (r.ao || "a") + (r.emissive || "e") + (r.glowText || "g") + (null == r.depthWrite ? "d" : r.depthWrite) : ""),
		i = f[n];
		return i || (i = new((r = r || {}).mat ? r.mat : e.MeshLambertMaterial)(r), t && "default" != t && this.loadTexture(i, r.texSrc || t, r), r && r.emissive && this.loadTexture(i, (r.glowText && r.texSrc || t) + "_e", r, "emissiveMap"), r && r.ao && (this.loadTexture(i, t + "_ao", r, "aoMap"), i.aoMapIntensity = 1.3), r && r.normal && this.loadTexture(i, t + "_n", r, "normalMap"), "default" == t && (i.vertexColors = e.VertexColors), r && r.noFog && (i.fog = !1), f[n] = i),
		i
	},
	this.offsetMesh = function (t, e) {
		t.translateZ(e)
	},
	this.genColorCube = function (t, r, n, i, o) {
		for (var a = "", c = 0; c < i.length; ++c)
			a += i[c] + "_";
		var l = d[a];
		if (!l) {
			l = new e.Geometry;
			var h = .5 + (o || 0);
			for (c = 0; c < i.length; ) {
				var p = i[c + 1],
				u = new e.BoxGeometry(1 * (4 == c ? .9 : 1), p, 1 * (4 == c ? .9 : 1));
				s.colorize(u, i[c]);
				var f = new e.Mesh(u);
				this.moveMesh(f, 0, h - p / 2, 0),
				this.merge(l, f),
				h -= p,
				c += 2
			}
			d[a] = l
		}
		f = new e.Mesh(l, this.getMat("default"));
		return this.scaleMesh(f, t, r, n),
		f
	};
	var M = {};
	this.genBody = function (t, r, n, i) {
		var s = M[t];
		if (!s) {
			s = new e.Geometry;
			var a = o.playerHeight - o.headScale - o.legHeight,
			c = this.genColorCube(o.chestWidth, a, o.chestScale, [t, .8, r, .2]);
			this.moveMesh(c, 0, a / 2, 0),
			this.merge(s, c);
			var l = this.genColorCube(o.headScale, o.headScale, o.headScale, [n, .2, i, .8]);
			this.moveMesh(l, 0, o.playerHeight - o.headScale / 2 - o.legHeight, 0),
			this.merge(s, l),
			M[t] = s
		}
		var h = new e.Mesh(s, this.getMat("default"));
		return h.receiveShadow = !0,
		h.noGreen = !0,
		h
	};
	var _ = {};
	this.genLeg = function (t, r, n, i) {
		var s = o.legScale,
		a = null;
		if (i) {
			var c = r + "-" + (i || "");
			if (!(a = _[c])) {
				var l = o.legHeight / 2,
				h = s / 2,
				p = [.5, 2],
				u = this.genColorCube(s, l, s, [r, 1]);
				this.moveMesh(u, 0, -l / 2 * Math.cos(p[1]), -l / 2 * Math.sin(p[1])),
				this.rotateMesh(u, 0, p[1], 0);
				var d = Math.sqrt(h * h + h * h - 2 * h * h * Math.cos(p[0] - p[1])),
				f = 2 * Math.sqrt(h * h - d / 2 * (d / 2)),
				m = this.genColorCube(s, d, f, [r, 1]);
				this.moveMesh(m, 0, -l * Math.cos(p[1]), -l * Math.sin(p[1])),
				this.rotateMesh(m, 0, (p[1] + p[0]) / 2, 0);
				var g = this.genColorCube(s, l, s, [r, .5, n, .5]);
				this.moveMesh(g, 0, -l * Math.cos(p[1]) - l / 2 * Math.cos(p[0]), -l * Math.sin(p[1]) - l / 2 * Math.sin(p[0])),
				this.rotateMesh(g, 0, p[0], 0);
				a = new e.Geometry;
				this.merge(a, u),
				this.merge(a, m),
				this.merge(a, g),
				_[c] = a
			}
			a = new e.Mesh(a, this.getMat("default")),
			this.moveMesh(a, o.legScale / 2 * (t ? -1 : 1), o.legHeight - o.crouchDst + .5, 0)
		} else
			a = this.genColorCube(s, o.legHeight, s, [r, .75, n, .25],  - .5), this.moveMesh(a, o.legScale / 2 * (t ? -1 : 1), o.legHeight, 0);
		return a.receiveShadow = !0,
		a.noGreen = !0,
		a
	};
	var E = {};
	this.genArms = function (t, r, n, i, s, a) {
		var c = E[t.name + "-" + n + "-" + a + "-" + (s || 0)];
		if (!c) {
			c = new e.Geometry;
			var l = (-o.chestWidth + o.armScale / 2 - o.armInset) * (a ? t.holdW || .4 : 1);
			s && 1 != s || this.merge(c, this.genArm(l, o.armOff, t, !0, r, n, i, a)),
			s && 2 != s || this.merge(c, this.genArm(-l, o.armOff, t, !1, r, n, i, a)),
			E[t.name + "-" + n + "-" + a + "-" + (s || 0)] = c
		}
		return (c = new e.Mesh(c, this.getMat("default"))).noGreen = !0,
		c.receiveShadow = !0,
		c
	},
	this.genArm = function (t, r, n, s, a, c, l, h) {
		var p = s ? n.leftHoldY : n.rightHoldY,
		u = s ? n.leftHoldZ : n.rightHoldZ,
		d = s ? n.leftHoldX || 0 : n.rightHoldX || 0,
		f = o.armScale * (h ? .75 : 1),
		m = Math.min(o.uArmLength + o.lArmLength - .01, i.getDistance3D(t, r, 0, (n.xOff - d) * (s && n.akimbo ? -1 : 1), n.yOff + p, n.zOff - u)),
		g = i.getAnglesSSS(m, o.uArmLength, o.lArmLength),
		v = Math.PI / 2;
		if (!h) {
			var y = this.genColorCube(f, o.uArmLength, f, [a, 1]);
			this.moveMesh(y, 0, -o.uArmLength / 2 * Math.cos(v), -o.uArmLength / 2 * Math.sin(v)),
			this.rotateMesh(y, 0, v, 0);
			var x = f / 2,
			b = Math.sqrt(x * x + x * x - 2 * x * x * Math.cos(Math.PI + g[0] + Math.PI / 2)),
			w = 2 * Math.sqrt(x * x - b / 2 * (b / 2)),
			M = this.genColorCube(f, b, w, [a, 1]);
			this.moveMesh(M, 0, -o.uArmLength * Math.cos(v), -o.uArmLength * Math.sin(v)),
			this.rotateMesh(M, 0, (v + g[0]) / 2, 0)
		}
		var _ = this.genColorCube(f, o.lArmLength, f, [a, .65, c, .15, l, .2]),
		E = o.lArmLength / 2;
		this.moveMesh(_, 0, -o.uArmLength * Math.cos(v) - E * Math.cos(g[0]), -o.uArmLength * Math.sin(v) - E * Math.sin(g[0])),
		this.rotateMesh(_, 0, g[0], 0);
		var S = new e.Geometry;
		if (h) {
			if (s) {
				var T = this.genColorCube(f, 20, f, [a, 1]);
				this.moveMesh(T, 0, -o.uArmLength * Math.cos(v) - -10 * Math.cos(g[0]), -o.uArmLength * Math.sin(v) - -10 * Math.sin(g[0])),
				this.rotateMesh(T, 0, g[0], 0),
				this.merge(S, T)
			}
		} else
			this.merge(S, y), this.merge(S, M);
		return this.merge(S, _),
		S = new e.Mesh(S),
		this.moveMesh(S, t - n.xOff, r - n.yOff, -n.zOff),
		S.rotation.order = "YXZ",
		S.rotation.x = -g[1] - i.getDirection(0, r, n.zOff - u, n.yOff + p),
		S.rotation.y = i.getDirection(-t, 0, (s && n.akimbo ? 1 : -1) * (n.xOff - d), n.zOff - u) - Math.PI / 2,
		S
	},
	this.addCube = function (t, r, n, i, o, a, c, l) {
		l = l || {};
		var h = new e.Mesh(s.generateCube(c, i, o, a, l));
		return this.moveMesh(h, t, r, n),
		h.rotation.set(l.yR || 0, l.xR || 0, l.zR || 0),
		h.scale.set(i, o, a),
		l.src && !l.noGroup ? this.meshGroup(h, l) : this.add(h, l),
		h
	};
	var S = [];
	this.addSpray = function (t, r, n, s, a, c, h, p) {
		tmpObj = null;
		for (var u = 0; u < S.length; ++u)
			if (S[u].sid == t) {
				tmpObj = S[u];
				break
			}
		tmpObj || (tmpObj = new e.Mesh(l), tmpObj.sid = t, tmpObj.scale.set(o.sprayScale, o.sprayScale, 1), tmpObj.receiveShadow = !0, S.push(tmpObj), this.add(tmpObj)),
		this.moveMesh(tmpObj, n, s, a),
		tmpObj.rotation.y = i.toRad(c),
		tmpObj.rotation.x = i.toRad(h),
		tmpObj.material = this.getMat("sprays/" + r, {
				depthWrite: !1,
				opacity: p,
				transparent: !0
			})
	},
	this.clearSprays = function () {
		for (var t = 0; t < S.length; ++t)
			S[t] && S[t].material.map && S[t].material.map.dispose(), this.scene.remove(S[t]);
		S.length = 0
	},
	this.addPlane = function (t, r, n, i, o, a, c, l, h) {
		(a = a || {}).premultipliedAlpha = !0;
		var p = new e.Mesh(s.generatePlane(o, i, a, t, r, n));
		return a.euler && (p.eulerOrder = a.euler),
		this.moveMesh(p, t, r, n),
		p.rotateY(c || 0),
		p.rotateX((l || 0) - Math.PI / 2),
		p.rotateZ(h || 0),
		p.scale.set(2 * i, 2 * o, 1),
		a.dontAdd ? a.src && (p.material = this.getMat(a.src, a)) : a.src && !a.noGroup ? this.meshGroup(p, a, 1) : this.add(p, a),
		p
	},
	this.addRamp = function (t, r, n, i, o, a, c, l, h) {
		l = l || {};
		var p = new e.Mesh(s.generatePlane(2 * a, i, l));
		this.moveMesh(p, t, r + o / 2, n),
		a *= 2;
		var u = Math.sqrt(o * o + a * a);
		return p.scale.set(i, u, 2),
		p.rotateY(-Math.PI / 2 - c),
		p.rotateX(Math.asin(o / u) - Math.PI / 2),
		p.rotateZ(h || 0),
		l.src ? this.meshGroup(p, l, 1) : this.add(p, l),
		p
	};
	var T = [],
	A = [];
	this.loadMesh = function (t, r, n, i, o, s, a, l) {
		var h = this.getMat(t.src, t),
		p = T[t.src];
		if (p) {
			if (t.centerZ) {
				p.computeBoundingBox();
				var u = p.boundingBox.getCenter();
				a.translateZ(u.x * s)
			}
		} else
			p = l ? new e.Geometry : new e.BufferGeometry, T[t.src] = p, c.load("/models/" + t.src + ".obj", function (r) {
				if (r.children[0].geometry.computeVertexNormals(), p.copy(l ? (new e.Geometry).fromBufferGeometry(r.children[0].geometry) : r.children[0].geometry), t.uv2 && p.addAttribute("uv2", new e.BufferAttribute(p.attributes.uv.array, 2)), l) {
					for (var n = new e.Geometry, i = 0; i < A[t.src].length; ++i)
						g.merge(n, A[t.src][i]);
					g.add(new e.Mesh(n, h), t),
					A[t.src].loaded = !0
				}
				if (t.centerZ) {
					p.computeBoundingBox();
					var o = p.boundingBox.getCenter();
					a.translateZ(o.x * s)
				}
			});
		var d = new e.Mesh(p, h);
		d.receiveShadow = !0,
		d.noGreen = t.noGreen,
		d.castShadow = t.shadows,
		d.rotation.y = o || 0,
		g.moveMesh(d, r, n, i),
		g.scaleMesh(d, s || 1, s || 1, s || 1),
		l ? A[t.src] ? A[t.src].loaded ? this.meshGroup(d, t) : A[t.src].push(d) : A[t.src] = [d] : a.add(d)
	},
	this.genObj3D = function (t, r, n) {
		var i = new e.Object3D;
		return this.moveMesh(i, t || 0, r || 0, n || 0),
		i
	},
	this.merge = function (t, e, r) {
		e.updateMatrix(),
		t.merge(e.geometry, e.matrix, r)
	},
	this.meshGroup = function (t, r) {
		var n = r.src + "-" + (r.shadowsR || "a") + (r.emissive || "e") + (r.opacity || "o");
		v[n] || (v[n] = new e.Geometry, v[n].data = r),
		t.updateMatrix(),
		v[n].merge(t.geometry, t.matrix)
	},
	this.addMeshGroups = function () {
		for (var t in v)
			if (v.hasOwnProperty(t)) {
				var r = new e.Mesh((new e.BufferGeometry).fromGeometry(v[t]));
				r.groupSrc = v[t].data.src,
				r.visible = !L[r.groupSrc],
				r.matrixAutoUpdate = !1,
				this.add(r, v[t].data)
			}
		v = {}
	};
	var L = {};
	this.toggleMeshGroup = function (t, r) {
		L[t] = !r,
		this.scene && this.scene.traverse(function (n) {
			n instanceof e.Mesh && n.groupSrc == t && (n.visible = r)
		})
	},
	this.add = function (t, e) {
		e && (t.castShadow = e.shadows, t.receiveShadow = e.shadows || e.shadowsR, t.material = this.getMat(e.src, e)),
		this.updateGreenScreen(t),
		this.scene.add(t),
		this.updateShadowMap()
	},
	this.remove = function (t) {
		this.scene.remove(t)
	},
	this.moveMesh = function (t, e, r, n) {
		null != e && (t.position.x = e),
		null != r && (t.position.y = r),
		null != n && (t.position.z = n)
	},
	this.scaleMesh = function (t, e, r, n) {
		t.scale.set(e, r, n)
	},
	this.rotateMesh = function (t, e, r, n) {
		(e || 0 == e) && (t.rotation.y = e),
		(r || 0 == r) && (t.rotation.x = r),
		(n || 0 == n) && (t.rotation.z = n)
	}
},
module.exports.initScene = function (t) {
	if (n = t, t.ambient && (this.ambientLight = new o.AmbientLight(t.ambient), this.ambientLight.name = "ambLight", !this.scene.getObjectByName("ambLight") && this.scene.add(this.ambientLight)), t.light) {
		this.skyLight = new o.DirectionalLight(t.light, 1.2),
		this.skyLight.name = "skyLight",
		this.scene.getObjectByName("skyLight") || this.scene.add(this.skyLight);
		var e =  - .3 * Math.PI,
		r = 2 * Math.PI *  - .25;
		this.skyLight.position.x = i.lightDistance * Math.cos(r),
		this.skyLight.position.y = i.lightDistance * Math.sin(r) * Math.sin(e),
		this.skyLight.position.z = i.lightDistance * Math.sin(r) * Math.cos(e),
		this.skyLight.castShadow = !0,
		this.skyLight.shadow.mapSize.width = t.shadowR || i.shadowRes,
		this.skyLight.shadow.mapSize.height = t.shadowR || i.shadowRes,
		this.skyLight.shadow.camera.far = i.shadowDst
	}
	this.scene.fog = new o.Fog(t.fog, 1, t.fogD),
	this.renderer.setClearColor(t.sky),
	this.useDepthMap && "0" != this.useDepthMap && this.toggleDepthMap(this.useDepthMap),
	this.greenScreen && this.toggleGreenscreen(this.greenScreen)
}