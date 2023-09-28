import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  setClose: () => void;
  isOpen: boolean;
};

export default function Modal({ children, setClose, isOpen }: Props) {
  return (
    <>
      <dialog className={`modal ${isOpen && "modal-open"}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Source</h3>
          <p className="py-4">{children}</p>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={setClose}>
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
