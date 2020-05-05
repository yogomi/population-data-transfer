import * as THREE from 'three';
import { COLORS } from 'common_libs/colors';
// eslint-disable-next-line import/no-unresolved
import { flexlog } from 'flexlog/flexlog';

export const EARTH_RADIUS = 6378100; // (m)
export const EARTH_DIVIDE_COUNT = 11;

export const INNER_TRIANGLE_COLORS = [
  COLORS.red,
  COLORS.blue,
  COLORS.green,
];

/* eslint-disable no-bitwise */

export function triangleIdFromIdArray(idArray) {
  let id = 0;

  // 2bit分は予約
  // 00 の場合を地球を想定した10分割とする
  id <<= 2;
  // 6bit分がBase Triangle ID
  id <<= 6;
  id |= idArray[0];
  for (let i = 0; i < EARTH_DIVIDE_COUNT; i++) {
    // Child Triangl ID は2bitの連なり
    id <<= 2;
    if (i < idArray.length - 1) {
      id |= idArray[i + 1];
    }
  }

  return id;
}

export function idArrayFromTriangleId(triangleId) {
  let id = triangleId;
  const idArray = Array(EARTH_DIVIDE_COUNT + 1);

  for (let i = 0; i < EARTH_DIVIDE_COUNT; i++) {
    idArray[EARTH_DIVIDE_COUNT - i] = id & 0b11;
    id >>= 2;
  }
  idArray[0] = id & 0b111111;

  return idArray;
}

export function baseGeoTriangles(radius = 1) {
  const shortPoint = (radius * Math.sqrt(2.0)) / Math.sqrt(5.0 + Math.sqrt(5.0));
  const longPoint = ((1.0 + Math.sqrt(5.0)) / 2.0) * shortPoint;

  const xPlate = [
    new THREE.Vector3(0, longPoint, shortPoint),
    new THREE.Vector3(0, -longPoint, shortPoint),
    new THREE.Vector3(0, -longPoint, -shortPoint),
    new THREE.Vector3(0, longPoint, -shortPoint),
  ];
  const yPlate = [
    new THREE.Vector3(shortPoint, 0, longPoint),
    new THREE.Vector3(shortPoint, 0, -longPoint),
    new THREE.Vector3(-shortPoint, 0, -longPoint),
    new THREE.Vector3(-shortPoint, 0, longPoint),
  ];
  const zPlate = [
    new THREE.Vector3(longPoint, shortPoint, 0),
    new THREE.Vector3(-longPoint, shortPoint, 0),
    new THREE.Vector3(-longPoint, -shortPoint, 0),
    new THREE.Vector3(longPoint, -shortPoint, 0),
  ];
  const baseTriangles = [
    new THREE.Triangle(xPlate[0], yPlate[3], yPlate[0]),
    new THREE.Triangle(xPlate[1], yPlate[0], yPlate[3]),
    new THREE.Triangle(xPlate[0], yPlate[0], zPlate[0]),
    new THREE.Triangle(xPlate[1], zPlate[3], yPlate[0]),
    new THREE.Triangle(yPlate[0], zPlate[3], zPlate[0]),
    new THREE.Triangle(zPlate[0], xPlate[3], xPlate[0]),
    new THREE.Triangle(zPlate[3], xPlate[1], xPlate[2]),
    new THREE.Triangle(xPlate[3], zPlate[0], yPlate[1]),
    new THREE.Triangle(xPlate[2], yPlate[1], zPlate[3]),
    new THREE.Triangle(yPlate[1], zPlate[0], zPlate[3]),

    new THREE.Triangle(xPlate[3], yPlate[1], yPlate[2]),
    new THREE.Triangle(xPlate[2], yPlate[2], yPlate[1]),
    new THREE.Triangle(xPlate[3], yPlate[2], zPlate[1]),
    new THREE.Triangle(xPlate[2], zPlate[2], yPlate[2]),
    new THREE.Triangle(yPlate[2], zPlate[2], zPlate[1]),
    new THREE.Triangle(zPlate[1], xPlate[0], xPlate[3]),
    new THREE.Triangle(zPlate[2], xPlate[2], xPlate[1]),
    new THREE.Triangle(xPlate[0], zPlate[1], yPlate[3]),
    new THREE.Triangle(xPlate[1], yPlate[3], zPlate[2]),
    new THREE.Triangle(yPlate[3], zPlate[1], zPlate[2]),
  ];
  return baseTriangles;
}

export function vectorFromGeoPosition(latitude, longitude) {
  const xAxis = new THREE.Vector3(1, 0, 0);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const v = new THREE.Vector3(0, 0, 1);
  const latitudeRadian = -latitude * (Math.PI / 180);
  const longitudeRadian = longitude * (Math.PI / 180);

  v.applyAxisAngle(xAxis, latitudeRadian);
  v.applyAxisAngle(yAxis, longitudeRadian);
  return v;
}

