import React, { useRef, useEffect } from 'react'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { useControls, folder } from 'leva'
import type { PerspectiveCamera as PerspectiveCameraType } from 'three'

interface CameraControllerProps {
  debug?: boolean
}

const DEFAULT_CAMERA = {
  posX: 0,
  posY: 12,
  posZ: 10,
  fov: 20,
} as const

export function CameraController({
  debug = false,
}: CameraControllerProps): React.ReactNode {
  const cameraRef = useRef<PerspectiveCameraType>(null)

  const { posX, posY, posZ, fov } = useControls({
    Camera: folder(
      {
        posX: { value: DEFAULT_CAMERA.posX, min: -20, max: 20, step: 0.5 },
        posY: { value: DEFAULT_CAMERA.posY, min: 0, max: 15, step: 0.1 },
        posZ: { value: DEFAULT_CAMERA.posZ, min: 2, max: 30, step: 0.5 },
        fov: { value: DEFAULT_CAMERA.fov, min: 10, max: 90, step: 1 },
      },
      { collapsed: true, render: () => debug }
    ),
  })

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0.5, 0)
    }
  }, [])

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[posX, posY, posZ]}
        fov={fov}
      />
      <OrbitControls
        enablePan={debug}
        enableZoom={true}
        enableRotate={debug}
        target={[0, 0.5, 0]}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}
