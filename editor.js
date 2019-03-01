
// DISABLE ERRORS:
console.warn = (text) => {};
console.info = (text) => {};

// STORAGE:
var canStore = (typeof(Storage) !== "undefined");
window.saveVal = function(name, val) {
    if (canStore) localStorage.setItem(name, val);
};
window.getSavedVal = function(name) {
    return canStore ?  localStorage.getItem(name) : null;
};

// HTML SHIT:
function updateObjectCount(count) {
    objectCount.innerHTML = count;
};

// IMPORTS:
var THREE = require("three");
THREE.OBJLoader = require("./libs/OBJLoader.js")(THREE);
THREE.PointerLockControls = require("./libs/PointerLockControls.js")(THREE);
require("./libs/TransformControls.js")(THREE);
const prefabs = require("./data/prefabs.js").prefabs;
const PREFABS = require("./data/prefabs.js");
const texturePrefabs = PREFABS.texturePrefabs;
const loadTexturePrefab = PREFABS.loadTexturePrefab;
const initScene = require("./libs/render.js").initScene;
const biomes = require("./data/map.js").biomes;
const GEOS = require("./libs/geos.js");
const UTILS = require("./libs/utils.js");
const config = require("./config.js");

// TEST MAP:
window.testMap = function() {
    var mapData = editor.getMapExport();
    window.saveVal("custMap", mapData);
    window.open("/", '_blank');
};

// CUSTOM OBJECT:
class ObjectInstance extends THREE.Object3D {
    get prefab() {
        return prefabs[this.objType];
    }

    get texturePrefab() {
        return texturePrefabs[this._texture];
    }

    get pos() { return this.boundingMesh.position.toArray(); }
    set pos(v) { this.boundingMesh.position.fromArray(v); }

    get rot() { return this.boundingMesh.rotation.toArray().slice(0, 3); }
    set rot(v) { this.boundingMesh.rotation.copy(new THREE.Euler(...v)); }

    get size() { return this.boundingMesh.scale.toArray(); }
    set size(v) { this.boundingMesh.scale.fromArray(v); }

    get part() { return this._part; }
    set part(part) {
        this._part = part;
    }

    get texture() { return this._texture; }
    set texture(texture) {
        if (this.prefab.noTexture) return;
        if (!(texture in texturePrefabs)) throw "Invalid texture id.";

        // Save the src
        this._texture = texture;

        // Update texture, if exists
        this.defaultMaterial.transparent = true;
        if (this.texturePrefab.src) this.defaultMaterial.map = loadTexturePrefab(texture);
        else this.defaultMaterial.map = undefined;

        // Update the material
        this.defaultMaterial.needsUpdate = true;
    }

    get collidable() { return this._collidable; }
    set collidable(c) {
        if (!this.prefab.tool) {
            this._collidable = c;
            if (this.boxShape) this.boxShape.material = c?ObjectInstance.boundingCollidableBoxMaterial
                :ObjectInstance.boundingNoncollidableBoxMaterial;
        }
    }

    get penetrable() { return this._penetrable; }
    set penetrable(c) {
        if (this.prefab.editPen) this._penetrable = c;
    }

    get boost() { return this._boost }
    set boost(b) { this._boost = b }

    get edgeNoise() { return this._edgeNoise }
    set edgeNoise(b) { this._edgeNoise = b }

    get speedMlt() { return this._speedMlt }
    set speedMlt(b) { this._speedMlt = b }

    get maxHeight() { return this._maxHeight }
    set maxHeight(b) { this._maxHeight = b }

    get frequency() { return this._frequency }
    set frequency(b) { this._frequency = b }

    get ySeg() { return this._ySeg }
    set ySeg(b) { this._ySeg = b }

    get xSeg() { return this._xSeg }
    set xSeg(b) { this._xSeg = b }
    
    get planeType() { return this._planeType }
    set planeType(b) { this._planeType = b }
    
    get seed() { return this._seed }
    set seed(b) { this._seed = b }
    
    resetPlane() {
        this.prefab.genGeo(this.size, this).then(geo => {
            this.defaultMesh.geometry = geo;
        });
    }    

    get visible() { return this._visible; }
    set visible(c) {
        this._visible = c;
        if (this.defaultMaterial) {
            this.defaultMaterial.opacity = (c?(this.prefab.opacity||this.opacity||1):0);
        }
    }

    get team() { return this._team; }
    set team(c) { this._team = c; }

    get color() { return this._color; }
    set color(c) {
        if (this.prefab.editColor) {
            this._color = c;
            this.defaultMaterial.color.set(GEOS.getColor(c));
        }
    }

    get emissive() { return this._emissive; }
    set emissive(c) {
        if (this.prefab.editEmissive) {
            this._emissive = c;
            this.defaultMaterial.emissive.set(GEOS.getColor(c));
        }
    }

    get opacity() { return this._opacity; }
    set opacity(c) {
        if (this.prefab.editOpac) {
            this._opacity = c;
            this.defaultMaterial.opacity = c;
            this.defaultMaterial.transparent = (c != 1);
        }
    }

    get direction()  {
        if (this.prefab.customDirection) return this._direction;
        else return undefined;
    }
    set direction(d) {
        // Add default direction
        if (this.prefab.customDirection && d === undefined) {
            d = 0;
        }

        // Save the direction
        this._direction = d;

        // Update the arrow
        if (d !== undefined && this.prefab.customDirection) {
            let angle = d * Math.PI / 2;
            this.arrowHelper.setDirection(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
        }
    }

    constructor(data, useID) {
        super();

        // Save the object type
        data.id = data.id||0;
        if (!useID) data.id = config.prefabIDS[data.id];
        if (!prefabs.hasOwnProperty(data.id)) {
            throw "Invalid type: " + data.id;
        }
        this.objType = data.id;
        this.defaultSize = [1, 1, 1];

        // Create bounding mesh; this will need to be manually added to the scene
        this.boundingMesh = new THREE.Mesh(ObjectInstance.boundingMeshGeometry, ObjectInstance.boundingMeshMaterial);
        this.boundingMesh.userData.owner = this;

        // Add box to bounding mesh
        if (!this.prefab.hideBoundingBox) {
            this.boxShape = new THREE.LineSegments(ObjectInstance.boundingBoxGeometry,
                this.prefab.lineCol!=undefined?new THREE.LineBasicMaterial({color:this.prefab.lineCol})
                :ObjectInstance.boundingCollidableBoxMaterial);
        }

        // Add arrow to mesh
        if (this.prefab.customDirection) {
            this.arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 10, 0xff00ff, 5, 4);
        }

        // Create default material and mesh for storing things like procedural geometries in, this will be empty for
        // other items
        this.defaultMaterial = new THREE.MeshLambertMaterial();
        this.defaultMaterial.opacity = (this.prefab.opacity!=undefined?this.prefab.opacity:1);
        this.defaultMaterial.transparent = true;
        this.defaultMaterial.vertexColors = THREE.VertexColors;
        this.defaultMesh = new THREE.Mesh(new THREE.Geometry(), this.defaultMaterial);
        this.add(this.defaultMesh);

        // Save data (this will update the object form the setters) (this will also procedurally create the prefab
        // geometry)
        this.pos = data.p;
        this.rot = data.r || [0, 0, 0];
        this.size = data.s || this.defaultSize;
        if (UTILS.isString(data.t)) this.texture = (data.t||ObjectInstance.DEFAULT_TEXTURE);
        else this.texture = (config.textureIDS[data.t||0])||ObjectInstance.DEFAULT_TEXTURE;
        this.collidable = (data.col===undefined?true:false);
        this.penetrable = (data.pe?true:false);
        this.boost = (data.b||0);
        if (this.boost === true) this.boost = 1;
        this.edgeNoise = (data.en||0);
        this.health = (data.hp||0);
        this.part = (data.pr||0);
        this.team = (data.tm||0);
        this.visible = (data.v===undefined?true:false);
        this.terrain = data.ter||false;
        this.color = (data.c!=undefined?data.c:'#FFFFFF');
        this.emissive = (data.e!=undefined?data.e:'#000000');
        this.opacity = (data.o!=undefined?data.o:1);
        this.direction = data.d; // May be undefined
        
        // PLAIN ANIMATION & TERRAIN
        this.planeType = data.ap ? 2 : (data.tr ? 1 : 0);
        let plane = this.planeType > 0 ? (data.ap || data.tr).split(',') : [];
        this.xSeg = (plane[0] != undefined ? plane[0] : 25);
        this.ySeg = (plane[1] != undefined ? plane[1] : 25);
        this.maxHeight = (plane[2] != undefined ? plane[2] : 1);
        this.frequency = this.planeType == 1 ? (plane[3] != undefined ? plane[3] : 2.5) : 2.5;
        this.speedMlt = this.planeType == 2 ? (plane[3] != undefined ? plane[3] : 10) : 10;
        this.seed = (plane[4] != undefined ? plane[4] : Math.random());

        // Generate the content
        let prefabPromises = [];
        if (this.prefab.editorGen) {
            prefabPromises.push(this.prefab.editorGen(this, this.defaultMaterial));
        } else if (this.prefab.gen) {
            prefabPromises.push(this.prefab.gen(this, this.defaultMaterial));
        }
        
        Promise.all(prefabPromises).then(() => {
            this.traverse(child => {
                child.castShadow = this.prefab.castShadow;
                child.receiveShadow = this.prefab.receiveShadow;
            });
            if (this.prefab.defaultSize) {
                this.defaultSize = this.prefab.defaultSize;
            } else {
                let t = this.rotation.clone();
                this.rotation.set(0, 0, 0);
                let bb = ObjectInstance.tmpBox3.setFromObject(this);
                this.rotation.copy(t);
                this.defaultSize = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z];
            }
            this.size = data.s || this.defaultSize
        });
        
        // Misc
        this.previousScale = new THREE.Vector3();
    }

    static defaultFromType(id) {
        return new ObjectInstance({
            id, p: [0, 0, 0]
        }, true);
    }

    update(dt) {
        if (this.prefab.dontRound) {
            const minScale = 0.00001;
            this.boundingMesh.scale.x = Math.max(minScale, this.boundingMesh.scale.x);
            this.boundingMesh.scale.y = Math.max(minScale, this.boundingMesh.scale.y);
            this.boundingMesh.scale.z = Math.max(minScale, this.boundingMesh.scale.z);
        } else {
            const minScale = 1;
            this.boundingMesh.scale.x = Math.max(minScale, this.boundingMesh.scale.x).roundToNearest(1);
            this.boundingMesh.scale.y = Math.max(minScale, this.boundingMesh.scale.y).roundToNearest(1);
            this.boundingMesh.scale.z = Math.max(minScale, this.boundingMesh.scale.z).roundToNearest(1);
        }

        // Copy position in local coordinates
        this.position.set(0, this.boundingMesh.scale.y / 2, 0);
        this.position.applyQuaternion(this.boundingMesh.quaternion);
        this.position.add(this.boundingMesh.position);

        // Copy rotation
        this.quaternion.copy(this.boundingMesh.quaternion);

        // Invert rotation for box shape
        if (this.boxShape) {
            this.boxShape.position.copy(this.boundingMesh.position);
            this.boxShape.scale.copy(this.boundingMesh.scale);
            this.boxShape.rotation.copy(this.boundingMesh.rotation);
        }

        // Update arrow and make it hover above the object
        if (this.arrowHelper) {
            this.arrowHelper.position.copy(this.boundingMesh.position);
            this.arrowHelper.position.y += this.boundingMesh.scale.y + 5;
        }

        // UPDATE MESH WITH NEW SIZE:
        let newScale = this.boundingMesh.scale;
        if (!this.previousScale.equals(newScale)) {
            // Handle new size
            if (this.prefab.genGeo) {
                // Generate geometry with new size
                this.prefab.genGeo(this.size, this.prefab.canTerrain ? this : 1).then(geo => {
                    this.defaultMesh.geometry = geo;
                });
            } else if (this.prefab.scaleWithSize) {
                this.scale.copy(newScale);
            }

            // Save previous scale
            this.previousScale.copy(newScale);
        } else {
            if (this.prefab.canTerrain) {
                if (this.planeType == 2) {
                    let time = editor.clock.getElapsedTime() * this.speedMlt;
                    let len = this.defaultMesh.geometry.vertices.length;
                    let range = this.maxHeight * 0.5;
                    for (let i = 0; i < len; i ++) {
                        this.defaultMesh.geometry.vertices[i].y = range * Math.sin( i / 5 + ( time + i ) / 4 );
                    }
                    this.defaultMesh.geometry.verticesNeedUpdate = true;
                }
            }
        }

        // Reset scale if not scalable
        if (!this.prefab.scalable) this.size = this.defaultSize;
    }

    clone() {
        return ObjectInstance.deserialize(this.serialize());
    }

    serialize() {
        let data = {
            p: this.pos,
            s: this.size
        };
        var tID = config.prefabIDS.indexOf(this.objType);
        if (tID) data.id = tID;
        if (data.id === -1) alert("WARNING: No prefab id for type " + this.objType + ".");
        data.p = data.p.map(x => Math.round(x));
        data.s = data.s.map(x => Math.round(x));
        if (!this.collidable) data.col = (!this.collidable)?1:0;
        if (this.penetrable) data.pe = 1;
        if (this.boost) data.b = this.boost;
        if (this.edgeNoise) data.en = this.edgeNoise.round(1);
        if (this.health) data.hp = this.health;
        
        if (this.prefab.canTerrain && this.planeType) {
            if (this.planeType == 1) data.tr = [this.xSeg, this.ySeg, this.maxHeight, this.frequency, this.seed].join(',');
            if (this.planeType == 2) data.ap = [this.xSeg, this.ySeg, this.maxHeight, this.speedMlt].join(',');
        }
        
        if (!this.visible) data.v = 1;
		if (this.part) data.pr = this.part;
        let rot = this.rot;
        if (rot[0] || rot[1] || rot[2]) data.r = rot.map(v => v.round(2));
        if (this.color != '#FFFFFF') data.c = this.color;
        if (this.emissive != '#000000') data.e = this.emissive;
        if (this.opacity != 1) data.o = this.opacity;
        if (this.prefab.texturable) {
            var tmpT = config.textureIDS.indexOf(this.texture);
            if (tmpT) data.t = tmpT
        } if (this.prefab.customDirection) data.d = this.direction;
        return data;
    }
    static deserialize(data) {
        return new ObjectInstance(data);
    }
}

