import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.nome, // Salva o nome nos metadados do usuário
          },
        },
      });

      if (error) throw error;

      if (data) {
        toast.success("Conta criada com sucesso! Você já pode entrar.");
        navigate("/login");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md glass rounded-2xl p-8 animate-slide-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Crie sua Conta</h1>
            <p className="text-muted-foreground">Comece a gerenciar seus clientes hoje</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <input
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-input border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Seu nome ou da empresa"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-input border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-input border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="******"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Senha</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl bg-input border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="******"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold hover:shadow-primary transition-all flex items-center justify-center gap-2 group hover-lift mt-6"
            >
              {loading ? (
                "Criando conta..."
              ) : (
                <>
                  Criar Conta
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cadastro;