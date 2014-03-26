require([
	'goo/entities/GooRunner',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/entities/components/CameraComponent',
	'goo/scripts/OrbitCamControlScript',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/MeshData',
	'goo/entities/components/MeshRendererComponent',
	'goo/math/Vector3',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',

	'goo/fsmpack/statemachine/FSMComponent',
	'goo/fsmpack/statemachine/FSMSystem',
	'goo/fsmpack/statemachine/State',
	'goo/fsmpack/statemachine/Machine',
	'goo/fsmpack/statemachine/actions/KeyDownAction',
	'goo/fsmpack/statemachine/actions/KeyUpAction',
	'goo/fsmpack/statemachine/actions/AddPositionAction'
], function (
	GooRunner,
	World,
	Material,
	ShaderLib,
	Camera,
	ShapeCreator,
	CameraComponent,
	OrbitCamControlScript,
	ScriptComponent,
	MeshData,
	MeshRendererComponent,
	Vector3,
	PointLight,
	LightComponent,
	FSMComponent,
	FSMSystem,
	State,
	Machine,
	KeyDownAction,
	KeyUpAction,
	AddPositionAction
	) {
	'use strict';

	function getFSMComponent(entity) {
		var fsmComponent = new FSMComponent();
		// create action tied to listen to pick events
		// tie pick event to a channel

		var speed = 10;

		// horizontal moving
		var machine1 = new Machine('horizontalMoving');
		fsmComponent.addMachine(machine1);

		var stateIdle = new State('idle');
		machine1.addState(stateIdle);
		stateIdle.addAction(new KeyDownAction(null, { key: 'a', transitions: { keydown: 'toMovingLeft' } }));
		stateIdle.addAction(new KeyDownAction(null, { key: 'd', transitions: { keydown: 'toMovingRight' } }));
		stateIdle.setTransition('toMovingLeft', 'movingLeft');
		stateIdle.setTransition('toMovingRight', 'movingRight');

		var stateMovingLeft = new State('movingLeft');
		machine1.addState(stateMovingLeft);
		stateMovingLeft.addAction(new KeyUpAction(null, { key: 'a', transitions: { keyup: 'toIdle' } }));
		stateMovingLeft.addAction(new AddPositionAction(null, { entity: entity, amountX: -speed }));
		stateMovingLeft.setTransition('toIdle', 'idle');

		var stateMovingRight = new State('movingRight');
		machine1.addState(stateMovingRight);
		stateMovingRight.addAction(new KeyUpAction(null, { key: 'd', transitions: { keyup: 'toIdle' } }));
		stateMovingRight.addAction(new AddPositionAction(null, { entity: entity, amountX: speed }));
		stateMovingRight.setTransition('toIdle', 'idle');

		// vertical moving
		var machine2 = new Machine('verticalMoving');
		fsmComponent.addMachine(machine2);

		var stateIdle = new State('idle');
		machine2.addState(stateIdle);
		stateIdle.addAction(new KeyDownAction(null, { key: 'w', transitions: { keydown: 'toMovingUp' } }));
		stateIdle.addAction(new KeyDownAction(null, { key: 's', transitions: { keydown: 'toMovingDown' } }));
		stateIdle.setTransition('toMovingUp', 'movingUp');
		stateIdle.setTransition('toMovingDown', 'movingDown');

		var stateMovingUp = new State('movingUp');
		machine2.addState(stateMovingUp);
		stateMovingUp.addAction(new KeyUpAction(null, { key: 'w', transitions: { keyup: 'toIdle' } }));
		stateMovingUp.addAction(new AddPositionAction(null, { entity: entity, amountZ: -speed }));
		stateMovingUp.setTransition('toIdle', 'idle');

		var stateMovingDown = new State('movingDown');
		machine2.addState(stateMovingDown);
		stateMovingDown.addAction(new KeyUpAction(null, { key: 's', transitions: { keyup: 'toIdle' } }));
		stateMovingDown.addAction(new AddPositionAction(null, { entity: entity, amountZ: speed }));
		stateMovingDown.setTransition('toIdle', 'idle');

		return fsmComponent;
	}

	function addCharacter(goo, x, y, z) {
		var boxMeshData = ShapeCreator.createBox(1, 1, 1);
		var boxMaterial = Material.createMaterial(ShaderLib.simpleLit, 'mat');
		var boxEntity = goo.world.createEntity(boxMeshData, boxMaterial, [x, y, z]);
		boxEntity.setComponent(getFSMComponent(boxEntity));
		boxEntity.addToWorld();
	}

	function getColor(x, y, z) {
		var step = 1.9;
		return [
			Math.cos(x + y + z) / 2 + 0.5,
			Math.cos(x + y + z + step) / 2 + 0.5,
			Math.cos(x + y + z + step * 2) / 2 + 0.5];
	}

	function addLamp(goo, x, y, z) {
		var color = getColor(x, y, z);

		var lampMeshData = ShapeCreator.createSphere(32, 32);
		var lampMaterial = Material.createMaterial(ShaderLib.simpleColored, '');
		lampMaterial.uniforms.color = color;
		var lampEntity = goo.world.createEntity(lampMeshData, lampMaterial, 'lamp1', [x, y, z]);

		var light = new PointLight();
		light.color = new Vector3(color[0], color[1], color[2]);
		light.range = 10;
		lampEntity.setComponent(new LightComponent(light));
		lampEntity.addToWorld();

		return lampEntity;
	}

	function addLamps(goo) {
		var nLamps = 1;
		var lampEntities = [];
		for(var i = 0; i < nLamps; i++) {
			lampEntities.push(addLamp(goo, (i - ((nLamps - 1) / 2)) * 4, 5, 0));
		}
		return lampEntities;
	}

	function addCamera(goo) {
		// camera
		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 0, 3);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(60, Math.PI / 2, 0)
		}));
		cameraEntity.setComponent(scripts);
	}

	function moveTheBoxGame(goo) {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		goo.world.setSystem(new FSMSystem(goo));

		addCamera(goo);
		/*var lampEntities = */addLamps(goo);

		/*var boxEntity = */addCharacter(goo, 0, 0, 0);
	}

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		moveTheBoxGame(goo);
	}

	init();
});