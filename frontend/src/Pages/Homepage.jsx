import { useState } from "react";
import axios from "axios";
import About from "./About";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const Homepage = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const navigate = useNavigate();

  const handleTextChange = async (e) => {
    const newText = e.target.value;
    setText(newText);
  };

  const isValidText = (text) => {
    // Regular expressions to match English and Hebrew letters and spaces
    const englishHebrewRegex = /^[a-zA-Zא-ת\s]+$/;
    return englishHebrewRegex.test(text);
  };

  const generateModel = async () => {
    if (!text) {
      alert("אנא הזן טקסט");
      return;
    }

    if (!isValidText(text)) {
      alert("אנא הזן טקסט תקין עם אותיות בלבד באנגלית או בעברית");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/process-text", {
        text,
      });

      const { fileName } = response.data;
      navigate(`/model/${fileName}`);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "Text is too toxic"
      ) {
        alert("אנא הזן טקסט תקין");
      } else {
        console.error("Error generating model:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="homepage">
      <div className="content">
        <h1 className="text-stone-400 text-4xl  py-10 mb-32 text-center">
          פגמ”ר 2024 בצלאל / “תשליך” / גיל רוזנבג
        </h1>
        <div className="w-full flex justify-around items-center tracking-widest">
          <div>
            <p>אנימציית הסבר</p>
          </div>
          <div className="w-2/5 flex flex-col gap-5">
            <div>
              <h2 className="text-stone-600 text-4xl font-medium">
                אני מזמינה אתכם להתנסות בעצמכם
              </h2>
              <h3 className="font-sans">
                אתם כותבים והמערכת תיצור עבורכם את המיכל המתאים
              </h3>
            </div>
            <div className="note-container h-[150px]">
              <textarea
                className="note-textarea !text-xl"
                onChange={handleTextChange}
                placeholder={`איך אתה מרגיש בימים אלה?
                  
                  
                                
על מה חשבת לאחרונה?`}
              ></textarea>
            </div>
            <button
              className="text-center font-semibold text-stone-600 text-xl cursor-pointer hover:text-slate-700"
              onClick={generateModel}
              disabled={disableButton}
            >{`< צור לי את המיכל שלי >`}</button>
          </div>
        </div>
      </div>
      <About />
    </div>
  );
};

export default Homepage;
