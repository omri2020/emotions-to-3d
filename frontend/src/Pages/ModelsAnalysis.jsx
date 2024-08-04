import Obj from "../components/Obj";
import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import Loader from "../Loader";

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
    return <Loader />;
  }

  const numHorizontalLines = Math.floor(viewport.height / 150);
  const numVerticalLines = Math.floor(viewport.width / 150);

  return (
    <div className="relative w-screen h-screen bg-white">
      <div className="absolute bg-[#EDE6DF] h-[12px] w-full top-1/2 z-10"></div>
      <div className="absolute bg-[#EDE6DF] w-[12px] h-full left-1/2 z-10"></div>
      <span className="flex items-center absolute top-16 right-[calc(50%-60px)] z-20 text-4xl transform -rotate-90">
        <i className="bx bx-chevron-right"></i> רגש חיובי
      </span>
      <span className="flex items-center absolute bottom-20 right-[calc(50%-60px)] z-20 text-4xl transform -rotate-90">
        <i className="bx bx-chevron-right"></i> רגש שלילי
      </span>
      <span className="flex items-center absolute top-[calc(50%+10px)] z-20 right-0 text-4xl">
        <i className="bx bx-chevron-right"></i> אנרגיה גבוהה
      </span>
      <span className="flex items-center absolute top-[calc(50%+10px)] z-20 left-7 text-4xl">
        <i className="bx bx-chevron-right"></i> אנרגיה נמוכה
      </span>

      {/*Feelings marks*/}
      {/*Positive*/}
      <span className="flex items-center absolute top-[12%] left-1/2 z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Optimism</span>
      </span>
      <span className="flex items-center absolute top-[12%] right-[10%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Excitment</span>
      </span>
      <span className="flex items-center absolute top-[12%] right-[16%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Joy</span>
      </span>
      <span className="flex items-center absolute top-[21%] right-[47%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Approval</span>
      </span>
      <span className="flex items-center absolute top-[21%] right-[38%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Admiration</span>
      </span>
      <span className="flex items-center absolute top-[21%] right-[30%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Love</span>
      </span>
      <span className="flex items-center absolute top-[30%] left-[30%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Caring</span>
      </span>
      <span className="flex items-center absolute top-[30%] right-[40%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Gratitude</span>
      </span>
      <span className="flex items-center absolute top-[30%] right-[20%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Desire</span>
      </span>
      <span className="flex items-center absolute top-[39%] left-[20%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Relief</span>
      </span>
      <span className="flex items-center absolute top-[39%] left-[40%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Pride</span>
      </span>
      <span className="flex items-center absolute top-[39%] right-[40%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Curiosity</span>
      </span>
      <span className="flex items-center absolute top-[43%] right-[25%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Amusement</span>
      </span>
      <span className="flex items-center absolute top-[48%] right-[47%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Relization</span>
      </span>
      <span className="flex items-center absolute top-[48%] right-[40%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Suprize</span>
      </span>
      <span className="flex items-center absolute top-[50%] right-[50%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Neutral</span>
      </span>
      {/*Negative*/}
      <span className="flex items-center absolute bottom-[12%] left-[20%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Grief</span>
      </span>
      <span className="flex items-center absolute bottom-[12%] left-[25%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Sadness</span>
      </span>
      <span className="flex items-center absolute bottom-[12%] right-[16%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Anger</span>
      </span>
      <span className="flex items-center absolute bottom-[21%] left-[25%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Disapointment</span>
      </span>
      <span className="flex items-center absolute bottom-[21%] right-[25%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Disgust</span>
      </span>
      <span className="flex items-center absolute bottom-[30%] left-[30%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Remorse</span>
      </span>
      <span className="flex items-center absolute bottom-[30%] right-[35%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Annoyance</span>
      </span>
      <span className="flex items-center absolute bottom-[30%] right-[20%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Fear</span>
      </span>
      <span className="flex items-center absolute bottom-[30%] left-[40%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Embarrassment</span>
      </span>
      <span className="flex items-center absolute bottom-[39%] left-[47%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Confusion</span>
      </span>
      <span className="flex items-center absolute bottom-[39%] right-[35%] z-20 text-xl font-bold">
        <div className="h-2.5 w-2.5 rounded-full bg-main ml-1.5 mb-0.5"></div>
        <span>Nervousness</span>
      </span>

      {/* Horizontal grid lines */}
      {Array.from({ length: numHorizontalLines }, (_, index) => {
        const top = (index - Math.floor(numHorizontalLines / 2)) * 150;
        return top !== 0 ? (
          <div
            key={`h-${index}`}
            className="absolute bg-[#FBFAF8] h-[10px] w-full"
            style={{ top: `calc(50% + ${top}px - 4px)` }} // 4px to offset the main axis thickness
          />
        ) : null;
      })}

      {/* Vertical grid lines */}
      {Array.from({ length: numVerticalLines }, (_, index) => {
        const left = (index - Math.floor(numVerticalLines / 2)) * 150;
        return left !== 0 ? (
          <div
            key={`v-${index}`}
            className="absolute bg-[#FBFAF8] w-[10px] h-full"
            style={{ left: `calc(50% + ${left}px - 4px)` }} // 4px to offset the main axis thickness
          />
        ) : null;
      })}

      {/* Existed containers */}
      <div className="h-32 w-32 fixed right-[30%] top-[61%] z-10">
        <img src="/containers/Vector-4.png" alt="" />
      </div>
      <div className="h-32 w-32 fixed left-[30%] top-[61%] z-10">
        <img src="/containers/Vector-2.png" alt="" />
      </div>
      <div className="h-32 w-32 fixed left-[15%] top-[70%] z-10">
        <img src="/containers/Vector-3.png" alt="" />
      </div>
      <div className="h-32 w-32 fixed right-[15%] top-[70%] z-10">
        <img src="/containers/Frame 118.png" alt="" />
      </div>
      <div className="h-32 w-32 fixed right-[40%] top-[10%] z-10">
        <img src="/containers/Vector.png" alt="" />
      </div>
      <div className="h-32 w-32 fixed right-[25%] top-[10%] z-10">
        <img src="/containers/Vector-5.png" alt="" />
      </div>

      {records.map((record, i) => {
        // Normalize coordinates to the range of -50 to 50
        const xPercent = (record.coords.x / 5) * 50;
        const yPercent = (record.coords.y / 5) * 50;

        // Adjust for item dimensions
        const itemHeight = (10 * viewport.height) / 100; // 10vh
        const itemWidth = (10 * viewport.width) / 100; // 10vw

        // Ensure the clamping logic handles negative values correctly
        const clampedXPercent = clamp(
          xPercent,
          -50 + (itemWidth / viewport.width) * 100,
          50 - (itemWidth / viewport.width) * 100
        );
        const clampedYPercent = clamp(
          yPercent,
          -50 + (itemHeight / viewport.height) * 100,
          50 - (itemHeight / viewport.height) * 100
        );
        // Convert the clamped values to the range of 0 to 100 for positioning
        const finalXPercent = 50 + clampedXPercent;
        const finalYPercent = 50 - clampedYPercent; // Y axis is inverted

        console.log(`record${i}`, record.coords.x, record.coords.y);
        console.log(`record${i} before clamping`, xPercent, yPercent);
        console.log(`record${i} after clamping`, finalXPercent, finalYPercent);

        return (
          <Obj
            key={i}
            xPercent={finalXPercent}
            yPercent={finalYPercent}
            url={`http://localhost:3001${record.objPath}`}
            onLoaded={() => setObjectLoading(false)}
            objectLoading={objectLoading}
            record={record}
          />
        );
      })}
    </div>
  );
};

export default ModelsAnalysis;
