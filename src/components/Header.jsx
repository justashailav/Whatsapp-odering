const Header = () => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-gradient-to-r from-orange-50 via-white to-orange-50 border-b border-orange-100 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand */}
        <div className="leading-tight">
          <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
            Cloud Kitchen
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Fresh • Fast • WhatsApp Orders
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          Accepting Orders
        </div>

      </div>
    </header>
  );
};

export default Header;
