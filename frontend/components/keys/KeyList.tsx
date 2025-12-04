"use client";

import { useState } from "react";
import Button from "../ui/Button";
import { Modal } from "../cloud/modal/Modal";
import {
  KeyStore,
  loadKeyStore,
  keyStoreExists,
  exportEncryptedKeyStore,
  restoreEncryptedKeyStore,
  EncryptedKeyStore,
} from "@/app/keyStore/keyManager";

export default function KeyList() {
  const [keyStore, setKeyStore] = useState<KeyStore | null>(null);
  const [hasKeyStore, setHasKeyStore] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>("");

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [processingBackup, setProcessingBackup] = useState(false);

  const checkExists = async () => {
    try {
      const exists = await keyStoreExists();
      setHasKeyStore(exists);
    } catch (err) {
      console.error(err);
      setStatus("Erro ao verificar keystore");
    }
  };

  const handleOpenLoadKeys = async () => {
    setStatus("");
    await checkExists();
    setPasswordModalOpen(true);
  };

  const handleLoadKeys = async () => {
    if (!password) return;
    setLoadingKeys(true);
    setStatus("");
    try {
      const ks = await loadKeyStore(password);
      if (!ks) {
        setStatus("Nenhum keystore encontrado");
      }
      setKeyStore(ks);
      setPasswordModalOpen(false);
      setPassword("");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Erro ao carregar keystore");
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleDownloadBackup = async () => {
    setProcessingBackup(true);
    setStatus("");
    try {
      const data = await exportEncryptedKeyStore();
      if (!data) {
        setStatus("Nenhum keystore para exportar");
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fullcrypt-keystore-backup.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Backup de chaves exportado com sucesso");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao exportar backup de chaves");
    } finally {
      setProcessingBackup(false);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingBackup(true);
    setStatus("");

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as EncryptedKeyStore;

      if (!parsed.encrypted || !parsed.iv) {
        throw new Error("Arquivo de backup inválido");
      }

      await restoreEncryptedKeyStore(parsed);
      setStatus("Backup de chaves restaurado com sucesso");
      setKeyStore(null); // força o usuário a recarregar com senha
      setHasKeyStore(true);
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Erro ao restaurar backup de chaves");
    } finally {
      setProcessingBackup(false);
      // limpa o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
  };

  const aesEntries = keyStore ? Object.entries(keyStore.aesKeys || {}) : [];

  return (
    <div className="neon-box p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciador de Chaves</h1>
          <p className="text-gray-400 text-sm">
            Visualize o conteúdo do keystore e faça backup/restauração das chaves.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="neon-btn" onClick={handleOpenLoadKeys}>
          Carregar e listar chaves
        </Button>

        <Button
          className="gray-btn"
          onClick={handleDownloadBackup}
        >
          {processingBackup ? "Processando..." : "Baixar backup criptografado"}
        </Button>

        <label className="gray-btn inline-flex items-center cursor-pointer">
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleRestoreBackup}
          />
          Restaurar de arquivo
        </label>
      </div>

      {hasKeyStore === false && (
        <p className="text-yellow-400 text-sm">
          Nenhum keystore encontrado. Crie um ao usar o sistema de chaves.
        </p>
      )}

      {keyStore && (
        <div className="space-y-4 mt-4">
          <div className="border border-[var(--surface-secondary)] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Chaves pós-quânticas</h2>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Dilithium:</span>{" "}
                {keyStore.dilithium ? (
                  <span className="text-green-400">Configurada</span>
                ) : (
                  <span className="text-gray-400">Não configurada</span>
                )}
              </div>
              <div>
                <span className="font-medium">Kyber:</span>{" "}
                {keyStore.kyber ? (
                  <span className="text-green-400">Configurada</span>
                ) : (
                  <span className="text-gray-400">Não configurada</span>
                )}
              </div>
            </div>
          </div>

          <div className="border border-[var(--surface-secondary)] rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">
              Chaves AES por arquivo ({aesEntries.length})
            </h2>

            {aesEntries.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Nenhuma chave AES armazenada no keystore.
              </p>
            ) : (
              <div className="max-h-64 overflow-auto text-sm">
                <table className="w-full text-left text-xs">
                  <thead className="text-gray-400 border-b border-[var(--surface-secondary)]">
                    <tr>
                      <th className="py-1 pr-2">ID do arquivo</th>
                      <th className="py-1">Chave (base64)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aesEntries.map(([fileId, key]) => (
                      <tr key={fileId} className="border-b border-[var(--surface-secondary)]/40">
                        <td className="py-1 pr-2 font-mono text-[11px] break-all">
                          {fileId}
                        </td>
                        <td className="py-1 font-mono text-[11px] break-all text-gray-300">
                          {key}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {status && (
        <p className="text-sm text-red-400 mt-2">
          {status}
        </p>
      )}

      {/* Modal de senha para carregar o keystore */}
      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)}>
        <h2 className="text-lg mb-3">Informe sua senha</h2>

        <input
          type="password"
          className="w-full neon-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLoadKeys();
            }
          }}
        />

        <div className="flex gap-2 mt-4">
          <Button onClick={() => setPasswordModalOpen(false)} className="gray-btn">
            Cancelar
          </Button>
          <Button
            onClick={handleLoadKeys}
            className="neon-btn"
          >
            {loadingKeys ? "Carregando..." : "Confirmar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

