import * as WebIFC from 'web-ifc'
import * as THREE from 'three'

let api = null

async function getAPI() {
  if (api) return api
  api = new WebIFC.IfcAPI()
  api.SetWasmPath('/wasm/')
  await api.Init()
  return api
}

export async function loadIFCFile(file, onProgress) {
  const ifcApi = await getAPI()
  const buffer = await file.arrayBuffer()
  const data = new Uint8Array(buffer)

  if (onProgress) onProgress(30)

  const modelID = ifcApi.OpenModel(data, {
    COORDINATE_TO_ORIGIN: true,
    USE_FAST_BOOLS: false
  })

  if (onProgress) onProgress(60)

  const group = new THREE.Group()
  group.name = file.name

  ifcApi.StreamAllMeshes(modelID, (mesh) => {
    const placedGeometries = mesh.geometries
    for (let i = 0; i < placedGeometries.size(); i++) {
      const placedGeometry = placedGeometries.get(i)
      const geometry = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID)

      const bufferGeometry = new THREE.BufferGeometry()
      const posFloats = new Float32Array(ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize()))
      const indInts = new Uint32Array(ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize()))

      const positions = new Float32Array(posFloats.length / 2)
      const normals = new Float32Array(posFloats.length / 2)
      for (let j = 0; j < posFloats.length; j += 6) {
        const idx = j / 6
        positions[idx * 3] = posFloats[j]
        positions[idx * 3 + 1] = posFloats[j + 1]
        positions[idx * 3 + 2] = posFloats[j + 2]
        normals[idx * 3] = posFloats[j + 3]
        normals[idx * 3 + 1] = posFloats[j + 4]
        normals[idx * 3 + 2] = posFloats[j + 5]
      }

      bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
      bufferGeometry.setIndex(new THREE.BufferAttribute(indInts, 1))

      const color = placedGeometry.color
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color.x, color.y, color.z),
        opacity: color.w,
        transparent: color.w < 1,
        side: THREE.DoubleSide
      })

      const matrix = new THREE.Matrix4()
      matrix.fromArray(placedGeometry.flatTransformation)

      const mesh3 = new THREE.Mesh(bufferGeometry, material)
      mesh3.matrix.copy(matrix)
      mesh3.matrixAutoUpdate = false
      mesh3.castShadow = true
      mesh3.receiveShadow = true

      group.add(mesh3)
      ifcApi.Dispose(geometry)
    }
  })

  ifcApi.CloseModel(modelID)
  if (onProgress) onProgress(100)

  return group
}
