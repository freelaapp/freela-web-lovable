import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import EsqueciMinhaSenha from "../EsqueciMinhaSenha";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
    toasts: [],
  }),
}));

vi.mock("@/lib/api", () => ({
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
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

  it("deve renderizar o formulário de email corretamente", () => {
    renderWithProviders(<EsqueciMinhaSenha />);

    expect(screen.getByRole("heading", { name: /esqueceu sua senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar código/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para login/i })).toBeInTheDocument();
  });

  it("deve mostrar erro para email vazio", async () => {
    renderWithProviders(<EsqueciMinhaSenha />);

    fireEvent.click(screen.getByRole("button", { name: /enviar código/i }));

    await waitFor(() => {
      expect(screen.getByText(/não parece válido/i)).toBeInTheDocument();
    });
  });

  it("deve avançar para etapa de código após envio bem-sucedido", async () => {
    const { forgotPassword } = await import("@/lib/api");
    vi.mocked(forgotPassword).mockResolvedValue({ success: true, message: "OK" });

    renderWithProviders(<EsqueciMinhaSenha />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar código/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /digite o código/i })).toBeInTheDocument();
    });
  });

  it("deve exibir erro quando a API de forgotPassword falhar", async () => {
    const { forgotPassword } = await import("@/lib/api");
    vi.mocked(forgotPassword).mockRejectedValue(new Error("Erro de rede"));

    renderWithProviders(<EsqueciMinhaSenha />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar código/i }));

    await waitFor(() => {
      expect(screen.getByText(/erro de rede/i)).toBeInTheDocument();
    });
  });
});
