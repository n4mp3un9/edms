"use client";

import Link from "next/link";
import UserNavbar from "../components/UserNavbar";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

function ShareToDropdown({
  value,
  onChange,
  required,
}: {
  value: "private" | "team" | "public";
  onChange: (value: "private" | "team" | "public") => void;
  required?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const el = wrapperRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const labelMap: Record<"private" | "team" | "public", string> = {
    private: "แชร์ส่วนตัว",
    team: "แชร์ภายในหน่วยงาน",
    public: "แชร์ทั้งองค์กร",
  };

  const options: { value: "private" | "team" | "public"; label: string }[] = [
    { value: "private", label: "แชร์ส่วนตัว" },
    { value: "team", label: "แชร์ภายในหน่วยงาน" },
    { value: "public", label: "แชร์ทั้งองค์กร" },
  ];

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name="shareTo" value={value} />

      <button
        type="button"
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition ${
          open
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-slate-200 hover:border-slate-300"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-900">
          {labelMap[value]}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="py-2">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`flex w-full items-center justify-start px-4 py-3 text-left text-[13px] font-medium transition ${
                    isSelected
                      ? "bg-blue-50 text-slate-900"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {required ? (
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value={value}
          onChange={() => void 0}
        />
      ) : null}
    </div>
  );
}

function DocumentUploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [currentDateTimeThai, setCurrentDateTimeThai] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shareTo, setShareTo] = useState<"private" | "team" | "public">("private");
  const [resolvedDepartment, setResolvedDepartment] = useState<string | null>(null);
  const [loadingDept, setLoadingDept] = useState(false);
  const [deptError, setDeptError] = useState<string | null>(null);

  function getLocalDateString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getThaiDateTimeString() {
    const now = new Date();
    const base = now.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Bangkok",
    });
    return `${base} น.`;
  }

  useEffect(() => {
    const localDate = getLocalDateString();
    setCurrentDateTime(localDate);
    setCurrentDateTimeThai(getThaiDateTimeString());
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!email) {
      setResolvedDepartment(null);
      setDeptError(null);
      return;
    }

    let cancelled = false;
    setLoadingDept(true);
    setDeptError(null);

    fetch(`/api/hr/department?email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) setResolvedDepartment(null);
            return;
          }
          throw new Error("Failed to load department for upload");
        }
        const data: { departmentName: string | null; departmentNameEn: string | null; departmentCode: string | null } =
          await res.json();
        if (!cancelled) {
          setResolvedDepartment(
            data.departmentName ?? data.departmentNameEn ?? data.departmentCode ?? null
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setDeptError("ไม่สามารถดึงข้อมูลฝ่ายจากระบบพนักงานได้");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDept(false);
      });

    return () => {
      cancelled = true;
    };
  }, [email]);

  function isAllowedFile(file: File) {
    const allowed = ["pdf", "docx", "jpg", "jpeg", "png"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    return !!ext && allowed.includes(ext);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (email) {
      formData.set("email", email);
    }

    if (resolvedDepartment) {
      formData.set("department", resolvedDepartment);
    }

    const shareToValue = (formData.get("shareTo") as string | null) ?? "";
    if (!shareToValue) {
      setIsSuccess(false);
      setMessage("กรุณาเลือกระดับการแชร์เอกสาร");
      return;
    }

    if (selectedFiles.length === 0) {
      setIsSuccess(false);
      setMessage("กรุณาเลือกไฟล์เอกสารอย่างน้อย 1 ไฟล์ก่อนอัปโหลด");
      return;
    }

    const createdAt = formData.get("createdAt");
    if (!createdAt) {
      const localDate = getLocalDateString();
      formData.set("createdAt", localDate);
    }

    formData.delete("file");
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    setIsUploading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setIsSuccess(true);
      setMessage("อัปโหลดเอกสารเรียบร้อยแล้ว!");
      form.reset();
      setSelectedFiles([]);
      setShowSuccessModal(true);
    } catch (err) {
      setIsSuccess(false);
      setMessage("ไม่สามารถอัปโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <UserNavbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 pb-16">
        <section className="rounded-2xl border border-indigo-100 bg-white px-8 py-6 text-xs shadow-sm md:px-10 md:py-8">
          <h1 className="mb-4 flex items-center gap-2 text-lg font-semibold text-rose-700">
            <span className="text-rose-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 align-middle"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                <path d="M14 2v6h6" />
              </svg>
            </span>
            <span>อัปโหลดเอกสารใหม่</span>
          </h1>

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="mb-1 block text-[11px] font-medium text-slate-800">
                เลือกไฟล์เอกสาร *
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-400 bg-white px-4 py-10 text-center text-slate-500">
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="M8 7l4-4 4 4" />
                    <rect x="4" y="15" width="16" height="4" rx="1" />
                  </svg>
                </span>
                <span className="mb-1 text-xs font-medium text-slate-800">
                  คลิกเพื่อเลือกไฟล์
                </span>
                <span className="text-[11px] text-slate-500">
                  รองรับไฟล์ : PDF, DOCX, JPG, PNG
                </span>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length === 0) return;

                    const allowedFiles: File[] = [];
                    let hasInvalid = false;

                    for (const file of files) {
                      if (isAllowedFile(file)) {
                        allowedFiles.push(file);
                      } else {
                        hasInvalid = true;
                      }
                    }

                    if (hasInvalid) {
                      setIsSuccess(false);
                      setMessage("บางไฟล์ไม่รองรับ สามารถเลือกได้เฉพาะไฟล์ PDF, DOCX, JPG, PNG เท่านั้น");
                    }

                    if (allowedFiles.length === 0) {
                      e.target.value = "";
                      return;
                    }

                    setSelectedFiles((prev) => [...prev, ...allowedFiles]);
                    e.target.value = "";
                  }}
                />
              </label>
              {selectedFiles.length > 0 && (
                <div className="mt-2 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-700">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-800">
                        ไฟล์ที่เลือกทั้งหมด ({selectedFiles.length} ไฟล์)
                      </div>
                      <p className="text-[10px] text-slate-500">
                        คุณสามารถลบไฟล์ที่ไม่ต้องการออกทีละไฟล์ก่อนอัปโหลดได้
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100"
                      onClick={() => setSelectedFiles([])}
                    >
                      ลบทั้งหมด
                    </button>
                  </div>
                  <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                    {selectedFiles.map((file, index) => {
                      const sizeKb = Math.max(1, Math.round(file.size / 1024));
                      const ext = file.name.split(".").pop()?.toLowerCase() || "";
                      const isImage = ["jpg", "jpeg", "png"].includes(ext);

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-1.5 shadow-sm"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-700">
                              {isImage ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="M21 15l-5-5L5 21" />
                                </svg>
                              ) : ext === "pdf" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                                  <path d="M14 2v6h6" />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M4 4h16v16H4z" />
                                  <path d="M4 9h16" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-medium text-slate-800">
                                {file.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {ext ? ext.toUpperCase() : ""}
                                {ext && " · "}
                                {sizeKb.toLocaleString()} KB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] text-slate-700 hover:bg-slate-300"
                            onClick={() => {
                              setSelectedFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6 6 18" />
                              <path d="M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-800">
                  ชื่อเอกสาร *
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="กรอกชื่อเอกสาร"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div className="space-y-1">
                {resolvedDepartment ? (
                  <>
                    <label className="text-[11px] font-medium text-slate-800">
                      ฝ่าย/สถาบัน *
                    </label>
                    <input
                      key="resolved-department"
                      name="department"
                      value={resolvedDepartment}
                      readOnly
                      placeholder="ฝ่ายจะถูกดึงจากระบบพนักงานอัตโนมัติ"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
                      autoComplete="off"
                      required
                    />
                  </>
                ) : (
                  <>
                    <label className="text-[11px] font-medium text-slate-800">
                      ฝ่าย/สถาบัน *
                    </label>
                    <input
                      name="department"
                      type="text"
                      placeholder="กรอกฝ่าย/สถาบัน"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      autoComplete="off"
                      required
                    />
                  </>
                )}
                {email && (
                  <p className="mt-1 text-[10px] text-slate-500">
                    {loadingDept
                      ? "กำลังดึงข้อมูลฝ่ายจากระบบพนักงาน..."
                      : resolvedDepartment
                      ? "กำหนดฝ่ายอัตโนมัติตามข้อมูลจากระบบพนักงาน"
                      : deptError ||
                        "หากไม่พบข้อมูลจากระบบพนักงาน กรุณาเลือกฝ่ายด้วยตนเอง"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-800">
                  แท็ก *
                </label>
                <input
                  name="tags"
                  type="text"
                  placeholder="เช่น : สำคัญ , ด่วน"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-800">
                  วันที่เพิ่ม *
                </label>
                <input
                  name="createdAt"
                  type="text"
                  value={currentDateTimeThai}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 shadow-sm outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  ระบบจะตั้งเป็นวันเวลาปัจจุบันให้อัตโนมัติเมื่ออัปโหลด
                </p>
              </div>
            </div>

            {/* Share */}
            <div className="mt-3 space-y-1">
              <label className="flex items-center gap-2 text-[11px] font-medium text-slate-800">
                <span className="text-slate-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="inline-block h-4 w-4 align-middle"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="7" r="3" />
                    <circle cx="17" cy="7" r="3" />
                    <path d="M2 21v-1a4 4 0 0 1 4-4h6" />
                    <path d="M22 21v-1a4 4 0 0 0-4-4h-3" />
                  </svg>
                </span>
                <span>แชร์เอกสาร (กำหนดสิทธิ์การเข้าถึง) *</span>
              </label>
              <ShareToDropdown
                value={shareTo}
                onChange={(next) => setShareTo(next)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-800">
                คำอธิบาย *
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="กรอกรายละเอียดเพิ่มเติมเกี่ยวกับเอกสาร"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            {message && !isSuccess && (
              <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4">
                <div
                  className={`flex max-w-md items-center gap-2 rounded-full border px-4 py-2 text-[11px] shadow-lg ${
                    isSuccess
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/70">
                    {isSuccess ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-3 w-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-3 w-3 text-rose-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </span>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
                <div className="flex max-w-md items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-[11px] text-white shadow-lg">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v12" />
                      <path d="M8 7l4-4 4 4" />
                      <rect x="4" y="15" width="16" height="4" rx="1" />
                    </svg>
                  </span>
                  <span>กำลังอัปโหลดเอกสาร โปรดรอสักครู่...</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-center gap-4 text-[11px] font-medium">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setShowConfirmUpload(true)}
                className="group flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-2.5 text-white shadow transition-transform duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 text-[11px] transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="M8 7l4-4 4 4" />
                    <rect x="4" y="15" width="16" height="4" rx="1" />
                  </svg>
                </span>
                <span className="tracking-wide">
                  {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดเอกสาร"}
                </span>
              </button>
              <button
                type="button"
                className="group flex items-center gap-2 rounded-full bg-rose-600 px-7 py-2.5 text-white shadow transition-transform duration-150 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-lg"
                onClick={() => {
                  setShowConfirmCancel(true);
                }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-600 text-[11px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </span>
                <span className="tracking-wide">ยกเลิก</span>
              </button>
            </div>
          </form>
        </section>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white px-8 py-7 text-sm text-slate-800 shadow-2xl">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span>อัปโหลดเอกสารเรียบร้อยแล้ว</span>
            </h2>
            <p className="mb-7 text-[13px] text-slate-600">
              คุณต้องการไปที่หน้ารวมเอกสารเพื่อดูรายการทั้งหมดหรือไม่?
            </p>
            <div className="flex justify-end gap-3 text-[13px]">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="group flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-2 font-medium text-slate-700 shadow-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </span>
                <span className="whitespace-nowrap">ปิดหน้าต่างนี้</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  const params = new URLSearchParams();
                  if (email) params.set("email", email);
                  if (resolvedDepartment)
                    params.set("department", resolvedDepartment);
                  if (token) params.set("token", token);
                  const query = params.toString();
                  router.push(query ? `/search?${query}` : "/search");
                }}
                className="group flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-2 font-semibold text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
                <span className="whitespace-nowrap">ไปที่หน้ารวมเอกสาร</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm upload modal */}
      {showConfirmUpload && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-7 text-sm text-slate-800 shadow-2xl">
            <h2 className="mb-2 flex items-center gap-3 text-base font-semibold text-indigo-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12.5 11 14.5 15 10.5" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <span>ยืนยันการอัปโหลดเอกสาร</span>
            </h2>
            <p className="mb-7 text-[13px] text-slate-600">
              คุณต้องการอัปโหลดเอกสารที่เลือกไว้ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-3 text-[13px]">
              <button
                type="button"
                onClick={() => setShowConfirmUpload(false)}
                className="group flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-2 font-medium text-slate-700 shadow-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </span>
                <span>ยกเลิก</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmUpload(false);
                  const formEl = document.getElementById("upload-form") as HTMLFormElement | null;
                  formEl?.requestSubmit();
                }}
                className="group flex items-center gap-2 rounded-full bg-indigo-700 px-7 py-2 font-semibold text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-indigo-700 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="M8 7l4-4 4 4" />
                    <rect x="4" y="15" width="16" height="4" rx="1" />
                  </svg>
                </span>
                <span>ยืนยันการอัปโหลด</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm cancel upload modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-6 text-sm text-slate-800 shadow-2xl">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-rose-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </span>
              <span>ยืนยันการยกเลิกการอัปโหลด</span>
            </h2>
            <p className="mb-6 text-[13px] text-slate-600">
              คุณต้องการยกเลิกการอัปโหลดเอกสารนี้ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-3 text-[13px]">
              <button
                type="button"
                onClick={() => setShowConfirmCancel(false)}
                className="group flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-2 font-medium text-slate-700 shadow-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </span>
                <span>ยกเลิก</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmCancel(false);
                  const formEl = document.getElementById("upload-form") as HTMLFormElement | null;
                  if (formEl) {
                    formEl.reset();
                  }
                  setSelectedFiles([]);
                  const localDate = getLocalDateString();
                  setCurrentDateTime(localDate);
                  setCurrentDateTimeThai(getThaiDateTimeString());
                }}
                className="group flex items-center gap-2 rounded-full bg-rose-600 px-7 py-2 font-semibold text-white shadow-md transition-transform duration-150 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-lg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-600 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <span>ยืนยันการยกเลิกการอัปโหลด</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-[11px] text-indigo-900">
        <div className="mx-auto flex w-full max-w-5xl items-center px-4">
          <div className="flex items-center">
            <img
              src="/fti-logo.png"
              alt="FTI"
              className="h-14 w-auto"
            />
          </div>
          <div className="mx-auto flex flex-col items-center text-center text-[11px] leading-snug text-slate-700">
            <span> 2025 จัดทำโดย ฝ่ายดิจิทัลและเทคโนโลยี สภาอุตสาหกรรมแห่งประเทศไทย</span>
            <span>จัดทำโดย นางสาวกัลยรักษ์ โรจนเลิศประเสริฐ</span>
            <span>นักศึกษาฝึกงาน มหาวิทยาลัยพะเยา</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function DocumentUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-xs text-slate-700">
          กำลังโหลดหน้าสำหรับอัปโหลดเอกสาร...
        </div>
      }
    >
      <DocumentUploadPageInner />
    </Suspense>
  );
}