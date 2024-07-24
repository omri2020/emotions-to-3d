import Obj from "../components/Obj";
import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";

const ModelsAnalysis = () => {
  const [records, setRecords] = useState([]);
  const [objectLoading, setObjectLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    "ws://localhost:3001",
    {
      onOpen: () => {
        console.log("WebSocket connection established");
        // Update the viewport dimensions on WebSocket connection
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      },
      onMessage: (message) => {
        const newRecord = JSON.parse(message.data);
        console.log(newRecord);

        // Check if the received data is an array or an object
        if (Array.isArray(newRecord)) {
          setRecords(newRecord);
        } else {
          setRecords((prevRecords) => [...prevRecords, newRecord]);
        }
        setRecordsLoading(false);
      },
    }
  );

  useEffect(() => {
    // Update the viewport dimensions on window resize
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Clamp function to ensure values stay within a range
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  if (recordsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-screen h-screen border border-black">
      <div className="absolute bg-black h-[1px] w-full top-1/2"></div>
      <div className="absolute bg-black w-[1px] h-full left-1/2"></div>
      {records.map((record, i) => {
        // Calculate the clamped positions
        const halfObjectSize = 100; // Adjust based on the actual size of the object
        const x = clamp(
          record.coords.x * 100,
          -(viewport.width / 2 - halfObjectSize),
          viewport.width / 2 - halfObjectSize
        );
        const y = clamp(
          record.coords.y * 100,
          -(viewport.height / 2 - halfObjectSize),
          viewport.height / 2 - halfObjectSize
        );

        return (
          <Obj
            key={i}
            x={x}
            y={y}
            url={`http://localhost:3001${record.objPath}`}
            onLoaded={() => setObjectLoading(false)}
            objectLoading={objectLoading}
          />
        );
      })}
    </div>
  );
};

export default ModelsAnalysis;
