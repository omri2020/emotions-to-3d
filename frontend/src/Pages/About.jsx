const About = () => {
  return (
    <div className="sliding-page text-center flex flex-col p-4 text-white tracking-wider">
      <h1 className=" text-4xl font-bold mb-2">על הפרוייקט</h1>
      <p className="description text-3xl">{`תחילת הדרך >> הסיפור שמאחורי התהליך >> בניית המערכת >> החזון`}</p>
      <div className="w-full container flex justify-aroubend mt-32">
        <div className="flex flex-col text-right text-3xl  gap-5 px-10">
          <h3 className="card-title relative">{`> מאיפה הכל התחיל?`}</h3>
          <p>
            במהלך הלימודים{" "}
            <span className="bg-white text-slate-600">
              עברתי משבר שבעקבותיו יצאתי למסע
            </span>{" "}
            ארוך ואינטנסיבי של טיפול נפשי במשך שנתיים (וחודש). לאחר סיום הטיפול
            ביקשתי את התיק שלי, וקיבלתי חבילה ענקית של דפים, שהיא סיכום שבועי
            שלחיי במשך אותן שנתיים. הבנתי שאני{" "}
            <span className="bg-white text-slate-600">
              רוצה לעשות עם הטקסטים האלו משהו.
            </span>
          </p>
        </div>
        <div className="flex flex-col text-right text-3xl  gap-5 px-10">
          <h3 className="card-title relative">{`> למה מיכלים?`}</h3>
          <p>
            אני רואה במיכלים מטאפורות של המושג{" "}
            <span className="bg-white text-slate-600">"הכלה"</span>, כלי קיבול
            "קבלה".בטיפול, המטפל לעיתים מתפקד כ"מיכל" עבור המטופל, שתפקידו להכיל
            רגשות קשים שלו, שהוא מאוים מהם ומתקשה לעבד אותם בעצמו. ההכלה נעשית
            על ידי קבלת רגשות אלו והפיכתם לפחות מאיימים. הפרויקט מבקש{" "}
            <span className="bg-white text-slate-600">
              לתת לרגש ממשות, צורה וחומר
            </span>{" "}
            על ידי המיכלים, ולתת לו מקום ממשי בעולם.
          </p>
        </div>
        <div className="flex flex-col text-right text-3xl  gap-5 px-10">
          <h3 className="card-title relative">{`> איך זה עובד?`}</h3>
          <p>
            הטקסט מנותח על ידי מודל שפה (BERT), שמזהה את הרגשות שהטקסט מכיל
            בתוכו.ישנם 28 רגשות שונים שהמודל יודע לזהות. בעקבות מחקר מעמיק על
            הקשר בין רגש וצורה,{" "}
            <span className="bg-white text-slate-600">
              לכל רגש מתוך 28 הרגשות הותאמו מאפיינים צורניים ייחודיים לו.
            </span>{" "}
            התוכנה משקללת את תמהיל הרגשות שזוהה בטקסט, ומייצרת את הכלי המתאים
            ביחס להתפלגות.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
