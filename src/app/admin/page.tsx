"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, Timestamp, deleteDoc, doc } from "firebase/firestore";
import {
  LogOut, Mail, Phone, Calendar, User, Loader2,
  MessageSquare, Trash2, RefreshCw, Users, TrendingUp, Clock
} from "lucide-react";

const T = {
  bg: "#08090a",
  surface: "#0f1012",
  surfaceAlt: "#141618",
  border: "rgba(255,255,255,0.06)",
  accent: "#00c46a",
  accentDim: "rgba(0,196,106,0.12)",
  white: "#f5f5f0",
  muted: "rgba(245,245,240,0.45)",
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};

interface ContactEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Timestamp | null;
}

function formatDate(ts: Timestamp | null) {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactEntry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login/");
  }, [user, authLoading, router]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactEntry)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchContacts(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact entry?")) return;
    setDeleting(id);
    await deleteDoc(doc(db, "contacts", id));
    setContacts(c => c.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  };

  const handleLogout = async () => { await logout(); router.replace("/login/"); };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color={T.accent} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform:rotate(0) } to { transform:rotate(360deg) } }`}</style>
      </div>
    );
  }

  const today = contacts.filter(c => {
    if (!c.createdAt) return false;
    const d = c.createdAt.toDate();
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin { from { transform:rotate(0) } to { transform:rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,196,106,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.body, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: `linear-gradient(135deg, ${T.accent}, #00a857)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.display, fontWeight: 700, color: "#000", fontSize: "0.9rem" }}>P</div>
            <div>
              <div style={{ fontFamily: T.display, fontSize: "1.1rem", fontWeight: 600, color: T.white, lineHeight: 1.2 }}>Admin Panel</div>
              <div style={{ fontSize: "0.7rem", color: T.muted }}>Pune Global Group</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", color: T.muted }}>{user.email}</div>
            <button onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "0.45rem 0.85rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.8rem", color: T.muted, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,38,38,0.4)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
            ><LogOut size={13} /> Sign out</button>
          </div>
        </header>

        <div style={{ flex: 1, padding: "2rem", maxWidth: 1300, margin: "0 auto", width: "100%" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { icon: Users, label: "Total Enquiries", value: contacts.length, color: T.accent },
              { icon: Clock, label: "Today", value: today, color: "#60a5fa" },
              { icon: TrendingUp, label: "This Week", value: contacts.filter(c => { if (!c.createdAt) return false; const d = c.createdAt.toDate(); return (Date.now() - d.getTime()) < 7 * 86400000; }).length, color: "#a78bfa" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <Icon size={15} color={color} />
                  <span style={{ fontSize: "0.75rem", color: T.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
                </div>
                <div style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: T.white }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: "1.5rem", alignItems: "start" }}>
            {/* Table card */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: T.display, fontSize: "1.25rem", fontWeight: 600, color: T.white }}>Contact Submissions</div>
                <button onClick={fetchContacts} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "0.4rem 0.8rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.8rem", color: T.muted }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                ><RefreshCw size={12} /> Refresh</button>
              </div>

              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem", gap: "0.75rem", color: T.muted }}>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: "0.875rem" }}>Loading submissions…</span>
                </div>
              ) : contacts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <MessageSquare size={36} color={T.muted} style={{ margin: "0 auto 1rem" }} />
                  <div style={{ color: T.muted, fontSize: "0.9rem" }}>No contact submissions yet.</div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {["Name", "Email", "Phone", "Date", "Actions"].map(h => (
                          <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.72rem", color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map(c => {
                        const isSelected = selected?.id === c.id;
                        return (
                          <tr key={c.id}
                            style={{ borderBottom: `1px solid ${T.border}`, background: isSelected ? T.accentDim : "transparent", cursor: "pointer", transition: "background 0.15s", animation: "fadeIn 0.3s ease" }}
                            onClick={() => setSelected(isSelected ? null : c)}
                            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = T.surfaceAlt; }}
                            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <td style={{ padding: "0.9rem 1.25rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: T.accent, fontWeight: 600, flexShrink: 0 }}>
                                  {c.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <span style={{ fontSize: "0.875rem", color: T.white, fontWeight: 500 }}>{c.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.85rem", color: T.muted }}>{c.email}</td>
                            <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.85rem", color: T.muted }}>{c.phone || "—"}</td>
                            <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.8rem", color: T.muted, whiteSpace: "nowrap" }}>{formatDate(c.createdAt)}</td>
                            <td style={{ padding: "0.9rem 1.25rem" }}>
                              <button onClick={ev => { ev.stopPropagation(); handleDelete(c.id); }}
                                disabled={deleting === c.id}
                                style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: "0.25rem", borderRadius: 4, display: "flex", opacity: deleting === c.id ? 0.5 : 1, transition: "color 0.2s" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                                onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
                              >
                                {deleting === c.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.75rem", position: "sticky", top: 80, animation: "fadeIn 0.25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <div style={{ fontFamily: T.display, fontSize: "1.2rem", fontWeight: 600, color: T.white }}>Enquiry Detail</div>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "1.2rem" }}>×</button>
                </div>

                <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.display, fontSize: "1.5rem", color: T.accent, fontWeight: 700, marginBottom: "1rem" }}>
                  {selected.name?.[0]?.toUpperCase() ?? "?"}
                </div>

                <h3 style={{ fontFamily: T.display, fontSize: "1.4rem", color: T.white, fontWeight: 600, marginBottom: "1.25rem" }}>{selected.name}</h3>

                {[
                  { icon: Mail, label: "Email", value: selected.email },
                  { icon: Phone, label: "Phone", value: selected.phone || "Not provided" },
                  { icon: Calendar, label: "Submitted", value: formatDate(selected.createdAt) },
                  { icon: User, label: "Source", value: "Website Contact Form" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <Icon size={14} color={T.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.7rem", color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.15rem" }}>{label}</div>
                      <div style={{ fontSize: "0.875rem", color: T.white }}>{value}</div>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: "0.7rem", color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Message</div>
                  <p style={{ fontSize: "0.875rem", color: T.white, lineHeight: 1.75, fontWeight: 300 }}>{selected.message}</p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <a href={`mailto:${selected.email}`}
                    style={{ flex: 1, background: T.accent, color: "#000", border: "none", borderRadius: 8, padding: "0.7rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.85rem", fontWeight: 600, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    <Mail size={14} /> Reply
                  </a>
                  <button onClick={() => handleDelete(selected.id)}
                    style={{ flex: 1, background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "0.7rem", cursor: "pointer", fontFamily: T.body, fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
