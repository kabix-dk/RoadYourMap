import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/utils";

// Przykładowy komponent do testowania
const ExampleComponent = ({ title }: { title: string }) => {
  return <h1>{title}</h1>;
};

describe("ExampleComponent", () => {
  it("should render the title", () => {
    render(<ExampleComponent title="Test Title" />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { container } = render(<ExampleComponent title="Snapshot Test" />);

    expect(container.firstChild).toMatchInlineSnapshot(`
      <h1>
        Snapshot Test
      </h1>
    `);
  });
});
