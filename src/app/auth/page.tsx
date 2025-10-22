import Login from "@/components/auth/login";
import Register from "@/components/auth/register";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SocialAuth from "@/components/auth/social";

function AuthPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Login or create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="login">
                Login
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="register">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="pt-4">
              <Login />
            </TabsContent>

            <TabsContent value="register" className="pt-4">
              <Register />
            </TabsContent>
          </Tabs>
          <SocialAuth />
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthPage;
