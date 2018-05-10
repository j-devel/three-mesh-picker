'use strict';

import MeshPicker from './MeshPicker.js';

// https://hackernoon.com/import-export-default-require-commandjs-javascript-nodejs-es6-vs-cheatsheet-different-tutorial-example-5a321738b50f
//--------
export default MeshPicker;
// [browser]: <script src="three-mesh-picker.js"></script>
//            window.MeshPicker is now available
// [node]: const MeshPicker = require('three-mesh-picker');
//--------
// export { MeshPicker };
// [browser]: <script src="three-mesh-picker.js"></script>
//            const MeshPicker = window['MeshPicker'].MeshPicker;
// [node]: const MeshPicker = require('MeshPicker').MeshPicker;
