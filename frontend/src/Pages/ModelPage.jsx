import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ObjModel from "./ObjModel";
import ErrorBoundary from "../ErrorBoundary";
import axios from "axios";
import ProgressBar from "../components/ProgressBar";
import { Link, useParams } from "react-router-dom";
import Loader from "../Loader";
import Modal from "../components/Modal";
import { sendEmail } from "../services/sendEmail";

function SetupCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

const ModelPage = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [objectLoading, setObjectLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const directionalLightRef = useRef();

  const emotionTranslations = {
    admiration: "הערצה",
    amusement: "שעשוע",
    anger: "כעס",
    annoyance: "מטרד",
    approval: "אישור",
    caring: "דאגה",
    confusion: "בלבול",
    curiosity: "סקרנות",
    desire: "תשוקה",
    disappointment: "אכזבה",
    disapproval: "אי הסכמה",
    disgust: "גועל",
    embarrassment: "מבוכה",
    excitement: "התרגשות",
    fear: "פחד",
    gratitude: "הכרת תודה",
    grief: "יגון",
    joy: "שמחה",
    love: "אהבה",
    nervousness: "עצבנות",
    optimism: "אופטימיות",
    pride: "גאווה",
    realization: "הבנה",
    relief: "הקלה",
    remorse: "חרטה",
    sadness: "עצבות",
    surprise: "הפתעה",
    neutral: "ניטרלי",
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/record/${id}`);
        console.log("Record fetched:", response.data);
        setRecord(response.data);
      } catch (error) {
        console.error("Error fetching record:", error);
      } finally {
        setRecordLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  if (recordLoading) {
    return <Loader />;
  }

  const createdAtDate = new Date(record?.createdAt);
  const time = createdAtDate.toLocaleTimeString("he-IL");
  const date = createdAtDate.toLocaleDateString("he-IL");

  const handleSendEmail = () => {
    const fileUrl = `http://localhost:3001${record.objPath}`;
    sendEmail(email, record.username, fileUrl);
    setIsSent(true);
  };

  const changeLightDirection = () => {
    if (directionalLightRef.current) {
      const x = Math.random() * 20 - 10;
      const y = Math.random() * 20 - 10;
      const z = Math.random() * 20 - 10;
      console.log(x, y, z);

      directionalLightRef.current.position.set(x, y, z);
    }
  };

  function transformFeelings(feelings) {
    const transformedFeelings = {};
    const scaleFactor = 100; // Scale the values to a range of 0 to 100

    // Apply transformation to each feeling
    for (const [emotion, score] of Object.entries(feelings)) {
      // You can use different transformations. Here we use square root scaling
      transformedFeelings[emotion] = Math.sqrt(score) * scaleFactor;
    }

    return transformedFeelings;
  }

  const transformedFeelings = transformFeelings(record.feelings);

  return (
    <div className="tracking-widest py-4 px-8 flex flex-col items-center gap-52">
      <header className="flex w-full justify-between text-stone-500">
        <Link to="/">{`< חזרה לדף הבית `}</Link>
        <div>
          <span>{`${record.username + " / " + date + " / " + time}`}</span>
        </div>
      </header>
      <div className="max-w-[1100px] min-h-[600px] h-full w-full flex justify-between text-slate-600">
        <div className="max-w-[400px] w-full p-4 flex flex-col justify-between">
          {record && (
            <div>
              <ul>
                {Object.keys(transformedFeelings).map((emotion, index) => (
                  <ProgressBar
                    key={emotion}
                    label={emotionTranslations[emotion]}
                    value={transformedFeelings[emotion]}
                    index={index}
                  />
                ))}
              </ul>
            </div>
          )}
          <div className="note-container !h-[200px]">
            <textarea
              className="note-textarea !text-2xl overflow-hidden"
              value={record.text}
              disabled
            ></textarea>
          </div>
        </div>
        <div className="max-w-[700px] w-full flex flex-col">
          <div className="flex-1">
            <ErrorBoundary>
              <Canvas style={{ height: "100%", width: "100%" }}>
                <SetupCamera />
                <ambientLight intensity={3} />
                <directionalLight
                  ref={directionalLightRef}
                  position={[-10, -10, -5]}
                  intensity={10}
                />
                <pointLight />
                <OrbitControls />
                <Suspense fallback={null}>
                  <ObjModel
                    url={`http://localhost:3001${record.objPath}`}
                    onLoaded={() => setObjectLoading(false)}
                  />
                </Suspense>
              </Canvas>
              {objectLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <Loader />
                </div>
              )}
            </ErrorBoundary>
          </div>
          <button className="underline" onClick={changeLightDirection}>
            Change Light Direction
          </button>
          <button
            className="underline text-3xl"
            onClick={() => setIsModalOpen(true)}
          >{`> שליחת את התוצר אליי <`}</button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isSent ? (
          <div className="p-10 flex flex-col gap-20 text-slate-600">
            <div>
              <p>
                וזהו! <br /> כמה דקות והתוצר אצלך
              </p>
              <p className="mt-4">תודה על השיתוף</p>
            </div>
            <Link to="/" className="mt-4 underline">{`חזרה לדף הבית >`}</Link>
          </div>
        ) : (
          <div className="p-10 flex flex-col gap-20 text-slate-600">
            <p>הכנס/י את המייל שלך לקבלת קובץ</p>
            <input
              className="bg-stone-200 border-b border-black placeholder:text-stone-400"
              placeholder="המייל שלי"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="mt-4 underline" onClick={handleSendEmail}>
              {`לשליחה >>`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModelPage;