export function divideTriangle(triangle, radius = 1) {
  const middleVertexes = [
    triangle.a.clone().add(triangle.b).normalize().multiplyScalar(radius),
    triangle.b.clone().add(triangle.c).normalize().multiplyScalar(radius),
    triangle.c.clone().add(triangle.a).normalize().multiplyScalar(radius),
  ];
  return [
    new THREE.Triangle(triangle.a, middleVertexes[0], middleVertexes[2]),
    new THREE.Triangle(middleVertexes[0], triangle.b, middleVertexes[1]),
    new THREE.Triangle(middleVertexes[2], middleVertexes[1], triangle.c),
    new THREE.Triangle(middleVertexes[0], middleVertexes[1], middleVertexes[2]),
  ];
}

// vector: THREE.Vector3
export function geoPositionFromVector(vector) {
  const xzVector = new THREE.Vector3(vector.x, 0, vector.z);
  const zVector = new THREE.Vector3(0, 0, 1);
  function sign(v) {
    if (v < 0) {
      return -1;
    }
    return 1;
  }
  return {
    latitude: (xzVector.angleTo(vector) * (180 / Math.PI) * sign(vector.y)),
    longitude: (xzVector.angleTo(zVector) * (180 / Math.PI) * sign(vector.x)),
  };
}

export function triangleFromId(triangleId, level = EARTH_DIVIDE_COUNT) {
  const functionName = 'TriangleFromId';
  const idArray = idArrayFromTriangleId(triangleId);
  let devidedTriangles = baseGeoTriangles();

  let belongingTriangle;
  let depthLevel = level;
  if (depthLevel > idArray.length - 1) {
    flexlog.logger.info(functionName, ': level is bigger than idArray index.');
    depthLevel = idArray.length - 1;
  }
  for (let i = 0; i <= level; i++) {
    belongingTriangle = devidedTriangles[idArray[i]];
    devidedTriangles = divideTriangle(belongingTriangle);
  }

  return belongingTriangle;
}

export function centerVectorOfTriangleFromId(id, level = EARTH_DIVIDE_COUNT) {
  const triangle = triangleFromId(id, level);
  const centerVector = triangle.a;
  return centerVector.add(triangle.b).add(triangle.c).normalize();
}

export function centerGeoPositionFromId(id, level = EARTH_DIVIDE_COUNT) {
  return geoPositionFromVector(centerVectorOfTriangleFromId(id, level));
}

function determinant(vec1, vec2, vec3) {
  const m = new THREE.Matrix3();
  m.set(vec1.x, vec1.y, vec1.z,
    vec2.x, vec2.y, vec2.z,
    vec3.x, vec3.y, vec3.z);
  return m.determinant();
}

export function isVectorCrossWithTriangle(vector, triangle) {
  const invVector = vector.clone().multiplyScalar(-1);
  const edge1 = (new THREE.Vector3()).subVectors(triangle.c, triangle.a);
  const edge2 = (new THREE.Vector3()).subVectors(triangle.b, triangle.a);
  const origin = new THREE.Vector3(0, 0, 0);

  // クラメルの方程式の分母
  const denominator = determinant(edge1, edge2, invVector);

  if (denominator <= 0) {
    return false;
  }

  const d = (new THREE.Vector3()).subVectors(origin, triangle.a);

  const u = determinant(d, edge2, invVector) / denominator;

  if ((u >= 0) && (u <= 1)) {
    const v = determinant(edge1, d, invVector) / denominator;
    if ((v >= 0) && (u + v <= 1)) {
      const t = determinant(edge1, edge2, d) / denominator;

      // 距離がマイナスの場合は交差していない
      if (t < 0) {
        return false;
      }
      return true;
    }
  }
  return false;
}

export function triangleIdFromGeoPosition(latitude, longitude) {
  const geoVector = vectorFromGeoPosition(latitude, longitude);
  const belongingTriangleIdArray = new Array(EARTH_DIVIDE_COUNT + 1);

  const baseTriangles = baseGeoTriangles();
  const belongingBaseTriangle = (() => {
    for (let id = 0; id < 20; id++) {
      if (isVectorCrossWithTriangle(geoVector, baseTriangles[id])) {
        belongingTriangleIdArray[0] = id;
        return baseTriangles[id];
      }
    }
    return baseTriangles[0];
  })();

  function findBelongingInnerTriangle(triangle, depth) {
    const dividedTriangles = divideTriangle(triangle);
    for (let id = 0; id < 4; id++) {
      if (isVectorCrossWithTriangle(geoVector, dividedTriangles[id])) {
        belongingTriangleIdArray[depth] = id;
        return dividedTriangles[id];
      }
    }
    return undefined;
  }

  let tempTriangle = belongingBaseTriangle;
  for (let i = 0; i < EARTH_DIVIDE_COUNT; i++) {
    tempTriangle = findBelongingInnerTriangle(tempTriangle, i + 1);

    if (tempTriangle === undefined) {
      flexlog.logger.err(tempTriangle);
      flexlog.logger.err('No inner triangle!!');
      throw 'No inner triangle!';
    }
  }

  return triangleIdFromIdArray(belongingTriangleIdArray);
}

/* eslint-enable no-bitwise */
