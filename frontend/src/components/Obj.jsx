import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MeshStandardMaterial } from "three";
import { OrbitControls } from "@react-three/drei";
import ErrorBoundary from "../ErrorBoundary";

const RotatingObject = ({ obj }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return <primitive ref={meshRef} object={obj} scale={[0.15, 0.15, 0.15]} />;
};

const Obj = ({ url, onLoaded, x, y, objectLoading }) => {
  function SetupCamera() {
    const { camera } = useThree();
    useEffect(() => {
      camera.position.set(0, 20, 20);
      camera.lookAt(0, 0, 0);
    }, [camera]);
    return null;
  }

  const objStyle = {
    position: "absolute",
    left: `calc(50% + ${x}px)`,
    top: `calc(50% - ${y}px)`,
    width: "200px",
    height: "200px",
    borderRadius: "50%",
  };

  const obj = useLoader(OBJLoader, url, (loader) => {
    loader.manager.onStart = () => console.log("Loading started");
    loader.manager.onLoad = () => {
      onLoaded();
      console.log("Loading complete");
    };
    loader.manager.onError = (url) => console.log("Error loading", url);
  });

  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = new MeshStandardMaterial({
            color: 0xaaaaaa, // Lightened color
            roughness: 0.1, // Reduced roughness for more reflection
            metalness: 0.7, // Increased metalness for more shine
            wireframe: true,
          });
        }
      });
    }
  }, [obj]);

  return (
    <div style={{ ...objStyle }}>
      <ErrorBoundary>
        <Canvas style={{ height: "100%", width: "100%" }}>
          <SetupCamera />
          <ambientLight intensity={3} />
          <directionalLight position={[-10, -10, -5]} intensity={10} />
          <pointLight />
          <OrbitControls />
          <Suspense fallback={null}>
            <RotatingObject obj={obj} />
          </Suspense>
        </Canvas>
        {objectLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div>Loading...</div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default Obj;
