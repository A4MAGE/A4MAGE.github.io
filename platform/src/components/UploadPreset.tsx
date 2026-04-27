import "./UploadPreset.css";

type UploadPresetProps = {
  close: () => void;
};

const UploadPreset = ({ close }: UploadPresetProps) => {
  return (
    <div className="upload-widget">
      <div className="upload-container">
        <p>Upload me!</p>
        <button onClick={close}>x</button>
      </div>
    </div>
  );
};

export default UploadPreset;
