const InstructionVideo: React.FC = function InstructionVideo() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: '4%',
      }}
    >
      public/demo-mqp-study/assets/pie_instruction.mp4
      <video width="1000" controls>
        <source src="./assets/text_instruction.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default InstructionVideo;
