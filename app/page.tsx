import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="bg-indigo-800 text-white shadow">
        <div className="flex h-14 w-full items-stretch pl-0 pr-2 sm:pl-0 sm:pr-4">
          {/* โลโก้พื้นขาว + มุมเฉียง แบบเดียวกับหน้า Edit */}
          <div className="flex items-stretch">
            <div className="flex items-center bg-white px-3 sm:px-6">
              <Link href="/" className="flex items-center gap-2 text-indigo-800">
                <img src="/fti-logo.png" alt="EDMS" className="h-7 w-auto sm:h-8" />
                <span className="text-base font-semibold tracking-wide sm:text-lg">EDMS</span>
              </Link>
            </div>
            <div className="header-logo-notch h-full w-12 bg-white sm:w-16" />
          </div>

          {/* เมนูพื้นน้ำเงิน: desktop เหมือนเดิม, มือถือลด padding/font-size นิดหน่อยให้พอดีจอ */}
          <nav className="ml-auto flex items-center gap-1 px-2 text-[10px] font-medium sm:gap-2 sm:px-8 sm:text-xs">
            <span className="rounded-full bg-white px-3 py-1.5 text-indigo-800 shadow-sm sm:px-4">
              Home
            </span>
            <Link
              href="/document"
              className="rounded-full border border-white/60 bg-white/10 px-3 py-1.5 text-white transition hover:bg-white hover:text-indigo-800 sm:px-4"
            >
              Document
            </Link>
            <Link
              href="/search"
              className="rounded-full border border-white/60 bg-white/10 px-3 py-1.5 text-white transition hover:bg-white hover:text-indigo-800 sm:px-4"
            >
              Search
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-8 pb-16">
        <section className="w-full max-w-3xl rounded-2xl border border-indigo-100 bg-white px-8 py-8 text-center shadow-sm">
          <div className="mb-6 space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900">
              ระบบบริหารจัดการเอกสารอิเล็กทรอนิกส์ภายในองค์กร
            </h1>
            <p className="text-sm text-slate-600">
              แพลตฟอร์มเพื่อใช้จัดเก็บ ค้นหา และแชร์เอกสารอย่างเป็นระบบ
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link
              href="/document"
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-2.5 text-white shadow hover:bg-emerald-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="M8 11l4 4 4-4" />
                  <rect x="4" y="15" width="16" height="4" rx="1" />
                </svg>
              </span>
              <span className="text-[13px]">อัปโหลดเอกสารใหม่</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-full bg-indigo-700 px-8 py-2.5 text-white shadow hover:bg-indigo-800"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="5" />
                  <path d="m16 16 4 4" />
                </svg>
              </span>
              <span className="text-[13px]">ค้นหา / เอกสารทั้งหมด</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-full bg-slate-700 px-8 py-2.5 text-white shadow hover:bg-slate-800"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 20h4l10-10-4-4L4 16v4z" />
                  <path d="M14 6l4 4" />
                </svg>
              </span>
              <span className="text-[13px]">แก้ไขเอกสาร</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-[11px] text-indigo-900">
        <div className="mx-auto flex w-full max-w-5xl items-center px-4">
          {/* โลโก้ใหญ่ ซ้ายสุด */}
          <div className="flex items-center">
            <img
              src="/fti-logo.png"
              alt="FTI"
              className="h-14 w-auto"
            />
          </div>

          {/* ข้อความลิขสิทธิ์ อยู่กึ่งกลางแถบ */}
          <div className="mx-auto flex flex-col items-center text-center text-[11px] leading-snug text-slate-700">
            <span>© 2025 จัดทำโดย ฝ่ายดิจิทัลและเทคโนโลยี สภาอุตสาหกรรมแห่งประเทศไทย</span>
            <span>จัดทำโดย นางสาวกัลยรักษ์ โรจนเลิศประเสริฐ</span>
            <span>นักศึกษาฝึกงาน มหาวิทยาลัยพะเยา</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
