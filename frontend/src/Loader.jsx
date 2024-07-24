const Loader = () => {
  return (
    <div className="flex justify-center h-screen w-screen relative overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/bw3.mp4"
        autoPlay
        loop
        muted
      ></video>
      <div className="relative flex justify-center h-screen w-screen bg-center bg-[length:120%] !tracking-wide">
        <div className="mt-52 text-center text-gray-200 flex flex-col items-center gap-12">
          <p className="!text-4xl font-semibold w-3/4">
            המערכת מזהה רגשות שעולים ממה ששתפת ומעצבת את המיכל המתאים
          </p>
          <div>
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
