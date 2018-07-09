// if THREE is global (via script tag loading), use that THREE to prevent
// conflicts with ES6 version. (Line objects become broken, otherwise...)
import * as THREE_ES6 from 'three';
console.log('window.THREE:', window.THREE);
const THREE = window.THREE ? window.THREE : THREE_ES6;

class MeshPicker {
    constructor(width, height, opts={}) {
        if (width === undefined || height === undefined) {
            throw 'error: both viewport width and height must be provided.';
        }
        let can = document.createElement('canvas');
        can.width = width; // viewport width
        can.height = height; // viewport height
        this._canvas = can;
        this._renderer = new THREE.WebGLRenderer({
            canvas: can,
        });
        let rtWidth = opts.renderTagetWidth ? opts.renderTagetWidth : 512;
        let rtHeight = opts.renderTagetHeight ? opts.renderTagetHeight : 512;
        this._rt = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
        });
        // console.log('rt:', this._rt);

        this._side = opts.side !== undefined ? opts.side : THREE.FrontSide;
        this._materialPick = new THREE.RawShaderMaterial({
            vertexShader: `
                precision mediump float;
                precision mediump int;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                attribute vec3 position;
                attribute vec4 color;
                varying vec4 vColor;
                void main() {
                    vColor = color;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                precision mediump float;
                precision mediump int;
                varying vec4 vColor;
                void main() {
                    gl_FragColor = vColor;
                }
            `,
            side: this._side,
            // side: THREE.FrontSide,
            // side: THREE.BackSide,
            // side: THREE.DoubleSide,
            transparent: false,  // disable blending, NG otherwise.
        });

        this._scene = new THREE.Scene();
        this._meshPairs = []; // [[mesh0, meshPick0], [mesh1, meshPick1], ...]
        this._len = 0; // current max idx used for this._meshPairs
        this._mapUuidIdx = {}; // mesh.uuid -> _idx

        // depth stuff
        // https://stackoverflow.com/questions/44121266/compute-3d-point-from-mouse-position-and-depth-map
        this._materialDepth = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
            side: this._side,
        });
        const unpackDownscale = 255 / 256;
        this._unpackFactors = new THREE.Vector4(
            unpackDownscale / (256 * 256 * 256),
            unpackDownscale / (256 * 256),
            unpackDownscale / 256,
            unpackDownscale);
    }
    screening(mesh, idx) {
        if (idx > 0xffffff) { // 256**3-1 = 16777215
            console.log(`nop: exceeded the max number of meshes supported.
                Or, call clear() and add() meshes again.`);
            return false;
        }
        if (! (mesh instanceof THREE.Mesh)) {
            console.log('nop: the base object is not of type THREE.Mesh');
            return false;
        } else if (this.has(mesh)) {
            console.log('nop: already added.');
            return false;
        }
        return true;
    }

    createPickableFrom(mesh, idx) {
        // https://stackoverflow.com/questions/33806640/how-to-change-material-color-for-only-one-object-in-three-js
        let meshPick = mesh.clone();
        // override the shader program
        meshPick.material = this._materialPick;

        // encode id into [attribute vec4 color]
        let geom = meshPick.geometry.clone(); // depp copy for edit
        //---- OK
        // https://stackoverflow.com/questions/17859823/three-js-webgl-renderer-not-updating-color-property-on-faces
        // let hex = Math.random() * 0xffffff; // debug
        let hex = idx;
        for (let i = 0; i < geom.faces.length; i ++) {
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
    has(mesh) {
        return mesh.uuid in this._mapUuidIdx;
    }
    _truncateMeshPairs() {
        // truncate null entries (made due to remove()) in this._meshPairs if any
        let a = this._meshPairs;
        for (let i = a.length-1; i >= 0 && a[i] === null; i--) {
            a.pop();
            this._len--;
        }
    }
    add(mesh) {
        this._truncateMeshPairs();
        let idx = this._len;
        if (! this.screening(mesh, idx)) return;

        let meshPick = this.createPickableFrom(mesh, idx);

        // meshPick.position.x *= -1.0; // just for debug
        // console.log('meshPick:', meshPick);
        this._meshPairs.push([mesh, meshPick]);
        this._mapUuidIdx[mesh.uuid] = idx;
        this._scene.add(meshPick);
        this._len++;
    }
    remove(mesh) {
        if (! this.has(mesh)) {
            console.log('nop, not found');
            return;
        }

        // delete index map
        let idx = this._mapUuidIdx[mesh.uuid];
        delete this._mapUuidIdx[mesh.uuid];

        // let a corresponding pair be a "hole"
        let meshPick = this._meshPairs[idx][1];
        this._meshPairs[idx] = null;
        // make sure null's are truncated
        this._truncateMeshPairs();

        // delete a corresponding meshPick - https://stackoverflow.com/questions/40694372/what-is-the-right-way-to-remove-a-mesh-completely-from-the-scene-in-three-js?rq=1
        this._scene.remove(meshPick);
        meshPick.geometry.dispose();
        // meshPick.material (this._materialPick) is shared, so don't dispose() it
        meshPick = null;
    }
    list() {
        let meshes = [];
        this._meshPairs.forEach((pair) => {
            if (pair !== null) { meshes.push(pair[0]); }
        });
        return meshes;
    }
    count() {
        return Object.keys(this._mapUuidIdx).length;
    }
    clear() {
        // remove all meshes
        let meshes = this.list();
        meshes.forEach((m) => { this.remove(m); });
        meshes.length = 0;

        // reset the dynamic array with holes
        this._meshPairs.length = 0;
        this._len = 0;
    }
    dispose() {
        // clear all meshes
        this.clear();

        // clear other stuff
        this._materialPick = undefined;
        this._scene = undefined;
        this._canvas = undefined;
        this._renderer = undefined;
        this._rt = undefined;
    }
    updateWidth(w) {
        this._canvas.width = w;
    }
    updateHeight(h) {
        this._canvas.height = h;
    }
    pickMesh(mx, my, camera) {
        return this._inspect(mx, my, camera, false);
    }
    pickPoint(mx, my, camera) {
        return this._inspect(mx, my, camera, true);
    }
    _inspect(mx, my, camera, forDepth) {
        if (camera === undefined) {
            console.log('nop, camera not set...');
            return null;
        }

        // make sure the poses of meshPick's are updated
        this._meshPairs.forEach((pair) => {
            if (pair === null) return; // https://stackoverflow.com/questions/31399411/go-to-next-iteration-in-javascript-foreach-loop/31399448
            pair[1].position.x = pair[0].position.x;
            pair[1].position.y = pair[0].position.y;
            pair[1].position.z = pair[0].position.z;
            pair[1].rotation.x = pair[0].rotation.x;
            pair[1].rotation.y = pair[0].rotation.y;
            pair[1].rotation.z = pair[0].rotation.z;
        });

        let bgOrig = this._scene.background;
        let white = 0xffffff;
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
        let pixel = new Uint8Array(4);
        const w = this._canvas.width;
        const h = this._canvas.height;
        this._renderer.readRenderTargetPixels(
            this._rt,
            mx / w * this._rt.width,
            (1 - my / h) * this._rt.height,
            1, 1, pixel);
        // console.log("pixel:", pixel);
        // console.log(`picked data: ${pixel[0]} ${pixel[1]} ${pixel[2]} ${pixel[3]} -> ${idx} `);
        let idx = (pixel[0]<<16) | (pixel[1]<<8) | pixel[2];
        if (idx === white) {
            // console.log("picked none");
            return null;
        }

        if (forDepth) {
            let viewZ = this.computeDepth(pixel, camera.far, camera.near);
            // console.log('viewZ:', viewZ);
            let point = this.getPositionFromViewZ(viewZ, mx, my, camera, w, h);
            console.log('point:', point);
            return point;
        } else {
            return this._meshPairs[idx][0];
        }
    }
    //-------- depth stuff
    // https://stackoverflow.com/questions/44121266/compute-3d-point-from-mouse-position-and-depth-map
    computeDepth(pixel, cf, cn) {
        // unpackRGBAToDepth()
        let invClipZ = (new THREE.Vector4()).fromArray(pixel)
            .multiplyScalar(1 / 255)
            .dot(this._unpackFactors);
        // perspectiveDepthToViewZ()
        return (cn * cf) / ((cf - cn) * invClipZ - cf);
    }
    getPositionFromViewZ(viewZ, mx, my, camera, w, h) {
        let pos = new THREE.Vector3(mx/w*2-1, -(my/h)*2+1, 0.5);
        const projInv = new THREE.Matrix4();
        projInv.getInverse(camera.projectionMatrix);
        pos.applyMatrix4(projInv);
        pos.multiplyScalar(viewZ / pos.z);
        pos.applyMatrix4(camera.matrixWorld);
        return pos;
    }
    getPositionInfinity(mx, my, camera) {
        return this.getPositionFromViewZ(
            -camera.far, mx, my, camera,
            this._canvas.width, this._canvas.height);
    }
    //--------
    raycast(mx, my, meshes, camera, recursive=false) {
        // https://threejs.org/docs/#api/core/Raycaster
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2(); // normalized (-1 to +1)
        mouse.x = (mx / this._canvas.width) * 2 - 1;
        mouse.y = - (my / this._canvas.height) * 2 + 1;
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        // calculate mesh intersecting the picking ray
        let intersects = raycaster.intersectObjects(meshes, recursive);
        // console.log('intersects:', intersects);
        // intersects are sorted by distance
        return intersects.length > 0 ? intersects[0] : null;
    }
    log() {
        console.log('log(): ======== ========');
        console.log('this._len:', this._len);
        console.log('this.count():', this.count());
        console.log('this._scene:', this._scene);
        console.log('this._meshPairs (null holes allowed; but must be truncated):', this._meshPairs);
        console.log('this._mapUuidIdx:', this._mapUuidIdx);
    }
}
export default MeshPicker;
