import { Button, Input, Label } from "@repo/ui/";

export const RegisterForm = () => {
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          className="w-full p-2 rounded-md 

          "
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          className="w-full p-2 rounded-md"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full p-2 rounded-md"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="w-full p-2 rounded-md"
        />
      </div>
      <Button className="w-full py-2 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
        Create Account
      </Button>
    </div>
  );
};
