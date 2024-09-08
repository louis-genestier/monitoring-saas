import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

const Logo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="4" fill="#6366F1" />
    <path d="M7 7H17V17H7V7Z" fill="white" />
  </svg>
);

export function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [contentHeight, setContentHeight] = useState("auto");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(`${contentRef.current.scrollHeight}px`);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    const observer = new MutationObserver(updateHeight);
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 flex items-center justify-center p-4 w-screen">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-6 sm:p-8">
            <Logo />
            <h2 className="text-3xl font-bold mt-6 mb-2">Welcome</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to your account or create a new one.
            </p>
            <TabsList className="grid w-full grid-cols-2 mb-1 bg-gray-100 p-1 rounded-lg h-14">
              <TabsTrigger
                value="login"
                className="text-lg py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-lg py-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
              >
                Register
              </TabsTrigger>
            </TabsList>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ height: contentHeight }}
            >
              <div ref={contentRef}>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
