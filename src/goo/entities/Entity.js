define([
	'goo/math/Transform',
	'goo/entities/components/Component'
],
/** @lends */

function(
	Transform,
	Component
) {
	"use strict";

	/**
	 * @class A gameworld object and container of components
	 * @param {World} world A {@link World} reference
	 * @param {String} [name] Entity name
	 */

	function Entity(world, name) {
		this._world = world;
		this._components = [];

		Object.defineProperty(this, 'id', {
			value: Entity.entityCount++,
			writable: false
		});
		this.name = name !== undefined ? name : 'Entity_' + this.id;

		/** Parent transformcomponent in the "scene graph"
		 * @type {TransformComponent}
		 * @default
		 */
		this.parent = null;
		/**
		 * Child transformcomponents in the "scenegraph"
		 * @type {TransformComponent[]}
		 */
		this.children = [];

		/** @type {Transform} */
		this.transform = new Transform();

		/** The entity's transform in world space.
		 * Read only. Automatically updated.
		 * @type {Transform} */
		this.worldTransform = new Transform();

		this._dirty = true;
		this._updated = false;

		/** Set to true to skip rendering (move to meshrenderercomponent)
		 * @type {boolean}
		 * @default false
		 */
		this.skip = false;

		this.hidden = false;
	}

	/**
	 * Add the entity to the world, making it active and processed by systems and managers.
	 * @param {boolean} [recursive=true] Add children recursively
	 */
	Entity.prototype.addToWorld = function(recursive) {
		this._world.addEntity(this, recursive);
	};

	/**
	 * Remove entity from the world.
	 * @param {boolean} [recursive=true] Remove children recursively
	 */
	Entity.prototype.removeFromWorld = function(recursive) {
		this._world.removeEntity(this, recursive);
	};

	function getTypeAttributeName(type) {
		return type.charAt(0).toLowerCase() + type.substr(1);
	}

	Entity.prototype.addComponent = function(component) {
		if (component instanceof Function) {
			component = new component();
		}
		if ((component instanceof Component) === false) {
			console.error('Trying to add something else than a Component', component);
		}
		if (!component.allowMultiple && this.hasComponent(component.componentType)) {
			// TODO: Overwrite or reject?
			for (var i = 0; i < this._components.length; i++) {
				if (this._components[i].componentType === component.componentType) {
					this._components[i] = component;
					break;
				}
			}
		} else {
			this._components.push(component);
		}
		this[getTypeAttributeName(component.componentType)] = component;

		component.ownerEntity = this;

		if (this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'addedComponent');
		}

		return component;
	};

	/**
	 * Set component of a certain type on entity. Existing component of the same type will be overwritten.
	 *
	 * @param {Component} component Component to set on the entity
	 * @deprecated Since v0.5.x. Should now use addComponent
	 */
	Entity.prototype.setComponent = function(component) {
		this.addComponent(component);
	};

	/**
	 * Checks if a component of a specific type is present or not
	 *
	 * @param {string} type Type of component to check for (eg. 'transformComponent')
	 * @returns {boolean}
	 */
	Entity.prototype.hasComponent = function(type) {
		return this[getTypeAttributeName(type)] !== undefined;
	};

	/**
	 * Retrieve a component of a specific type
	 *
	 * @param {string} type Type of component to retrieve (eg. 'transformComponent')
	 * @returns {Component} component with requested type or undefined if not present
	 */
	Entity.prototype.getComponent = function(type) {
		return this[getTypeAttributeName(type)];
	};

	/**
	 * Remove a component of a specific type from entity.
	 *
	 * @param {string} type Type of component to remove (eg. 'transformComponent')
	 */
	Entity.prototype.clearComponent = function(type) {
		var component = this[getTypeAttributeName(type)];
		var index = this._components.indexOf(component);
		if (index !== -1) {
			var component = this._components[index];
			this._components.splice(index, 1);
		}
		delete this[getTypeAttributeName(type)];

		if (this._world.entityManager.containsEntity(this)) {
			this._world.changedEntity(this, component, 'removedComponent');
		}
	};

	/**
	 * Mark the component for updates of world transform
	 */
	Entity.prototype.setUpdated = function() {
		this._dirty = true;
		this.transform.setUpdated();
	};

	/**
	 * Attach a child entity to this entity
	 *
	 * @param {Entity} childEntity child entity to attach
	 */
	Entity.prototype.attachChild = function(childEntity) {
		var entity = this;
		while (entity) {
			if (entity === childEntity) {
				console.warn('attachChild: An object can\'t be added as a descendant of itself.');
				return;
			}
			entity = entity.parent;
		}
		if (childEntity.parent) {
			childEntity.parent.detachChild(childEntity);
		}
		childEntity.parent = this;
		this.children.push(childEntity);
	};

	/**
	 * Detach a child transform from this component tree
	 *
	 * @param {Entity} childComponent child transform component to detach
	 */
	Entity.prototype.detachChild = function(childEntity) {
		if (childEntity === this) {
			console.warn('attachChild: An object can\'t be removed from itself.');
			return;
		}

		var index = this.children.indexOf(childEntity);
		if (index !== -1) {
			childEntity.parent = null;
			this.children.splice(index, 1);
		}
	};

	/**
	 * Update target transform contained by this component
	 */
	Entity.prototype.updateTransform = function() {
		this.transform.update();
	};

	/**
	 * Update this transform components world transform (resulting transform considering parent transformations)
	 * @param {Boolean} recursive=false If world transform updates should be done recursively
	 */
	Entity.prototype.updateWorldTransform = function(recursive) {
		if (this.parent) {
			this.worldTransform.multiply(this.parent.worldTransform, this.transform);
		} else {
			this.worldTransform.copy(this.transform);
		}
		this._dirty = false;
		this._updated = true;

		if (recursive) {
			for (var i = 0; i < this.children.length; i++) {
				this.children[i].updateWorldTransform(recursive);
			}
		}
	};

	/**
	 * Recursively retrieve an entity based on an id
	 *
	 * @param id Id to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	Entity.prototype.getEntityById = function(id) {
		if (this.id === id) {
			return this;
		}
		for (var i = 0; i < this.children.length; i++) {
			var foundEntity = this.children[i].getEntityById(id);
			if (foundEntity) {
				return foundEntity;
			}
		}
		return;
	};

	/**
	 * Recursively retrieve an entity based on its name
	 *
	 * @param name Name to retrieve entity for
	 * @returns Entity or undefined if not existing
	 */
	Entity.prototype.getEntityByName = function(name) {
		if (this.name === name) {
			return this;
		}
		for (var i = 0; i < this.children.length; i++) {
			var foundEntity = this.children[i].getEntityByName(name);
			if (foundEntity) {
				return foundEntity;
			}
		}
		return;
	};

	Entity.prototype._cloneEntity = function(world, entity, settings) {
		var newEntity = world.createEntity(entity.name);

		// for (var i = 0; i < entity._components.length; i++) {
			// var component = entity._components[i];
			//Clone this
		// }
		for (var j = 0; j < entity.children.length; j++) {
			var child = entity.children[j];
			var clonedChild = this._cloneEntity(world, child, settings);
			newEntity.attachChild(clonedChild);
		}

		if (settings.callback) {
			settings.callback(newEntity);
		}

		return newEntity;
	};

	/**
	 * Clone entity hierarcy with optional settings for sharing data and callbacks
	 * @param {World} world
	 * @param {Entity} entity The entity to clone
	 * @param {Object} [settings]
	 * @param {function(Entity)} [settings.callback] Callback to be run on every new entity. Takes entity as argument. Runs bottom to top in the cloned hierarchy.
	 */
	Entity.prototype.clone = function(world, entity, settings) {
		settings = settings || {};
		settings.shareData = settings.shareData || true;
		settings.shareMaterial = settings.shareMaterial || true;
		settings.cloneHierarchy = settings.cloneHierarchy || true;

		return this._cloneEntity(world, entity, settings);
	};

	/**
	 * Traverse entity hierarchy with callback
	 * @param {Entity} entity The entity to begin traversing from
	 * @param {function(Entity)} callback Callback to run. Runs top to bottom in the hierarchy
	 */
	Entity.prototype.traverse = function(callback, level) {
		level = level !== undefined ? level : 0;

		if (callback(this, level) !== false) {
			for (var j = 0; j < this.children.length; j++) {
				var child = this.children[j];
				child.traverse(callback, level + 1);
			}
		}
	};

	/**
	 * Traverse entity hierarchy with callback
	 * @param {Entity} entity The entity to begin traversing from
	 * @param {function(Entity)} callback Callback to run. Runs top to bottom in the hierarchy
	 */
	Entity.prototype.getRoot = function(entity) {
		while (entity.parent) {
			entity = entity.parent;
		}
		return entity;
	};

	/**
	 * @returns {string} Name of entity
	 */
	Entity.prototype.toString = function() {
		return this.name;
	};

	Entity.entityCount = 0;

	return Entity;
});