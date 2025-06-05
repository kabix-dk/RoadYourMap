import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../lib/auth/validation";

interface ResetPasswordFormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPasswordForm() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const validationResult = resetPasswordSchema.safeParse(formData);

    if (!validationResult.success) {
      const newErrors: ResetPasswordFormErrors = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ResetPasswordFormErrors;
        if (field in newErrors) {
          newErrors[field] = error.message;
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error?.message || "Wystąpił błąd podczas resetowania hasła",
        });
        return;
      }

      // Redirect to dashboard after successful password reset
      window.location.href = "/dashboard";
    } catch {
      setErrors({
        general: "Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ResetPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Ustaw nowe hasło</h2>
        <p className="text-muted-foreground">Wprowadź nowe hasło dla swojego konta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Nowe hasło</Label>
          <Input
            id="password"
            type="password"
            placeholder="Wprowadź nowe hasło (min. 6 znaków)"
            value={formData.password}
            onChange={handleInputChange("password")}
            disabled={isLoading}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Wprowadź hasło ponownie"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            disabled={isLoading}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Resetowanie...
            </>
          ) : (
            "Ustaw nowe hasło"
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
