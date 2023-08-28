import Image from 'next/image';

interface CharacterButtonProps {
  name: string;
  highConcept: string;
  imageUrl?: string;
  onClick?: () => void;
}

const CharacterButton: React.FC<CharacterButtonProps> = ({
  name,
  highConcept,
  imageUrl,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="flex items-center p-4 border rounded-lg hover:bg-gray-200 hover:text-gray-800 cursor-pointer  w-48"
  >
    <Image
      src={imageUrl || '/drowsee_128.png'}
      alt={name}
      width={64}
      height={64}
      className="w-16 h-16"
    />
    <div className="ml-4">
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="text-sm text-gray-600">{highConcept}</p>
    </div>
  </div>
);

export default CharacterButton;
