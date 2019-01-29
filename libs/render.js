var i = require("../config.js"),
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
    this.init = function (n) {
        this.scene = new e.Scene,
        module.exports.initScene.call(this, n),
        this.sunPlane = this.addPlane(0, 5e3, -4500, 750, 750, {
                src: "sun_0",
                noFog: !0,
                transparent: !0,
                mat: e.MeshBasicMaterial,
                noGroup: !0
            }, 0, i.getDirection(-4500, 5e3, 0, 0))
    };
    var x,
    b,
    w = 0;
    this.flash = function (t, e) {
        flashOverlay.style.display = "block",
        flashOverlay.style.left = 100 * t + "%",
        flashOverlay.style.top = 100 * (1 - e) + "%",
        w = 100
    },
    this.updateLightMap = function (t) {
        this.skyLight && (this.skyLight.shadow.camera.right = t.shadWidth, this.skyLight.shadow.camera.left = -t.shadWidth, this.skyLight.shadow.camera.top = t.shadLength, this.skyLight.shadow.camera.bottom = -t.shadLength)
    },
    this.useDepthMap = 0,
    this.toggleDepthMap = function (n) {
        if (this.useDepthMap = n, this.scene) {
            var i = n && "0" != n;
            this.scene.overrideMaterial = i ? p : null,
            i ? (this.scene.fog = new e.Fog(0, 0, n), this.renderer.setClearColor(0)) : module.exports.initScene.call(this, r)
        }
    },
    this.greenScreen = !1,
    this.updateGreenScreen = function (t) {
        g.greenScreen && !t.noGreen ? (t.realMat = t.material, t.material = u) : t.material = t.realMat || t.material
    },
    this.toggleGreenscreen = function (t) {
        this.greenScreen = t,
        this.scene && (t ? (this.renderer.setClearColor(65280), this.scene.fog.near = .1, this.scene.fog.far = 0) : (this.scene.fog.near = 1, this.scene.fog.far = r.fogD, this.renderer.setClearColor(r.sky)), this.scene.traverse(function (t) {
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
    this.postprocessing = {
        enabled: !1
    },
    this.initShaders = function () {
        var t = new e.RenderPass(this.scene, this.camera);
        (b = new e.SSAOPass(this.scene, this.camera)).renderToScreen = !0,
        (x = new e.EffectComposer(this.renderer)).addPass(t),
        x.addPass(b),
        this.resizeShaders()
    },
    this.resizeShaders = function () {
        if (b && b.setSize(window.innerWidth, window.innerHeight), x) {
            var t = this.renderer.getPixelRatio(),
            e = Math.floor(window.innerWidth / t) || 1,
            n = Math.floor(window.innerHeight / t) || 1;
            x.setSize(e, n)
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
    var M = 0,
    _ = 0;
    this.shakeX = 0,
    this.shakeY = 0,
    this.updateShake = function (t) {
        M && (M *= Math.pow(.99, t), _ += i.randFloat(-Math.PI, Math.PI), this.shakeX = Math.cos(_) * M, this.shakeY = Math.sin(_) * M, M <= .01 && (M = 0, this.shakeX = this.shakeY = 0))
    },
    this.shake = function (t) {
        M = t
    },
    this.render = function (t) {
        this.scene && (this.postprocessing.enabled ? x.render() : (this.renderer.clear(), this.renderer.render(this.scene, this.camera)), w && (w -= t) <= 0 && (w = 0, flashOverlay.style.display = "none"), this.updateShake(t))
    },
    this.updateTexture = function (t, n) {
        var r = m[t];
        r ? r.image = n : (r = new e.Texture(n), m[t] = r),
        r.needsUpdate = !0
    },
    this.loadTexture = function (t, n, r, i) {
        return m[n] ? m[n].mats ? m[n].mats.push(t) : (t[i || "map"] = m[n], t.needsUpdate = !0) : (m[n] = {
                mats: [t]
            }, r = r || {}, h.load("/textures/" + n + ".png", function (t) {
                t.wrapS = e.RepeatWrapping,
                t.wrapT = e.RepeatWrapping,
                t.repeat.set(r.repeatX || 1, r.repeatY || 1),
                t.minFilter = e.NearestFilter,
                t.magFilter = e.NearestFilter,
                t.needsUpdate = !0;
                for (var o = 0; o < m[n].mats.length; ++o)
                    m[n].mats[o][i || "map"] = t, m[n].mats[o].needsUpdate = !0;
                m[n] = t
            })),
        t
    },
    this.getMat = function (t, n) {
        var r = (n && n.texSrc || t) + (n ? (n.rotation || "x") + (n.noFog || "y") + (n.opacity || "z") + (n.color || "b") + (n.ao || "a") + (n.emissive || "e") + (n.glowText || "g") + (void 0 != n.depthWrite ? n.depthWrite : "d") : ""),
        i = f[r];
        return i || (i = new((n = n || {}).mat ? n.mat : e.MeshLambertMaterial)(n), t && "default" != t && this.loadTexture(i, n.texSrc || t, n), n && n.emissive && this.loadTexture(i, (n.glowText && n.texSrc || t) + "_e", n, "emissiveMap"), n && n.ao && (this.loadTexture(i, t + "_ao", n, "aoMap"), i.aoMapIntensity = 1.3), n && n.normal && this.loadTexture(i, t + "_n", n, "normalMap"), "default" == t && (i.vertexColors = e.VertexColors), n && n.noFog && (i.fog = !1), f[r] = i),
        i
    },
    this.offsetMesh = function (t, e) {
        t.translateZ(e)
    },
    this.genColorCube = function (t, n, r, i, o) {
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
        return f = new e.Mesh(l, this.getMat("default")),
        this.scaleMesh(f, t, n, r),
        f
    };
    var E = {};
    this.genBody = function (t, n, r, i) {
        var s = E[t];
        if (!s) {
            s = new e.Geometry;
            var a = o.playerHeight - o.headScale - o.legHeight,
            c = this.genColorCube(o.chestWidth, a, o.chestScale, [t, .8, n, .2]);
            this.moveMesh(c, 0, a / 2, 0),
            this.merge(s, c);
            var l = this.genColorCube(o.headScale, o.headScale, o.headScale, [r, .2, i, .8]);
            this.moveMesh(l, 0, o.playerHeight - o.headScale / 2 - o.legHeight, 0),
            this.merge(s, l),
            E[t] = s
        }
        var h = new e.Mesh(s, this.getMat("default"));
        return h.receiveShadow = !0,
        h.noGreen = !0,
        h
    };
    var S = {};
    this.genLeg = function (t, n, r, i) {
        var s = o.legScale,
        a = null;
        if (i) {
            var c = n + "-" + (i || "");
            if (!(a = S[c])) {
                var l = o.legHeight / 2,
                h = s / 2,
                p = [.5, 2],
                u = this.genColorCube(s, l, s, [n, 1]);
                this.moveMesh(u, 0, -l / 2 * Math.cos(p[1]), -l / 2 * Math.sin(p[1])),
                this.rotateMesh(u, 0, p[1], 0);
                var d = Math.sqrt(h * h + h * h - 2 * h * h * Math.cos(p[0] - p[1])),
                f = 2 * Math.sqrt(h * h - d / 2 * (d / 2)),
                m = this.genColorCube(s, d, f, [n, 1]);
                this.moveMesh(m, 0, -l * Math.cos(p[1]), -l * Math.sin(p[1])),
                this.rotateMesh(m, 0, (p[1] + p[0]) / 2, 0);
                var g = this.genColorCube(s, l, s, [n, .5, r, .5]);
                this.moveMesh(g, 0, -l * Math.cos(p[1]) - l / 2 * Math.cos(p[0]), -l * Math.sin(p[1]) - l / 2 * Math.sin(p[0])),
                this.rotateMesh(g, 0, p[0], 0),
                a = new e.Geometry,
                this.merge(a, u),
                this.merge(a, m),
                this.merge(a, g),
                S[c] = a
            }
            a = new e.Mesh(a, this.getMat("default")),
            this.moveMesh(a, o.legScale / 2 * (t ? -1 : 1), o.legHeight - o.crouchDst + .5, 0)
        } else
            a = this.genColorCube(s, o.legHeight, s, [n, .75, r, .25],  - .5), this.moveMesh(a, o.legScale / 2 * (t ? -1 : 1), o.legHeight, 0);
        return a.receiveShadow = !0,
        a.noGreen = !0,
        a
    };
    var T = {};
    this.genArms = function (t, n, r, i, s, a) {
        var c = T[t.name + "-" + r + "-" + a + "-" + (s || 0)];
        if (!c) {
            c = new e.Geometry;
            var l = (-o.chestWidth + o.armScale / 2 - o.armInset) * (a ? t.holdW || .4 : 1);
            s && 1 != s || this.merge(c, this.genArm(l, o.armOff, t, !0, n, r, i, a)),
            s && 2 != s || this.merge(c, this.genArm(-l, o.armOff, t, !1, n, r, i, a)),
            T[t.name + "-" + r + "-" + a + "-" + (s || 0)] = c
        }
        return (c = new e.Mesh(c, this.getMat("default"))).noGreen = !0,
        c.receiveShadow = !0,
        c
    },
    this.genArm = function (t, n, r, s, a, c, l, h) {
        var p = s ? r.leftHoldY : r.rightHoldY,
        u = s ? r.leftHoldZ : r.rightHoldZ,
        d = s ? r.leftHoldX || 0 : r.rightHoldX || 0,
        f = o.armScale * (h ? .75 : 1),
        m = Math.min(o.uArmLength + o.lArmLength - .01, i.getDistance3D(t, n, 0, (r.xOff - d) * (s && r.akimbo ? -1 : 1), r.yOff + p, r.zOff - u)),
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
        this.moveMesh(S, t - r.xOff, n - r.yOff, -r.zOff),
        S.rotation.order = "YXZ",
        S.rotation.x = -g[1] - i.getDirection(0, n, r.zOff - u, r.yOff + p),
        S.rotation.y = i.getDirection(-t, 0, (s && r.akimbo ? 1 : -1) * (r.xOff - d), r.zOff - u) - Math.PI / 2,
        S
    },
    this.addCube = function (t, n, r, i, o, a, c, l) {
        l = l || {};
        var h = new e.Mesh(s.generateCube(c, i, o, a, l));
        return this.moveMesh(h, t, n, r),
        h.rotateY(l.xR || 0),
        h.rotateX(l.yR || 0),
        h.rotateZ(l.zR || 0),
        h.scale.set(i, o, a),
        l.src && !l.noGroup ? this.meshGroup(h, l) : this.add(h, l),
        h
    };
    var A = [];
    this.addSpray = function (t, n, r, s, a, c, h, p) {
        tmpObj = null;
        for (var u = 0; u < A.length; ++u)
            if (A[u].sid == t) {
                tmpObj = A[u];
                break
            }
        tmpObj || (tmpObj = new e.Mesh(l), tmpObj.sid = t, tmpObj.scale.set(o.sprayScale, o.sprayScale, 1), tmpObj.receiveShadow = !0, A.push(tmpObj), this.add(tmpObj)),
        this.moveMesh(tmpObj, r, s, a),
        tmpObj.rotation.y = i.toRad(c),
        tmpObj.rotation.x = i.toRad(h),
        tmpObj.material = this.getMat("sprays/" + n, {
                depthWrite: !1,
                opacity: p,
                transparent: !0
            })
    },
    this.clearSprays = function () {
        for (var t = 0; t < A.length; ++t)
            A[t] && A[t].material.map && A[t].material.map.dispose(), this.scene.remove(A[t]);
        A.length = 0
    },
    this.addPlane = function (t, n, r, i, o, a, c, l, h) {
        (a = a || {}).premultipliedAlpha = !0;
        var p = new e.Mesh(s.generatePlane(o, i, a));
        return a.euler && (p.eulerOrder = a.euler),
        this.moveMesh(p, t, n, r),
        p.rotateY(c || 0),
        p.rotateX((l || 0) - Math.PI / 2),
        p.rotateZ(h || 0),
        p.scale.set(2 * i, 2 * o, 1),
        a.dontAdd ? a.src && (p.material = this.getMat(a.src, a)) : a.src && !a.noGroup ? this.meshGroup(p, a, 1) : this.add(p, a),
        p
    },
    this.addRamp = function (t, n, r, i, o, a, c, l, h) {
        l = l || {};
        var p = new e.Mesh(s.generatePlane(2 * a, i, l));
        this.moveMesh(p, t, n + o / 2, r),
        a *= 2;
        var u = Math.sqrt(o * o + a * a);
        return p.scale.set(i, u, 2),
        p.rotateY(-Math.PI / 2 - c),
        p.rotateX(Math.asin(o / u) - Math.PI / 2),
        p.rotateZ(h || 0),
        l.src ? this.meshGroup(p, l, 1) : this.add(p, l),
        p
    };
    var L = [],
    C = [];
    this.loadMesh = function (t, n, r, i, o, s, a, l) {
        var h = this.getMat(t.src, t),
        p = L[t.src];
        if (p) {
            if (t.centerZ) {
                p.computeBoundingBox();
                var u = p.boundingBox.getCenter();
                a.translateZ(u.x * s)
            }
        } else
            p = l ? new e.Geometry : new e.BufferGeometry, L[t.src] = p, c.load("/models/" + t.src + ".obj", function (n) {
                if (n.children[0].geometry.computeVertexNormals(), p.copy(l ? (new e.Geometry).fromBufferGeometry(n.children[0].geometry) : n.children[0].geometry), t.uv2 && p.addAttribute("uv2", new e.BufferAttribute(p.attributes.uv.array, 2)), l) {
                    for (var r = new e.Geometry, i = 0; i < C[t.src].length; ++i)
                        g.merge(r, C[t.src][i]);
                    g.add(new e.Mesh(r, h), t),
                    C[t.src].loaded = !0
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
        g.moveMesh(d, n, r, i),
        g.scaleMesh(d, s || 1, s || 1, s || 1),
        l ? C[t.src] ? C[t.src].loaded ? this.meshGroup(d, t) : C[t.src].push(d) : C[t.src] = [d] : a.add(d)
    },
    this.genObj3D = function (t, n, r) {
        var i = new e.Object3D;
        return this.moveMesh(i, t || 0, n || 0, r || 0),
        i
    },
    this.merge = function (t, e, n) {
        e.updateMatrix(),
        t.merge(e.geometry, e.matrix, n)
    },
    this.meshGroup = function (t, n) {
        var r = n.src + "-" + (n.shadowsR || "a") + (n.emissive || "e") + (n.opacity || "o");
        v[r] || (v[r] = new e.Geometry, v[r].data = n),
        t.updateMatrix(),
        v[r].merge(t.geometry, t.matrix)
    },
    this.addMeshGroups = function () {
        for (var t in v)
            if (v.hasOwnProperty(t)) {
                var n = new e.Mesh((new e.BufferGeometry).fromGeometry(v[t]));
                n.groupSrc = v[t].data.src,
                n.visible = !R[n.groupSrc],
                n.matrixAutoUpdate = !1,
                this.add(n, v[t].data)
            }
        v = {}
    };
    var R = {};
    this.toggleMeshGroup = function (t, n) {
        R[t] = !n,
        this.scene && this.scene.traverse(function (r) {
            r instanceof e.Mesh && r.groupSrc == t && (r.visible = n)
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
    this.moveMesh = function (t, e, n, r) {
        void 0 != e && (t.position.x = e),
        void 0 != n && (t.position.y = n),
        void 0 != r && (t.position.z = r)
    },
    this.scaleMesh = function (t, e, n, r) {
        t.scale.set(e, n, r)
    },
    this.rotateMesh = function (t, e, n, r) {
        (e || 0 == e) && (t.rotation.y = e),
        (n || 0 == n) && (t.rotation.x = n),
        (r || 0 == r) && (t.rotation.z = r)
    }
},
module.exports.initScene = function (t) {
    if (r = t, t.ambient && (this.ambientLight = new o.AmbientLight(t.ambient), this.ambientLight.name = "ambLight", this.scene.getObjectByName("ambLight") || this.scene.add(this.ambientLight)), t.light) {
        this.skyLight = new o.DirectionalLight(t.light, 1.1),
        this.skyLight.name = "skyLight",
        this.scene.getObjectByName("skyLight") || this.scene.add(this.skyLight);
        var e =  - .3 * Math.PI,
        n = 2 * Math.PI *  - .25;
        this.skyLight.position.x = i.lightDistance * Math.cos(n),
        this.skyLight.position.y = i.lightDistance * Math.sin(n) * Math.sin(e),
        this.skyLight.position.z = i.lightDistance * Math.sin(n) * Math.cos(e),
        this.skyLight.castShadow = !0,
        this.skyLight.shadow.mapSize.width = i.shadowRes,
        this.skyLight.shadow.mapSize.height = i.shadowRes,
        this.skyLight.shadow.camera.far = i.shadowDst
    }
    this.scene.fog = new o.Fog(t.fog, 1, t.fogD),
    this.renderer.setClearColor(t.sky),
    this.useDepthMap && "0" != this.useDepthMap && this.toggleDepthMap(this.useDepthMap),
    this.greenScreen && this.toggleGreenscreen(this.greenScreen)
}