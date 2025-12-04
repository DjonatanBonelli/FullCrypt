"use client";
import Button from "../ui/Button";
import { Modal } from "../cloud/modal/Modal";

interface KeyPasswordModalProps {
  open: boolean;
  password: string;
  status: string;
  isUploading: boolean;
  setPassword: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function KeyPasswordModal({
  open,
  password,
  status,
  isUploading,
  setPassword,
  onClose,
  onConfirm,
}: KeyPasswordModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg mb-3">Informe sua senha</h2>

      <input
        type="password"
        className="w-full neon-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Digite sua senha"
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm();
        }}
      />

      <div className="flex gap-2 mt-4">
        <Button onClick={onClose} className="gray-btn">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          className="neon-btn"
          disabled={isUploading || !password}
        >
          Confirmar
        </Button>
      </div>

      {status && <p className="text-red-400 mt-2">{status}</p>}
    </Modal>
  );
}
