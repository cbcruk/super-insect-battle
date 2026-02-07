import React, { useRef, useEffect } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import type { PerspectiveCamera as PerspectiveCameraType } from 'three'

export function CameraController(): React.ReactNode {
  const cameraRef = useRef<PerspectiveCameraType>(null)

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0)
    }
  }, [])

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 4, 7]}
      fov={45}
    />
  )
}
