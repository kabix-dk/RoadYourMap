import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { generateRoadmap, RoadmapError } from "@/lib/services/generation.service";
import { useState, useCallback } from "react";

// Zod schema for form validation
export const createRoadmapFormSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany.").max(255, "Tytuł może mieć maksymalnie 255 znaków."),
  experience_level: z
    .string()
    .min(1, "Poziom doświadczenia jest wymagany.")
    .max(50, "Poziom doświadczenia może mieć maksymalnie 50 znaków."),
  technology: z.string().min(1, "Technologia jest wymagana.").max(100, "Technologia może mieć maksymalnie 100 znaków."),
  goals: z.string().min(1, "Cele są wymagane."),
  additional_info: z.string().optional(),
});

type CreateRoadmapFormData = z.infer<typeof createRoadmapFormSchema>;

const InlineErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p className="text-sm text-red-300 mt-1" role="alert">
      {message}
    </p>
  );
};

export default function RoadmapCreationForm() {
  const [apiError, setApiError] = useState<string | null>(null);

  const navigate = useCallback((path: string) => {
    // Using window.location.assign instead of href for better type safety
    window.location.assign(path);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoadmapFormData>({
    resolver: zodResolver(createRoadmapFormSchema),
  });

  const onSubmit = async (data: CreateRoadmapFormData) => {
    try {
      setApiError(null);
      await generateRoadmap(data);
      navigate("/roadmaps/preview");
    } catch (error) {
      if (error instanceof RoadmapError) {
        setApiError(error.message);
        if (error.status === 401) {
          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else {
        setApiError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {apiError && (
        <div className="p-3 text-sm text-red-200 bg-red-900/20 border border-red-500/30 rounded-md" role="alert">
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">
          Tytuł Roadmapy
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Wprowadź tytuł roadmapy"
          aria-describedby={errors.title ? "title-error" : undefined}
          className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
            errors.title ? "border-red-500" : ""
          }`}
        />
        <InlineErrorMessage message={errors.title?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience_level" className="text-white">
          Poziom Doświadczenia
        </Label>
        <Input
          id="experience_level"
          {...register("experience_level")}
          placeholder="Np. Junior, Mid, Senior"
          aria-describedby={errors.experience_level ? "experience-level-error" : undefined}
          className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
            errors.experience_level ? "border-red-500" : ""
          }`}
        />
        <InlineErrorMessage message={errors.experience_level?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="technology" className="text-white">
          Technologia
        </Label>
        <Input
          id="technology"
          {...register("technology")}
          placeholder="Np. React, Python, Java"
          aria-describedby={errors.technology ? "technology-error" : undefined}
          className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
            errors.technology ? "border-red-500" : ""
          }`}
        />
        <InlineErrorMessage message={errors.technology?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals" className="text-white">
          Cele Nauki
        </Label>
        <Textarea
          id="goals"
          {...register("goals")}
          placeholder="Opisz swoje cele nauki"
          className={`min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
            errors.goals ? "border-red-500" : ""
          }`}
          aria-describedby={errors.goals ? "goals-error" : undefined}
        />
        <InlineErrorMessage message={errors.goals?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_info" className="text-white">
          Dodatkowe Informacje (opcjonalne)
        </Label>
        <Textarea
          id="additional_info"
          {...register("additional_info")}
          placeholder="Wprowadź dodatkowe informacje"
          className={`min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
            errors.additional_info ? "border-red-500" : ""
          }`}
          aria-describedby={errors.additional_info ? "additional-info-error" : undefined}
        />
        <InlineErrorMessage message={errors.additional_info?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full hover:cursor-pointer" aria-busy={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner className="mr-2" />
            Generowanie...
          </>
        ) : (
          "Generuj Roadmapę"
        )}
      </Button>
    </form>
  );
}
