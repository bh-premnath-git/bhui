import XplorePanel from "./components/Xplore/XplorePanel";

export function Xplorer() {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 overflow-hidden">
        <XplorePanel showSidebar={false} />
      </main>
    </div>
  );
}
