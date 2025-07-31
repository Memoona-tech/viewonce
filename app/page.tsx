import AnonymousUploader from "./components/anonymousUploader";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center space-y-6 bg-pink-800">
      <AnonymousUploader />
    </div>
  );
}
