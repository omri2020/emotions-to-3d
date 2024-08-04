const Loader = () => {
  return (
    <div className="flex justify-center h-screen w-screen relative overflow-hidden z-[1000]">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/bw3.mp4"
        autoPlay
        loop
        muted
      ></video>
      <div className="relative flex justify-center h-screen w-screen bg-center bg-[length:120%] !tracking-wide">
        <div className="mt-52 text-center text-gray-200 flex flex-col items-center gap-12">
          <p className="!text-4xl w-3/5 ">
            המערכת מנתחת כעת את הרגשות העולים מהשיתוף שלך ומייצרת עבורם מיכל
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
