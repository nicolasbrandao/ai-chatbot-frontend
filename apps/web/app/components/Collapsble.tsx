import { ReactNode, FC } from "react";

const Collapsible = ({
  children,
  collapsedContent,
}: {
  children: ReactNode;
  collapsedContent: ReactNode;
}) => {
  return (
    <div className="collapse">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">{children}</div>
      <div className="collapse-content">{collapsedContent}</div>
    </div>
  );
};

export default Collapsible;
