import ProgressBar from "react-bootstrap/ProgressBar";

const Progress = ({ maxTokens, tokensSold }) => {
  return (
    <div className="my-3">
      <ProgressBar
        now={(tokensSold / maxTokens) * 100}
        label={`${((tokensSold / maxTokens) * 100).toFixed(2)}%`}
      />
      <p className="text-center my-3">
        {parseFloat(tokensSold).toFixed(0)} / {parseFloat(maxTokens).toFixed(0)}{" "}
        Tokens Sold
      </p>
    </div>
  );
};

export default Progress;
