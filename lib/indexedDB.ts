export const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("EvidenceVault", 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("evidence")) {
        db.createObjectStore("evidence", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveEvidence = async (evidence: any) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("evidence", "readwrite");
    const store = tx.objectStore("evidence");
    const request = store.put(evidence);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getEvidenceByCaseId = async (caseId: string) => {
  const db = await initDB();
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction("evidence", "readonly");
    const store = tx.objectStore("evidence");
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result || [];
      resolve(all.filter(item => item.caseId === caseId));
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteEvidence = async (id: string) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("evidence", "readwrite");
    const store = tx.objectStore("evidence");
    const request = store.delete(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
