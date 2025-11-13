interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

function Container({ children, className }: ContainerProps) {
  return (
    <>
      <div className={`w-full mx-auto px-5 ${className}`}>{children}</div>
    </>
  );
}

export default Container;
