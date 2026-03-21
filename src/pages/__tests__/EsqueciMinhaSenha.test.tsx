import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import EsqueciMinhaSenha from "../EsqueciMinhaSenha";

// Mock dos hooks e APIs
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  forgotPassword: vi.fn(),
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: vi.fn(() => ({})),
    handleSubmit: vi.fn((fn) => fn),
    formState: { errors: {} },
    reset: vi.fn(),
    watch: vi.fn(() => ({})),
  }),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(() => (data: any) => ({ errors: {} })),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("EsqueciMinhaSenha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o formulário corretamente", () => {
    renderWithProviders(<EsqueciMinhaSenha />);

    expect(screen.getByRole("heading", { name: /esqueceu sua senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar instruções/i })).toBeInTheDocument();
    expect(screen.getByText(/voltar para login/i)).toBeInTheDocument();
  });

  it("deve mostrar o link 'Esqueci minha senha' na tela de login funciona", () => {
    renderWithProviders(<EsqueciMinhaSenha />);
    // Verificar que o link para login existe
    expect(screen.getByRole("link", { name: /voltar para login/i })).toHaveAttribute("href", "/login");
  });

  it("deve exibir mensagem de sucesso após envio bem-sucedido", async () => {
    const { forgotPassword } = await import("@/lib/api");
    vi.mocked(forgotPassword).mockResolvedValue({ success: true, message: "OK" });

    renderWithProviders(<EsqueciMinhaSenha />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /enviar instruções/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/verifique seu email/i)).toBeInTheDocument();
    });
  });

  it("deve exibir erro quando a API falhar", async () => {
    const { forgotPassword } = await import("@/lib/api");
    vi.mocked(forgotPassword).mockRejectedValue(new Error("Erro de rede"));

    const { toast } = await import("@/hooks/use-toast");
    const mockToast = vi.fn();
    vi.mocked(toast).mockReturnValue({ toast: mockToast } as any);

    renderWithProviders(<EsqueciMinhaSenha />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /enviar instruções/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao enviar email",
          variant: "destructive",
        })
      );
    });
  });
});
