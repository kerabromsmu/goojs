define([
	'goo/physicspack/PhysicsSystem',
	'goo/physicspack/ammo/AmmoRigidbody'
],
/** @lends */
function (
	PhysicsSystem,
	AmmoRigidbody
) {
	'use strict';

	/* global Ammo */

	var tmpVec1;
	var tmpVec2;

	/**
	 * @class
	 * @extends PhysicsSystem
	 */
	function AmmoPhysicsSystem(settings) {
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();

		/**
		 * @type {Ammo.btDiscreteDynamicsWorld}
		 */
		this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);

		/**
		 * Maps Ammo pointers to entities
		 * @private
		 * @type {Object}
		 */
		this._entities = {};

		if (!tmpVec1) {
			tmpVec1	= new Ammo.btVector3();
			tmpVec2	= new Ammo.btVector3();
		}

		PhysicsSystem.call(this, settings);
	}
	AmmoPhysicsSystem.prototype = Object.create(PhysicsSystem.prototype);

	AmmoPhysicsSystem.prototype.raycastAll = function (start, end, mask, callback) {
		// TODO
	};
	AmmoPhysicsSystem.prototype.raycastFirst = function (start, end, mask, result) {
		// TODO
	};
	AmmoPhysicsSystem.prototype.raycastClosest = function (start, end, mask, result) {
		start.setValue(start.x, start.y, start.z);
		end.setValue(end.x, end.y, end.z);

		var rayCallback = new Ammo.ClosestRayResultCallback(start, end);
		//rayCallback.set_m_

		this.world.rayTest(start, end, rayCallback);

		var hit = false;
		if (rayCallback.hasHit()) {
			var collisionObj = rayCallback.get_m_collisionObject();
			var body = Ammo.castObject(collisionObj, Ammo.btRigidBody);
			var point = rayCallback.get_m_hitPointWorld();
			var normal = rayCallback.get_m_hitNormalWorld();

			if (body) {
				result.entity = this._entities[body.a || body.ptr];
				result.point.setDirect(point.x(), point.y(), point.z());
				result.normal.setDirect(normal.x(), normal.y(), normal.z());
				hit = true;
			}
		}

		Ammo.destroy(rayCallback);

		return hit;
	};

	AmmoPhysicsSystem.prototype.setGravity = function (gravityVector) {
		var g = new Ammo.btVector3(gravityVector.x, gravityVector.y, gravityVector.z);
		this.world.setGravity(g);
		Ammo.destroy(g);
	};

	AmmoPhysicsSystem.prototype.addBody = function (entity) {
		entity.rigidbodyComponent.rigidbody = new AmmoRigidbody(entity, this);
	};

	AmmoPhysicsSystem.prototype.step = function (tpf) {
		var world = this.world;

		// Step the world forward in time
		var fixedTimeStep = 1 / this.stepFrequency;
		var maxSubSteps = this.maxSubSteps;
		world.stepSimulation(tpf, maxSubSteps, fixedTimeStep);

		// TODO: Update kinematic bodies etc

		this.emitContactEvents();
	};

	AmmoPhysicsSystem.prototype.emitContactEvents = function () {
		// Get overlapping entities
		var dp = this.world.getDispatcher(),
			num = dp.getNumManifolds(),
			entities = this._entities;

		this._swapContactLists();
		for (var i = 0; i !== num; i++) {
			var manifold = dp.getManifoldByIndexInternal(i);

			var numContacts = manifold.getNumContacts();
			if (numContacts === 0) {
				continue;
			}

			var ptrA = manifold.getBody0();
			var ptrB = manifold.getBody1();
			var entityA = entities[ptrA];
			var entityB = entities[ptrB];

			if (ptrA > ptrB) {
				var tmp = entityA;
				entityA = entityB;
				entityB = tmp;
			}

			if (this._inContactLastStepA.indexOf(entityA) !== -1) {
				this.emitBeginContact(entityA, entityB);
			} else {
				this.emitDuringContact(entityA, entityB);
			}

			this._inContactCurrentStepA.push(entityA);
			this._inContactCurrentStepB.push(entityB);
		}

		// Emit end contact events
		for (var i = 0; i !== this._inContactLastStepA.length; i++) {
			var entityA = this._inContactLastStepA;
			var entityB = this._inContactLastStepB;

			var found = false;
			for (var j = 0; j !== this._inContactCurrentStepA.length; j++) {
				if (entityA === this._inContactLastStepA[i] && entityB === this._inContactLastStepB[i]) {
					found = true;
					break;
				}
			}
			if (!found) {
				this.emitEndContact(entityA, entityB);
			}
		}
	};

	return AmmoPhysicsSystem;
});