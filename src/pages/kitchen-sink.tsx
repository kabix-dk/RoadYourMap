import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export default function KitchenSink() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      <h1 className="text-4xl font-bold mb-8">Kitchen Sink</h1>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="lg">Large Button</Button>
          <Button>Default Size</Button>
          <Button size="sm">Small Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Button</Button>
          <Button>
            <Spinner className="mr-2 h-4 w-4" />
            Loading
          </Button>
        </div>
      </section>

      {/* Input Fields Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input Fields</h2>
        <div className="grid gap-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="default-input">Default Input</Label>
            <Input id="default-input" placeholder="Enter some text..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-input">Disabled Input</Label>
            <Input id="disabled-input" disabled placeholder="Disabled input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="with-icon">Input with Icon</Label>
            <div className="relative">
              <Input id="with-icon" placeholder="Search..." />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Textarea Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Textarea</h2>
        <div className="grid gap-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="default-textarea">Default Textarea</Label>
            <Textarea id="default-textarea" placeholder="Enter your message..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-textarea">Disabled Textarea</Label>
            <Textarea id="disabled-textarea" disabled placeholder="Disabled textarea" />
          </div>
        </div>
      </section>

      {/* Spinner Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Spinners</h2>
        <div className="flex gap-4 items-center">
          <Spinner className="h-4 w-4" />
          <Spinner className="h-6 w-6" />
          <Spinner className="h-8 w-8" />
        </div>
      </section>
    </div>
  );
}
