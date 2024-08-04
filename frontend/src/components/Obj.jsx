import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MeshStandardMaterial } from "three";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import ErrorBoundary from "../ErrorBoundary";
import { emotionTranslations } from "../utils/emotionTranslations";

const RotatingObject = ({ obj }) => {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(0, -15, 0);
    }
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return <primitive ref={meshRef} object={obj} scale={[0.4, 0.4, 0.4]} />;
};

const Obj = ({ url, onLoaded, xPercent, yPercent, objectLoading, record }) => {
  const SetupCamera = () => {
    const { set } = useThree();
    const cameraRef = useRef();

    useEffect(() => {
      set({ camera: cameraRef.current });
    }, [set]);

    return (
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[0, 15, 20]}
        zoom={3}
        near={0.1}
        far={100}
      />
    );
  };

  const objStyle = {
    position: "absolute",
    left: `${xPercent}%`,
    top: `${yPercent}%`,
    width: "19rem",
    height: "12rem",
    transform: "translate(-50%, -50%)", // Center the element
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
            color: 0xd6c9b9, // Lightened color
            roughness: 0.1, // Reduced roughness for more reflection
            metalness: 0.7, // Increased metalness for more shine
            wireframe: true,
          });
        }
      });
    }
  }, [obj]);

  return (
    <div
      style={{ ...objStyle }}
      className="bg-main flex items-center justify-center px-6 z-20"
    >
      <div
        className="absolute top-[-12px] border-l-[30px] border-l-transparent
  border-b-[13px] border-b-main
  border-r-[30px] border-r-transparent"
      ></div>
      <ErrorBoundary>
        <Canvas style={{ flex: 1 }}>
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
      <div className="flex flex-col text-white w-1/3">
        <h4 className="text-main bg-white text-left mb-3">
          #{record.username.match(/\d+/)}
        </h4>

        {Object.keys(record.feelings).map((feelingKey) => (
          <span key={feelingKey} className="font-thin text-lg !leading-3">
            <i className="bx bx-chevron-left"></i>{" "}
            {emotionTranslations[feelingKey] || feelingKey}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Obj;
