import React, { useEffect, useRef, useState } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { useFrame } from "@react-three/fiber";
import {
  AmbientLight,
  DirectionalLight,
  MeshStandardMaterial,
  PCFSoftShadowMap,
} from "three";

const ObjModel = ({ url, onLoaded }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const { gl, scene } = useThree();

  const obj = useLoader(OBJLoader, url, (loader) => {
    loader.manager.onStart = () => console.log("Loading started");
    loader.manager.onLoad = () => {
      onLoaded();
      console.log("Loading complete");
    };
    loader.manager.onError = (url) => console.log("Error loading", url);
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = new MeshStandardMaterial({
            color: 0xd6c9b9,
            roughness: 0.1,
            metalness: 0.7,
            wireframe: true,
          });
          child.castShadow = true;
          child.receiveShadow = true;
          child.position.set(0, 0, 0);
          child.rotation.set(0, 0, 0);
        }
      });
    }
  }, [obj]);

  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
      const xPosition = -screenWidth / 250;
      meshRef.current.position.set(xPosition, 0, 0);
    }
  }, [screenWidth]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    // Enable shadow mapping in the renderer
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;

    // Add lights to the scene
    const directionalLight = new DirectionalLight(0xffffff, 10);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const ambientLight = new AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    return () => {
      scene.remove(directionalLight);
      scene.remove(ambientLight);
    };
  }, [gl, scene]);

  return <primitive ref={meshRef} object={obj} scale={[0.12, 0.12, 0.12]} />;
};

export default ObjModel;
