const About = () => {
  return (
    <div className="sliding-page text-center flex flex-col p-4 text-white tracking-wider">
      <h1 className=" text-4xl font-bold mt-2 mb-1">על הפרוייקט</h1>
      <p className="description text-2xl flex items-center justify-center">
        מאיפה הכל התחיל?
        <i className="bx bx-chevron-left"> </i>
        למה מיכלים? <i className="bx bx-chevron-left"></i>
        איך זה עובד?
      </p>
      <div className="w-full h-full flex justify-between mt-40 px-20">
        <div className="flex flex-col text-right text-2xl gap-5 max-w-[30%] leading-7">
          <h3 className="flex items-center">
            <i className="bx bx-chevron-left"></i> מאיפה הכל התחיל?
          </h3>
          <p>
            במהלך הלימודים{" "}
            <span className="bg-white px-1 rounded-sm text-main">
              עברתי משבר שבעקבותיו יצאתי למסע
            </span>{" "}
            ארוך ואינטנסיבי של טיפול נפשי שנמשך שנתיים. <br /> לאחר סיום הטיפול
            ביקשתי את התיק שלי, וקיבלתי חבילה ענקית של דפים שהיא סיכום שבועי של
            חיי במשך אותן שנתיים. החלטתי שאני{" "}
            <span className="bg-white px-1 rounded-sm text-main">
              רוצה לעשות עם הטקסטים האלו משהו.
            </span>
          </p>
        </div>
        <div className="flex flex-col text-right text-2xl  gap-5 max-w-[30%] leading-7">
          <h3 className="flex items-center">
            <i className="bx bx-chevron-left"></i> למה מיכלים?
          </h3>
          <p>
            אני רואה במיכלים מטאפורות של המושג{" "}
            <span className="bg-white px-1 rounded-sm text-main">"הכלה"</span>
            , כלי קיבול - "קבלה". <br />
            בטיפול, המטפל לעיתים מתפקד כ"מיכל" עבור המטופל, שתפקידו להכיל רגשות
            קשים שלו, שהוא מאוים מהם ומתקשה לעבד אותם בעצמו. ההכלה נעשית על ידי
            קבלת רגשות אלו והפיכתם לפחות מאיימים. כאשר הרגש מקבל{" "}
            <span className="bg-white px-1 rounded-sm text-main">
              ממשות, צורה וחומר
            </span>{" "}
            על ידי המיכלים, זהו הניסיון לתת לו מקום בעולם ולשחרר אותו החוצה.
          </p>
        </div>
        <div className="flex flex-col text-right text-2xl  gap-5 max-w-[30%] leading-7">
          <h3 className="flex items-center">
            <i className="bx bx-chevron-left"></i> איך זה עובד?
          </h3>
          <p>
            1. ניתוח הטקסט על ידי מודל שפה, שמאומן לזהות{" "}
            <span className="bg-white px-1 rounded-sm text-main">
              {" "}
              28 רגשות שונים
            </span>{" "}
            ,וכמה דומיננטי כל רגש.
            <br /> 2. סינון הפרדיקציה והשארת הרגשות הדומיננטיים ביותר.
            <br /> 3. בעקבות מחקרי עבר, וביצוע מחקר נוסף במסגרת הפרויקט על
            הקשרים אינטואיטיביים בין רגש וצורה,{" "}
            <span className="bg-white px-1 rounded-sm text-main">
              לכל רגש הותאמו מאפיינים צורניים ייחודיים לו
            </span>
            .
            <br /> 4. מתבצע שקלול של הרגשות שזוהו בטקסט, שתוצאתו היא בחירת
            התכונות הצורניות ביחס להתפלגות הרגשות.
            <br /> 5. שליחת התכונות כפרמטרים לתוכנת תלת מימד ייעודית לעיצוב
            פרמטרי, ויצירת האובייקט התלת מימדי.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
