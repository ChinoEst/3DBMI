import * as FRAGS from '@thatopen/fragments'
import * as THREE from 'three'

let fragments = null

async function getFragments() {
  if (fragments) return fragments
  fragments = new FRAGS.FragmentsModels('/worker.mjs')
  return fragments
}

export async function loadIFCFile(file, onProgress) {
  if (onProgress) onProgress(10)

  const serializer = new FRAGS.IfcImporter()
  serializer.wasm = {
    absolute: true,
    path: 'https://unpkg.com/web-ifc@0.0.77/'
  }

  if (onProgress) onProgress(20)

  const buffer = await file.arrayBuffer()
  const ifcBytes = new Uint8Array(buffer)

  if (onProgress) onProgress(40)

  const fragmentBytes = await serializer.process({
    bytes: ifcBytes,
    progressCallback: (progress) => {
      if (onProgress) onProgress(40 + Math.round(progress * 40))
    }
  })

  if (onProgress) onProgress(85)

  const frags = await getFragments()
  const model = await frags.load(fragmentBytes, { modelId: file.name })
  await frags.update(true)

  if (onProgress) onProgress(100)

  // 直接回傳 model.object，不 clone
  model.object.name = file.name
  return model.object
}
