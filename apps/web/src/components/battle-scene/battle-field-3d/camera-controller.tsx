import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, Html } from '@react-three/drei'
import type { PerspectiveCamera as PerspectiveCameraType } from 'three'

interface CameraControllerProps {
  debug?: boolean
}

export function CameraController({
  debug = false,
}: CameraControllerProps): React.ReactNode {
  const cameraRef = useRef<PerspectiveCameraType>(null)
  const [cameraInfo, setCameraInfo] = useState({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0)
    }
  }, [])

  useFrame(() => {
    if (debug && cameraRef.current) {
      const { x, y, z } = cameraRef.current.position
      setCameraInfo({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        z: Math.round(z * 100) / 100,
      })
    }
  })

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 2, 8]}
        fov={45}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[0, 0, 0]}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2}
      />
      {debug && (
        <Html position={[0, 5, 0]} center>
          <div className="rounded bg-black/80 px-3 py-2 font-mono text-xs text-white">
            <div>Camera: [{cameraInfo.x}, {cameraInfo.y}, {cameraInfo.z}]</div>
            <div className="mt-1 text-gray-400">Drag to rotate, Scroll to zoom</div>
          </div>
        </Html>
      )}
    </>
  )
}
