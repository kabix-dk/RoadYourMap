import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Nieprawidłowy format email";
    }

    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (formData.password.length < 6) {
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są identyczne";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error?.message || "Wystąpił błąd podczas rejestracji",
        });
        return;
      }

      // Redirect to dashboard on successful registration
      window.location.href = "/dashboard";
    } catch {
      setErrors({
        general: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Wyczyść błąd dla tego pola
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
        <h2 className="text-2xl font-bold text-white">Utwórz konto</h2>
        <p className="text-blue-200">Wprowadź swoje dane, aby założyć nowe konto</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm text-red-200 bg-red-900/20 border border-red-500/30 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            value={formData.email}
            onChange={handleInputChange("email")}
            disabled={isLoading}
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && <p className="text-sm text-red-300">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Hasło
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Wprowadź hasło"
            value={formData.password}
            onChange={handleInputChange("password")}
            disabled={isLoading}
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && <p className="text-sm text-red-300">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Potwierdź hasło
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Potwierdź hasło"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            disabled={isLoading}
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
          />
          {errors.confirmPassword && <p className="text-sm text-red-300">{errors.confirmPassword}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Rejestracja...
            </>
          ) : (
            "Utwórz konto"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-blue-200">
          Masz już konto?{" "}
          <a href="/auth/login" className="text-white hover:underline font-medium">
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
  );
}
