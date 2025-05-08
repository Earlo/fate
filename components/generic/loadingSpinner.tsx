const LoadingSpinner: React.FC = () => (
  <div
    className="text-secondary size-16 animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    role="status"
  >
    <span className="absolute! h-px! w-px! overflow-hidden! whitespace-nowrap! border-0! p-0! [clip:rect(0,0,0,0)]!">
      Loading...
    </span>
  </div>
);

export default LoadingSpinner;
