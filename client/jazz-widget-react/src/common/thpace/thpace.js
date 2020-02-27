(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Thpace = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  const EPSILON = Math.pow(2, -52);
  const EDGE_STACK = new Uint32Array(512);

  class Delaunator {

      static from(points, getX = defaultGetX, getY = defaultGetY) {
          const n = points.length;
          const coords = new Float64Array(n * 2);

          for (let i = 0; i < n; i++) {
              const p = points[i];
              coords[2 * i] = getX(p);
              coords[2 * i + 1] = getY(p);
          }

          return new Delaunator(coords);
      }

      constructor(coords) {
          const n = coords.length >> 1;
          if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');

          this.coords = coords;

          // arrays that will store the triangulation graph
          const maxTriangles = Math.max(2 * n - 5, 0);
          this._triangles = new Uint32Array(maxTriangles * 3);
          this._halfedges = new Int32Array(maxTriangles * 3);

          // temporary arrays for tracking the edges of the advancing convex hull
          this._hashSize = Math.ceil(Math.sqrt(n));
          this._hullPrev = new Uint32Array(n); // edge to prev edge
          this._hullNext = new Uint32Array(n); // edge to next edge
          this._hullTri = new Uint32Array(n); // edge to adjacent triangle
          this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash

          // temporary arrays for sorting points
          this._ids = new Uint32Array(n);
          this._dists = new Float64Array(n);

          this.update();
      }

      update() {
          const {coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash} =  this;
          const n = coords.length >> 1;

          // populate an array of point indices; calculate input data bbox
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          for (let i = 0; i < n; i++) {
              const x = coords[2 * i];
              const y = coords[2 * i + 1];
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
              this._ids[i] = i;
          }
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;

          let minDist = Infinity;
          let i0, i1, i2;

          // pick a seed point close to the center
          for (let i = 0; i < n; i++) {
              const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
              if (d < minDist) {
                  i0 = i;
                  minDist = d;
              }
          }
          const i0x = coords[2 * i0];
          const i0y = coords[2 * i0 + 1];

          minDist = Infinity;

          // find the point closest to the seed
          for (let i = 0; i < n; i++) {
              if (i === i0) continue;
              const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
              if (d < minDist && d > 0) {
                  i1 = i;
                  minDist = d;
              }
          }
          let i1x = coords[2 * i1];
          let i1y = coords[2 * i1 + 1];

          let minRadius = Infinity;

          // find the third point which forms the smallest circumcircle with the first two
          for (let i = 0; i < n; i++) {
              if (i === i0 || i === i1) continue;
              const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
              if (r < minRadius) {
                  i2 = i;
                  minRadius = r;
              }
          }
          let i2x = coords[2 * i2];
          let i2y = coords[2 * i2 + 1];

          if (minRadius === Infinity) {
              // order collinear points by dx (or dy if all x are identical)
              // and return the list as a hull
              for (let i = 0; i < n; i++) {
                  this._dists[i] = (coords[2 * i] - coords[0]) || (coords[2 * i + 1] - coords[1]);
              }
              quicksort(this._ids, this._dists, 0, n - 1);
              const hull = new Uint32Array(n);
              let j = 0;
              for (let i = 0, d0 = -Infinity; i < n; i++) {
                  const id = this._ids[i];
                  if (this._dists[id] > d0) {
                      hull[j++] = id;
                      d0 = this._dists[id];
                  }
              }
              this.hull = hull.subarray(0, j);
              this.triangles = new Uint32Array(0);
              this.halfedges = new Uint32Array(0);
              return;
          }

          // swap the order of the seed points for counter-clockwise orientation
          if (orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
              const i = i1;
              const x = i1x;
              const y = i1y;
              i1 = i2;
              i1x = i2x;
              i1y = i2y;
              i2 = i;
              i2x = x;
              i2y = y;
          }

          const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
          this._cx = center.x;
          this._cy = center.y;

          for (let i = 0; i < n; i++) {
              this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
          }

          // sort the points by distance from the seed triangle circumcenter
          quicksort(this._ids, this._dists, 0, n - 1);

          // set up the seed triangle as the starting hull
          this._hullStart = i0;
          let hullSize = 3;

          hullNext[i0] = hullPrev[i2] = i1;
          hullNext[i1] = hullPrev[i0] = i2;
          hullNext[i2] = hullPrev[i1] = i0;

          hullTri[i0] = 0;
          hullTri[i1] = 1;
          hullTri[i2] = 2;

          hullHash.fill(-1);
          hullHash[this._hashKey(i0x, i0y)] = i0;
          hullHash[this._hashKey(i1x, i1y)] = i1;
          hullHash[this._hashKey(i2x, i2y)] = i2;

          this.trianglesLen = 0;
          this._addTriangle(i0, i1, i2, -1, -1, -1);

          for (let k = 0, xp, yp; k < this._ids.length; k++) {
              const i = this._ids[k];
              const x = coords[2 * i];
              const y = coords[2 * i + 1];

              // skip near-duplicate points
              if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON) continue;
              xp = x;
              yp = y;

              // skip seed triangle points
              if (i === i0 || i === i1 || i === i2) continue;

              // find a visible edge on the convex hull using edge hash
              let start = 0;
              for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                  start = hullHash[(key + j) % this._hashSize];
                  if (start !== -1 && start !== hullNext[start]) break;
              }

              start = hullPrev[start];
              let e = start, q;
              while (q = hullNext[e], !orient(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1])) {
                  e = q;
                  if (e === start) {
                      e = -1;
                      break;
                  }
              }
              if (e === -1) continue; // likely a near-duplicate point; skip it

              // add the first triangle from the point
              let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

              // recursively flip triangles from the point until they satisfy the Delaunay condition
              hullTri[i] = this._legalize(t + 2);
              hullTri[e] = t; // keep track of boundary triangles on the hull
              hullSize++;

              // walk forward through the hull, adding more triangles and flipping recursively
              let n = hullNext[e];
              while (q = hullNext[n], orient(x, y, coords[2 * n], coords[2 * n + 1], coords[2 * q], coords[2 * q + 1])) {
                  t = this._addTriangle(n, i, q, hullTri[i], -1, hullTri[n]);
                  hullTri[i] = this._legalize(t + 2);
                  hullNext[n] = n; // mark as removed
                  hullSize--;
                  n = q;
              }

              // walk backward from the other side, adding more triangles and flipping
              if (e === start) {
                  while (q = hullPrev[e], orient(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1])) {
                      t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                      this._legalize(t + 2);
                      hullTri[q] = t;
                      hullNext[e] = e; // mark as removed
                      hullSize--;
                      e = q;
                  }
              }

              // update the hull indices
              this._hullStart = hullPrev[i] = e;
              hullNext[e] = hullPrev[n] = i;
              hullNext[i] = n;

              // save the two new edges in the hash table
              hullHash[this._hashKey(x, y)] = i;
              hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
          }

          this.hull = new Uint32Array(hullSize);
          for (let i = 0, e = this._hullStart; i < hullSize; i++) {
              this.hull[i] = e;
              e = hullNext[e];
          }

          // trim typed triangle mesh arrays
          this.triangles = this._triangles.subarray(0, this.trianglesLen);
          this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
      }

      _hashKey(x, y) {
          return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
      }

      _legalize(a) {
          const {_triangles: triangles, _halfedges: halfedges, coords} = this;

          let i = 0;
          let ar = 0;

          // recursion eliminated with a fixed-size stack
          while (true) {
              const b = halfedges[a];

              /* if the pair of triangles doesn't satisfy the Delaunay condition
               * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
               * then do the same check/flip recursively for the new pair of triangles
               *
               *           pl                    pl
               *          /||\                  /  \
               *       al/ || \bl            al/    \a
               *        /  ||  \              /      \
               *       /  a||b  \    flip    /___ar___\
               *     p0\   ||   /p1   =>   p0\---bl---/p1
               *        \  ||  /              \      /
               *       ar\ || /br             b\    /br
               *          \||/                  \  /
               *           pr                    pr
               */
              const a0 = a - a % 3;
              ar = a0 + (a + 2) % 3;

              if (b === -1) { // convex hull edge
                  if (i === 0) break;
                  a = EDGE_STACK[--i];
                  continue;
              }

              const b0 = b - b % 3;
              const al = a0 + (a + 1) % 3;
              const bl = b0 + (b + 2) % 3;

              const p0 = triangles[ar];
              const pr = triangles[a];
              const pl = triangles[al];
              const p1 = triangles[bl];

              const illegal = inCircle(
                  coords[2 * p0], coords[2 * p0 + 1],
                  coords[2 * pr], coords[2 * pr + 1],
                  coords[2 * pl], coords[2 * pl + 1],
                  coords[2 * p1], coords[2 * p1 + 1]);

              if (illegal) {
                  triangles[a] = p1;
                  triangles[b] = p0;

                  const hbl = halfedges[bl];

                  // edge swapped on the other side of the hull (rare); fix the halfedge reference
                  if (hbl === -1) {
                      let e = this._hullStart;
                      do {
                          if (this._hullTri[e] === bl) {
                              this._hullTri[e] = a;
                              break;
                          }
                          e = this._hullPrev[e];
                      } while (e !== this._hullStart);
                  }
                  this._link(a, hbl);
                  this._link(b, halfedges[ar]);
                  this._link(ar, bl);

                  const br = b0 + (b + 1) % 3;

                  // don't worry about hitting the cap: it can only happen on extremely degenerate input
                  if (i < EDGE_STACK.length) {
                      EDGE_STACK[i++] = br;
                  }
              } else {
                  if (i === 0) break;
                  a = EDGE_STACK[--i];
              }
          }

          return ar;
      }

      _link(a, b) {
          this._halfedges[a] = b;
          if (b !== -1) this._halfedges[b] = a;
      }

      // add a new triangle given vertex indices and adjacent half-edge ids
      _addTriangle(i0, i1, i2, a, b, c) {
          const t = this.trianglesLen;

          this._triangles[t] = i0;
          this._triangles[t + 1] = i1;
          this._triangles[t + 2] = i2;

          this._link(t, a);
          this._link(t + 1, b);
          this._link(t + 2, c);

          this.trianglesLen += 3;

          return t;
      }
  }

  // monotonically increases with real angle, but doesn't need expensive trigonometry
  function pseudoAngle(dx, dy) {
      const p = dx / (Math.abs(dx) + Math.abs(dy));
      return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
  }

  function dist(ax, ay, bx, by) {
      const dx = ax - bx;
      const dy = ay - by;
      return dx * dx + dy * dy;
  }

  // return 2d orientation sign if we're confident in it through J. Shewchuk's error bound check
  function orientIfSure(px, py, rx, ry, qx, qy) {
      const l = (ry - py) * (qx - px);
      const r = (rx - px) * (qy - py);
      return Math.abs(l - r) >= 3.3306690738754716e-16 * Math.abs(l + r) ? l - r : 0;
  }

  // a more robust orientation test that's stable in a given triangle (to fix robustness issues)
  function orient(rx, ry, qx, qy, px, py) {
      const sign = orientIfSure(px, py, rx, ry, qx, qy) ||
      orientIfSure(rx, ry, qx, qy, px, py) ||
      orientIfSure(qx, qy, px, py, rx, ry);
      return sign < 0;
  }

  function inCircle(ax, ay, bx, by, cx, cy, px, py) {
      const dx = ax - px;
      const dy = ay - py;
      const ex = bx - px;
      const ey = by - py;
      const fx = cx - px;
      const fy = cy - py;

      const ap = dx * dx + dy * dy;
      const bp = ex * ex + ey * ey;
      const cp = fx * fx + fy * fy;

      return dx * (ey * cp - bp * fy) -
             dy * (ex * cp - bp * fx) +
             ap * (ex * fy - ey * fx) < 0;
  }

  function circumradius(ax, ay, bx, by, cx, cy) {
      const dx = bx - ax;
      const dy = by - ay;
      const ex = cx - ax;
      const ey = cy - ay;

      const bl = dx * dx + dy * dy;
      const cl = ex * ex + ey * ey;
      const d = 0.5 / (dx * ey - dy * ex);

      const x = (ey * bl - dy * cl) * d;
      const y = (dx * cl - ex * bl) * d;

      return x * x + y * y;
  }

  function circumcenter(ax, ay, bx, by, cx, cy) {
      const dx = bx - ax;
      const dy = by - ay;
      const ex = cx - ax;
      const ey = cy - ay;

      const bl = dx * dx + dy * dy;
      const cl = ex * ex + ey * ey;
      const d = 0.5 / (dx * ey - dy * ex);

      const x = ax + (ey * bl - dy * cl) * d;
      const y = ay + (dx * cl - ex * bl) * d;

      return {x, y};
  }

  function quicksort(ids, dists, left, right) {
      if (right - left <= 20) {
          for (let i = left + 1; i <= right; i++) {
              const temp = ids[i];
              const tempDist = dists[temp];
              let j = i - 1;
              while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
              ids[j + 1] = temp;
          }
      } else {
          const median = (left + right) >> 1;
          let i = left + 1;
          let j = right;
          swap(ids, median, i);
          if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
          if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
          if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

          const temp = ids[i];
          const tempDist = dists[temp];
          while (true) {
              do i++; while (dists[ids[i]] < tempDist);
              do j--; while (dists[ids[j]] > tempDist);
              if (j < i) break;
              swap(ids, i, j);
          }
          ids[left + 1] = ids[j];
          ids[j] = temp;

          if (right - i + 1 >= j - left) {
              quicksort(ids, dists, i, right);
              quicksort(ids, dists, left, j - 1);
          } else {
              quicksort(ids, dists, left, j - 1);
              quicksort(ids, dists, i, right);
          }
      }
  }

  function swap(arr, i, j) {
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
  }

  function defaultGetX(p) {
      return p[0];
  }
  function defaultGetY(p) {
      return p[1];
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var colorName = {
  	"aliceblue": [240, 248, 255],
  	"antiquewhite": [250, 235, 215],
  	"aqua": [0, 255, 255],
  	"aquamarine": [127, 255, 212],
  	"azure": [240, 255, 255],
  	"beige": [245, 245, 220],
  	"bisque": [255, 228, 196],
  	"black": [0, 0, 0],
  	"blanchedalmond": [255, 235, 205],
  	"blue": [0, 0, 255],
  	"blueviolet": [138, 43, 226],
  	"brown": [165, 42, 42],
  	"burlywood": [222, 184, 135],
  	"cadetblue": [95, 158, 160],
  	"chartreuse": [127, 255, 0],
  	"chocolate": [210, 105, 30],
  	"coral": [255, 127, 80],
  	"cornflowerblue": [100, 149, 237],
  	"cornsilk": [255, 248, 220],
  	"crimson": [220, 20, 60],
  	"cyan": [0, 255, 255],
  	"darkblue": [0, 0, 139],
  	"darkcyan": [0, 139, 139],
  	"darkgoldenrod": [184, 134, 11],
  	"darkgray": [169, 169, 169],
  	"darkgreen": [0, 100, 0],
  	"darkgrey": [169, 169, 169],
  	"darkkhaki": [189, 183, 107],
  	"darkmagenta": [139, 0, 139],
  	"darkolivegreen": [85, 107, 47],
  	"darkorange": [255, 140, 0],
  	"darkorchid": [153, 50, 204],
  	"darkred": [139, 0, 0],
  	"darksalmon": [233, 150, 122],
  	"darkseagreen": [143, 188, 143],
  	"darkslateblue": [72, 61, 139],
  	"darkslategray": [47, 79, 79],
  	"darkslategrey": [47, 79, 79],
  	"darkturquoise": [0, 206, 209],
  	"darkviolet": [148, 0, 211],
  	"deeppink": [255, 20, 147],
  	"deepskyblue": [0, 191, 255],
  	"dimgray": [105, 105, 105],
  	"dimgrey": [105, 105, 105],
  	"dodgerblue": [30, 144, 255],
  	"firebrick": [178, 34, 34],
  	"floralwhite": [255, 250, 240],
  	"forestgreen": [34, 139, 34],
  	"fuchsia": [255, 0, 255],
  	"gainsboro": [220, 220, 220],
  	"ghostwhite": [248, 248, 255],
  	"gold": [255, 215, 0],
  	"goldenrod": [218, 165, 32],
  	"gray": [128, 128, 128],
  	"green": [0, 128, 0],
  	"greenyellow": [173, 255, 47],
  	"grey": [128, 128, 128],
  	"honeydew": [240, 255, 240],
  	"hotpink": [255, 105, 180],
  	"indianred": [205, 92, 92],
  	"indigo": [75, 0, 130],
  	"ivory": [255, 255, 240],
  	"khaki": [240, 230, 140],
  	"lavender": [230, 230, 250],
  	"lavenderblush": [255, 240, 245],
  	"lawngreen": [124, 252, 0],
  	"lemonchiffon": [255, 250, 205],
  	"lightblue": [173, 216, 230],
  	"lightcoral": [240, 128, 128],
  	"lightcyan": [224, 255, 255],
  	"lightgoldenrodyellow": [250, 250, 210],
  	"lightgray": [211, 211, 211],
  	"lightgreen": [144, 238, 144],
  	"lightgrey": [211, 211, 211],
  	"lightpink": [255, 182, 193],
  	"lightsalmon": [255, 160, 122],
  	"lightseagreen": [32, 178, 170],
  	"lightskyblue": [135, 206, 250],
  	"lightslategray": [119, 136, 153],
  	"lightslategrey": [119, 136, 153],
  	"lightsteelblue": [176, 196, 222],
  	"lightyellow": [255, 255, 224],
  	"lime": [0, 255, 0],
  	"limegreen": [50, 205, 50],
  	"linen": [250, 240, 230],
  	"magenta": [255, 0, 255],
  	"maroon": [128, 0, 0],
  	"mediumaquamarine": [102, 205, 170],
  	"mediumblue": [0, 0, 205],
  	"mediumorchid": [186, 85, 211],
  	"mediumpurple": [147, 112, 219],
  	"mediumseagreen": [60, 179, 113],
  	"mediumslateblue": [123, 104, 238],
  	"mediumspringgreen": [0, 250, 154],
  	"mediumturquoise": [72, 209, 204],
  	"mediumvioletred": [199, 21, 133],
  	"midnightblue": [25, 25, 112],
  	"mintcream": [245, 255, 250],
  	"mistyrose": [255, 228, 225],
  	"moccasin": [255, 228, 181],
  	"navajowhite": [255, 222, 173],
  	"navy": [0, 0, 128],
  	"oldlace": [253, 245, 230],
  	"olive": [128, 128, 0],
  	"olivedrab": [107, 142, 35],
  	"orange": [255, 165, 0],
  	"orangered": [255, 69, 0],
  	"orchid": [218, 112, 214],
  	"palegoldenrod": [238, 232, 170],
  	"palegreen": [152, 251, 152],
  	"paleturquoise": [175, 238, 238],
  	"palevioletred": [219, 112, 147],
  	"papayawhip": [255, 239, 213],
  	"peachpuff": [255, 218, 185],
  	"peru": [205, 133, 63],
  	"pink": [255, 192, 203],
  	"plum": [221, 160, 221],
  	"powderblue": [176, 224, 230],
  	"purple": [128, 0, 128],
  	"rebeccapurple": [102, 51, 153],
  	"red": [255, 0, 0],
  	"rosybrown": [188, 143, 143],
  	"royalblue": [65, 105, 225],
  	"saddlebrown": [139, 69, 19],
  	"salmon": [250, 128, 114],
  	"sandybrown": [244, 164, 96],
  	"seagreen": [46, 139, 87],
  	"seashell": [255, 245, 238],
  	"sienna": [160, 82, 45],
  	"silver": [192, 192, 192],
  	"skyblue": [135, 206, 235],
  	"slateblue": [106, 90, 205],
  	"slategray": [112, 128, 144],
  	"slategrey": [112, 128, 144],
  	"snow": [255, 250, 250],
  	"springgreen": [0, 255, 127],
  	"steelblue": [70, 130, 180],
  	"tan": [210, 180, 140],
  	"teal": [0, 128, 128],
  	"thistle": [216, 191, 216],
  	"tomato": [255, 99, 71],
  	"turquoise": [64, 224, 208],
  	"violet": [238, 130, 238],
  	"wheat": [245, 222, 179],
  	"white": [255, 255, 255],
  	"whitesmoke": [245, 245, 245],
  	"yellow": [255, 255, 0],
  	"yellowgreen": [154, 205, 50]
  };

  var toString = Object.prototype.toString;

  var isPlainObj = function (x) {
  	var prototype;
  	return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
  };

  var defined = function () {
      for (var i = 0; i < arguments.length; i++) {
          if (arguments[i] !== undefined) return arguments[i];
      }
  };

  var colorParse = parse;

  /**
   * Base hues
   * http://dev.w3.org/csswg/css-color/#typedef-named-hue
   */
  //FIXME: use external hue detector
  var baseHues = {
  	red: 0,
  	orange: 60,
  	yellow: 120,
  	green: 180,
  	blue: 240,
  	purple: 300
  };

  /**
   * Parse color from the string passed
   *
   * @return {Object} A space indicator `space`, an array `values` and `alpha`
   */
  function parse (cstr) {
  	var m, parts = [], alpha = 1, space;

  	if (typeof cstr === 'string') {
  		//keyword
  		if (colorName[cstr]) {
  			parts = colorName[cstr].slice();
  			space = 'rgb';
  		}

  		//reserved words
  		else if (cstr === 'transparent') {
  			alpha = 0;
  			space = 'rgb';
  			parts = [0,0,0];
  		}

  		//hex
  		else if (/^#[A-Fa-f0-9]+$/.test(cstr)) {
  			var base = cstr.slice(1);
  			var size = base.length;
  			var isShort = size <= 4;
  			alpha = 1;

  			if (isShort) {
  				parts = [
  					parseInt(base[0] + base[0], 16),
  					parseInt(base[1] + base[1], 16),
  					parseInt(base[2] + base[2], 16)
  				];
  				if (size === 4) {
  					alpha = parseInt(base[3] + base[3], 16) / 255;
  				}
  			}
  			else {
  				parts = [
  					parseInt(base[0] + base[1], 16),
  					parseInt(base[2] + base[3], 16),
  					parseInt(base[4] + base[5], 16)
  				];
  				if (size === 8) {
  					alpha = parseInt(base[6] + base[7], 16) / 255;
  				}
  			}

  			if (!parts[0]) parts[0] = 0;
  			if (!parts[1]) parts[1] = 0;
  			if (!parts[2]) parts[2] = 0;

  			space = 'rgb';
  		}

  		//color space
  		else if (m = /^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(cstr)) {
  			var name = m[1];
  			var isRGB = name === 'rgb';
  			var base = name.replace(/a$/, '');
  			space = base;
  			var size = base === 'cmyk' ? 4 : base === 'gray' ? 1 : 3;
  			parts = m[2].trim()
  				.split(/\s*,\s*/)
  				.map(function (x, i) {
  					//<percentage>
  					if (/%$/.test(x)) {
  						//alpha
  						if (i === size)	return parseFloat(x) / 100
  						//rgb
  						if (base === 'rgb') return parseFloat(x) * 255 / 100
  						return parseFloat(x)
  					}
  					//hue
  					else if (base[i] === 'h') {
  						//<deg>
  						if (/deg$/.test(x)) {
  							return parseFloat(x)
  						}
  						//<base-hue>
  						else if (baseHues[x] !== undefined) {
  							return baseHues[x]
  						}
  					}
  					return parseFloat(x)
  				});

  			if (name === base) parts.push(1);
  			alpha = (isRGB) ? 1 : (parts[size] === undefined) ? 1 : parts[size];
  			parts = parts.slice(0, size);
  		}

  		//named channels case
  		else if (cstr.length > 10 && /[0-9](?:\s|\/)/.test(cstr)) {
  			parts = cstr.match(/([0-9]+)/g).map(function (value) {
  				return parseFloat(value)
  			});

  			space = cstr.match(/([a-z])/ig).join('').toLowerCase();
  		}
  	}

  	//numeric case
  	else if (!isNaN(cstr)) {
  		space = 'rgb';
  		parts = [cstr >>> 16, (cstr & 0x00ff00) >>> 8, cstr & 0x0000ff];
  	}

  	//object case - detects css cases of rgb and hsl
  	else if (isPlainObj(cstr)) {
  		var r = defined(cstr.r, cstr.red, cstr.R, null);

  		if (r !== null) {
  			space = 'rgb';
  			parts = [
  				r,
  				defined(cstr.g, cstr.green, cstr.G),
  				defined(cstr.b, cstr.blue, cstr.B)
  			];
  		}
  		else {
  			space = 'hsl';
  			parts = [
  				defined(cstr.h, cstr.hue, cstr.H),
  				defined(cstr.s, cstr.saturation, cstr.S),
  				defined(cstr.l, cstr.lightness, cstr.L, cstr.b, cstr.brightness)
  			];
  		}

  		alpha = defined(cstr.a, cstr.alpha, cstr.opacity, 1);

  		if (cstr.opacity != null) alpha /= 100;
  	}

  	//array
  	else if (Array.isArray(cstr) || commonjsGlobal.ArrayBuffer && ArrayBuffer.isView && ArrayBuffer.isView(cstr)) {
  		parts = [cstr[0], cstr[1], cstr[2]];
  		space = 'rgb';
  		alpha = cstr.length === 4 ? cstr[3] : 1;
  	}

  	return {
  		space: space,
  		values: parts,
  		alpha: alpha
  	}
  }

  var hsl = {
  	name: 'hsl',
  	min: [0,0,0],
  	max: [360,100,100],
  	channel: ['hue', 'saturation', 'lightness'],
  	alias: ['HSL'],

  	rgb: function(hsl) {
  		var h = hsl[0] / 360,
  				s = hsl[1] / 100,
  				l = hsl[2] / 100,
  				t1, t2, t3, rgb, val;

  		if (s === 0) {
  			val = l * 255;
  			return [val, val, val];
  		}

  		if (l < 0.5) {
  			t2 = l * (1 + s);
  		}
  		else {
  			t2 = l + s - l * s;
  		}
  		t1 = 2 * l - t2;

  		rgb = [0, 0, 0];
  		for (var i = 0; i < 3; i++) {
  			t3 = h + 1 / 3 * - (i - 1);
  			if (t3 < 0) {
  				t3++;
  			}
  			else if (t3 > 1) {
  				t3--;
  			}

  			if (6 * t3 < 1) {
  				val = t1 + (t2 - t1) * 6 * t3;
  			}
  			else if (2 * t3 < 1) {
  				val = t2;
  			}
  			else if (3 * t3 < 2) {
  				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
  			}
  			else {
  				val = t1;
  			}

  			rgb[i] = val * 255;
  		}

  		return rgb;
  	}
  };

  function lerp(v0, v1, t) {
      return v0*(1-t)+v1*t
  }
  var lerp_1 = lerp;

  var clamp_1 = clamp;

  function clamp(value, min, max) {
    return min < max
      ? (value < min ? min : value > max ? max : value)
      : (value < max ? max : value > min ? min : value)
  }

  /**
   * @module  color-interpolate
   * Pick color from palette by index
   */






  var colorInterpolate = interpolate;

  function interpolate (palette) {
  	palette = palette.map(function(c) {
  		c = colorParse(c);
  		if (c.space != 'rgb') {
  			if (c.space != 'hsl') throw 'c.space' + 'space is not supported.';
  			c.values = hsl.rgb(c.values);
  		}
  		c.values.push(c.alpha);
  		return c.values;
  	});

  	return function(t, mix) {
  		mix = mix || lerp_1;
  		t = clamp_1(t, 0, 1);

  		var idx = ( palette.length - 1 ) * t,
  			lIdx = Math.floor( idx ),
  			rIdx = Math.ceil( idx );

  		t = idx - lIdx;

  		var lColor = palette[lIdx], rColor = palette[rIdx];

  		var result = lColor.map(function(v, i) {
  			v = mix(v, rColor[i], t);
  			if (i < 3) v = Math.round(v);
  			return v;
  		});

  		if (result[3] === 1) {
  			return 'rgb('+result.slice(0,3)+')';
  		}
  		return 'rgba('+result+')';
  	};
  }

  /**
   * @description Interface for a simple 2d coordinate
   * */
  var cssColors = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    "indianred ": "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  };
  var rgb = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/;
  var rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}|.*)\)/;
  var hsla = /hsla\((\d{1,3}),\s*(\d{1,3})\%,\s*(\d{1,3})\%,\s*(\d{1,3}|.*)\)/;
  var hsl$1 = /hsl\((\d{1,3}),\s*(\d{1,3})\%,\s*(\d{1,3})\%\)/;
  var hex = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/;
  /**
   * @param color - Color to parse
   * @example parseColor('rgba(255,15,50,.2)')
   * parseColor('rgb(50,60,20)')
   * parseColor('pink')
   * parseColor('hsla(120,100%,50%,0.3)')
   * @description Helper function that will parse colors for RGBA color space
   * @returns Array length 4 where each value corresponds to RGBA
   */

  function parseColor(color) {
    var match;

    if (color.match(rgb)) {
      match = color.match(rgb).slice(1, 4).map(function (num) {
        return parseInt(num);
      });
      return [match[0], match[1], match[2], 1];
    } else if (color.match(rgba)) {
      match = color.match(rgba).slice(1, 5).map(function (num) {
        return parseFloat(num);
      });
      return [match[0], match[1], match[2], match[3]];
    } else if (color.match(hsl$1)) {
      match = color.match(hsl$1).slice(1, 4).map(function (num) {
        return parseInt(num);
      });
      return [].concat(_toConsumableArray(hslToRgb(match[0], match[1], match[2])), [1]);
    } else if (color.match(hsla)) {
      match = color.match(hsla).slice(1, 5).map(function (num) {
        return parseFloat(num);
      });
      return [].concat(_toConsumableArray(hslToRgb(match[0], match[1], match[2])), [match[3]]);
    } else if (color.match(hex)) {
      return [].concat(_toConsumableArray(hexToRgb(color)), [1]);
    } else if (typeof color === 'string') {
      var css = cssColors[color];

      if (css !== undefined) {
        return [].concat(_toConsumableArray(hexToRgb(css)), [1]);
      } else {
        return [0, 0, 0, 0];
      }
    } else {
      console.warn("I have no idea what \"".concat(color, " is.\""));
      return [0, 0, 0, 0];
    }
  }
  /**
   * @description Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   * @param h - The hue
   * @param s - The saturation (percentage)
   * @param l - The lightness (percentage)
   * @return The RGB representation
   */

  function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100; // Achromatic

    if (s === 0) return [l, l, l];else {
      var hueToRgb = function hueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      h /= 360;
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      return [Math.round(hueToRgb(p, q, h + 1 / 3) * 255), Math.round(hueToRgb(p, q, h) * 255), Math.round(hueToRgb(p, q, h - 1 / 3) * 255)];
    }
  }
  /**
   * 
   * @description Converts a given hex color to RGB
   * @param color - The hex color
   * @return The RGB representation
   */

  function hexToRgb(color) {
    var result = hex.exec(color);

    if (result) {
      return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    } else {
      console.warn("Invalid hex used: ".concat(color));
      return [0, 0, 0];
    }
  }

  var defaultSettings = {
    triangleSize: 130,
    bleed: 120,
    noise: 60,
    colors: ['rgba(11,135,147,1)', 'rgba(54,0,51,1)'],
    pointVariationX: 20,
    pointVariationY: 35,
    pointAnimationSpeed: 7500,
    image: undefined,
    imageOpacity: .4
  };
  /**
   * @description Use static method 'create' to create a thpace instance.
   * @example Thpace.create(canvas, settings});
   * @classdesc This is the main Thpace class. Used to create a thpace instance on a given canvas.
   */

  var Thpace =
  /*#__PURE__*/
  function () {
    _createClass(Thpace, null, [{
      key: "create",

      /**
       * Create an instance of thpace on your page.
       * @param canvas - The canvas to turn into a thpace instance.
       * @param settings - Optional object with settings to control the thpace instance
       */
      value: function create(canvas, settings) {
        if (!canvas) {
          console.warn('Need a valid canvas element!');
          return;
        }

        return new Thpace(canvas, _extends({}, defaultSettings, settings));
      }
    }]);

    function Thpace(canvas, settings) {
      _classCallCheck(this, Thpace);

      _defineProperty(this, "canvas", void 0);

      _defineProperty(this, "ctx", void 0);

      _defineProperty(this, "settings", void 0);

      _defineProperty(this, "width", void 0);

      _defineProperty(this, "height", void 0);

      _defineProperty(this, "triangles", void 0);

      _defineProperty(this, "particles", void 0);

      _defineProperty(this, "coordinateTable", void 0);

      _defineProperty(this, "baseCoordinateTable", void 0);

      _defineProperty(this, "delta", void 0);

      _defineProperty(this, "lastUpdate", void 0);

      this.canvas = canvas;
      this.settings = settings;

      if (settings.color1 && settings.color2 && typeof settings.color1 === 'string' && typeof settings.color2 === 'string') {
        this.settings.colors = [getRGBA(settings.color1), getRGBA(settings.color2)];
      } else if (this.settings.colors) {
        this.settings.colors = this.settings.colors.map(function (color) {
          return getRGBA(color);
        });
      }

      this.ctx = canvas.getContext('2d');
      this.width = 0;
      this.height = 0;
      this.delta = performance.now();
      this.lastUpdate = performance.now();
      this.triangles = [];
      this.particles = [];
      this.coordinateTable = {};
      this.baseCoordinateTable = {};
      window.addEventListener('resize', this.resize.bind(this));
      this.resize();
      this.animate();
    }

    _createClass(Thpace, [{
      key: "resize",
      value: function resize() {
        var p = this.canvas.parentElement;

        if (p) {
          this.canvas.width = p.clientWidth;
          this.canvas.height = p.clientHeight;
        }

        if (this.width !== this.canvas.width || this.height !== this.canvas.height) {
          this.width = this.canvas.width;
          this.height = this.canvas.height;
          this.generateTriangles();
          this.generateParticles();
        }
      }
    }, {
      key: "remove",
      value: function remove() {
        window.removeEventListener('resize', this.resize.bind(this));
      }
    }, {
      key: "generateTriangles",
      value: function generateTriangles() {
        var _this = this;

        var points = [];
        var coordinateTable = {};
        points.push([0, 0]);
        points.push([0, this.height]);
        points.push([this.width, 0]);
        points.push([this.width, this.height]);
        var bleed = this.settings.bleed;
        var size = this.settings.triangleSize;
        var noise = this.settings.noise;
        var colors = this.settings.colors;

        for (var i = 0 - bleed; i < this.width + bleed; i += size) {
          for (var j = 0 - bleed; j < this.height + bleed; j += size) {
            var x = i + getRandomInt(0, noise);
            var y = j + getRandomInt(0, noise);
            points.push([x, y]);
          }
        }

        var delaunay = Delaunator.from(points);
        var triangleList = delaunay.triangles;
        var coordinates = [];

        for (var _i = 0; _i < triangleList.length; _i += 3) {
          var t = [points[triangleList[_i]], points[triangleList[_i + 1]], points[triangleList[_i + 2]]];
          var coords = [];
          coords.push({
            x: t[0][0],
            y: t[0][1]
          });
          coords.push({
            x: t[1][0],
            y: t[1][1]
          });
          coords.push({
            x: t[2][0],
            y: t[2][1]
          });
          t.push(gradient(getCenter(coords), this.width, this.height, colors));
          coordinates.push(t);
        }

        var baseCoordinateTable = {};
        coordinates.forEach(function (t) {
          t.forEach(function (p) {
            var x = p[0];
            var y = p[1];

            if (!coordinateTable[x]) {
              coordinateTable[x] = {};
            }

            var per = x / _this.width;
            coordinateTable[x][y] = 0;

            if (!baseCoordinateTable[x]) {
              baseCoordinateTable[x] = {};
            }

            baseCoordinateTable[x][y] = per * 2 * Math.PI;
          });
        });
        this.triangles = coordinates;
        this.coordinateTable = coordinateTable;
        this.baseCoordinateTable = baseCoordinateTable;
      }
    }, {
      key: "generateParticles",
      value: function generateParticles() {
        var particles = [];

        for (var i = 0; i < 250; i++) {
          var pSet = {
            ctx: this.ctx,
            width: this.width,
            height: this.height
          };
          particles.push(new Particle(pSet));
        }

        this.particles = particles;
      }
    }, {
      key: "animate",
      value: function animate() {
        var _this2 = this;

        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        this.triangles.forEach(function (t) {
          ctx.beginPath();
          var coords = [];
          coords.push({
            x: t[0][0],
            y: t[0][1]
          });
          coords.push({
            x: t[1][0],
            y: t[1][1]
          });
          coords.push({
            x: t[2][0],
            y: t[2][1]
          });
          var color = t[3];
          var style = "rgb(".concat(color[0], ", ").concat(color[1], ", ").concat(color[2], ")");
          ctx.fillStyle = style;
          ctx.strokeStyle = style;
          ctx.globalAlpha = color[3];
          var dp = [0, 1, 2, 0];
          dp.forEach(function (el, ind) {
            if (_this2.coordinateTable[coords[el].x] && _this2.coordinateTable[coords[el].x][coords[el].y] != undefined) {
              var c = {
                x: coords[el].x,
                y: coords[el].y
              };
              var change = _this2.coordinateTable[coords[el].x][coords[el].y];

              if (ind == 0) {
                ctx.moveTo(c.x + change.x, c.y + change.y);
              } else {
                ctx.lineTo(c.x + change.x, c.y + change.y);
              }
            }
          });
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        });
        this.particles.forEach(function (p) {
          p.update();
        });
        this.particles.forEach(function (p) {
          p.draw();
        });

        if (this.settings.image) {
          var imageOpacity = this.settings.imageOpacity || 0;
          var pat = ctx.createPattern(this.settings.image, 'repeat');

          if (pat) {
            ctx.globalAlpha = imageOpacity;
            ctx.fillStyle = pat;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.globalAlpha = 1;
          }
        }

        this.animateCoordinateTable();
        this.delta = performance.now() - this.lastUpdate;
        this.lastUpdate = performance.now();
        requestAnimationFrame(this.animate.bind(this));
      }
    }, {
      key: "animateCoordinateTable",
      value: function animateCoordinateTable() {
        var _this3 = this;

        var pointAnimationSpeed = this.settings.pointAnimationSpeed || 0;
        var pointVariationX = this.settings.pointVariationX || 0;
        var pointVariationY = this.settings.pointVariationY || 0;
        Object.keys(this.coordinateTable).forEach(function (x) {
          Object.keys(_this3.coordinateTable[x]).forEach(function (y) {
            _this3.baseCoordinateTable[x][y] += _this3.delta / (pointAnimationSpeed / 1.5) * 4; // Don't ask

            var changeX = Math.cos(_this3.baseCoordinateTable[x][y]) * pointVariationX;
            var changeY = Math.sin(_this3.baseCoordinateTable[x][y]) * pointVariationY;
            _this3.coordinateTable[x][y] = {
              x: changeX,
              y: changeY
            };
          });
        });
      }
    }]);

    return Thpace;
  }();

  var Particle =
  /*#__PURE__*/
  function () {
    function Particle(settings) {
      _classCallCheck(this, Particle);

      _defineProperty(this, "ctx", void 0);

      _defineProperty(this, "x", void 0);

      _defineProperty(this, "y", void 0);

      _defineProperty(this, "ox", void 0);

      _defineProperty(this, "oy", void 0);

      _defineProperty(this, "interval", void 0);

      _defineProperty(this, "limit", void 0);

      _defineProperty(this, "opacity", void 0);

      _defineProperty(this, "r", void 0);

      this.ctx = settings.ctx;
      this.x = getRandomInt(0, settings.width);
      this.y = getRandomInt(0, settings.height);
      this.ox = this.x;
      this.oy = this.y;
      this.interval = getRandomInt(1000, 5000);
      this.limit = getRandomInt(5, 15);
      this.opacity = getRandomFloat(0.1, 0.7);
      this.r = getRandomFloat(1, 2);
    }

    _createClass(Particle, [{
      key: "update",
      value: function update() {
        this.x = this.ox + Math.cos(performance.now() / this.interval) * this.limit;
        this.y = this.oy + Math.sin(performance.now() / this.interval) * this.limit / 2;
      }
    }, {
      key: "draw",
      value: function draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255,255,255, ' + this.opacity + ')';
        this.ctx.fill();
      }
    }]);

    return Particle;
  }();

  var rgb$1 = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/;
  var rgba$1 = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}|.*)\)/;

  function gradient(coords, width, height, colors) {
    var x = coords.x;
    var y = coords.y;
    var per = 0;
    per = x / width;
    var per2 = 0;
    per2 = y / height;
    per = (per2 + per) / 2;

    if (per > 1) {
      per = 1;
    } else if (per < 0) {
      per = 0;
    }

    var color = colorInterpolate(colors)(per);
    var match;

    if (color.match(rgb$1)) {
      match = color.match(rgb$1).slice(1, 4).map(function (num) {
        return parseInt(num);
      });
      return [match[0], match[1], match[2], 1];
    } else if (color.match(rgba$1)) {
      match = color.match(rgba$1).slice(1, 5).map(function (num) {
        return parseFloat(num);
      });
      return [match[0], match[1], match[2], match[3]];
    } else {
      return [0, 0, 0, 0];
    }
  }

  function getCenter(coords) {
    var sumX = 0;
    var sumY = 0;
    coords.forEach(function (p) {
      sumX += p.x;
      sumY += p.y;
    });
    return {
      x: sumX / coords.length,
      y: sumY / coords.length
    };
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getRGBA(color) {
    if (!color) {
      console.warn("Incorrect color: ".concat(color));
      return 'rgba(0,0,0,0)';
    }

    return "rgba(".concat(parseColor(color).join(','), ")");
  }

  return Thpace;

})));
