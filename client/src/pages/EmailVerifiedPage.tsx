import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, XCircle } from "lucide-react";
import { useSearchParams } from "@/hooks/useSearchParams";

export default function EmailVerifiedPage() {
  const params = useSearchParams();
  const success = params.get('success');
  const error = params.get('error');

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              Bestätigung fehlgeschlagen
            </CardTitle>
            <CardDescription>
              Der Bestätigungslink ist ungültig oder abgelaufen. Bitte versuchen Sie sich anzumelden oder registrieren Sie sich erneut.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full">
                Zur Anmeldung
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">
                Neu registrieren
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
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            E-Mail erfolgreich bestätigt!
          </CardTitle>
          <CardDescription>
            Ihr Konto wurde aktiviert. Sie können sich jetzt anmelden und alle Funktionen von Wolkenkrümel nutzen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/login">
            <Button className="w-full">
              Jetzt anmelden
            </Button>
          </Link>
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