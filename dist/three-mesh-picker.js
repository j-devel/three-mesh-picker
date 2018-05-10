(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("THREE"));
	else if(typeof define === 'function' && define.amd)
		define(["THREE"], factory);
	else if(typeof exports === 'object')
		exports["MeshPicker"] = factory(require("THREE"));
	else
		root["MeshPicker"] = factory(root["THREE"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _MeshPicker = __webpack_require__(1);

var _MeshPicker2 = _interopRequireDefault(_MeshPicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://hackernoon.com/import-export-default-require-commandjs-javascript-nodejs-es6-vs-cheatsheet-different-tutorial-example-5a321738b50f
//--------
exports.default = _MeshPicker2.default;
// [browser]: <script src="three-mesh-picker.js"></script>
//            window.MeshPicker is now available
// [node]: const MeshPicker = require('three-mesh-picker');
//--------
// export { MeshPicker };
// [browser]: <script src="three-mesh-picker.js"></script>
//            const MeshPicker = window['MeshPicker'].MeshPicker;
// [node]: const MeshPicker = require('MeshPicker').MeshPicker;

module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// https://threejs.org/docs/#manual/introduction/Import-via-modules

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = __webpack_require__(2);

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MeshPicker = function () {
    function MeshPicker(width, height) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, MeshPicker);

        if (width === undefined || height === undefined) {
            throw 'error: both viewport width and height must be provided.';
        }
        var can = document.createElement('canvas');
        can.width = width; // viewport width
        can.height = height; // viewport height
        this._canvas = can;
        this._renderer = new THREE.WebGLRenderer({
            canvas: can
        });
        var rtWidth = opts.renderTagetWidth ? opts.renderTagetWidth : 512;
        var rtHeight = opts.renderTagetHeight ? opts.renderTagetHeight : 512;
        this._rt = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping
        });
        // console.log('rt:', this._rt);

        this._side = opts.side !== undefined ? opts.side : THREE.FrontSide;
        this._materialPick = new THREE.RawShaderMaterial({
            vertexShader: '\n                precision mediump float;\n                precision mediump int;\n                uniform mat4 modelViewMatrix;\n                uniform mat4 projectionMatrix;\n                attribute vec3 position;\n                attribute vec4 color;\n                varying vec4 vColor;\n                void main() {\n                    vColor = color;\n                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n                }\n            ',
            fragmentShader: '\n                precision mediump float;\n                precision mediump int;\n                varying vec4 vColor;\n                void main() {\n                    gl_FragColor = vColor;\n                }\n            ',
            side: this._side,
            // side: THREE.FrontSide,
            // side: THREE.BackSide,
            // side: THREE.DoubleSide,
            transparent: false // disable blending, NG otherwise.
        });

        this._scene = new THREE.Scene();
        this._meshPairs = []; // [[mesh0, meshPick0], [mesh1, meshPick1], ...]
        this._len = 0; // current max idx used for this._meshPairs
        this._mapUuidIdx = {}; // mesh.uuid -> _idx

        // depth stuff
        // https://stackoverflow.com/questions/44121266/compute-3d-point-from-mouse-position-and-depth-map
        this._materialDepth = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
            side: this._side
        });
        var unpackDownscale = 255 / 256;
        this._unpackFactors = new THREE.Vector4(unpackDownscale / (256 * 256 * 256), unpackDownscale / (256 * 256), unpackDownscale / 256, unpackDownscale);
    }

    _createClass(MeshPicker, [{
        key: 'screening',
        value: function screening(mesh, idx) {
            if (idx > 0xffffff) {
                // 256**3-1 = 16777215
                console.log('nop: exceeded the max number of meshes supported.\n                Or, call clear() and add() meshes again.');
                return false;
            }
            if (!(mesh instanceof THREE.Mesh)) {
                console.log('nop: the base object is not of type THREE.Mesh');
                return false;
            } else if (this.has(mesh)) {
                console.log('nop: already added.');
                return false;
            }
            return true;
        }
    }, {
        key: 'createPickableFrom',
        value: function createPickableFrom(mesh, idx) {
            // https://stackoverflow.com/questions/33806640/how-to-change-material-color-for-only-one-object-in-three-js
            var meshPick = mesh.clone();
            // override the shader program
            meshPick.material = this._materialPick;

            // encode id into [attribute vec4 color]
            var geom = meshPick.geometry.clone(); // depp copy for edit
            //---- OK
            // https://stackoverflow.com/questions/17859823/three-js-webgl-renderer-not-updating-color-property-on-faces
            // let hex = Math.random() * 0xffffff; // debug
            var hex = idx;
            for (var i = 0; i < geom.faces.length; i++) {
                geom.faces[i].color.setHex(hex);
            }
            meshPick.material.vertexColors = THREE.FaceColors;
            meshPick.material.colorsNeedUpdate = true;
            //---- not relevant, just a memo
            // // this is for Points/Line; not for picking faces - https://threejs.org/docs/#api/core/Geometry.colors
            // // https://github.com/mrdoob/three.js/issues/7361
            // // e.g.
            // geom.colors = [ new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color() ];
            // geom.colors[ 0 ].setRGB( 1, 0, 0 );
            // geom.colors[ 1 ].setRGB( 1, 0, 0 );
            // geom.colors[ 2 ].setRGB( 1, 0, 0 );
            // geom.colors[ 3 ].setRGB( 1, 0, 0 );
            // geom.colorsNeedUpdate = true;
            // meshPick.material.vertexColors = THREE.VertexColors;
            // meshPick.material.needsUpdate = true;

            meshPick.geometry = geom;
            return meshPick;
        }
    }, {
        key: 'has',
        value: function has(mesh) {
            return mesh.uuid in this._mapUuidIdx;
        }
    }, {
        key: '_truncateMeshPairs',
        value: function _truncateMeshPairs() {
            // truncate null entries (made due to remove()) in this._meshPairs if any
            var a = this._meshPairs;
            for (var i = a.length - 1; i >= 0 && a[i] === null; i--) {
                a.pop();
                this._len--;
            }
        }
    }, {
        key: 'add',
        value: function add(mesh) {
            this._truncateMeshPairs();
            var idx = this._len;
            if (!this.screening(mesh, idx)) return;

            var meshPick = this.createPickableFrom(mesh, idx);

            // meshPick.position.x *= -1.0; // just for debug
            // console.log('meshPick:', meshPick);
            this._meshPairs.push([mesh, meshPick]);
            this._mapUuidIdx[mesh.uuid] = idx;
            this._scene.add(meshPick);
            this._len++;
        }
    }, {
        key: 'remove',
        value: function remove(mesh) {
            if (!this.has(mesh)) {
                console.log('nop, not found');
                return;
            }

            // delete index map
            var idx = this._mapUuidIdx[mesh.uuid];
            delete this._mapUuidIdx[mesh.uuid];

            // let a corresponding pair be a "hole"
            var meshPick = this._meshPairs[idx][1];
            this._meshPairs[idx] = null;
            // make sure null's are truncated
            this._truncateMeshPairs();

            // delete a corresponding meshPick - https://stackoverflow.com/questions/40694372/what-is-the-right-way-to-remove-a-mesh-completely-from-the-scene-in-three-js?rq=1
            this._scene.remove(meshPick);
            meshPick.geometry.dispose();
            // meshPick.material (this._materialPick) is shared, so don't dispose() it
            meshPick = null;
        }
    }, {
        key: 'list',
        value: function list() {
            var meshes = [];
            this._meshPairs.forEach(function (pair) {
                if (pair !== null) {
                    meshes.push(pair[0]);
                }
            });
            return meshes;
        }
    }, {
        key: 'count',
        value: function count() {
            return Object.keys(this._mapUuidIdx).length;
        }
    }, {
        key: 'clear',
        value: function clear() {
            var _this = this;

            // remove all meshes
            var meshes = this.list();
            meshes.forEach(function (m) {
                _this.remove(m);
            });
            meshes.length = 0;

            // reset the dynamic array with holes
            this._meshPairs.length = 0;
            this._len = 0;
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            // clear all meshes
            this.clear();

            // clear other stuff
            this._materialPick = undefined;
            this._scene = undefined;
            this._canvas = undefined;
            this._renderer = undefined;
            this._rt = undefined;
        }
    }, {
        key: 'updateWidth',
        value: function updateWidth(w) {
            this._canvas.width = w;
        }
    }, {
        key: 'updateHeight',
        value: function updateHeight(h) {
            this._canvas.height = h;
        }
    }, {
        key: 'pickMesh',
        value: function pickMesh(mx, my, camera) {
            return this._inspect(mx, my, camera, false);
        }
    }, {
        key: 'pickPoint',
        value: function pickPoint(mx, my, camera) {
            return this._inspect(mx, my, camera, true);
        }
    }, {
        key: '_inspect',
        value: function _inspect(mx, my, camera, forDepth) {
            if (camera === undefined) {
                console.log('nop, camera not set...');
                return null;
            }

            // make sure the poses of meshPick's are updated
            this._meshPairs.forEach(function (pair) {
                if (pair === null) return; // https://stackoverflow.com/questions/31399411/go-to-next-iteration-in-javascript-foreach-loop/31399448
                pair[1].position.x = pair[0].position.x;
                pair[1].position.y = pair[0].position.y;
                pair[1].position.z = pair[0].position.z;
                pair[1].rotation.x = pair[0].rotation.x;
                pair[1].rotation.y = pair[0].rotation.y;
                pair[1].rotation.z = pair[0].rotation.z;
            });

            var bgOrig = this._scene.background;
            var white = 0xffffff;
            this._scene.background = new THREE.Color(white);
            if (forDepth) {
                this._scene.overrideMaterial = this._materialDepth;
                this._renderer.render(this._scene, camera, this._rt);
                this._scene.overrideMaterial = null;
            } else {
                this._renderer.render(this._scene, camera, this._rt);
            }
            this._scene.background = bgOrig;

            // https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_cubes_gpu.html
            var pixel = new Uint8Array(4);
            var w = this._canvas.width;
            var h = this._canvas.height;
            this._renderer.readRenderTargetPixels(this._rt, mx / w * this._rt.width, (1 - my / h) * this._rt.height, 1, 1, pixel);
            // console.log("pixel:", pixel);
            // console.log(`picked data: ${pixel[0]} ${pixel[1]} ${pixel[2]} ${pixel[3]} -> ${idx} `);
            var idx = pixel[0] << 16 | pixel[1] << 8 | pixel[2];
            if (idx === white) {
                // console.log("picked none");
                return null;
            }

            if (forDepth) {
                var viewZ = this.computeDepth(pixel, camera.far, camera.near);
                // console.log('viewZ:', viewZ);
                var point = this.getPositionFromViewZ(viewZ, mx, my, camera, w, h);
                console.log('point:', point);
                return point;
            } else {
                return this._meshPairs[idx][0];
            }
        }
        //-------- depth stuff
        // https://stackoverflow.com/questions/44121266/compute-3d-point-from-mouse-position-and-depth-map

    }, {
        key: 'computeDepth',
        value: function computeDepth(pixel, cf, cn) {
            // unpackRGBAToDepth()
            var invClipZ = new THREE.Vector4().fromArray(pixel).multiplyScalar(1 / 255).dot(this._unpackFactors);
            // perspectiveDepthToViewZ()
            return cn * cf / ((cf - cn) * invClipZ - cf);
        }
    }, {
        key: 'getPositionFromViewZ',
        value: function getPositionFromViewZ(viewZ, mx, my, camera, w, h) {
            var pos = new THREE.Vector3(mx / w * 2 - 1, -(my / h) * 2 + 1, 0.5);
            var projInv = new THREE.Matrix4();
            projInv.getInverse(camera.projectionMatrix);
            pos.applyMatrix4(projInv);
            pos.multiplyScalar(viewZ / pos.z);
            pos.applyMatrix4(camera.matrixWorld);
            return pos;
        }
    }, {
        key: 'getPositionInfinity',
        value: function getPositionInfinity(mx, my, camera) {
            return this.getPositionFromViewZ(-camera.far, mx, my, camera, this._canvas.width, this._canvas.height);
        }
        //--------

    }, {
        key: 'raycast',
        value: function raycast(mx, my, meshes, camera) {
            var recursive = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

            // https://threejs.org/docs/#api/core/Raycaster
            var raycaster = new THREE.Raycaster();
            var mouse = new THREE.Vector2(); // normalized (-1 to +1)
            mouse.x = mx / this._canvas.width * 2 - 1;
            mouse.y = -(my / this._canvas.height) * 2 + 1;
            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);
            // calculate mesh intersecting the picking ray
            var intersects = raycaster.intersectObjects(meshes, recursive);
            // console.log('intersects:', intersects);
            // intersects are sorted by distance
            return intersects.length > 0 ? intersects[0] : null;
        }
    }, {
        key: 'log',
        value: function log() {
            console.log('log(): ======== ========');
            console.log('this._len:', this._len);
            console.log('this.count():', this.count());
            console.log('this._scene:', this._scene);
            console.log('this._meshPairs (null holes allowed; but must be truncated):', this._meshPairs);
            console.log('this._mapUuidIdx:', this._mapUuidIdx);
        }
    }]);

    return MeshPicker;
}();

exports.default = MeshPicker;
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=three-mesh-picker.js.map