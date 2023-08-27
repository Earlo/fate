interface CampaignButtonProps {
  name: string;
  onClick: () => void;
}

const CampaignButton: React.FC<CampaignButtonProps> = ({ name, onClick }) => {
  return (
    <div
      className="flex items-center justify-between bg-gray-200 p-2 mb-2 rounded"
      onClick={onClick}
    >
      <div>
        <h3 className="font-bold text-lg">{name}</h3>
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
        Open
      </button>
    </div>
  );
};

export default CampaignButton;
