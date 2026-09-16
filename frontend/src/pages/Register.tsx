import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../services/auth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
      });

      setSuccess(
        "Conta criada com sucesso! Redirecionando...",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Não foi possível criar sua conta.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    navigate("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-4 py-8">
      {/* =====================================================
          FORMAS DE FUNDO
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-24
          -bottom-30
          h-90
          w-90
          rounded-full
          bg-linear-to-br
          from-orange-500
          via-orange-400
          to-yellow-300
          opacity-90
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          top-35
          h-85
          w-85
          rounded-full
          bg-linear-to-br
          from-fuchsia-500
          via-pink-500
          to-red-500
          opacity-90
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          -top-17.5
          h-52.5
          w-52.5
          -translate-x-1/2
          rounded-full
          bg-linear-to-br
          from-purple-600
          to-fuchsia-500
          opacity-90
        "
      />

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div
          className="
            relative
            w-full
            max-w-5xl
            overflow-hidden
            rounded-4xl
            border
            border-white/70
            bg-white/55
            shadow-[0_35px_80px_rgba(0,0,0,0.20)]
            backdrop-blur-2xl
          "
        >
          {/* =================================================
              TEXTURA
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.12]
              mix-blend-overlay
            "
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.65'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative grid min-h-155 md:grid-cols-2">

            {/* =================================================
                LADO ESQUERDO
            ================================================= */}

            <section
              className="
                relative
                flex
                flex-col
                justify-between
                overflow-hidden
                border-b
                border-white/50
                bg-white/35
                p-8
                md:border-b-0
                md:border-r
                md:p-12
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.35em]
                    text-zinc-500
                  "
                >
                  Simple Task
                </p>

                <h1
                  className="
                    mt-6
                    text-5xl
                    font-light
                    tracking-tight
                    text-zinc-900
                    md:text-6xl
                  "
                >
                  Crie sua
                  <br />
                  <span className="font-semibold">
                    conta.
                  </span>
                </h1>

                <p
                  className="
                    mt-6
                    max-w-sm
                    text-base
                    leading-7
                    text-zinc-600
                  "
                >
                  Tenha um espaço simples para
                  organizar suas tarefas, compromissos
                  e rotina.
                </p>
              </div>

              <div className="mt-12">
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-zinc-500
                  "
                >
                  Já possui uma conta?
                </p>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="
                    mt-4
                    rounded-full
                    border
                    border-zinc-900/20
                    bg-white/70
                    px-7
                    py-3
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-zinc-900
                    shadow-sm
                    backdrop-blur
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-white
                    hover:shadow-lg
                  "
                >
                  Fazer login
                </button>
              </div>
            </section>

            {/* =================================================
                LADO DIREITO
            ================================================= */}

            <section
              className="
                relative
                flex
                items-center
                justify-center
                bg-white/20
                p-8
                md:p-12
              "
            >
              <div className="w-full max-w-md">

                <div className="mb-7">
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.35em]
                      text-zinc-500
                    "
                  >
                    Comece agora
                  </p>

                  <h2
                    className="
                      mt-3
                      text-4xl
                      font-semibold
                      tracking-[0.12em]
                      text-zinc-900
                    "
                  >
                    CADASTRE-SE
                  </h2>
                </div>

                {/* =============================================
                    FORMULÁRIO
                ============================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  {/* NOME */}

                  <div>
                    <label
                      htmlFor="name"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-zinc-600
                      "
                    >
                      Nome
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Seu nome"
                      required
                      autoComplete="name"
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-white/80
                        bg-white/60
                        px-5
                        py-4
                        text-sm
                        text-zinc-900
                        shadow-inner
                        outline-none
                        backdrop-blur-xl
                        transition
                        placeholder:text-zinc-400
                        focus:border-zinc-900/30
                        focus:bg-white/80
                        focus:ring-4
                        focus:ring-purple-500/10
                      "
                    />
                  </div>

                  {/* E-MAIL */}

                  <div>
                    <label
                      htmlFor="email"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-zinc-600
                      "
                    >
                      E-mail
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="voce@email.com"
                      required
                      autoComplete="email"
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-white/80
                        bg-white/60
                        px-5
                        py-4
                        text-sm
                        text-zinc-900
                        shadow-inner
                        outline-none
                        backdrop-blur-xl
                        transition
                        placeholder:text-zinc-400
                        focus:border-zinc-900/30
                        focus:bg-white/80
                        focus:ring-4
                        focus:ring-purple-500/10
                      "
                    />
                  </div>

                  {/* SENHA */}

                  <div>
                    <label
                      htmlFor="password"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-zinc-600
                      "
                    >
                      Senha
                    </label>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-white/80
                        bg-white/60
                        px-5
                        py-4
                        text-sm
                        text-zinc-900
                        shadow-inner
                        outline-none
                        backdrop-blur-xl
                        transition
                        placeholder:text-zinc-400
                        focus:border-zinc-900/30
                        focus:bg-white/80
                        focus:ring-4
                        focus:ring-purple-500/10
                      "
                    />
                  </div>

                  {/* CONFIRMAR SENHA */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-zinc-600
                      "
                    >
                      Confirmar senha
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value,
                        )
                      }
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-white/80
                        bg-white/60
                        px-5
                        py-4
                        text-sm
                        text-zinc-900
                        shadow-inner
                        outline-none
                        backdrop-blur-xl
                        transition
                        placeholder:text-zinc-400
                        focus:border-zinc-900/30
                        focus:bg-white/80
                        focus:ring-4
                        focus:ring-purple-500/10
                      "
                    />
                  </div>

                  {/* ERRO */}

                  {error && (
                    <div
                      className="
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50/80
                        px-4
                        py-3
                        text-sm
                        text-red-600
                      "
                    >
                      {error}
                    </div>
                  )}

                  {/* SUCESSO */}

                  {success && (
                    <div
                      className="
                        rounded-2xl
                        border
                        border-emerald-200
                        bg-emerald-50/80
                        px-4
                        py-3
                        text-sm
                        text-emerald-600
                      "
                    >
                      {success}
                    </div>
                  )}

                  {/* BOTÃO */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      w-full
                      rounded-full
                      bg-zinc-900
                      px-6
                      py-4
                      text-sm
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-white
                      shadow-xl
                      transition
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-zinc-800
                      hover:shadow-2xl
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading
                      ? "Criando conta..."
                      : "Criar conta"}
                  </button>
                </form>

                {/* LOGIN MOBILE */}

                <div className="mt-7 text-center md:hidden">
                  <p className="text-xs text-zinc-500">
                    Já possui uma conta?
                  </p>

                  <button
                    type="button"
                    onClick={handleLogin}
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-zinc-900
                      underline
                      underline-offset-4
                    "
                  >
                    Fazer login
                  </button>
                </div>

              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;