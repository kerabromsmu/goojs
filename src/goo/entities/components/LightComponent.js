define(['goo/entities/components/Component'],
	/** @lends */
	function (Component) {
	"use strict";

	/**
	 * @class Defines a light
	 * @param {Light} light Light to contain in this component (directional, spot, point)
	 */
	function LightComponent(light) {
		this.type = 'LightComponent';
		this.light = light;
		this.logicInstance = null;
		Component.call(this);
	}

	LightComponent.prototype = Object.create(Component.prototype);

	LightComponent.prototype.updateLight = function (transform) {
		this.light.update(transform);
	};

	return LightComponent;
});
