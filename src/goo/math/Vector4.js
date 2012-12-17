define(["goo/math/Vector"], function(Vector) {
	"use strict";

	Vector4.prototype = Object.create(Vector.prototype);
	Vector4.prototype.setupAliases([['x', 'r'], ['y', 'g'], ['z', 'b'], ['w', 'a']]);

	/* ====================================================================== */

	/**
	 * @name Vector4
	 * @class Vector with 4 components.
	 * @extends Vector
	 * @constructor
	 * @description Creates a new vector.
	 * @param {Vector4|Float[]|Float...} arguments Initial values for the components.
	 */

	function Vector4() {
		Vector.call(this, 4);
		var init = arguments.length !== 0 ? arguments : [0, 0, 0, 0];
		this.set(init);
	}

	/* ====================================================================== */

	Vector4.ZERO = new Vector4(0, 0, 0, 0);
	Vector4.ONE = new Vector4(1, 1, 1, 1);
	Vector4.UNIT_X = new Vector4(1, 0, 0, 0);
	Vector4.UNIT_Y = new Vector4(0, 1, 0, 0);
	Vector4.UNIT_Z = new Vector4(0, 0, 1, 0);
	Vector4.UNIT_W = new Vector4(0, 0, 0, 1);

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise addition and stores the result in a separate vector. Equivalent of "return (target = lhs + rhs);".
	 * @param {Vector4|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector4.add = function(lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 4 || rdata.length !== 4) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] + rdata[0];
		target.data[1] = ldata[1] + rdata[1];
		target.data[2] = ldata[2] + rdata[2];
		target.data[3] = ldata[3] + rdata[3];

		return target;
	};

	/**
	 * @description Performs a component-wise addition and stores the result locally. Equivalent of "return (this = this + rhs);".
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector4} Self for chaining.
	 */

	Vector4.prototype.add = function(rhs) {
		return Vector4.add(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise subtraction and stores the result in a separate vector. Equivalent of "return (target = lhs - rhs);".
	 * @param {Vector4|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector4.sub = function(lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 4 || rdata.length !== 4) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] - rdata[0];
		target.data[1] = ldata[1] - rdata[1];
		target.data[2] = ldata[2] - rdata[2];
		target.data[3] = ldata[3] - rdata[3];

		return target;
	};

	/**
	 * @description Performs a component-wise subtraction and stores the result locally. Equivalent of "return (this = this - rhs);".
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector4} Self for chaining.
	 */

	Vector4.prototype.sub = function(rhs) {
		return Vector4.sub(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise multiplication and stores the result in a separate vector. Equivalent of "return (target = lhs * rhs);".
	 * @param {Vector4|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector4.mul = function(lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 4 || rdata.length !== 4) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] * rdata[0];
		target.data[1] = ldata[1] * rdata[1];
		target.data[2] = ldata[2] * rdata[2];
		target.data[3] = ldata[3] * rdata[3];

		return target;
	};

	/**
	 * @description Performs a component-wise multiplication and stores the result locally. Equivalent of "return (this = this * rhs);".
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector4} Self for chaining.
	 */

	Vector4.prototype.mul = function(rhs) {
		return Vector4.mul(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @static
	 * @description Performs a component-wise division and stores the result in a separate vector. Equivalent of "return (target = lhs / rhs);".
	 * @param {Vector4|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4} [target] Target vector for storage.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Vector4} A new vector if the target vector is omitted, else the target vector.
	 */

	Vector4.div = function(lhs, rhs, target) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs, rhs];
		}

		if (!target) {
			target = new Vector4();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 4 || rdata.length !== 4) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		target.data[0] = ldata[0] / rdata[0];
		target.data[1] = ldata[1] / rdata[1];
		target.data[2] = ldata[2] / rdata[2];
		target.data[3] = ldata[3] / rdata[3];

		return target;
	};

	/**
	 * @description Performs a component-wise division and stores the result locally. Equivalent of "return (this = this / rhs);".
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Vector4} Self for chaining.
	 */

	Vector4.prototype.div = function(rhs) {
		return Vector4.div(this, rhs, this);
	};

	/* ====================================================================== */

	/**
	 * @description Computes the dot product between two vectors. Equivalent of "return lhs•rhs;".
	 * @param {Vector4|Float[]|Float} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @throws {Illegal Arguments} If the arguments are of incompatible sizes.
	 * @return {Float} Dot product.
	 */

	Vector4.dot = function(lhs, rhs) {
		if (typeof (lhs) === "number") {
			lhs = [lhs, lhs, lhs, lhs];
		}

		if (typeof (rhs) === "number") {
			rhs = [rhs, rhs, rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		if (ldata.length !== 4 || rdata.length !== 4) {
			throw {
				name : "Illegal Arguments",
				message : "The arguments are of incompatible sizes."
			};
		}

		var sum = 0.0;

		sum += ldata[0] * rdata[0];
		sum += ldata[1] * rdata[1];
		sum += ldata[2] * rdata[2];
		sum += ldata[3] * rdata[3];

		return sum;
	};

	/**
	 * @description Computes the dot product between two vectors. Equivalent of "return this•rhs;".
	 * @param {Vector4|Float[]|Float} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @return {Float} Dot product.
	 */

	Vector4.prototype.dot = function(rhs) {
		return Vector4.dot(this, rhs);
	};

	/* ====================================================================== */

	return Vector4;
});
