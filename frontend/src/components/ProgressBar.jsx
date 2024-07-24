const ProgressBar = ({ label, value, index }) => {
  return (
    <div className="mb-4 flex justify-between items-center ">
      <p className="text-2xl">{label}</p>
      <div className="w-52 bg-stone-300 rounded-full h-3 overflow-hidden mt-2">
        <div
          className="bg-slate-500 h-full"
          style={{ width: `${value.toFixed(2)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
