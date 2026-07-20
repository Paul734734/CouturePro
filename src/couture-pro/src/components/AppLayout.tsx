import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>CouturePro</h1>
      </header>
      <main className="app-main">
        {children}
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 CouturePro</p>
      </footer>
    </div>
  );
}
