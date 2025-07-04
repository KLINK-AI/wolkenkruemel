import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/components/LanguageProvider";

const loginSchema = z.object({
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  password: z.string().min(1, "Passwort erforderlich"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      // Store user in localStorage (simple auth state management)
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Trigger storage event to update navbar
      window.dispatchEvent(new Event('storage'));
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${user.displayName || user.username}!`,
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message || "Ungültige E-Mail oder Passwort",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bei Wolkenkrümel anmelden</CardTitle>
          <CardDescription>
            Melden Sie sich in Ihrem Konto an, um fortzufahren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail-Adresse</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="max@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ihr Passwort" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Anmeldung läuft..." : "Anmelden"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Noch kein Konto?{" "}
              <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
                Hier registrieren
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}