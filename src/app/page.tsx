import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <div className="relative w-full">
      {/* Main Content Form */}
      <div className="relative z-10 py-8 sm:py-14 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <RegistrationForm />
      </div>
    </div>
  );
}
