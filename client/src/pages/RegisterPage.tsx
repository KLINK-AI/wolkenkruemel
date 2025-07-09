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
import { Link } from "wouter";
import { useLanguage } from "@/components/LanguageProvider";

const registerSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen haben").max(50, "Benutzername darf maximal 50 Zeichen haben"),
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  password: z.string()
    .min(8, "Passwort muss mindestens 8 Zeichen haben")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, "Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben und eine Zahl enthalten"),
  firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben").max(50, "Vorname darf maximal 50 Zeichen haben"),
  lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben").max(50, "Nachname darf maximal 50 Zeichen haben"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      // Map to backend format with displayName as username
      const registrationData = {
        ...data,
        displayName: data.username  // Use username as displayName
      };
      const response = await apiRequest("POST", "/api/register", registrationData);
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte prüfen Sie Ihre E-Mails und bestätigen Sie Ihre E-Mail-Adresse.",
      });
    },
    onError: (error: any) => {
      let errorMessage = error.message || "Ein Fehler ist aufgetreten";
      
      // Set specific field errors
      if (error.field === "email") {
        form.setError("email", { message: error.message });
        errorMessage = "Diese E-Mail-Adresse ist bereits registriert";
      } else if (error.field === "username") {
        form.setError("username", { message: error.message });
        errorMessage = "Dieser Benutzername ist bereits vergeben";
      } else if (error.field === "displayName") {
        form.setError("username", { message: error.message });
        errorMessage = "Dieser Benutzername ist bereits registriert";
      }
      
      toast({
        title: "Registrierung fehlgeschlagen",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              Registrierung erfolgreich!
            </CardTitle>
            <CardDescription>
              Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline" className="w-full">
                Zur Startseite
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bei Wolkenkrümel registrieren</CardTitle>
          <CardDescription>
            Erstellen Sie Ihr kostenloses Konto und werden Sie Teil der Community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname</FormLabel>
                    <FormControl>
                      <Input placeholder="Max" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benutzername</FormLabel>
                    <FormControl>
                      <Input placeholder="maxmustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input type="password" placeholder="Mindestens 8 Zeichen" {...field} />
                    </FormControl>
                    <div className="text-sm text-muted-foreground mt-1">
                      Passwort muss mindestens 8 Zeichen haben und einen Kleinbuchstaben, einen Großbuchstaben und eine Zahl enthalten
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registrierung läuft..." : "Registrieren"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bereits registriert?{" "}
              <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                Hier anmelden
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}