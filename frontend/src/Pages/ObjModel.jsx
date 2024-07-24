import React, { useEffect, useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial } from "three";

const ObjModel = ({ url, onLoaded }) => {
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

  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(0, -3, 0);
    }
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return <primitive ref={meshRef} object={obj} scale={[0.19, 0.19, 0.19]} />;
};

export default ObjModel;
