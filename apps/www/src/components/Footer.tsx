export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} surasura
        </p>
      </div>
    </footer>
  );
}
