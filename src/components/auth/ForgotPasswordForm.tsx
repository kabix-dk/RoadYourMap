import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../../lib/auth/validation";

interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const validationResult = forgotPasswordSchema.safeParse(formData);

    if (!validationResult.success) {
      const newErrors: ForgotPasswordFormErrors = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0] === "email") {
          newErrors.email = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error?.message || "Wystąpił błąd podczas wysyłania emaila",
        });
        return;
      }

      // Redirect to home page after successful email send
      window.location.href = "/";
    } catch {
      setErrors({
        general: "Wystąpił błąd podczas wysyłania emaila. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });

    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Zapomniałeś hasła?</h2>
        <p className="text-muted-foreground">Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Wysyłanie...
            </>
          ) : (
            "Wyślij link resetujący"
          )}
        </Button>
      </form>

      <div className="text-center">
        <a href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Powrót do logowania
        </a>
      </div>
    </div>
  );
}