ObjectInstance.DEFAULT_TEXTURE = "DEFAULT";
ObjectInstance.tmpBox3 = new THREE.Box3();
ObjectInstance.boundingMeshGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
ObjectInstance.boundingMeshGeometry.translate(0, 0.5, 0);
ObjectInstance.boundingMeshMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });
ObjectInstance.boundingBoxGeometry = (() => {
    const s = 0.5;
    let geometry = new THREE.Geometry();
    geometry.vertices.push(
        // X
        new THREE.Vector3(-s, -s, -s), new THREE.Vector3(s, -s, -s),
        new THREE.Vector3(-s, s, -s), new THREE.Vector3(s, s, -s),
        new THREE.Vector3(-s, s, s), new THREE.Vector3(s, s, s),
        new THREE.Vector3(-s, -s, s), new THREE.Vector3(s, -s, s),

        // Y
        new THREE.Vector3(-s, -s, -s), new THREE.Vector3(-s, s, -s),
        new THREE.Vector3(-s, -s, s), new THREE.Vector3(-s, s, s),
        new THREE.Vector3(s, -s, s), new THREE.Vector3(s, s, s),
        new THREE.Vector3(s, -s, -s), new THREE.Vector3(s, s, -s),

        // Z
        new THREE.Vector3(-s, -s, -s), new THREE.Vector3(-s, -s, s),
        new THREE.Vector3(-s, s, -s), new THREE.Vector3(-s, s, s),
        new THREE.Vector3(s, s, -s), new THREE.Vector3(s, s, s),
        new THREE.Vector3(s, -s, -s), new THREE.Vector3(s, -s, s),
    );
    return geometry;
})();
ObjectInstance.boundingBoxGeometry.translate(0, 0.5, 0);
ObjectInstance.boundingCollidableBoxMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
ObjectInstance.boundingNoncollidableBoxMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });


