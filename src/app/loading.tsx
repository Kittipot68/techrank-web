export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
    );
}
