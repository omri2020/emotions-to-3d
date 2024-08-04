import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import ObjModel from "./ObjModel";
import ErrorBoundary from "../ErrorBoundary";
import axios from "axios";
import ProgressBar from "../components/ProgressBar";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../Loader";
import Modal from "../components/Modal";
import { sendEmail } from "../services/sendEmail";
import { emotionTranslations } from "../utils/emotionTranslations";
import Button from "../components/Button";
import debounce from "../utils/debounce";
import LightButton from "../components/LightButton";

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
      zoom={45}
      near={0.1}
      far={100}
    />
  );
};

const ModelPage = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [objectLoading, setObjectLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSentModal, setIsSentModal] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const navigate = useNavigate();

  const directionalLightRef = useRef();

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      navigate("/");
    }, 60000);
  }, [navigate]);

  useEffect(() => {
    const handleUserInteraction = debounce(() => {
      console.log("User interaction detected, resetting timeout");
      resetTimeout();
    }, 300);

    // List of events to listen to
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleUserInteraction);
    });

    // Initialize the timeout
    resetTimeout();

    return () => {
      // Cleanup event listeners and timeout on component unmount
      events.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout]);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/record/${id}`);
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

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = () => {
    if (isValidEmail(email)) {
      const fileUrl = `http://localhost:3001${record.objPath}`;
      sendEmail(email, record.username, fileUrl);
      setIsSent(true);
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } else {
      setError("אולי טעות בהקלדה? נסלח ונשכח, נסו שוב");
      setIsSent(false);
    }
  };

  const handleExit = () => {
    if (!isSent) {
      setIsSentModal(true);
      return;
    }
    navigate("/");
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
    <div className="tracking-widest py-4 px-8 flex items-center justify-center">
      {objectLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-[calc(50%+17.5vw)] -translate-y-1/2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-dashed border-slate-500"></div>
        </div>
      )}
      <ErrorBoundary>
        <Canvas
          style={{
            position: "fixed",
            top: "0",
            right: "0",
            left: "0",
            bottom: "0",
            width: "100vw",
            height: "100vh",
            zIndex: "1",
          }}
        >
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
      </ErrorBoundary>
      <div className="max-w-[90%] h-full w-full ">
        <header className="flex w-full justify-between  mb-80">
          <Button
            className="!border-b-slate-500 !border-b z-10 !bg-transparent !text-main hover:transform hover:scale-150 hover:border-none"
            onClick={handleExit}
            animation="pressed-right"
          >
            <i className="bx bx-chevron-right"></i>
            <span className="transform translate-x-1 flex items-center text-2xl">
              חזרה לדף הבית
            </span>
          </Button>
          {isSentModal && (
            <Modal isOpen={isSentModal} onClose={() => setIsSentModal(false)}>
              <div className="flex flex-col items-center justify-center gap-10">
                <div className="flex flex-col items-center justify-center text-2xl">
                  <span>כבר עוזבים?</span>
                  <span>שמרו אצלכם את התוצר לפני האתחול</span>
                </div>
                <div className="flex flex-col items-center jusstify-center gap-3">
                  <Button
                    className="w-full"
                    animation="pressed-left-sm"
                    onClick={() => {
                      setIsSentModal(false);
                      setIsModalOpen(true);
                    }}
                  >
                    <span>שליחה למייל שלי</span>
                    <i className="bx bx-chevron-left"></i>
                    <i className="bx bx-chevron-left"></i>
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/");
                    }}
                    className="w-full !bg-transparent border border-main !text-main"
                    animation="pressed-right-lg"
                  >
                    <i className="bx bx-chevron-right"></i>
                    <i className="bx bx-chevron-right"></i>
                    <span>אתחול בלי שמירה</span>
                  </Button>
                </div>
              </div>
            </Modal>
          )}
          <div>
            <span className="text-2xl">{`${
              record.username + " / " + time + " / " + date
            }`}</span>
          </div>
        </header>
        <div className="w-full flex items-center justify-between relative">
          <LightButton onClick={changeLightDirection} />
          <div className="max-w-[35%] z-10 w-full p-4 flex flex-col gap-10 justify-between">
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
            <div className="note-container h-60">
              <textarea
                className="note-textarea !text-2xl"
                value={record.text}
                disabled
              ></textarea>
            </div>
          </div>
          <div className="h-full max-w-[60%] w-full flex flex-col self-end">
            <Button
              onClick={() => setIsModalOpen(true)}
              icons={true}
              className="flex items-center justify-center relative !px-8"
              animation="pressed-shrink"
            >
              <i className="bx bx-chevron-left absolute right-1"></i>
              <span>לשמירה ושליחה</span>
              <i className="bx bx-chevron-right absolute left-1"></i>
            </Button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEmail("");
          setError("");
        }}
      >
        {isSent ? (
          <div className="flex flex-col gap-20 text-2xl text-center">
            <div>
              <p>
                וזהו! <br /> כמה דקות והתוצר אצלך
              </p>
              <p className="mt-4">תודה על השיתוף</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-start gap-20 text-2xl">
            <p>הכנס/י את המייל שלך לקבלת הקובץ</p>
            <div className="w-full">
              <input
                className="text-inherit bg-stone-200 border-b border-slate-600 w-full placeholder:text-stone-400 outline-main pr-2 py-1"
                type="email"
                placeholder="המייל שלי"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-[18px] ">{error}</p>}
            </div>
            <Button onClick={handleSendEmail} animation="pressed-left">
              <span>שליחה</span>
              <i className="bx bx-chevron-left"></i>
              <i className="bx bx-chevron-left -mr-2"></i>
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModelPage;
