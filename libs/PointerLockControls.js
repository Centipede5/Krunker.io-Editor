module.exports = function (t) {
	return function (e) {
		var n = this;
		e.rotation.set(0, 0, 0);
		var r = new t.Object3D;
		r.add(e);
		var i = new t.Object3D;
		i.position.y = 10,
		i.add(r);
		var o = Math.PI / 2,
		s = function (t) {
			if (!1 !== n.enabled) {
				var e = t.movementX || t.mozMovementX || t.webkitMovementX || 0,
				s = t.movementY || t.mozMovementY || t.webkitMovementY || 0;
				i.rotation.y -= .002 * e,
				r.rotation.x -= .002 * s,
				r.rotation.x = Math.max(-o, Math.min(o, r.rotation.x))
			}
		};
		this.dispose = function () {
			document.removeEventListener("mousemove", s, !1)
		},
		document.addEventListener("mousemove", s, !1),
		this.enabled = !1,
		this.getObject = function () {
			return i
		},
		this.getDirection = function () {
			var e = new t.Vector3(0, 0, -1),
			n = new t.Euler(0, 0, 0, "YXZ");
			return function (t) {
				return n.set(r.rotation.x, i.rotation.y, 0),
				t.copy(e).applyEuler(n),
				t
			}
		}
		()
	}
}