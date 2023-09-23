import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <div className="bg-gray-800 py-4 text-white">
      <div className="container mx-auto text-center">
        <Link href="/about" className="mr-4 hover:underline">
          About
        </Link>
      </div>
    </div>
  );
};

export default Footer;
