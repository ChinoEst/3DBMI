import { IFCLoader } from 'web-ifc-three/IFCLoader'

let loader = null

export async function getIFCLoader() {
  if (loader) return loader
  loader = new IFCLoader()
  await loader.ifcManager.setWasmPath('/wasm/')
  loader.ifcManager.applyWebIfcConfig({
    COORDINATE_TO_ORIGIN: true,
    USE_FAST_BOOLS: false
  })
  return loader
}

export async function loadIFCFile(file, onProgress) {
  const ifcLoader = await getIFCLoader()
  const url = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    ifcLoader.load(
      url,
      (model) => {
        URL.revokeObjectURL(url)
        resolve(model)
      },
      (progress) => {
        if (onProgress && progress.total > 0) {
          onProgress(Math.round((progress.loaded / progress.total) * 100))
        }
      },
      (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }
    )
  })
}
