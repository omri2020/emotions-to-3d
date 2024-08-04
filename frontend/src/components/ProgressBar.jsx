const ProgressBar = ({ label, value, index }) => {
  return (
    <div className="mb-5 flex justify-between items-center">
      <p className="text-4xl">{label}</p>
      <div className="w-[20vw] border border-slate-500 h-4 overflow-hidden mt-2">
        <div
          className="bg-main h-full"
          style={{ width: `${value.toFixed(2)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
