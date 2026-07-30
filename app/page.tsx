"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "@/lib/format";
import type { MemberStatus, Status } from "@/lib/kv";

const STORAGE_KEY = "papan-status-tim:member-id";
const POLL_INTERVAL_MS = 5000;
const TASK_MAX_LENGTH = 60;

const STATUS_LABELS: Record<Status, string> = {
  belum_mulai: "Belum Mulai",
  dikerjakan: "Dikerjakan",
  selesai: "Selesai",
};

const STATUS_ORDER: Status[] = ["belum_mulai", "dikerjakan", "selesai"];

export default function Page() {
  const [members, setMembers] = useState<MemberStatus[] | null>(null);
  const [myId, setMyId] = useState<string | null | undefined>(undefined);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [draftStatus, setDraftStatus] = useState<Status>("belum_mulai");
  const [draftTask, setDraftTask] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );

  const hasLoadedDraftForId = useRef<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setMyId(stored);
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (!res.ok) throw new Error("gagal memuat");
      const data = await res.json();
      setMembers(data.members);
      setLastFetched(new Date());
      setLoadError(false);
    } catch {
      // Data lama (jika ada) tetap tampil; coba lagi otomatis di polling berikutnya.
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadStatus]);

  // Isi form edit dengan data terbaru milik saya, hanya sekali per pergantian orang
  // (supaya tidak menimpa ketikan yang sedang berlangsung saat polling berjalan).
  useEffect(() => {
    if (!myId || !members) return;
    if (hasLoadedDraftForId.current === myId) return;
    const mine = members.find((m) => m.id === myId);
    if (mine) {
      setDraftStatus(mine.status);
      setDraftTask(mine.task);
      hasLoadedDraftForId.current = myId;
    }
  }, [myId, members]);

  function choosePerson(id: string) {
    window.localStorage.setItem(STORAGE_KEY, id);
    setMyId(id);
    hasLoadedDraftForId.current = null;
  }

  function gantiOrang() {
    window.localStorage.removeItem(STORAGE_KEY);
    setMyId(null);
    setSaveMessage(null);
  }

  async function saveChanges(nextStatus: Status, nextTask: string) {
    if (!myId) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: myId, status: nextStatus, task: nextTask }),
      });
      if (!res.ok) throw new Error("gagal");
      setDraftStatus(nextStatus);
      setDraftTask(nextTask);
      setSaveMessage({ type: "ok", text: "Tersimpan." });
      await loadStatus();
    } catch {
      setSaveMessage({ type: "error", text: "Gagal menyimpan. Coba lagi." });
    } finally {
      setSaving(false);
    }
  }

  const isLoadingInitial = members === null || myId === undefined;

  if (isLoadingInitial) {
    return (
      <div className="page">
        <p className="loading-text">
          {loadError
            ? "Tidak bisa memuat data. Memeriksa koneksi ke server…"
            : "Memuat papan status…"}
        </p>
      </div>
    );
  }

  const knownIds = members.map((m) => m.id);
  const needsPicker = !myId || !knownIds.includes(myId);

  if (needsPicker) {
    return (
      <div className="picker-overlay">
        <div className="picker-box">
          <h1 className="picker-title">Siapa Anda?</h1>
          <p className="picker-subtitle">Pilih nama Anda dari daftar di bawah.</p>
          <div className="picker-list">
            {members.map((m) => (
              <button key={m.id} className="picker-item" onClick={() => choosePerson(m.id)}>
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <h1 className="title">Papan Status Tim</h1>
        <button className="refresh-btn" onClick={loadStatus}>
          Perbarui
        </button>
      </div>
      {lastFetched && (
        <p className="updated-note">
          Data terakhir dimuat: {lastFetched.toLocaleTimeString("id-ID")}
        </p>
      )}

      <div className="card-list">
        {members.map((member) => {
          const isMe = member.id === myId;
          return (
            <div key={member.id} className={`card${isMe ? " is-me" : ""}`}>
              <div className="card-name-row">
                <p className="card-name">{member.name}</p>
                {isMe && <span className="me-tag">Ini saya</span>}
              </div>

              <span className={`status-badge status-${member.status}`}>
                {STATUS_LABELS[member.status]}
              </span>

              {member.task ? (
                <p className="card-task">{member.task}</p>
              ) : (
                <p className="card-task empty">Belum ada tugas ditulis</p>
              )}

              <p className="card-time">{formatRelativeTime(member.updatedAt)}</p>

              {isMe && (
                <div className="edit-section">
                  <div className="status-buttons">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        className={`status-btn status-${s}${draftStatus === s ? " active" : ""}`}
                        disabled={saving}
                        onClick={() => saveChanges(s, draftTask)}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  <form
                    className="task-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveChanges(draftStatus, draftTask);
                    }}
                  >
                    <label className="task-label" htmlFor="task-input">
                      Tugas singkat saya sekarang
                    </label>
                    <input
                      id="task-input"
                      className="task-input"
                      type="text"
                      maxLength={TASK_MAX_LENGTH}
                      placeholder="Contoh: Desain banner klien X"
                      value={draftTask}
                      onChange={(e) => setDraftTask(e.target.value)}
                    />
                    <p className="char-count">
                      {draftTask.length}/{TASK_MAX_LENGTH}
                    </p>
                    <button className="save-btn" type="submit" disabled={saving}>
                      {saving ? "Menyimpan…" : "Simpan"}
                    </button>
                    {saveMessage && (
                      <p className={`save-hint ${saveMessage.type}`}>{saveMessage.text}</p>
                    )}
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="footer">
        <button className="link-btn" onClick={gantiOrang}>
          Bukan saya? Ganti nama
        </button>
      </div>
    </div>
  );
}
