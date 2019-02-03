module.exports = function (t) {
    return function () {
        "use strict";
        var e = function (e) {
            t.MeshBasicMaterial.call(this),
            this.depthTest = !1,
            this.depthWrite = !1,
            this.fog = !1,
            this.side = t.FrontSide,
            this.transparent = !0,
            this.setValues(e),
            this.oldColor = this.color.clone(),
            this.oldOpacity = this.opacity,
            this.highlight = function (t) {
                t ? (this.color.setRGB(1, 1, 0), this.opacity = 1) : (this.color.copy(this.oldColor), this.opacity = this.oldOpacity)
            }
        };
        (e.prototype = Object.create(t.MeshBasicMaterial.prototype)).constructor = e;
        var n = function (e) {
            t.LineBasicMaterial.call(this),
            this.depthTest = !1,
            this.depthWrite = !1,
            this.fog = !1,
            this.transparent = !0,
            this.linewidth = 1,
            this.setValues(e),
            this.oldColor = this.color.clone(),
            this.oldOpacity = this.opacity,
            this.highlight = function (t) {
                t ? (this.color.setRGB(1, 1, 0), this.opacity = 1) : (this.color.copy(this.oldColor), this.opacity = this.oldOpacity)
            }
        };
        (n.prototype = Object.create(t.LineBasicMaterial.prototype)).constructor = n;
        var r = new e({
                visible: !1,
                transparent: !1
            });
        t.TransformGizmo = function () {
            this.init = function () {
                t.Object3D.call(this),
                this.handles = new t.Object3D,
                this.pickers = new t.Object3D,
                this.planes = new t.Object3D,
                this.add(this.handles),
                this.add(this.pickers),
                this.add(this.planes);
                var e = new t.PlaneBufferGeometry(50, 50, 2, 2),
                n = new t.MeshBasicMaterial({
                        visible: !1,
                        side: t.DoubleSide
                    }),
                r = {
                    XY: new t.Mesh(e, n),
                    YZ: new t.Mesh(e, n),
                    XZ: new t.Mesh(e, n),
                    XYZE: new t.Mesh(e, n)
                };
                for (var i in this.activePlane = r.XYZE, r.YZ.rotation.set(0, Math.PI / 2, 0), r.XZ.rotation.set(-Math.PI / 2, 0, 0), r)
                    r[i].name = i, this.planes.add(r[i]), this.planes[i] = r[i];
                var o = function (t, e) {
                    for (var n in t)
                        for (i = t[n].length; i--; ) {
                            var r = t[n][i][0],
                            o = t[n][i][1],
                            s = t[n][i][2];
                            r.name = n,
                            r.renderOrder = 1 / 0,
                            o && r.position.set(o[0], o[1], o[2]),
                            s && r.rotation.set(s[0], s[1], s[2]),
                            e.add(r)
                        }
                };
                o(this.handleGizmos, this.handles),
                o(this.pickerGizmos, this.pickers),
                this.traverse(function (e) {
                    if (e instanceof t.Mesh) {
                        e.updateMatrix();
                        var n = e.geometry.clone();
                        n.applyMatrix(e.matrix),
                        e.geometry = n,
                        e.position.set(0, 0, 0),
                        e.rotation.set(0, 0, 0),
                        e.scale.set(1, 1, 1)
                    }
                })
            },
            this.highlight = function (t) {
                this.traverse(function (e) {
                    e.material && e.material.highlight && (e.name === t ? e.material.highlight(!0) : e.material.highlight(!1))
                })
            }
        },
        t.TransformGizmo.prototype = Object.create(t.Object3D.prototype),
        t.TransformGizmo.prototype.constructor = t.TransformGizmo,
        t.TransformGizmo.prototype.update = function (e, n) {
            var r = new t.Vector3(0, 0, 0),
            i = new t.Vector3(0, 1, 0),
            o = new t.Matrix4;
            this.traverse(function (t) {
                -1 !== t.name.search("E") ? t.quaternion.setFromRotationMatrix(o.lookAt(n, r, i)) : -1 === t.name.search("X") && -1 === t.name.search("Y") && -1 === t.name.search("Z") || t.quaternion.setFromEuler(e)
            })
        },
        t.TransformGizmoTranslate = function () {
            t.TransformGizmo.call(this);
            var i = new t.ConeBufferGeometry(.05, .2, 12, 1, !1);
            i.translate(0, .5, 0);
            var o = new t.BufferGeometry;
            o.addAttribute("position", new t.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));
            var s = new t.BufferGeometry;
            s.addAttribute("position", new t.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));
            var a = new t.BufferGeometry;
            a.addAttribute("position", new t.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3)),
            this.handleGizmos = {
                X: [[new t.Mesh(i, new e({
                                color: 16711680
                            })), [.5, 0, 0], [0, 0, -Math.PI / 2]], [new t.Line(o, new n({
                                color: 16711680
                            }))]],
                Y: [[new t.Mesh(i, new e({
                                color: 65280
                            })), [0, .5, 0]], [new t.Line(s, new n({
                                color: 65280
                            }))]],
                Z: [[new t.Mesh(i, new e({
                                color: 255
                            })), [0, 0, .5], [Math.PI / 2, 0, 0]], [new t.Line(a, new n({
                                color: 255
                            }))]],
                XYZ: [[new t.Mesh(new t.OctahedronGeometry(.1, 0), new e({
                                color: 16777215,
                                opacity: .25
                            })), [0, 0, 0], [0, 0, 0]]],
                XY: [[new t.Mesh(new t.PlaneBufferGeometry(.29, .29), new e({
                                color: 16776960,
                                opacity: .25
                            })), [.15, .15, 0]]],
                YZ: [[new t.Mesh(new t.PlaneBufferGeometry(.29, .29), new e({
                                color: 65535,
                                opacity: .25
                            })), [0, .15, .15], [0, Math.PI / 2, 0]]],
                XZ: [[new t.Mesh(new t.PlaneBufferGeometry(.29, .29), new e({
                                color: 16711935,
                                opacity: .25
                            })), [.15, 0, .15], [-Math.PI / 2, 0, 0]]]
            },
            this.pickerGizmos = {
                X: [[new t.Mesh(new t.CylinderBufferGeometry(.2, 0, 1, 4, 1, !1), r), [.6, 0, 0], [0, 0, -Math.PI / 2]]],
                Y: [[new t.Mesh(new t.CylinderBufferGeometry(.2, 0, 1, 4, 1, !1), r), [0, .6, 0]]],
                Z: [[new t.Mesh(new t.CylinderBufferGeometry(.2, 0, 1, 4, 1, !1), r), [0, 0, .6], [Math.PI / 2, 0, 0]]],
                XYZ: [[new t.Mesh(new t.OctahedronGeometry(.2, 0), r)]],
                XY: [[new t.Mesh(new t.PlaneBufferGeometry(.4, .4), r), [.2, .2, 0]]],
                YZ: [[new t.Mesh(new t.PlaneBufferGeometry(.4, .4), r), [0, .2, .2], [0, Math.PI / 2, 0]]],
                XZ: [[new t.Mesh(new t.PlaneBufferGeometry(.4, .4), r), [.2, 0, .2], [-Math.PI / 2, 0, 0]]]
            },
            this.setActivePlane = function (e, n) {
                var r = new t.Matrix4;
                n.applyMatrix4(r.getInverse(r.extractRotation(this.planes.XY.matrixWorld))),
                "X" === e && (this.activePlane = this.planes.XY, Math.abs(n.y) > Math.abs(n.z) && (this.activePlane = this.planes.XZ)),
                "Y" === e && (this.activePlane = this.planes.XY, Math.abs(n.x) > Math.abs(n.z) && (this.activePlane = this.planes.YZ)),
                "Z" === e && (this.activePlane = this.planes.XZ, Math.abs(n.x) > Math.abs(n.y) && (this.activePlane = this.planes.YZ)),
                "XYZ" === e && (this.activePlane = this.planes.XYZE),
                "XY" === e && (this.activePlane = this.planes.XY),
                "YZ" === e && (this.activePlane = this.planes.YZ),
                "XZ" === e && (this.activePlane = this.planes.XZ)
            },
            this.init()
        },
        t.TransformGizmoTranslate.prototype = Object.create(t.TransformGizmo.prototype),
        t.TransformGizmoTranslate.prototype.constructor = t.TransformGizmoTranslate,
        t.TransformGizmoRotate = function () {
            t.TransformGizmo.call(this);
            var e = function (e, n, r) {
                var i = new t.BufferGeometry,
                o = [];
                r = r || 1;
                for (var s = 0; s <= 64 * r; ++s)
                    "x" === n && o.push(0, Math.cos(s / 32 * Math.PI) * e, Math.sin(s / 32 * Math.PI) * e), "y" === n && o.push(Math.cos(s / 32 * Math.PI) * e, 0, Math.sin(s / 32 * Math.PI) * e), "z" === n && o.push(Math.sin(s / 32 * Math.PI) * e, Math.cos(s / 32 * Math.PI) * e, 0);
                return i.addAttribute("position", new t.Float32BufferAttribute(o, 3)),
                i
            };
            this.handleGizmos = {
                X: [[new t.Line(new e(1, "x", .5), new n({
                                color: 16711680
                            }))]],
                Y: [[new t.Line(new e(1, "y", .5), new n({
                                color: 65280
                            }))]],
                Z: [[new t.Line(new e(1, "z", .5), new n({
                                color: 255
                            }))]],
                E: [[new t.Line(new e(1.25, "z", 1), new n({
                                color: 13421568
                            }))]],
                XYZE: [[new t.Line(new e(1, "z", 1), new n({
                                color: 7895160
                            }))]]
            },
            this.pickerGizmos = {
                X: [[new t.Mesh(new t.TorusBufferGeometry(1, .12, 4, 12, Math.PI), r), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]],
                Y: [[new t.Mesh(new t.TorusBufferGeometry(1, .12, 4, 12, Math.PI), r), [0, 0, 0], [Math.PI / 2, 0, 0]]],
                Z: [[new t.Mesh(new t.TorusBufferGeometry(1, .12, 4, 12, Math.PI), r), [0, 0, 0], [0, 0, -Math.PI / 2]]],
                E: [[new t.Mesh(new t.TorusBufferGeometry(1.25, .12, 2, 24), r)]],
                XYZE: [[new t.Mesh(new t.TorusBufferGeometry(1, .12, 2, 24), r)]]
            },
            this.pickerGizmos.XYZE[0][0].visible = !1,
            this.setActivePlane = function (t) {
                "E" === t && (this.activePlane = this.planes.XYZE),
                "X" === t && (this.activePlane = this.planes.YZ),
                "Y" === t && (this.activePlane = this.planes.XZ),
                "Z" === t && (this.activePlane = this.planes.XY)
            },
            this.update = function (e, n) {
                t.TransformGizmo.prototype.update.apply(this, arguments);
                var r = new t.Matrix4,
                i = new t.Euler(0, 0, 1),
                o = new t.Quaternion,
                s = new t.Vector3(1, 0, 0),
                a = new t.Vector3(0, 1, 0),
                c = new t.Vector3(0, 0, 1),
                l = new t.Quaternion,
                h = new t.Quaternion,
                p = new t.Quaternion,
                u = n.clone();
                i.copy(this.planes.XY.rotation),
                o.setFromEuler(i),
                r.makeRotationFromQuaternion(o).getInverse(r),
                u.applyMatrix4(r),
                this.traverse(function (t) {
                    o.setFromEuler(i),
                    "X" === t.name && (l.setFromAxisAngle(s, Math.atan2(-u.y, u.z)), o.multiplyQuaternions(o, l), t.quaternion.copy(o)),
                    "Y" === t.name && (h.setFromAxisAngle(a, Math.atan2(u.x, u.z)), o.multiplyQuaternions(o, h), t.quaternion.copy(o)),
                    "Z" === t.name && (p.setFromAxisAngle(c, Math.atan2(u.y, u.x)), o.multiplyQuaternions(o, p), t.quaternion.copy(o))
                })
            },
            this.init()
        },
        t.TransformGizmoRotate.prototype = Object.create(t.TransformGizmo.prototype),
        t.TransformGizmoRotate.prototype.constructor = t.TransformGizmoRotate,
        t.TransformGizmoScale = function () {
            t.TransformGizmo.call(this);
            var i = new t.BoxBufferGeometry(.125, .125, .125);
            i.translate(0, .5, 0);
            var o = new t.BufferGeometry;
            o.addAttribute("position", new t.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));
            var s = new t.BufferGeometry;
            s.addAttribute("position", new t.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));
            var a = new t.BufferGeometry;
            a.addAttribute("position", new t.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3)),
            this.handleGizmos = {
                X: [[new t.Mesh(i, new e({
                                color: 16711680
                            })), [.5, 0, 0], [0, 0, -Math.PI / 2]], [new t.Line(o, new n({
                                color: 16711680
                            }))]],
                Y: [[new t.Mesh(i, new e({
                                color: 65280
                            })), [0, .5, 0]], [new t.Line(s, new n({
                                color: 65280
                            }))]],
                Z: [[new t.Mesh(i, new e({
                                color: 255
                            })), [0, 0, .5], [Math.PI / 2, 0, 0]], [new t.Line(a, new n({
                                color: 255
                            }))]],
                XYZ: [[new t.Mesh(new t.BoxBufferGeometry(.125, .125, .125), new e({
                                color: 16777215,
                                opacity: .25
                            }))]]
            },
            this.pickerGizmos = {
                X: [[new t.Mesh(new t.CylinderBufferGeometry(.2, 0, 1, 4, 1, !1), r), [.6, 0, 0], [0, 0, -Math.PI / 2]]],
                Y: [[new t.Mesh(new t.CylinderBufferGeometry(.2, 0, 1, 4, 1, !1), r), [0, .6, 0]]],
                Z: [[new t.Mesh(new t.CylinderBufferGeometry(.2, 0, 1, 4, 1, !1), r), [0, 0, .6], [Math.PI / 2, 0, 0]]],
                XYZ: [[new t.Mesh(new t.BoxBufferGeometry(.4, .4, .4), r)]]
            },
            this.setActivePlane = function (e, n) {
                var r = new t.Matrix4;
                n.applyMatrix4(r.getInverse(r.extractRotation(this.planes.XY.matrixWorld))),
                "X" === e && (this.activePlane = this.planes.XY, Math.abs(n.y) > Math.abs(n.z) && (this.activePlane = this.planes.XZ)),
                "Y" === e && (this.activePlane = this.planes.XY, Math.abs(n.x) > Math.abs(n.z) && (this.activePlane = this.planes.YZ)),
                "Z" === e && (this.activePlane = this.planes.XZ, Math.abs(n.x) > Math.abs(n.y) && (this.activePlane = this.planes.YZ)),
                "XYZ" === e && (this.activePlane = this.planes.XYZE)
            },
            this.init()
        },
        t.TransformGizmoScale.prototype = Object.create(t.TransformGizmo.prototype),
        t.TransformGizmoScale.prototype.constructor = t.TransformGizmoScale,
        t.TransformControls = function (e, n) {
            t.Object3D.call(this),
            n = void 0 !== n ? n : document,
            this.object = void 0,
            this.visible = !1,
            this.translationSnap = null,
            this.rotationSnap = null,
            this.space = "world",
            this.size = 1,
            this.axis = null;
            var r = this,
            i = "translate",
            o = !1,
            s = {
                translate: new t.TransformGizmoTranslate,
                rotate: new t.TransformGizmoRotate,
                scale: new t.TransformGizmoScale
            };
            for (var a in s) {
                var c = s[a];
                c.visible = a === i,
                this.add(c)
            }
            var l = {
                type: "change"
            },
            h = {
                type: "mouseDown"
            },
            p = {
                type: "mouseUp",
                mode: i
            },
            u = {
                type: "objectChange"
            },
            d = new t.Raycaster,
            f = new t.Vector2,
            m = new t.Vector3,
            g = new t.Vector3,
            v = new t.Vector3,
            y = new t.Vector3,
            x = 1,
            b = new t.Matrix4,
            w = new t.Vector3,
            M = new t.Matrix4,
            _ = new t.Vector3,
            E = new t.Quaternion,
            S = new t.Vector3(1, 0, 0),
            T = new t.Vector3(0, 1, 0),
            A = new t.Vector3(0, 0, 1),
            L = new t.Quaternion,
            C = new t.Quaternion,
            R = new t.Quaternion,
            P = new t.Quaternion,
            I = new t.Quaternion,
            O = new t.Vector3,
            N = new t.Vector3,
            D = new t.Matrix4,
            U = new t.Matrix4,
            B = new t.Vector3,
            z = new t.Vector3,
            F = new t.Euler,
            G = new t.Matrix4,
            H = new t.Vector3,
            j = new t.Euler;
            function k(t) {
                if (void 0 !== r.object && !0 !== o && (void 0 === t.button || 0 === t.button)) {
                    var e = Y(t.changedTouches ? t.changedTouches[0] : t, s[i].pickers.children),
                    n = null;
                    e && (n = e.object.name, t.preventDefault()),
                    r.axis !== n && (r.axis = n, r.update(), r.dispatchEvent(l))
                }
            }
            function V(t) {
                if (void 0 !== r.object && !0 !== o && (void 0 === t.button || 0 === t.button)) {
                    var e = t.changedTouches ? t.changedTouches[0] : t;
                    if (0 === e.button || void 0 === e.button) {
                        var n = Y(e, s[i].pickers.children);
                        if (n) {
                            t.preventDefault(),
                            t.stopPropagation(),
                            r.axis = n.object.name,
                            r.dispatchEvent(h),
                            r.update(),
                            w.copy(H).sub(z).normalize(),
                            s[i].setActivePlane(r.axis, w);
                            var a = Y(e, [s[i].activePlane]);
                            a && (O.copy(r.object.position), N.copy(r.object.scale), D.extractRotation(r.object.matrix), G.extractRotation(r.object.matrixWorld), U.extractRotation(r.object.parent.matrixWorld), B.setFromMatrixScale(M.getInverse(r.object.parent.matrixWorld)), g.copy(a.point))
                        }
                    }
                    o = !0
                }
            }
            function W(t) {
                if (void 0 !== r.object && null !== r.axis && !1 !== o && (void 0 === t.button || 0 === t.button)) {
                    var e = Y(t.changedTouches ? t.changedTouches[0] : t, [s[i].activePlane]);
                    !1 !== e && (t.preventDefault(), t.stopPropagation(), m.copy(e.point), "translate" === i ? (m.sub(g), m.multiply(B), "local" === r.space && (m.applyMatrix4(M.getInverse(G)), -1 === r.axis.search("X") && (m.x = 0), -1 === r.axis.search("Y") && (m.y = 0), -1 === r.axis.search("Z") && (m.z = 0), m.applyMatrix4(D), r.object.position.copy(O), r.object.position.add(m)), "world" !== r.space && -1 === r.axis.search("XYZ") || (-1 === r.axis.search("X") && (m.x = 0), -1 === r.axis.search("Y") && (m.y = 0), -1 === r.axis.search("Z") && (m.z = 0), m.applyMatrix4(M.getInverse(U)), r.object.position.copy(O), r.object.position.add(m)), null !== r.translationSnap && ("local" === r.space && r.object.position.applyMatrix4(M.getInverse(G)), -1 !== r.axis.search("X") && (r.object.position.x = Math.round(r.object.position.x / r.translationSnap) * r.translationSnap), -1 !== r.axis.search("Y") && (r.object.position.y = Math.round(r.object.position.y / r.translationSnap) * r.translationSnap), -1 !== r.axis.search("Z") && (r.object.position.z = Math.round(r.object.position.z / r.translationSnap) * r.translationSnap), "local" === r.space && r.object.position.applyMatrix4(G))) : "scale" === i ? (m.sub(g), m.multiply(B), "local" === r.space && ("XYZ" === r.axis ? (x = 1 + m.y / Math.max(N.x, N.y, N.z), r.object.scale.x = N.x * x, r.object.scale.y = N.y * x, r.object.scale.z = N.z * x) : (m.applyMatrix4(M.getInverse(G)), "X" === r.axis && (r.object.scale.x = N.x * (1 + m.x / N.x)), "Y" === r.axis && (r.object.scale.y = N.y * (1 + m.y / N.y)), "Z" === r.axis && (r.object.scale.z = N.z * (1 + m.z / N.z))))) : "rotate" === i && (m.sub(z), m.multiply(B), _.copy(g).sub(z), _.multiply(B), "E" === r.axis ? (m.applyMatrix4(M.getInverse(b)), _.applyMatrix4(M.getInverse(b)), v.set(Math.atan2(m.z, m.y), Math.atan2(m.x, m.z), Math.atan2(m.y, m.x)), y.set(Math.atan2(_.z, _.y), Math.atan2(_.x, _.z), Math.atan2(_.y, _.x)), E.setFromRotationMatrix(M.getInverse(U)), I.setFromAxisAngle(w, v.z - y.z), L.setFromRotationMatrix(G), E.multiplyQuaternions(E, I), E.multiplyQuaternions(E, L), r.object.quaternion.copy(E)) : "XYZE" === r.axis ? (I.setFromEuler(m.clone().cross(_).normalize()), E.setFromRotationMatrix(M.getInverse(U)), C.setFromAxisAngle(I, -m.clone().angleTo(_)), L.setFromRotationMatrix(G), E.multiplyQuaternions(E, C), E.multiplyQuaternions(E, L), r.object.quaternion.copy(E)) : "local" === r.space ? (m.applyMatrix4(M.getInverse(G)), _.applyMatrix4(M.getInverse(G)), v.set(Math.atan2(m.z, m.y), Math.atan2(m.x, m.z), Math.atan2(m.y, m.x)), y.set(Math.atan2(_.z, _.y), Math.atan2(_.x, _.z), Math.atan2(_.y, _.x)), L.setFromRotationMatrix(D), null !== r.rotationSnap ? (C.setFromAxisAngle(S, Math.round((v.x - y.x) / r.rotationSnap) * r.rotationSnap), R.setFromAxisAngle(T, Math.round((v.y - y.y) / r.rotationSnap) * r.rotationSnap), P.setFromAxisAngle(A, Math.round((v.z - y.z) / r.rotationSnap) * r.rotationSnap)) : (C.setFromAxisAngle(S, v.x - y.x), R.setFromAxisAngle(T, v.y - y.y), P.setFromAxisAngle(A, v.z - y.z)), "X" === r.axis && L.multiplyQuaternions(L, C), "Y" === r.axis && L.multiplyQuaternions(L, R), "Z" === r.axis && L.multiplyQuaternions(L, P), r.object.quaternion.copy(L)) : "world" === r.space && (v.set(Math.atan2(m.z, m.y), Math.atan2(m.x, m.z), Math.atan2(m.y, m.x)), y.set(Math.atan2(_.z, _.y), Math.atan2(_.x, _.z), Math.atan2(_.y, _.x)), E.setFromRotationMatrix(M.getInverse(U)), null !== r.rotationSnap ? (C.setFromAxisAngle(S, Math.round((v.x - y.x) / r.rotationSnap) * r.rotationSnap), R.setFromAxisAngle(T, Math.round((v.y - y.y) / r.rotationSnap) * r.rotationSnap), P.setFromAxisAngle(A, Math.round((v.z - y.z) / r.rotationSnap) * r.rotationSnap)) : (C.setFromAxisAngle(S, v.x - y.x), R.setFromAxisAngle(T, v.y - y.y), P.setFromAxisAngle(A, v.z - y.z)), L.setFromRotationMatrix(G), "X" === r.axis && E.multiplyQuaternions(E, C), "Y" === r.axis && E.multiplyQuaternions(E, R), "Z" === r.axis && E.multiplyQuaternions(E, P), E.multiplyQuaternions(E, L), r.object.quaternion.copy(E))), r.update(), r.dispatchEvent(l), r.dispatchEvent(u))
                }
            }
            function X(t) {
                t.preventDefault(),
                void 0 !== t.button && 0 !== t.button || (o && null !== r.axis && (p.mode = i, r.dispatchEvent(p)), o = !1, "TouchEvent" in window && t instanceof TouchEvent ? (r.axis = null, r.update(), r.dispatchEvent(l)) : k(t))
            }
            function Y(t, r) {
                var i = n.getBoundingClientRect(),
                o = (t.clientX - i.left) / i.width,
                s = (t.clientY - i.top) / i.height;
                f.set(2 * o - 1, -2 * s + 1),
                d.setFromCamera(f, e);
                var a = d.intersectObjects(r, !0);
                return !!a[0] && a[0]
            }
            n.addEventListener("mousedown", V, !1),
            n.addEventListener("touchstart", V, !1),
            n.addEventListener("mousemove", k, !1),
            n.addEventListener("touchmove", k, !1),
            n.addEventListener("mousemove", W, !1),
            n.addEventListener("touchmove", W, !1),
            n.addEventListener("mouseup", X, !1),
            n.addEventListener("mouseout", X, !1),
            n.addEventListener("touchend", X, !1),
            n.addEventListener("touchcancel", X, !1),
            n.addEventListener("touchleave", X, !1),
            this.dispose = function () {
                n.removeEventListener("mousedown", V),
                n.removeEventListener("touchstart", V),
                n.removeEventListener("mousemove", k),
                n.removeEventListener("touchmove", k),
                n.removeEventListener("mousemove", W),
                n.removeEventListener("touchmove", W),
                n.removeEventListener("mouseup", X),
                n.removeEventListener("mouseout", X),
                n.removeEventListener("touchend", X),
                n.removeEventListener("touchcancel", X),
                n.removeEventListener("touchleave", X)
            },
            this.attach = function (t) {
                this.object = t,
                this.visible = !0,
                this.update()
            },
            this.detach = function () {
                this.object = void 0,
                this.visible = !1,
                this.axis = null
            },
            this.getMode = function () {
                return i
            },
            this.setMode = function (t) {
                for (var e in "scale" === (i = t || i) && (r.space = "local"), s)
                    s[e].visible = e === i;
                this.update(),
                r.dispatchEvent(l)
            },
            this.setTranslationSnap = function (t) {
                r.translationSnap = t
            },
            this.setRotationSnap = function (t) {
                r.rotationSnap = t
            },
            this.setSize = function (t) {
                r.size = t,
                this.update(),
                r.dispatchEvent(l)
            },
            this.setSpace = function (t) {
                r.space = t,
                this.update(),
                r.dispatchEvent(l)
            },
            this.update = function () {
                void 0 !== r.object && (r.object.updateMatrixWorld(), z.setFromMatrixPosition(r.object.matrixWorld), F.setFromRotationMatrix(M.extractRotation(r.object.matrixWorld)), e.updateMatrixWorld(), H.setFromMatrixPosition(e.matrixWorld), j.setFromRotationMatrix(M.extractRotation(e.matrixWorld)), x = z.distanceTo(H) / 6 * r.size, this.position.copy(z), this.scale.set(x, x, x), e instanceof t.PerspectiveCamera ? w.copy(H).sub(z).normalize() : e instanceof t.OrthographicCamera && w.copy(H).normalize(), "local" === r.space ? s[i].update(F, w) : "world" === r.space && s[i].update(new t.Euler, w), s[i].highlight(r.axis))
            }
        },
        t.TransformControls.prototype = Object.create(t.Object3D.prototype),
        t.TransformControls.prototype.constructor = t.TransformControls
    }
    ()
}