// EDITOR OBJECT:
const editor = {
    
    // INIT:
    init(container) {

        this.undos = [];
        this.redos = [];
        this.objHistory = [];

        this.container = container;

        this.objInstances = [];
        this.boundingMeshes = [];

        this.mapConfig = {
            name: "New Krunker Map",
            modURL: "",
            shadowR: 1024,
            ambient: '#97a0a8',
            light: '#f2f8fc',
            sky: '#dce8ed',
            fog: '#8d9aa0',
            fogD: 900
        };

        this.createObjects = { };
        for (let id in prefabs) {
            if (!prefabs.hasOwnProperty(id)) continue;
            this.createObjects[id] = () => this.addObject(ObjectInstance.defaultFromType(id));
        }

        this.objConfig = {
            texture: "DEFAULT",
            color: '#FFFFFF',
            emissive: '#000000',
            opacity: 1,
            part: 0,
            collidable: true,
            penetrable: false,
            boost: 0,
            edgeNoise: 0,
            health: 0,
            team: 0,
            visible: true,
            maxHeight: 10,
            ySeg: 25,
            xSeg: 25,
            planeType: 0,
            frequency: 2.5,
            seed: 0.1,
            speedMlt: 10
        };
        
        this.highlightObject = null;
        this.defaultSettings = null;
        this.settings = {
            degToRad: false,
            antiAlias: false,
            gridVisibility: true,
            gridOpacity: .25,
            gridSize: 100,
            gridSpacing: 10,
            objectHighlight: false,
            mergeVoxels: false,
            speedNormal: 70,
            speedSprint: 180,
            voxelSize: 10,
            imageSize: 1,
            assetAutoGroup: true,
            preserveFolderState: true,
            translationSnapping: 1,
            rotationSnapping: 10,
            autoBackup: 0
        };
        this.backupInterval = null;
        this.copy = null;
        this.objGroups = [];
        this.hexToRGBArray = ((hex) => hex.match(/[A-Za-z0-9]{2}/g).map(v => parseInt(v, 16)));
        this.rgbArrayToHex = ((rgb) => `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`);

        this.clock = new THREE.Clock();
        this.initSettings();
        this.initRenderer();
        this.initScene();
        this.initGUI();
        this.initAdvancedGUI();
        this.initControls();
        this.initHistory();
        this.initAutoBackup();
        this.registerEvents();
        this.setSnapping(true);

        this.render();
    },

    // INIT SCENE:
    initScene() {

        // SCENE:
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // CAMERA:
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);

        // SCENE STYLING:
        initScene.call(this, this.mapConfig);

        // GRID:
        this.updateGridHelper();
    },

    // INIT GUI:
    initGUI() {

        // GUI:
        let gui = new dat.GUI();
        this.mapGUI = gui.addFolder("Map Config");
        this.mapGUI.add(this.mapConfig, "name").name("Name").listen();
        this.mapGUI.add(this.mapConfig, "modURL").name("Mod URL").listen();

        this.mapGUI.addColor(this.mapConfig, "ambient").name("Ambient Light").onChange(v => {
            this.ambientLight.color.set(v);
        });
        this.mapGUI.addColor(this.mapConfig, "sky").name("Sky Color").onChange(v => {
            this.scene.background = new THREE.Color(v);
        });
        this.mapGUI.addColor(this.mapConfig, "light").name("Light Color").onChange(v => {
            this.skyLight.color.set(v);
        });
        this.mapGUI.addColor(this.mapConfig, "fog").name("Fog Color").onChange(v => {
            this.scene.fog.color.set(v);
        });
        this.mapGUI.add(this.mapConfig, "fogD", 10, 2000).name("Fog Distance").listen().onChange(v => {
            this.scene.fog.far = v;
        });
        this.mapGUI.add(this.mapConfig, "shadowR", 128, 4096).name("Shadow Res").listen().onChange(() => {});

        let createGUI = gui.addFolder("Create Object");
        let modelsGUI = createGUI.addFolder("Models");
        let toolsGUI = createGUI.addFolder("Tools");
        for (let id in prefabs) {
            if (!prefabs.hasOwnProperty(id) || prefabs[id].noExport) continue;
            (prefabs[id].gen ? modelsGUI : (prefabs[id].tool ? toolsGUI : createGUI)).add(this.createObjects, id).name(this.formatConstName(id));
        }
        createGUI.open();

        this.objConfigGUI = gui.addFolder("Object Config");
        this.objConfigGUI.open();
        this.objConfigOptions = [];

        gui.open();

        // OBJECT COMMANDS:
        document.getElementById("deleteObject").addEventListener("click", ev => {
            this.objectSelected(true) ? this.removeGroup() : this.removeObject();
        });
        document.getElementById("duplicateObject").addEventListener("click", ev => {
            this.objectSelected(true) ? this.duplicateGroup() : this.duplicateObject();
        });

        // MAP COMMANDS:
        document.getElementById("importMap").addEventListener("click", ev => {
            ev.shiftKey ? this.loadFile('importMap') : this.importMap();
        });
        document.getElementById("exportMap").addEventListener("click", ev => {
            if(ev.shiftKey) this.copyToClipboard(this.getMapExport()); 
            this.exportMap();
        });
        document.getElementById("newMap").addEventListener("click", ev => {
            confirm("Are you sure you want to reset the map?") && this.clearMap();
        });
    },
    
    initAdvancedGUI() {
        
        // GUI:
        this.advancedGUI = new dat.GUI();
        this.advancedGUI.domElement.id = 'advancedGUI';

        let options = {
            rotation: 0,
            json: (() => this.jsonInput()),
            file: (() => this.jsonInput(true)),
            textGen: (() => this.textToObjects()),
            create: (() => this.copyObjects(false, true)),
            stop: (() => this.stopGroup()),
            stopAll: (() => this.stopGroup(true)),
            exportObj: (() => this.exportGroup()),
            exportFull: (() => this.exportGroup(true)),
            copy: (() => this.copyObjects()),
            cut: (() => this.copyObjects(true)),
            paste: (() => this.pasteObjects()),
            texture: "DEFAULT",
            scaleMapX: 1.0,
            scaleMapY: 1.0,
            scaleMapZ: 1.0,
            scaleMap: (() => this.scaleMap()),
            transformMap: (() => this.transformMap()),
            colorizeR: (() => this.colorizeMap(false, false, true)),
            colorizeG: (() => this.colorizeMap(false, true)),
            colorizeI: (() => this.colorizeMap(prompt("Input colors. (Seperate using a comma)", ""))),
            voxelConvert: (() => this.convert()),
            voxelImport: (() => this.convert(true)), 
            imageConvert: (() => this.convert(false, true)),
            imageImport: (() => this.convert(true, true)), 
            editColor: (() => this.editGroup('color', prompt("Input color", ""))),
            reset: (() => this.resetSettings()),
            frameObject: (() => this.frameObject()),
            frameThickness: 10,
            frameCeiling: false,
            frameFloor: false,
            reflectDir: 0,
            reflectMap: (() => this.reflectMap()),
            speedReset: (() => (this.setSettings(['speedNormal', 'speedSprint'], [70, 180]), this.advancedGUI.updateDisplay())),
            breakableHealth: 1,
            breakableCollision: false,
            breakableMap: (() => this.breakableMap()),
            plannerXDir: 0,
            plannerYDir: 0,
            plannerZDir: 0,        
            plannerXSpace: 0,
            plannerYSpace: 0,
            plannerZSpace: 0,
            plannerSize: 10,
            plannerColor: '#460050',
            plannerExecute: (() => this.layoutPlanner()),
            snappingReset: (() => (this.setSettings(['translationSnapping', 'rotationSnapping'], [1, 10]), this.advancedGUI.updateDisplay(), this.updateSnapping())),
            gridReset: (() => (this.setSettings(['gridOpacity', 'gridSize', 'gridSpacing', 'gridVisibility'], [this.defaultSettings.gridOpacity, this.defaultSettings.gridSize, this.defaultSettings.gridSpacing, this.defaultSettings.gridVisibility]), this.advancedGUI.updateDisplay(), this.updateGridHelper())),
        };
        
        let mainMenu = this.advancedGUI.addFolder("Advanced");
        mainMenu.open();
        
        let assetMenu = mainMenu.addFolder("Assets");
        //let assets = localStorage.getItem('krunk_assets') ? JSON.parse(localStorage.getItem('krunk_assets')) : {};
        
        assetMenu.add(this.settings, "assetAutoGroup").name("Auto Group").onChange(t => {this.setSettings('assetAutoGroup', t)}); 
        assetMenu.add(options, "rotation", 0, 359, 1).name("Rotation")
        assetMenu.add(options, "json").name("Json Import");
        assetMenu.add(options, "file").name("File Import");
        //this.assetFolder(assets, assetMenu);
        
        let groupingMenu = mainMenu.addFolder("MultiObject");
        groupingMenu.add(options, "create").name("Create Group");
        groupingMenu.add(options, "stop").name("Stop Group"); 
        groupingMenu.add(options, "stopAll").name("Stop All Groups"); 
        groupingMenu.add(options, "copy").name("Copy");
        groupingMenu.add(options, "cut").name("Cut");
        groupingMenu.add(options, "paste").name("Paste");
        
        let editMenu = groupingMenu.addFolder("Edit");
        let textures = {
            "Default": "DEFAULT"
        };
        for (let key in texturePrefabs) {
            if (key != "DEFAULT") {
                if (!texturePrefabs.hasOwnProperty(key)) continue;
                textures[this.formatConstName(key)] = key;
            }
        }
        editMenu.add(options, "texture").options(textures).name("Texture").listen().onChange(t => {
            this.editGroup('texture', t);
        });
        editMenu.add(options, "editColor").name("Color");
        
        let exportMenu = groupingMenu.addFolder("Export");
        
        exportMenu.add(options, "exportObj").name("Asset");
        exportMenu.add(options, "exportFull").name("Full");         
        
        let otherMenu = mainMenu.addFolder("Other Features");
        
        let colorizeMenu = otherMenu.addFolder("Colorize");
        colorizeMenu.add(options, "colorizeR").name("Random"); 
        colorizeMenu.add(options, "colorizeG").name("Gold");
        colorizeMenu.add(options, "colorizeI").name("Input");
        
        let scaleMapMenu = otherMenu.addFolder("Scale Map");
        scaleMapMenu.add(options, "scaleMapX").name("X"); 
        scaleMapMenu.add(options, "scaleMapY").name("Y"); 
        scaleMapMenu.add(options, "scaleMapZ").name("Z");     
        scaleMapMenu.add(options, "scaleMap").name("Scale");
        
        let reflectMenu = otherMenu.addFolder("Reflect Map");
        reflectMenu.add(options, "reflectDir").options({X: 0, Y: 1, Z: 2}).name("Direction"); 
        reflectMenu.add(options, "reflectMap").name("Reflect");
        
        let frameMenu = otherMenu.addFolder("Frame");
        frameMenu.add(options, "frameThickness").name("Wall Thickness"); 
        frameMenu.add(options, "frameCeiling").name("Has Ceiling"); 
        frameMenu.add(options, "frameFloor").name("Has Floor"); 
        frameMenu.add(options, "frameObject").name("Frame It");  
        
        let voxelsMenu = otherMenu.addFolder('Voxels');
        voxelsMenu.add(this.settings, "mergeVoxels").name("Merge").onChange(t => {this.setSettings('mergeVoxels', t)});
        voxelsMenu.add(this.settings, "voxelSize").name("Size").onChange(t => {this.setSettings('voxelSize', t)});
        voxelsMenu.add(options, "voxelConvert").name("Convert");
        voxelsMenu.add(options, "voxelImport").name("Import"); 
        
        let imageMenu = otherMenu.addFolder('Image Converter');
        imageMenu.add(this.settings, "imageSize").name("Size").onChange(t => {this.setSettings('imageSize', t)});
        imageMenu.add(options, "imageConvert").name("Convert");
        imageMenu.add(options, "imageImport").name("Import"); 
        
        let breakableMenu = otherMenu.addFolder('Breakable Map');
        breakableMenu.add(options, "breakableHealth", 1, 500, 1).name("Health");
        breakableMenu.add(options, "breakableCollision").name("Force Collision");
        breakableMenu.add(options, "breakableMap").name("Execute");
        
        let plannerMenu = otherMenu.addFolder('Layout Planner');
        plannerMenu.add(options, "plannerSize").name("Cube Size");
        plannerMenu.addColor(options, "plannerColor").name("Cube Color");
        plannerMenu.add(options, "plannerXDir").name("Cubes in X");
        plannerMenu.add(options, "plannerXSpace").name("Space in X");
        plannerMenu.add(options, "plannerYDir").name("Cubes in Y");
        plannerMenu.add(options, "plannerYSpace").name("Space in Y");
        plannerMenu.add(options, "plannerZDir").name("Cubes in Z");
        plannerMenu.add(options, "plannerZSpace").name("Space in Z");
        plannerMenu.add(options, "plannerExecute").name("Execute");
        
        otherMenu.add(options, "textGen").name("Text Generator");
        
        let settingsMenu = mainMenu.addFolder('Settings');
        settingsMenu.add(this.settings, "autoBackup", 0, 25, 1).name("Backup Timer").onChange(t => {this.setSettings('autoBackup', Math.abs(t)),this.initAutoBackup()});
        settingsMenu.add(this.settings, "antiAlias").name("Anti-aliasing").onChange(t => {this.setSettings('antiAlias', t), alert("This change will occur after you refresh")});   
        settingsMenu.add(this.settings, "objectHighlight").name("Hightlight").onChange(t => {this.setSettings('objectHighlight', t)});

        let objConfigMenu = settingsMenu.addFolder('Object Config');
        objConfigMenu.add(this.settings, "degToRad").name("Anti Radians").onChange(t => {this.setSettings('degToRad', t)});
        objConfigMenu.add(this.settings, "preserveFolderState").name("Preserve Folders").onChange(t => {this.setSettings('preserveFolderState', t)});

        let gridMenu = settingsMenu.addFolder('Grid');
        gridMenu.add(this.settings, "gridVisibility").name("Visible").onChange(t => {this.setSettings('gridVisibility', t), this.updateGridHelper()});      
        gridMenu.add(this.settings, "gridOpacity", 0.05, 1, 0.05).name("Opacity").onChange(t => {this.setSettings('gridOpacity', t), this.updateGridHelper()});
        gridMenu.add(this.settings, "gridSize").name("Size").onChange(t => {this.setSettings('gridSize', Math.abs(t) || this.defaultSettings.gridSize), this.updateGridHelper()});      
        gridMenu.add(this.settings, "gridSpacing").name("Spacing").onChange(t => {this.setSettings('gridSpacing', Math.abs(t) || this.defaultSettings.gridSpacing), this.updateGridHelper()}); 
        gridMenu.add(options, "gridReset").name("Reset Grid");

        let speedMenu = settingsMenu.addFolder('Speed');
        speedMenu.add(this.settings, "speedNormal").name("Normal").onChange(t => {this.setSettings('speedNormal', Math.abs(t) || this.defaultSettings.speedNormal)});      
        speedMenu.add(this.settings, "speedSprint").name("Sprinting").onChange(t => {this.setSettings('speedSprint', Math.abs(t) || this.defaultSettings.speedSprint)});
        speedMenu.add(options, "speedReset").name("Reset Speed");
        
        let snappingMenu = settingsMenu.addFolder('Snapping');
        snappingMenu.add(this.settings, "translationSnapping", 1, 25, 1).name("Translation").onChange(t => {this.setSettings('translationSnapping', Math.abs(t) || this.defaultSettings.translationSnapping),this.updateSnapping()});      
        snappingMenu.add(this.settings, "rotationSnapping", 5, 45, 5).name("Rotation").onChange(t => {this.setSettings('rotationSnapping', Math.abs(t) || this.defaultSettings.rotationSnapping),this.updateSnapping()});
        snappingMenu.add(options, "snappingReset").name("Reset Snapping");

        settingsMenu.add(options, "reset").name("Reset All Settings");    
    },

    assetFolder(assets, menu) {
        let options = {};
        for (let ob in assets) {
            if (!Array.isArray(assets[ob])) {
                let folder = menu.addFolder(ob);
                this.assetFolder(assets[ob], folder);
            } else {
                options[ob] = (() => this.replaceObject(JSON.stringify(assets[ob]), false, false, this.settings.assetAutoGroup));
                menu.add(options, ob).name(ob + " [" + assets[ob].length + "]");
            }
        }
    },
    
    // INIT SETTINGS
    initSettings() {
        this.defaultSettings = JSON.parse(JSON.stringify(this.settings));
        let ls = window.getSavedVal('kro_editor');
        if (ls == null) return;
        try {
            JSON.parse(ls);
        } catch (e) {
            return;
        }
        let jsp = JSON.parse(ls);
        for (let set in jsp) {
            this.settings[set] = jsp[set];
        }  
    },

    // AUTO BACKUP
    initAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
        if (this.settings.autoBackup == 0) return;

        let milli = this.settings.autoBackup * 60000;
        
        let scope = this;
        this.backupInterval = setInterval(function() {
            if (scope.objInstances.length == 0) return;
            let oldname = scope.mapConfig.name;
            scope.mapConfig.name = scope.mapConfig.name + '_backup_' + Math.floor(Date.now() / 1000); 
            scope.exportMap();
            scope.mapConfig.name = oldname;
        }, milli);
    },

    // INIT HISTORY (UNDO / REDO)
    initHistory() {
        let scope = this;
        setInterval(function() {
            for (let instance of scope.objInstances) {
                if (scope.objHistory[instance.uuid]) {
                    let prev = JSON.stringify(scope.objHistory[instance.uuid]);
                    let curr = JSON.stringify(instance.serialize());
                    if (prev != curr) {
                        scope.addToHistory('update', instance, scope.objHistory[instance.uuid]);
                    }
                }
                
                scope.objHistory[instance.uuid] = instance.serialize();
            }
        }, 1000); 
    },
    addToHistory(cmd, object, history = null) {
        let save = {action: cmd, obj: object, history: history};
        switch (cmd) {
            case 'add': 
            case 'remove':
            case 'update':
                this.undos.push(save);
                break;
        }
    },
    executeHistory(type = 'undo') {
        let last = type == 'undo' ? this.undos.pop() : this.redos.pop();
        if (!last) return;
        switch (last.action) {
            case 'add': 
                if (type == 'undo') {
                    let rem = this.objInstances.filter(x => x.uuid == last.obj.uuid);
                    delete this.objHistory[last.obj.uuid];
                    this.removeObject(rem[0], false, false);
                    this.redos.push(last);
                } else {
                    this.addObject(last.obj, false, false);
                }
                break;

            case 'remove':
                if (type == 'undo') {
                    this.addObject(last.obj, false, false);
                    this.redos.push(last);
                } else {
                    delete this.objHistory[last.obj.uuid];
                    this.removeObject(last.obj, false, false);
                }
                break;

            case 'update':
                if (type == 'undo') this.redos.push(last);
                let update = this.objInstances.filter(x => x.uuid == last.obj.uuid)[0];
                let data = last.history;
                update.pos = data.p;
                update.size = data.s;
                update.rotation = data.r || [0, 0, 0];
                update.collidable = data.col===undefined?true:false;        
                update.penetrable = data.pe?true:false; 
                update.texture = (config.textureIDS[data.t||0])||ObjectInstance.DEFAULT_TEXTURE;
                update.boost = data.b || 0;
                update.edgeNoise = data.en || 0;
                update.health = data.hp || 0;
                update.part = data.pr || 0;
                update.team = data.tm || 0;
                update.visible = data.v===undefined?true:false;
                update.terrain = data.ter||false;
                update.color = data.c!=undefined?data.c:'#FFFFFF';
                update.emissive = data.e!=undefined?data.e:'#000000';
                update.opacity = data.o!=undefined?data.o:1;
                update.direction = data.d || undefined;
                
                update.planeType = data.ap ? 2 : (data.tr ? 1 : 0);
                let plane = update.planeType > 0 ? (data.ap || data.tr).split(',') : [];
                update.xSeg = (plane[0] != undefined ? plane[0] : 25);
                update.ySeg = (plane[1] != undefined ? plane[1] : 25);
                update.maxHeight = (plane[2] != undefined ? plane[2] : 1);
                update.frequency = update.planeType == 1 ? (plane[3] != undefined ? plane[3] : 2.5) : 2.5;
                update.speedMlt = update.planeType == 2 ? (plane[3] != undefined ? plane[3] : 10) : 10;
                update.seed = (plane[4] != undefined ? plane[4] : Math.random());
                
                this.objHistory[last.obj.uuid] = update.serialize();
                break;
        }
    },

    // INIT RENDERER:
    initRenderer() {

        // RENDERER:
        this.renderer = new THREE.WebGLRenderer({
            precision:"mediump",
    		powerPreference: "high-performance",
    		antialias: this.settings.antiAlias ? true : false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio * 0.6);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // RAYCASTER:
        this.raycaster = new THREE.Raycaster();

    },

    // INIT CONTROLS:
    moveSprint: false,
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    transformOptionIds: ["translateOption", "rotateOption", "scaleOption"],
    spaceOptionIds: ["worldSpaceOption", "localSpaceOption"],
    initControls() {
        // POINTER LOCK:
        let havePointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
        if (havePointerLock) {
            let element = this.renderer.domElement;

            // Declare callbacks
            let pointerLockChange = () => {
                // noinspection JSUnresolvedVariable
                this.controls.enabled = document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element;
            };
            let pointerLockError = ev => {
                console.error("Pointer lock error.", ev);
            };

            // Hook pointer lock state change events
            document.addEventListener("pointerlockchange", pointerLockChange, false);
            document.addEventListener("mozpointerlockchange", pointerLockChange, false);
            document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
            document.addEventListener("pointerlockerror", pointerLockError, false);
            document.addEventListener("mozpointerlockerror", pointerLockError, false);
            document.addEventListener("webkitpointerlockerror", pointerLockError, false);

            // Lock and unlock pointer on right click
            element.addEventListener("mousedown", (event) => {
                if (event.which === 3 || event.button === 2) {
                    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                    element.requestPointerLock();
                }
            }, false);
            element.addEventListener("mouseup", (event) => {
                if (event.which === 3 || event.button === 3) {
                    document.exitPointerLock();
                }
            })
        } else {
            alert("Your browser does not support pointer lock.");
        }

        // KEYS:
        document.addEventListener("keydown", ev => {
            if (this.isTyping(ev)) return;
            switch (ev.keyCode) {
                case 16: // shift
                    this.moveSprint = true;
                    break;
                case 38: // up
                case 87: // w
                    this.moveForward = true;
                    break;
                case 37: // left
                case 65: // a
                    this.moveLeft = true; break;
                case 40: // down
                case 83: // s
                    this.moveBackward = true;
                    break;
                case 39: // right
                case 68: // d
                    this.moveRight = true;
                    break;
                case 81: // q
                case 90: // z
                    if (!ev.ctrlKey) this.moveDown = true;
                    break;
                case 69: // e
                case 88: // x
                    this.moveUp = true;
                    break;
            }
        }, false);
        document.addEventListener("keyup", ev => {
            if (this.isTyping(ev)) return;
            switch (ev.keyCode) {
                case 16: // shift
                    this.moveSprint = false;
                    break;
                case 38: // up
                case 87: // w
                    this.moveForward = false;
                    break;
                case 37: // left
                case 65: // a
                    this.moveLeft = false;
                    break;
                case 40: // down
                case 83: // s
                    this.moveBackward = false;
                    break;
                case 39: // right
                case 68: // d
                    this.moveRight = false;
                    break;
                case 81: // q
                case 90: // z
                    this.moveDown = false;
                    break;
                case 69: // e
                case 88: // x
                    this.moveUp = false;
                    break;
            }
        }, false);

        // POINTER LOCK CONTROLS:
        this.controls = new THREE.PointerLockControls(this.camera);
        this.scene.add(this.controls.getObject());
        this.controls.getObject().position.set(0, 50, 100);

        // TRANSFORM CONTROLS:
        this.transformControl = new THREE.TransformControls(this.camera, this.renderer.domElement);
        this.transformControl.addEventListener("mouseUp", () => {
            this.updateObjConfigGUI();
        });
        this.scene.add(this.transformControl);

        // TRANSFORM BUTTONS:
        for (let i = 0; i < this.transformOptionIds.length; i++) {
            let optionId = this.transformOptionIds[i];
            let option = document.getElementById(optionId);
            option.addEventListener("click", () => this.setTransformType(i));
        }
        this.setTransformType(0);

        // SPACE BUTTONS:
        for (let i = 0; i < this.spaceOptionIds.length; i++) {
            let optionId = this.spaceOptionIds[i];
            let option = document.getElementById(optionId);
            option.addEventListener("click", () => this.setTransformSpace(i));
        }
        this.setTransformSpace(0);
    },

    // REGISTER EVENTS:
    registerEvents() {
        // Key down event
        window.addEventListener("keydown", ev => {
            if (this.isTyping(ev)) return;
            switch (ev.keyCode) {
                case 49: // 1
                    this.setTransformType(0);
                    break;
                case 50: // 2
                    this.setTransformType(1);
                    break;
                case 51: // 3
                    this.setTransformType(2);
                    break;
                case 192: // grave accent
                    this.setTransformSpace(this.transformSpace === 0 ? 1 : 0);
                    break;
                case 8:
                case 46: // delete, backspace
                    this.objectSelected(true) ? this.removeGroup() : this.removeObject();
                    break;
                case 80: // p
                    this.createPlaceholder();
                    break;
                case 82: // r
                    if (ev.shiftKey) this.objectSelected(true) ? this.duplicateGroup() : this.duplicateObject();
                    break;
                case 67: //ctrl c
                    if (ev.ctrlKey) this.copyObjects();
                    break;
                case 86: //ctrl v
                    if (ev.ctrlKey) this.pasteObjects();
                    break;
                case 70: //shift f (fix)
                    if (ev.shiftKey) this.fixHitbox();
                    break;
                case 71: //shift g (grouping)
                    if (ev.shiftKey) { 
                        if (ev.altKey) return this.stopGroup(true); 
                        if (this.objectSelected(true)) {
                            this.stopGroup();
                        } else {
                            this.copyObjects(false, true);
                        }
                    }
                    break;
                case 89: //ctrl y (redo)
                    if(ev.ctrlKey) this.executeHistory('redo');
                    break;
                case 90: // ctrl z (undo)
                    if(ev.ctrlKey) this.executeHistory(ev.shiftKey ? 'redo' : 'undo');
                    break;
            }
        });
        
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }); 

        // Click event
        this.container.addEventListener("mousedown", () => {
            // Make sure only left clicking
            if (event.which !== 1 && event.button !== 0) return;

            // Test the event
            let rayPoint = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            this.raycaster.setFromCamera(rayPoint, this.camera);

            // Handle the transform selection
            let intersects = this.raycaster.intersectObjects(this.boundingMeshes, true);
            if (intersects.length > 0) {
                let selected = intersects[0].object;
                this.attachTransform(selected);
            } else {
                this.hideTransform();
            }
        });
        // Move event
        this.container.addEventListener("mousemove", () => {
            if (!this.settings.objectHighlight) return this.removeHighlight();

            // Test the event
            let rayPoint = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );

            this.raycaster.setFromCamera(rayPoint, this.camera);

            let intersects = this.raycaster.intersectObjects(this.boundingMeshes, true);
            if (intersects.length > 0) {
                let selected = intersects[0].object.userData.owner;
                this.setHighlight(selected);
            } else {
                this.removeHighlight();
            }
        });
        this.container.addEventListener("drop", () => {
            event.preventDefault();
            let scope = this;
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                let file = event.dataTransfer.files[i];
                let reader = new FileReader();
                reader.onload = function (event){
                    let dataUri	= event.target.result;
                    let base64 = dataUri.match(/[^,]*,(.*)/)[1];
                    let json = window.atob(base64);
                    scope.importMap(json);
                };
                reader.readAsDataURL(file);
            }
        }, false);
        this.container.addEventListener("dragover", () => {
            event.preventDefault();
        }, false);
    },

    // RENDER:
    render() {
        // Get the delta time
        let dt = this.clock.getDelta();

        // Find move direction
        let moveDirection = new THREE.Vector3(0, 0, 0);
        if (this.moveForward) moveDirection.z -= 1;
        if (this.moveBackward) moveDirection.z += 1;
        if (this.moveLeft) moveDirection.x -= 1;
        if (this.moveRight) moveDirection.x += 1;
        if (this.moveUp) moveDirection.y += 1;
        if (this.moveDown) moveDirection.y -= 1;

        // Move the camera
        let moveSpeed = this.moveSprint ? this.settings.speedSprint : this.settings.speedNormal;
        // this.scene.updateMatrixWorld();
        moveDirection.applyQuaternion(this.camera.getWorldQuaternion());
        this.controls.getObject().position.add(moveDirection.multiplyScalar(moveSpeed * dt));

        // Update all of the instances
        for (let instance of this.objInstances) {
            instance.update(dt);
        }
        
        // Check Group changes
        this.updateGroups();

        // Do the render
        this.renderer.render(this.scene, this.camera);
        this.transformControl.update();
        requestAnimationFrame(() => this.render());
    },

    // OBJECT MANAGEMENT:
    addObject(instance, multiple = false, add = true) {
        // Multiple - Use When importing large amounts of objects at once

        // Create object
        this.scene.add(instance);
        this.objInstances.push(instance);
        updateObjectCount(this.objInstances.length);
        
        if (add) this.addToHistory('add', instance);

        // Add the bounding mesh
        this.scene.add(instance.boundingMesh);
        if (instance.boxShape) this.scene.add(instance.boxShape);
        this.boundingMeshes.push(instance.boundingMesh);

        // Add the arrow
        if (instance.arrowHelper) this.scene.add(instance.arrowHelper);

        // Select item
        if (!multiple) this.attachTransform(instance.boundingMesh);
    },
    removeObject(object, multiple = false, add = true) {
        // Remove the object passed in or the selected object
        object = object ? object.boundingMesh : this.transformControl.object;
        if (object) {
            // Remove the instance
            let instance = object.userData.owner;
            this.objInstances.splice(this.objInstances.indexOf(instance), 1);
            updateObjectCount(this.objInstances.length);
            this.scene.remove(instance);

            // Remove the bounding mesh
            this.boundingMeshes.splice(this.boundingMeshes.indexOf(object), 1);
            this.scene.remove(object);
            if (instance.boxShape) this.scene.remove(instance.boxShape);

            // Remove the arrow
            if (instance.arrowHelper) this.scene.remove(instance.arrowHelper);
            
            if (add) this.addToHistory('remove', instance);

            // Remove transform
            if (!multiple) this.hideTransform();
        } else {
            console.log("No object to remove.");
        }
    },
    duplicateObject() {
        // Duplicate the object if selected
        let object = this.transformControl.object;
        if (object) {
            // Remove the instance
            let oldInstance = object.userData.owner;
            let newInstance = oldInstance.clone();
            this.addObject(newInstance);

            // Select the object
            this.attachTransform(newInstance.boundingMesh);
        } else {
            console.log("No object to duplicate.");
        }
    },

    // GET MAP EXPORT:
    getMapExport() {
        let objects = [];
        let spawns = [];
        let camPos = [0, 0, 0];
        for (let instance of this.objInstances.filter(x => !x.prefab.noExport)) {
            if (instance.objType === "SPAWN_POINT") {
                var tmpArray = [instance.pos[0], instance.pos[1], instance.pos[2]];
                if (instance.team) tmpArray.push(parseInt(instance.team));
                spawns.push(tmpArray);
            } else if (instance.objType === "CAMERA_POSITION") {
                camPos = instance.pos;
            } else objects.push(instance.serialize());
        }
        let map = Object.assign({}, this.mapConfig, { camPos, spawns, objects });
        return JSON.stringify(map);
    },

    // MAP MANAGEMENT:
    exportMap() {
        var text = this.getMapExport();
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', this.mapConfig.name);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },
    importMap(fromFile = null) {

        // Prompt to get text
        let mapRaw = fromFile ? fromFile : prompt("Copy Paste Map Text Here");
        if (!mapRaw || mapRaw == "") return;
        
        // Parse the map
        try {

            // Parse map
            let map = JSON.parse(mapRaw);
            map = map.states || map.id ? map.map : map;
            // Clear the map
            this.clearMap();

            // Create the objects
            for (let data of map.objects) {
                this.addObject(ObjectInstance.deserialize(data), true);
            }
            delete map.objects; // Remove so it's not part of the map config

            // Add the camera position and spawn points
            if (map.camPos) this.addObject(new ObjectInstance({ id: 6, p: map.camPos }));
            for (let point of map.spawns) {
                this.addObject(new ObjectInstance({ id: 5, p: [point[0], point[1], point[2]],
                    tm: point[3] }));
            }

            // Save config
            Object.assign(this.mapConfig, map);
            
            this.scene.background = new THREE.Color(this.mapConfig.sky);
            this.skyLight.color.set(this.mapConfig.light);
            this.scene.fog.color.set(this.mapConfig.fog);
            this.scene.fog.far = this.mapConfig.fogD;
            this.mapGUI.updateDisplay();
            
        } catch (e) {
            console.log(e);
            alert("Failed to import map with error:\n" + e.toString());
        }
    },

    // HIGHLIGHT MANAGEMENT:
    setHighlight(object) {
        if (this.highlightObject == object) return;
        if (this.highlightObject) this.highlightObject.defaultMaterial.emissive.setHex(this.highlightObject.currentHex);
        this.highlightObject = object;
        this.highlightObject.currentHex = this.highlightObject.defaultMaterial.emissive.getHex();
        this.highlightObject.defaultMaterial.emissive.setHex(Math.random() * 0xff00000 - 0xff00000);
    },
    removeHighlight() {
        if (!this.highlightObject) return;
        this.highlightObject.defaultMaterial.emissive.setHex(this.highlightObject.currentHex);
        this.highlightObject = null;
    },

    // TRANSFORM MANAGEMENT:
    attachTransform(object) {
        if (object instanceof ObjectInstance) object = object.boundingMesh;
        this.transformControl.attach(object);
        this.updateObjConfigGUI();
    },
    hideTransform() {
        this.transformControl.detach(this.transformControl.object);
        this.updateObjConfigGUI();
    },
    setTransformType(type) {
        // Update the mode
        let typeString;
        switch (type) {
            case 0:
                typeString = "translate";
                break;
            case 1:
                typeString = "rotate";
                break;
            case 2:
                typeString = "scale";
                break;
        }
        this.transformControl.setMode(typeString);

        // Set the appropriate transform button to active
        for (let i = 0; i < this.transformOptionIds.length; i++) {
            let optionId = this.transformOptionIds[i];
            let option = document.getElementById(optionId);
            if (i === type) {
                option.classList.add("selected");
            } else {
                option.classList.remove("selected");
            }
        }

        // Transform does not allow for scaling in world space, so we need to force local space when scaling
        if (type === 2) {
            this.setTransformSpace(1);
        }
    },
    transformSpace: 0,
    setTransformSpace(type) {
        // Set the space
        this.transformSpace = type;
        let typeString;
        switch (type) {
            case 0:
                typeString = "world";
                break;
            case 1:
                typeString = "local";
                break;
        }
        this.transformControl.setSpace(typeString);

        // Set the appropriate space button to active
        for (let i = 0; i < this.spaceOptionIds.length; i++) {
            let optionId = this.spaceOptionIds[i];
            let option = document.getElementById(optionId);
            if (i === type) {
                option.classList.add("selected");
            } else {
                option.classList.remove("selected");
            }
        }
    },
    snappingEnabled: true,
    //translationSnapping: 1,
    //rotationSnapping: 10,
    setSnapping(enabled) {
        this.snappingEnabled = enabled;
        this.updateSnapping();
    },
    updateSnapping() {

        // Set snapping
        this.transformControl.setTranslationSnap(this.snappingEnabled ? this.settings.translationSnapping : null);
        this.transformControl.setRotationSnap(this.snappingEnabled ? THREE.Math.degToRad(this.settings.rotationSnapping) : null);

        // Update grid helper
        this.updateGridHelper();
    },
    updateGridHelper() {
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }

        // Create new grid helper
        this.gridHelper = new THREE.GridHelper(this.settings.gridSize, this.settings.gridSize / this.settings.gridSpacing);
        this.gridHelper.visible = this.settings.gridVisibility;
        this.gridHelper.material.opacity = this.settings.gridOpacity;
        this.gridHelper.material.transparent = true;
        this.scene.add(this.gridHelper);
    },

    // MISC:
    clearMap() {
        // Remove each object
        while (this.objInstances.length > 0) {
            // `removeObject` will remove this value from the array
            this.removeObject(this.objInstances[0], true);
        }
        updateObjectCount(0);
        this.hideTransform();
    },
    xyzKeys: ["X", "Y", "Z"],
    updateObjConfigGUI() {
        let wasOpen = {};
        // Remove all previous options
        for (let option of this.objConfigOptions) {
            // Remove folder or option with appropriate method
            if (option instanceof dat.GUI) {
                // Preserve Open State
                wasOpen[option.name] = !option.closed;
                this.objConfigGUI.removeFolder(option);
            } else {
                this.objConfigGUI.remove(option);
            }
        }
        this.objConfigOptions.length = 0;

        // Get selected object
        let selected = this.transformControl.object;
        if (!selected) return;
        let instance = selected.userData.owner;

        // Update values of config
        this.objConfig.pos = instance.pos;
        this.objConfig.rot = instance.rot;
        this.objConfig.size = instance.size;
        this.objConfig.texture = instance.texture;
        this.objConfig.part = instance.part;
        this.objConfig.collidable = instance.collidable;
        this.objConfig.penetrable = instance.penetrable;
        this.objConfig.boost = instance.boost;
        this.objConfig.edgeNoise = instance.edgeNoise;
        this.objConfig.health = instance.health;
        this.objConfig.team = instance.team;
        this.objConfig.visible = instance.visible;
        this.objConfig.color = instance.color;
        this.objConfig.emissive = instance.emissive;
        this.objConfig.opacity = instance.opacity;
        this.objConfig.direction = instance.direction;
        
        // PLANE ANIMATION
        this.objConfig.maxHeight = instance.maxHeight;
        this.objConfig.xSeg = instance.xSeg;
        this.objConfig.ySeg = instance.ySeg;
        this.objConfig.planeType = instance.planeType;
        this.objConfig.seed = instance.seed;
        this.objConfig.frequency = instance.frequency;
        this.objConfig.speedMlt = instance.speedMlt;
        let o;

        // BOOLEANS:
        if (!instance.prefab.tool) {
            o = this.objConfigGUI.add(this.objConfig, "visible").name("Visible").listen().onChange(c => {
                instance.visible = c;
            });
            this.objConfigOptions.push(o);
        } if (!instance.prefab.tool) {
            o = this.objConfigGUI.add(this.objConfig, "collidable").name("Collidable").listen().onChange(c => {
                instance.collidable = c;
            });
            this.objConfigOptions.push(o);
        } if (instance.prefab.editPen) {
            o = this.objConfigGUI.add(this.objConfig, "penetrable").name("Penetrable").listen().onChange(c => {
                instance.penetrable = c;
            });
            this.objConfigOptions.push(o);
        }  if (instance.prefab.boostable) {
            o = this.objConfigGUI.add(this.objConfig, "boost", -10, 10, 0.1).name("Boost").listen().onChange(c => {
                instance.boost = c;
            });
            this.objConfigOptions.push(o);
        } if (instance.prefab.edgeNoise) {
            o = this.objConfigGUI.add(this.objConfig, "edgeNoise", -5, 5, 0.1).name("Edge Noise").listen().onChange(c => {
                instance.edgeNoise = c;
            });
            this.objConfigOptions.push(o);
        }

        // HEALTH:
        if (instance.prefab.hasHealth) {
            o = this.objConfigGUI.add(this.objConfig, "health", 0, 500, 10).name("Health").onChange(h => {
                instance.health = h;
            });
            this.objConfigOptions.push(o);
        }
        
        // PLANE EFFECTS:
        if (instance.prefab.canTerrain) {
            o = this.objConfigGUI.addFolder("Manipulate");
            let options = {
                "Default": 0,
                "Terrain": 1,
                "Animated": 2
            };
            o.add(this.objConfig, "planeType").options(options).name("Effect").onChange(t => {
                instance.planeType = t;
                instance.resetPlane();
            });
            o.add(this.objConfig, "maxHeight", 1, 300, 1).name("Max Height").onChange(h => {
                instance.maxHeight = h;
            });
            o.add(this.objConfig, "xSeg", 10, 256, 5).name("X Segments").onChange(x => {
                instance.xSeg = x;
            });
            o.add(this.objConfig, "ySeg", 10, 256, 5).name("Y Segments").onChange(y => {
                instance.ySeg = y;
            });
            o.add(this.objConfig, "frequency", 0.1, 5, .1).name("Frequency").onChange(f => {
                instance.frequency = f;
            });
            o.add(this.objConfig, "speedMlt", 1, 50, 1).name("Speed Multiplier").onChange(s => {
                instance.speedMlt = s;
            });
            o.add(this.objConfig, "seed").name("Seed").onChange(y => {
                instance.seed = y;
            });
            let other = {
                resetPlane: (() => instance.resetPlane()),
                randomSeed: (() => (this.objConfig.seed = instance.seed = Math.random(), this.objConfigGUI.updateDisplay()))
            };
            o.add(other, "randomSeed").name("Randomize Seed");
            o.add(other, "resetPlane").name("Regenerate");
            this.objConfigOptions.push(o);
        }
        
        // PARTICLES:
        if (instance.prefab.hasParticles) {
            let options = {
                "Snow": 0,
                "Rain": 1,
                "Fog": 2
            };
            o = this.objConfigGUI.add(this.objConfig, "part").options(options).name("Type").listen().onChange(prt => {
                instance.part = prt;
            });
            this.objConfigOptions.push(o);
        }

        // COLOR:
        if (instance.prefab.texturable) {
            let options = {
                "Default": "DEFAULT"
            };
            for (let key in texturePrefabs) {
                if (key != "DEFAULT") {
                    if (!texturePrefabs.hasOwnProperty(key)) continue;
                    options[this.formatConstName(key)] = key;
                }
            }
            o = this.objConfigGUI.add(this.objConfig, "texture").options(options).name("Texture").listen().onChange(prefabId => {
                instance.texture = prefabId;
            });
            this.objConfigOptions.push(o);
        } if (instance.prefab.editColor) {
            o = this.objConfigGUI.addColor(this.objConfig, "color").name("Color").onChange(c => {
                instance.color = c;
            });
            this.objConfigOptions.push(o);
        } if (instance.prefab.editEmissive) {
            o = this.objConfigGUI.addColor(this.objConfig, "emissive").name("Emissive").onChange(c => {
                instance.emissive = c;
            });
            this.objConfigOptions.push(o);
        } if (instance.prefab.editOpac) {
            o = this.objConfigGUI.add(this.objConfig, "opacity", 0, 1, 0.1).name("Opacity").onChange(c => {
                instance.opacity = c;
            });
            this.objConfigOptions.push(o);
        }

        // OTHER:
        if (instance.prefab.customDirection) {
            o = this.objConfigGUI.add(this.objConfig, "direction", 0, 3, 1).name("Direction").onChange(d => {
                instance.direction = d;
            });
            this.objConfigOptions.push(o);
        } if (instance.prefab.teamable) {
            var teams = {
                "Default": 0,
                "Team 1": 1,
                "Team 2": 2
            };
            o = this.objConfigGUI.add(this.objConfig, "team").options(teams).name("Team").listen().onChange(c => {
                instance.team = c;
            });
            this.objConfigOptions.push(o);
        }

        // POS,ROT,SCL GUI:
        const arrayAttribute = (instanceKey, array, name) => {
            o = this.objConfigGUI.addFolder(name);
            for (let i = 0; i < 3; i++) {
                o.add(array, i).name(this.xyzKeys[i]).onChange(v => {
                    instance[instanceKey] = instanceKey == "rot" ? this.degToRad(array) : array;
                });
            }
            if (wasOpen[name] && this.settings.preserveFolderState) o.open();
            this.objConfigOptions.push(o);
        };
        arrayAttribute("pos", this.objConfig.pos, "Position");
        arrayAttribute("rot", this.objConfig.rot, "Rotation");
        if (instance.prefab.scalable) arrayAttribute("size", this.objConfig.size, "Size");

    },
    formatConstName(original) {
        return original.toLowerCase().split("_").map(s => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()).join(" ")
    },
    isTyping(ev) {
        let targetType = ev.target.getAttribute("type");
        return targetType === "text" || targetType === "number";
    },
    shorten(num) {
        return parseFloat(Math.round(num));
    },
    replaceObject(str, skip = false, fix = false, autoGroup = false) {
        let selected = this.objectSelected();
        if (selected) {
            if (!fix && !autoGroup) this.removeObject();

            let jsp = JSON.parse(str);
            jsp = jsp.objects ? jsp.objects : (jsp.states || jsp.id ? jsp.map.objects : jsp);

            let rotation = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Assets"].__controllers[1].getValue());
            let yAxis = new THREE.Vector3(0, 1, 0);
            if (fix) {
                console.log(selected.rotation.y, THREE.Math.radToDeg(selected.rotation.y), (selected.rotation.y * (180 / Math.PI)));
                if (fix != 'RAMP') this.objConfigGUI.__controllers[1].setValue(false);
                if (['VEHICLE', 'CONTAINER', 'CONTAINERR', 'TREE'].includes(fix)) rotation = 360 - (selected.rotation.y * (180 / Math.PI));
            }
            
            if ([90, 180, 270].includes(rotation)) {
                jsp = this.rotateObjects(jsp, rotation);
            }

            let objects = [];
            let center = this.findCenter(jsp);
            for (let ob of jsp) {
                ob.p[0] += selected.userData.owner.position.x - center[0];
                ob.p[1] += selected.userData.owner.position.y - (selected.scale.y / 2) - center[1] - (fix == "RAMP" ? 2 : 0);
                ob.p[2] += selected.userData.owner.position.z - center[2] - (fix == "VEHICLE" ? 0.5 : 0);
                let obj = ObjectInstance.deserialize(ob);
                if (rotation > 0 && ![90, 180, 270].includes(rotation)) this.rotateAroundPoint(obj.boundingMesh, selected.position, yAxis, THREE.Math.degToRad(rotation));
                if (autoGroup) objects.push(obj);
                this.addObject(obj, skip);
            }
            if (autoGroup) this.createGroup(selected, objects, [90, 180, 270].includes(rotation) ? 0 : THREE.Math.degToRad(rotation));
            if (skip && !autoGroup) this.hideTransform();
            this.advancedGUI.__folders["Advanced"].__folders["Assets"].__controllers[1].setValue(0);
        } else {
            alert("You must select a object first");
        }
    },
    createBoundingBox(x, y, z, sX, sY, sZ, rY) {
        let obph = {p: [x, y, z], s: [sX + 1, sY + 1, sZ + 1], r: [0, rY, 0], id: config.prefabIDS.length - 1};
        return ObjectInstance.deserialize(obph);
    },
    rotateObjects(jsp, deg) {
        switch (deg) {
            case 90: return this.changeAngle(jsp);
            case 180: return this.reflectAngle(jsp);
            case 270: return this.reflectAngle(this.changeAngle(jsp));
        }
        return jsp;
    },
    findCenter(jsp, live = false) {
        let yMin = live ? jsp[0].position.y : jsp[0].p[1],
        yMax = live ? jsp[0].position.y + jsp[0].scale.y: jsp[0].p[1] + jsp[0].s[1],
        xMin = live ? jsp[0].position.x - (jsp[0].scale.x / 2) : jsp[0].p[0] - (jsp[0].s[0] / 2),
        xMax = live ? jsp[0].position.x + (jsp[0].scale.x / 2) : jsp[0].p[0] + (jsp[0].s[0] / 2),
        zMin = live ? jsp[0].position.z - (jsp[0].scale.z / 2) : jsp[0].p[2] - (jsp[0].s[2] / 2),
        zMax = live ? jsp[0].position.z + (jsp[0].scale.z / 2) : jsp[0].p[2] + (jsp[0].s[2] / 2);

        for (let ob of jsp) {
            let pos = live ? ob.position.toArray() : ob.p;
            let size = live ? ob.scale.toArray() : ob.s;
            if (pos[1] < yMin) yMin = pos[1];
            if (pos[1] + size[1] > yMax) yMax = pos[1] + size[1];
            if (pos[0] - (size[0] / 2) < xMin) xMin = pos[0] - (size[0] / 2);
            if (pos[0] + (size[0] / 2) > xMax) xMax = pos[0] + (size[0] / 2);
            if (pos[2] - (size[2] / 2) < zMin) zMin = pos[2] - (size[2] / 2);
            if (pos[2] + (size[2] / 2) > zMax) zMax = pos[2] + (size[2] / 2);
        }

        return [Math.round((xMin + xMax) / 2), yMin, Math.round((zMin + zMax) / 2), Math.round(Math.abs(xMin) + Math.abs(xMax)), yMax, Math.round(Math.abs(zMin) + Math.abs(zMax))];
    },
    applyCenter(objects) {
        let center = this.findCenter(objects);
        for (let ob of objects){
            ob.p[0] -= center[0];
            ob.p[1] -= center[1];
            ob.p[2] -= center[2];
        }
        return objects;
    },
    changeAngle(jsp){
        for (let ob of jsp) {
            let x = ob.s[0], y = ob.s[2];
            ob.s[0] = y;
            ob.s[2] = x;
            let a = ob.p[0], b = ob.p[2];
            ob.p[0] = b;
            ob.p[2] = a;
        }
        
        return jsp;
    },
    reflectAngle(jsp) {
        for (let ob of jsp) {
            ob.p[0] = -1 * ob.p[0];
            ob.p[2] = -1 * ob.p[2];
        }
        return jsp;
    },
    reflect(jsp, dir, dnwld = true) {
        let obs = jsp.objects ? jsp.objects : (jsp.states || jsp.id ? jsp.map.objects : jsp);
        let reference = this.findCenter(obs);
        for (let ob of obs) {
            ob.p[dir] * -1;
            ob.p[dir] += 2 * (reference[dir] - ob.p[dir]);

            if ('d' in ob) {
                if ((dir == 0 && (ob.d == 0 || ob.d == 2)) || (dir == 2 && (ob.d == 1 || ob.d == 3))) ob.d = Math.abs(dir + 2 - ob.d);
            }
        }

        if ('spawns' in jsp) {
            for (let spwn of jsp.spawns) {
                spwn[dir] * -1;
                spwn[dir] += 2 * (reference[dir] - spwn[dir]);
            }
        }

        if ('camPos' in jsp) {
            jsp.camPos[dir] * -1;
            jsp.camPos[dir] += 2 * (reference[dir] - jsp.camPos[dir]);
        }

        if (dnwld) this.download(JSON.stringify(jsp), 'reflect.txt', 'text/plain');
        return jsp;
    },
    reflectMap() {
        let dir = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Reflect Map"].__controllers[0].getValue()),
        reference = this.findCenter(this.objInstances, true);

        for (let ob of this.objInstances) {
            let pos = ob.pos;

            pos[dir] * -1;
            pos[dir] += 2 * (reference[dir] - pos[dir]);
            ob.pos = pos;

            if (ob.direction != null) {
                if ((dir == 0 && (ob.direction == 0 || ob.direction == 2)) || (dir == 2 && (ob.direction == 1 || ob.direction == 3))) ob.direction = Math.abs(dir + 2 - ob.direction);
            }
        }
        this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Reflect Map"].__controllers[0].setValue(0);
        if (!this.settings.preserveFolderState) this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Reflect Map"].close();
    },
    copyObjects(cut = false, group = false, ret = false) {
        let selected = this.objectSelected();
        if (!selected) return alert('Stretch a cube over your objects then try again');
        if (group && this.objGroups && Object.keys(this.objGroups).includes(selected.uuid)) return alert('You cant combine groups');

        let pos = {
            minX: selected.position.x - (selected.scale.x / 2), 
            minY: selected.position.y, 
            minZ: selected.position.z - (selected.scale.z / 2),  
            maxX: selected.position.x + (selected.scale.x / 2), 
            maxY: selected.position.y + selected.scale.y, 
            maxZ: selected.position.z + (selected.scale.z / 2), 
        };
        let intersect = [];
        let obs = [];
        for (let ob of this.objInstances) {
            if (ob.boundingMesh.uuid == selected.uuid) continue;
            if (this.intersect({
                    minX: ob.boundingMesh.position.x - (ob.boundingMesh.scale.x / 2), 
                    minY: ob.boundingMesh.position.y, 
                    minZ: ob.boundingMesh.position.z - (ob.boundingMesh.scale.z / 2), 
                    maxX: ob.boundingMesh.position.x + (ob.boundingMesh.scale.x / 2), 
                    maxY: ob.boundingMesh.position.y + ob.boundingMesh.scale.y, 
                    maxZ: ob.boundingMesh.position.z + (ob.boundingMesh.scale.z / 2)
                }, pos)) {
                obs.push(ob);
                intersect.push(ob.serialize());
            }
        }

        if (!group) {
            if (cut && obs.length && !group) {
                for (let i = 0; i < obs.length; i++) 
                    this.removeObject(obs[i]);
            }

            if (ret) return intersect;
            this.copy = JSON.stringify(intersect);
        } else {
            this.createGroup(selected, obs);
        }
    },
    exportGroup(full = false) {
        let obs = this.copyObjects(false, false, true);
        if (obs.length == 0) return alert('There was nothing to save');
        let nme = prompt("Name your asset", "");
        if (nme == null || nme == "") return alert('Please name your asset');

        obs = this.applyCenter(obs);

        if (full) 
            obs = {
                "name": "asset_" + nme.replace(/ /g,"_"),
                "modURL":"https://www.dropbox.com/s/4j76kiqemdo6d9a/MMOKBill.zip?dl=0",
                "ambient":9937064,
                "light":15923452,
                "sky":14477549,
                "fog":9280160,
                "fogD":900,
                "camPos":[0,0,0],
                "spawns":[], 
                "objects": obs
            };
        this.download(JSON.stringify(obs), 'asset_' + nme.replace(/ /g,"_") + '.txt', 'text/plain');
        if (!this.settings.preserveFolderState) this.advancedGUI.__folders["Advanced"].__folders['MultiObject'].__folders['Export'].close();
    },
    pasteObjects() {
        if (!this.copy) return alert('Please copy objects first');
        if (!this.objectSelected()) return alert('Select a object you would like to replace with your copied objects');
        this.replaceObject(this.copy, true);
    },
    createGroup(owner, objects, rot = 0) {
        let ids = [];
        let data = [];
        for (let ob of objects) {
            ids.push(ob.boundingMesh.uuid);
            data.push(ob.serialize());
        }
        let center = this.findCenter(this.applyCenter(data));
        let groupBox = this.createBoundingBox(owner.position.x, owner.position.y, owner.position.z, center[3], center[4], center[5], rot);
        this.removeObject();
        this.addObject(groupBox);
        
        this.objGroups[groupBox.boundingMesh.uuid] = {
            owner: groupBox.boundingMesh, 
            pos: {...groupBox.boundingMesh.position}, 
            scale: {...groupBox.boundingMesh.scale},
            rotY: groupBox.boundingMesh.rotation.y,
            objects: ids
        };
    },
    removeGroup() {
        if (Object.keys(this.objGroups).length == 0) return;

        let selected = this.objectSelected(true);
        if (!selected) return;

        let remOb = [];

        this.objGroups[selected.uuid].objects.push(selected.uuid);
        let obs = this.objInstances.filter(ob => this.objGroups[selected.uuid].objects.includes(ob.boundingMesh.uuid));
        for (let i = 0; i < obs.length; i++)
            this.removeObject(obs[i]);

        delete this.objGroups[selected.uuid];
    },
    duplicateGroup() {
        if (Object.keys(this.objGroups).length == 0) return;

        let selected = this.objectSelected(true);
        if (!selected) return alert('You cant duplicate a group that doesnt exist');

        let group = this.objGroups[selected.uuid];
        let obs = this.objInstances.filter(ob => group.objects.includes(ob.boundingMesh.uuid));
        let intersect = [];

        for (let ob of obs) {
            let newOb = ObjectInstance.deserialize(ob.serialize());
            intersect.push(newOb);
            this.addObject(newOb);
        }
        
        let groupBox = this.addObject(selected.userData.owner.clone());
        selected = this.objectSelected();

        this.createGroup(selected, intersect);
    },
    updateGroups() {
        if (Object.keys(this.objGroups).length == 0) return;

        for (let uuid in this.objGroups) {
            let group = this.objGroups[uuid];

            // Position Change Check
            let currPos = group.owner.position,
                prevPos = group.pos,
                diffPos = [currPos.x - prevPos.x, currPos.y - prevPos.y, currPos.z - prevPos.z],
                changedPos = !(diffPos[0] === 0 && diffPos[1] === 0 && diffPos[2] === 0);

            // Scale Change Check
            let currScale = group.owner.scale,
                prevScale = group.scale,
                diffScale = [(currScale.x / prevScale.x), (currScale.y / prevScale.y), (currScale.z / prevScale.z)],
                changedScale = !(diffScale[0] === 1 && diffScale[1] === 1 && diffScale[2] === 1);

            //Y Rotation Change Check
            let currRot = group.owner.rotation,
                prevRot = group.rotY,
                diffRot = currRot.y - prevRot,
                changedRot = !(diffRot == 0);

            if (!changedPos && !changedScale && !changedRot) continue; // no changes
            let obs = this.objInstances.filter(ob => group.objects.includes(ob.boundingMesh.uuid));

            for (let ob of obs) {
                if (changedRot) {
                    this.rotateAroundPoint(ob.boundingMesh, currPos, new THREE.Vector3(0, 1, 0), Math.abs(diffRot), true);
                }
                if (changedScale) {
                    ob.boundingMesh.position.x *= diffScale[0];
                    ob.boundingMesh.position.y *= diffScale[1];
                    ob.boundingMesh.position.z *= diffScale[2];

                    ob.boundingMesh.scale.x *= diffScale[0];
                    ob.boundingMesh.scale.y *= diffScale[1];
                    ob.boundingMesh.scale.z *= diffScale[2];
                }
                if (changedPos) {
                    ob.boundingMesh.position.x += diffPos[0];
                    ob.boundingMesh.position.y += diffPos[1];
                    ob.boundingMesh.position.z += diffPos[2];
                }
            }

            this.objGroups[group.owner.uuid].pos = {...currPos};
            this.objGroups[group.owner.uuid].scale = {...currScale};
            this.objGroups[group.owner.uuid].rotY = currRot.y;
        }
    },
    stopGroup(all = false) {
        if (Object.keys(this.objGroups).length == 0) return alert('You cant stop a group that doesnt exist');

        if (all) {
            let obs = this.objInstances.filter(ob => Object.keys(this.objGroups).includes(ob.boundingMesh.uuid));
            for (let ob of obs) {
                this.removeObject(ob);
            }
            this.objGroups = [];
        } else {
            let selected = this.objectSelected(true);
            if (!selected) return alert('You cant stop a group that doesnt exist');

            delete this.objGroups[selected.uuid];
            return this.removeObject(selected.userData.owner);
        }
    },
    editGroup(change = 'texture', val = null) {
        if (Object.keys(this.objGroups).length == 0) return alert('You cant edit a group that doesnt exist');
        let selected = this.objectSelected(true);
        if (!selected) return alert('You cant edit a group that doesnt exist');
        let group = this.objGroups[selected.uuid];
        let obs = this.objInstances.filter(ob => group.objects.includes(ob.boundingMesh.uuid));
        switch (change) {
            case 'texture': for (let ob of obs) ob.texture = val; break;
            case 'color': for (let ob of obs) ob.color = val; break;
        }
    },
    fixHitbox() {
        let selected = this.objectSelected();
        if (!selected) return;
        switch(selected.userData.owner.objType) {
            case 'VEHICLE':
                this.replaceObject('[{"p":[0,0,0],"s":[47,9,17],"v":1},{"p":[5,9,0],"s":[26,6,17],"v":1}]', true, selected.userData.owner.objType);
                break;
            case 'TREE':
                this.replaceObject('[{"p":[0,0,0],"s":[9,55,9],"v":1},{"p":[0,37,16],"s":[15,15,15],"v":1},{"p":[0,30,-16],"s":[15,15,15],"v":1},{"p":[0,29,11],"s":[4,4,13],"v":1},{"p":[0,33,16],"s":[4,4,4],"v":1},{"p":[0,36,-6],"s":[4,4,5],"v":1},{"p":[0,55,0],"s":[37,37,37],"v":1}]', true, selected.userData.owner.objType);
                break;
            case 'CONTAINERR':
                this.replaceObject('[{"p":[0,0,0],"s":[57,1,25],"c":11739168},{"p":[0,24,0],"s":[57,2,25],"pe":1,"v":1},{"p":[0,0,-12],"s":[57,25,1],"pe":1,"v":1},{"p":[0,0,12],"s":[57,25,1],"pe":1,"v":1}]', true, selected.userData.owner.objType)
                break;
            case 'RAMP':
                let ramp = selected.userData.owner.serialize();
                let dir = ramp.d || 0;
                let x, z, x2, z2, y = ramp.p[1], y2 = ramp.s[1] + ramp.p[1];
                
                if (dir !== 0 && dir !== 2) ramp = this.changeAngle([ramp])[0];
                
                x = ramp.p[0];
                z = ramp.p[2];
                x2 = ramp.s[0] + x;
                z2 = ramp.s[2];

                let obs = this.mergeObjects(this.plotLine(x, y, x2, y2, z, z2));
                if (dir === 2) obs = this.reflect(obs, 0, false);
                if (dir === 1 || dir === 3) obs = this.changeAngle(obs);
                if (dir === 3) obs = this.reflect(obs, 2, false);
                this.replaceObject(JSON.stringify(obs), true, selected.userData.owner.objType);
                break;
        }
    },
    plotLine(x0,y0, x1,y1, z0, z1) {
        let dx = x1 - x0
        let dy = y1 - y0
        let D = 2*dy - dx
        let y = y0
        let obs = [];
        for (let x = x0; x < x1; x++) {
            obs.push({"p":[x, y, z0],"s":[1, 1, obs.length % 5 == 0 ? z1 : (z1 - 2)]});
            if (D > 0) {
                y = y + 1;
                D = D - 2*dx;
            }
            D = D + 2*dy;
        }
        return obs;
    },
    createPlaceholder() {
        let pos = this.camera.getWorldPosition();
        this.addObject(ObjectInstance.deserialize({p: [pos.x, pos.y - 10, pos.z], s: [10, 10, 10], id: config.prefabIDS.length - 1}));
    },
    colorizeMap(input = false, gold = false, rand = false) {
        if (input != false && (input == null || input == "")) return alert("Please input colors (ex: #000000,#ffffff)");
        if (input) input = input.trim().split(',');

        for (let ob of this.objInstances) {
            if (input) ob.color = input.length > 1 ? input[Math.floor(Math.random() * input.length)] : input[0];
            if (rand) ob.color = "#" + Math.random().toString(16).slice(2, 8);
        }
    },
    scaleMap() {
        let sX = this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Scale Map"].__controllers[0].getValue(),
            sY = this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Scale Map"].__controllers[1].getValue(),
            sZ = this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Scale Map"].__controllers[2].getValue();

        for (let ob of this.objInstances) {
            let pos = ob.pos, size = ob.size;

            pos[0] *= sX;
            pos[1] *= sY;
            pos[2] *= sZ;

            size[0] *= sX;
            size[1] *= sY;
            size[2] *= sZ;

            ob.size = size;
            ob.pos = pos;
        }
    },
    breakableMap() {
        if (!confirm("Are you sure you want to make the whole map breakable?")) return;
        let health = this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Breakable Map"].__controllers[0].getValue(),
        forcecol = this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Breakable Map"].__controllers[0].getValue();
        for (let ob of this.objInstances) {
            ob.health = health;
            if (forcecol) ob.collidable = true;
        }
    },
    layoutPlanner() {
        let blockX = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[2].getValue()),
        spaceX = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[3].getValue()),
        blockY = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[4].getValue()),
        spaceY = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[5].getValue()),
        blockZ = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[6].getValue()),
        spaceZ = parseInt(this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[7].getValue()),
        size = this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[0].getValue(),
        color = this.advancedGUI.__folders["Advanced"].__folders["Other Features"].__folders["Layout Planner"].__controllers[1].getValue();

        let objects = [{"p":[0,0,0],"s":[size,size,size],"c":color}];
        objects = this.replicateMulti(objects, blockX, spaceX, 0);
        objects = this.replicateMulti(objects, blockY, spaceY, 1);
        objects = this.replicateMulti(objects, blockZ, spaceZ, 2);
        objects = this.applyCenter(objects);
        for (let ob of objects) {
            this.addObject(ObjectInstance.deserialize(ob), true);
        }
    },
    replicateMulti(objs, number, space, dir){
        let objects = JSON.parse(JSON.stringify(objs));
        let temp = objects;

        for (let i = 0; i < number; i++) {
            temp = this.replicate(temp, space, dir);
            objects = objects.concat(temp);
        }
        return objects;
    },
    replicate(objs, space, dir){
        let copyObjs = JSON.parse(JSON.stringify(objs));
        let max = objs[dir].p[dir] + objs[dir].s[dir];
        let min = objs[dir].p[dir];

        for (let ob of objs) {
            if (ob.p[dir] + ob.s[dir] > max) max = ob.p[dir] + ob.s[dir];
            if (ob.p[dir] < min)  min = ob.p[dir];
        }

        for (let ob of copyObjs) ob.p[dir] += max - min + space;

        return copyObjs;
    },
    convertVoxel(str, insert = false) {
        if (insert && ! this.objectSelected()) return alert('Select a object to replace first');
        let voxels = JSON.parse(str);
        let mapout = {"name":"modmap","modURL":"","ambient":9937064,"light":15923452,"sky":14477549,"fog":9280160,"fogD":900,"camPos":[0,0,0],"spawns":[],"objects":[]};
        let vlist = [];
        for (let vx of voxels.voxels) mapout.objects.push(this.voxelToObject([parseInt(vx.x), parseInt(vx.y), parseInt(vx.z)]));

        if (this.settings.mergeVoxels) mapout.objects = this.mergeObjects(mapout.objects);
        if (insert) this.replaceObject(JSON.stringify(mapout.objects), true);
        if (!insert) this.download(JSON.stringify(mapout), 'convertedVoxels.txt', 'text/plain');
    },
    convertImage(img, insert = false) {
        if (insert && ! this.objectSelected()) return alert('Select a object to replace first');
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let colors = [];
        let objects = [];

        for (let i = 0; i < data.length; i += 4) {
            let rgb = this.rgbArrayToHex([data[i], data[i + 1], data[i + 2]]);
            let opacity = Math.round((data[i + 3] / 255) * 100) / 100;
            colors.push([rgb, opacity]);
        }
        let height = 0; 
        let horizontal = 0; 
        for (let i = 0; i < colors.length; i++) {
            horizontal += 1; 
            if (i % canvas.width == 0) {
                height++;
                horizontal = 0; 
            }
            if (colors[i][1] == 0) continue;
            let ob = {"p": [horizontal, -1 * height, 0], "s": [this.settings.imageSize, this.settings.imageSize, this.settings.imageSize], "c": colors[i][0], "c": colors[i][0]};
            if (colors[i][1] != 1) ob.o = colors[i][1];
            objects.push(ob);
        }
        objects = this.applyCenter(this.mergeObjects(objects));
        let map = {"name":"New Krunker Map","modURL":"","ambient":9937064,"light":15923452,"sky":14477549,"fog":9280160,"fogD":900,"camPos":[0,0,0],"spawns":[],"objects":[]};
        map.objects = objects;
        if (insert) this.replaceObject(JSON.stringify(map.objects), true);
        if (!insert) this.download(JSON.stringify(map), 'convertedImage.txt', 'text/plain');
    },
    convert(insert = false, img = false) {
        this.loadFile(img ? 'convertImage' : 'convertVoxel', img, [insert]);
    },
    voxelToObject(voxel) {
        return {
            'p': [
                parseInt(voxel[0]) * this.settings.voxelSize, 
                parseInt(voxel[1]) * this.settings.voxelSize, 
                parseInt(voxel[2]) * this.settings.voxelSize
            ], 
            's': [this.settings.voxelSize, this.settings.voxelSize, this.settings.voxelSize],
        };
    },
    mergeObjects(objs) {
        if(objs.length < 2) return objs;

        let objectsMerged = 0;
        for (let axis = 0; axis < 3; axis++) {
            let axis1 = (axis + 1) % 3;
            let axis2 = (axis + 2) % 3;
            for (let i = 0; i < objs.length - 1; i++) {
                for (let j = i + 1; j < objs.length; j++) {
                    let cmi = axis % 2 ? objs[i].p[axis] + objs[i].s[axis] / 2 : objs[i].p[axis];//center of mass
                    let cmj = axis % 2 ? objs[j].p[axis] + objs[j].s[axis] / 2 : objs[j].p[axis];
                    if (objs[j].s[axis1] == objs[i].s[axis1] && objs[j].s[axis2] == objs[i].s[axis2] &&
                        objs[j].p[axis1] == objs[i].p[axis1] && objs[j].p[axis2] == objs[i].p[axis2] &&
                        Math.abs(cmj - cmi) <= Math.abs(objs[j].s[axis] / 2 + objs[i].s[axis] / 2) &&
                        objs[j].c == objs[i].c &&
                        objs[j].e == objs[i].e &&
                        objs[j].o == objs[i].o &&
                        objs[j].t == objs[i].t &&
                        objs[j].col == objs[i].col &&
                        objs[j].pe == objs[i].pe &&
                        objs[j].hp == objs[i].hp &&
                        objs[j].v == objs[i].v &&
                        objs[j].a == objs[i].a) {
                        let sX = Math.abs(cmj - cmi) + Math.abs(objs[j].s[axis] / 2 + objs[i].s[axis] / 2);
                        let pX = (cmj + (objectsMerged + 1) * cmi) / (objectsMerged + 2);
                        if(axis == 1) pX = Math.min(objs[i].p[axis], objs[j].p[axis]);
                        objs[i].p[axis] = pX;
                        objs[i].s[axis] = sX;
                        objs.splice(j, 1);
                        objectsMerged++;
                        j--; 
                    }
                }
                objectsMerged = 0;
            } 
        }

        return objs;
    },
    textToObjects() {
        let input = prompt("Input text", "");
        if (input != false && (input == null || input == "")) return alert("Please input proper text");
        input = input.toLowerCase();
        let alphabet = {
            'a': [{"p":[-3,0,0],"s":[1,8,1]},{"p":[3,0,0],"s":[1,8,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,4,0],"s":[5,1,1]}],
            'b': [{"p":[-3,0,0],"s":[1,9,1]},{"p":[3,5,0],"s":[1,3,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,4,0],"s":[5,1,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[3,1,0],"s":[1,3,1]}],
            'c': [{"p":[-3,1,0],"s":[1,7,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[3,8,0],"s":[1,1,1]},{"p":[3,0,0],"s":[1,1,1]}],
            'd': [{"p":[-3,0,0],"s":[1,9,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[3,1,0],"s":[1,7,1]}],
            'e': [{"p":[-3,0,0],"s":[1,9,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[0,4,0],"s":[5,1,1]},{"p":[3,8,0],"s":[1,1,1]},{"p":[3,4,0],"s":[1,1,1]},{"p":[3,0,0],"s":[1,1,1]}],
            'f': [{"p":[-3,0,0],"s":[1,9,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,4,0],"s":[5,1,1]},{"p":[3,8,0],"s":[1,1,1]},{"p":[3,4,0],"s":[1,1,1]}],
            'g': [{"p":[-3,1,0],"s":[1,7,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[3,8,0],"s":[1,1,1]},{"p":[3,0,0],"s":[1,4,1]},{"p":[1,3,0],"s":[3,1,1]}],
            'h': [{"p":[-3,0,0],"s":[1,9,1]},{"p":[0,4,0],"s":[5,1,1]},{"p":[3,0,0],"s":[1,9,1]}],
            'i': [{"p":[0,8,0],"s":[7,1,1]},{"p":[0,1,0],"s":[1,7,1]},{"p":[0,0,0],"s":[7,1,1]}],
            'j': [{"p":[0,8,0],"s":[5,1,1]},{"p":[3,1,0],"s":[1,8,1]},{"p":[1,0,0],"s":[3,1,1]},{"p":[-2,2,0],"s":[1,1,1]},{"p":[-1,1,0],"s":[1,1,1]},{"p":[-3,8,0],"s":[1,1,1]}],
            'k': [{"p":[-1,5,0],"s":[3,1,1]},{"p":[-3,0,0],"s":[1,9,1]},{"p":[1,4,0],"s":[3,1,1]},{"p":[1,6,0],"s":[1,2,1]},{"p":[2,8,0],"s":[1,1,1]},{"p":[3,8,0],"s":[1,1,1]},{"p":[3,0,0],"s":[1,4,1]}],
            'l': [{"p":[-3,0,0],"s":[1,9,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[3,0,0],"s":[1,1,1]}],
            'm': [{"p":[-3,0,0],"s":[1,8,1]},{"p":[0,0,0],"s":[1,6,1]},{"p":[3,0,0],"s":[1,8,1]},{"p":[-2,8,0],"s":[1,1,1]},{"p":[2,8,0],"s":[1,1,1]},{"p":[-1,6,0],"s":[1,2,1]},{"p":[1,6,0],"s":[1,2,1]}],
            'n': [{"p":[-3,0,0],"s":[1,9,1]},{"p":[3,0,0],"s":[1,9,1]},{"p":[-2,7,0],"s":[1,1,1]},{"p":[-1,5,0],"s":[1,2,1]},{"p":[0,4,0],"s":[1,1,1]},{"p":[1,2,0],"s":[1,2,1]},{"p":[2,1,0],"s":[1,1,1]}],
            'o': [{"p":[-3,1,0],"s":[1,7,1]},{"p":[3,1,0],"s":[1,7,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,0,0],"s":[5,1,1]}],
            'p': [{"p":[-3,0,0],"s":[1,8,1]},{"p":[3,5,0],"s":[1,3,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,4,0],"s":[5,1,1]}],
            'q': [{"p":[-3,1,0],"s":[1,7,1]},{"p":[3,1,0],"s":[1,7,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[2,1,0],"s":[1,1,1]},{"p":[1,1,0],"s":[1,2,1]},{"p":[0,2,0],"s":[1,3,1]}],
            'r': [{"p":[-3,0,0],"s":[1,8,1]},{"p":[3,6,0],"s":[1,2,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[2,5,0],"s":[1,1,1]},{"p":[3,5,0],"s":[1,1,1]},{"p":[-1,4,0],"s":[3,1,1]},{"p":[1,4,0],"s":[1,1,1]},{"p":[2,3,0],"s":[1,1,1]},{"p":[3,0,0],"s":[1,3,1]}],
            's': [{"p":[-3,5,0],"s":[1,3,1]},{"p":[0,8,0],"s":[5,1,1]},{"p":[3,8,0],"s":[1,1,1]},{"p":[0,4,0],"s":[5,1,1]},{"p":[3,1,0],"s":[1,3,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[-3,0,0],"s":[1,1,1]}],
            't': [{"p":[0,0,0],"s":[1,8,1]},{"p":[0,8,0],"s":[7,1,1]}],
            'u': [{"p":[3,1,0],"s":[1,8,1]},{"p":[0,0,0],"s":[5,1,1]},{"p":[-3,1,0],"s":[1,8,1]}],
            'v': [{"p":[0,0,0],"s":[1,1,1]},{"p":[1,1,0],"s":[1,2,1]},{"p":[2,3,0],"s":[1,3,1]},{"p":[3,6,0],"s":[1,3,1]},{"p":[-1,1,0],"s":[1,2,1]},{"p":[-2,3,0],"s":[1,3,1]},{"p":[-3,6,0],"s":[1,3,1]}],
            'w': [{"p":[2,0,0],"s":[1,1,1]},{"p":[1,1,0],"s":[1,2,1]},{"p":[0,3,0],"s":[1,6,1]},{"p":[3,1,0],"s":[1,8,1]},{"p":[-1,1,0],"s":[1,2,1]},{"p":[-3,1,0],"s":[1,8,1]},{"p":[-2,0,0],"s":[1,1,1]}],
            'x': [{"p":[2,2,0],"s":[1,1,1]},{"p":[1,3,0],"s":[1,1,1]},{"p":[0,4,0],"s":[1,1,1]},{"p":[3,0,0],"s":[1,2,1]},{"p":[-1,3,0],"s":[1,1,1]},{"p":[-3,0,0],"s":[1,2,1]},{"p":[-2,2,0],"s":[1,1,1]},{"p":[1,5,0],"s":[1,1,1]},{"p":[-1,5,0],"s":[1,1,1]},{"p":[2,6,0],"s":[1,1,1]},{"p":[-2,6,0],"s":[1,1,1]},{"p":[3,7,0],"s":[1,2,1]},{"p":[-3,7,0],"s":[1,2,1]}],
            'y': [{"p":[0,0,0],"s":[1,5,1]},{"p":[1,5,0],"s":[1,1,1]},{"p":[-1,5,0],"s":[1,1,1]},{"p":[2,6,0],"s":[1,1,1]},{"p":[-2,6,0],"s":[1,1,1]},{"p":[3,7,0],"s":[1,2,1]},{"p":[-3,7,0],"s":[1,2,1]}],
            'z': [{"p":[0,0,0],"s":[7,1,1]},{"p":[-3,1,0],"s":[1,1,1]},{"p":[-2,2,0],"s":[1,1,1]},{"p":[-1,3,0],"s":[1,1,1]},{"p":[0,4,0],"s":[1,1,1]},{"p":[1,5,0],"s":[1,1,1]},{"p":[2,6,0],"s":[1,1,1]},{"p":[3,7,0],"s":[1,1,1]},{"p":[0,8,0],"s":[7,1,1]}]
        };
        let posX = 0, posY = 0;
        let objects = [];
        for (let chr of input) {
            if (chr == " ") posX += 5;
            if (chr == ".") posX = 0, posY -= 11;
            if (chr in alphabet) {
                let asset = JSON.parse(JSON.stringify(alphabet[chr])); // Stop from editing alphabet assets
                for (let ob of asset) {
                    ob.p[0] += posX;
                    ob.p[1] += posY; 
                    objects.push(ob);
                }
                posX += 9; 
            }
        }
        this.replaceObject(JSON.stringify(objects), true, false, true);
    },
    frameObject() {
        let selected = this.objectSelected();
        if (!selected) return alert('Please Select a object');
        let thickness = this.advancedGUI.__folders["Advanced"].__folders['Other Features'].__folders['Frame'].__controllers[0].getValue(),
            ceiling = this.advancedGUI.__folders["Advanced"].__folders['Other Features'].__folders['Frame'].__controllers[1].getValue(),
            floor = this.advancedGUI.__folders["Advanced"].__folders['Other Features'].__folders['Frame'].__controllers[2].getValue();

        if (thickness < 1) return alert('Wall Thickness must be 1 or greator');
        let pos = selected.position;
        let size = selected.scale;
        let cN = {p:[pos.x, pos.y, pos.z - (size.z / 2) - (thickness / 2)], s:[size.x + (thickness * 2), size.y, thickness]};
        this.addObject(ObjectInstance.deserialize(cN), true);

        let cS = {p:[pos.x, pos.y, pos.z + (size.z / 2) + (thickness / 2)], s:[size.x + (thickness * 2), size.y, thickness]};
        this.addObject(ObjectInstance.deserialize(cS), true);

        let cW = {p:[pos.x - (size.x / 2) - (thickness / 2), pos.y, pos.z], s:[thickness, size.y, size.z]};
        this.addObject(ObjectInstance.deserialize(cW), true);

        let cE = {p:[pos.x + (size.x / 2) + (thickness / 2), pos.y, pos.z], s:[thickness, size.y, size.z]};
        this.addObject(ObjectInstance.deserialize(cE), true);

        let cT = {p:[pos.x, pos.y + size.y, pos.z], s:[size.x + (thickness * 2), thickness, size.z + (thickness * 2)]};
        if (ceiling) this.addObject(ObjectInstance.deserialize(cT), true);

        let cB = {p:[pos.x, pos.y - thickness, pos.z], s:[size.x + (thickness * 2), thickness, size.z + (thickness * 2)]};
        if (floor) this.addObject(ObjectInstance.deserialize(cB), true);

        this.advancedGUI.__folders["Advanced"].__folders['Other Features'].__folders['Frame'].__controllers[0].setValue(10);
        this.advancedGUI.__folders["Advanced"].__folders['Other Features'].__folders['Frame'].__controllers[1].setValue(false);
        this.advancedGUI.__folders["Advanced"].__folders['Other Features'].__folders['Frame'].__controllers[2].setValue(false);
        if (!this.settings.preserveFolderState) this.advancedGUI.__folders["Advanced"].__folders['Other Features'].__folders['Frame'].close();
    },
    objectSelected(group = false) {
        let selected = this.transformControl.object;
        return selected ? (group ? (Object.keys(this.objGroups).includes(selected.uuid) ? selected : false) : selected) : false;
    },
    jsonInput(fromfile = false) {
        if (fromfile) {
            return this.loadFile('replaceObject', false, [true, false, this.settings.assetAutoGroup]);
        }
        let json = prompt("Import Object Json", "");
        if (json != null && json != "" && this.objectSelected()) this.replaceObject(json, true, false, true);
    },
    setSettings(keys, values) {
        if (!Array.isArray(keys)) {
            keys = [keys];
            values = [values];
        }
        for (let i = 0; i < keys.length; i++) {
            this.settings[keys[i]] = values[i];
        }
        window.saveVal('kro_editor', JSON.stringify(this.settings));
    },
    resetSettings() {
        for (let set in this.settings) {
            this.setSettings(set, this.defaultSettings[set]);
        }
        this.advancedGUI.updateDisplay();
        alert('Some settings require a refresh take effect');
    },
    degToRad(r) {
        return this.settings.degToRad ? r.map(x => x * (Math.PI / 180)) : r;
    },
    rotateAroundPoint(obj, point, axis, theta, pointIsWorld) {
        pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

        if(pointIsWorld) obj.parent.localToWorld(obj.position);

        obj.position.sub(point);
        obj.position.applyAxisAngle(axis, theta);
        obj.position.add(point);

        if(pointIsWorld) obj.parent.worldToLocal(obj.position);
        obj.rotateOnAxis(axis, theta);
    },
    intersect(a, b) {
        return (a.minX <= b.maxX && a.maxX >= b.minX) &&
            (a.minY <= b.maxY && a.maxY >= b.minY) &&
            (a.minZ <= b.maxZ && a.maxZ >= b.minZ);
    },
    copyToClipboard(str) {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    },
    download(content, fileName, contentType) {
        let a = document.createElement("a");
        let file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    },
    loadFile(callback, img = false, args = []) {
        let file = document.createElement('input');
        file.type = 'file';
        file.id = 'jsonInput';

        let scope = this;
        file.addEventListener('change', ev => {
            if (ev.target.files.length != 1) return alert('Please select 1 file');
            let f = ev.target.files[0];
            let reader = new FileReader();

            reader.onload = (theFile => {
                return e => {
                    if (img) {
                        let img2 = new Image();
                        img2.onload = () => {
                            args.unshift(img2);
                            scope[callback](...args);
                        }
                        img2.src = e.target.result;
                    } else {
                        args.unshift(e.target.result);
                        scope[callback](...args);
                    }
                };
            })(f);

            if (img) { reader.readAsDataURL(f); } else { reader.readAsText(f); }
        }, false);

        file.type = 'file';
        file.id = 'jsonInput';
        file.click();

        return;
    }
};
editor.init(document.getElementById("container"));
