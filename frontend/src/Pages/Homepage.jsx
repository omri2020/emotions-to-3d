import { useEffect, useRef, useState } from "react";
import axios from "axios";
import About from "./About";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import Button from "../components/Button";
import debounce from "../utils/debounce";

const Homepage = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameNumber, setUsernameNumber] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const username = `אנונימי #${usernameNumber}`;

  useEffect(() => {
    // Get the current number from localStorage or initialize it to 1
    const currentNumber =
      parseInt(localStorage.getItem("usernameNumber"), 10) || 1;
    setUsernameNumber(currentNumber);
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setText("");
      setError("");
    }, 60000);
  };

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
  }, []);

  const handleTextChange = async (e) => {
    const newText = e.target.value;
    setText(newText);
  };

  const generateModel = async () => {
    if (!text) {
      alert("אנא הזן טקסט");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3001/check-toxicity", {
        text,
      });

      const response = await axios.post("http://localhost:3001/process-text", {
        text,
        username,
      });

      const { fileName } = response.data;

      const newNumber = usernameNumber + 1;
      setUsernameNumber(newNumber);

      navigate(`/model/${fileName}`);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "Text is too toxic"
      ) {
        setError("לא הצלחתי להבין, נסו שוב!");
      } else {
        console.error("Error generating model:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="homepage bg-white">
      <div className="pt-4 pr-10 mb-32">
        <img src="/Logo.png" alt="logo" className="h-20" />
      </div>
      <div className="content text-center">
        <div className="w-4/5 grid grid-cols-3 gap-28 tracking-widest">
          <video autoPlay loop muted>
            <source src="/home-animation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="col-span-2 flex flex-col gap-5">
            <div>
              <h2 className="text-stone-700 text-6xl">
                אני מזמינה אתכם להתנסות בעצמכם
              </h2>
              <h3 className="text-lg mb-5 text-stone-700">
                אתם כותבים והמערכת תיצור עבורכם את המיכל המתאים לכם
              </h3>

              <div className="flex justify-between">
                <span>{`אנונימי #${usernameNumber}`}</span>
                <span>400/{text.length}</span>
              </div>
            </div>
            <div className="note-container h-80 mb-10">
              <textarea
                className="note-textarea !text-xl"
                onChange={handleTextChange}
                placeholder={`איך אתה מרגיש בימים אלה?
                  
                  
                                
על מה חשבת לאחרונה?`}
                maxLength={400}
                value={text}
              ></textarea>
              {error && (
                <p className="text-[18px] transform -translate-y-4">{error}</p>
              )}
            </div>
            <Button
              className="btn"
              onClick={generateModel}
              animation="pressed-grow"
            >
              <i className="bx bx-chevron-right"></i>
              <span>צור לי את המיכל שלי</span>
              <i className="bx bx-chevron-left"></i>
            </Button>
          </div>
        </div>
      </div>
      <About />
    </div>
  );
};

export default Homepage;
