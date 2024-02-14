interface IfProps {
  children: React.ReactNode;
  condition: boolean;
  fallback?: React.ReactNode;
}

const If: React.FC<IfProps> = ({ children, condition, fallback = null }) => {
  return condition ? children : fallback;
};

export default If;
