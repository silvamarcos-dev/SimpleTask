import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/auth";
import { saveToken } from "../lib/authStorage";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      saveToken(response.access_token);

      navigate("/dashboard");
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${apiBaseUrl}/auth/google`;
  }

  function handleRegister() {
    navigate("/register");
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
          blur-[1px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          top-37.5
          h-82.5
          w-82.5
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
                  Bem
                  <br />
                  <span className="font-semibold">
                    vindo.
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
                  Organize seu dia, acompanhe suas
                  tarefas e mantenha tudo no lugar.
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
                  Ainda não possui uma conta?
                </p>

                <button
                  type="button"
                  onClick={handleRegister}
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
                  Cadastre-se
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
                <div className="mb-8">
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.35em]
                      text-zinc-500
                    "
                  >
                    Acesse sua conta
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
                    FAÇA LOGIN
                  </h2>
                </div>

                {/* =============================================
                    FORMULÁRIO
                ============================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
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
                      autoComplete="current-password"
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
                      ? "Entrando..."
                      : "Entrar"}
                  </button>
                </form>

                {/* =============================================
                    DIVISOR
                ============================================= */}

                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-900/10" />

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.25em]
                      text-zinc-400
                    "
                  >
                    ou
                  </span>

                  <div className="h-px flex-1 bg-zinc-900/10" />
                </div>

                {/* =============================================
                    GOOGLE
                ============================================= */}

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-full
                    border
                    border-zinc-900/10
                    bg-white/65
                    px-6
                    py-4
                    text-sm
                    font-semibold
                    text-zinc-800
                    shadow-sm
                    backdrop-blur-xl
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-white
                    hover:shadow-lg
                  "
                >
                  <span
                    className="
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-sm
                      font-bold
                    "
                  >
                    G
                  </span>

                  Continuar com Google
                </button>

                {/* =============================================
                    CADASTRO MOBILE
                ============================================= */}

                <div className="mt-8 text-center md:hidden">
                  <p className="text-xs text-zinc-500">
                    Ainda não possui uma conta?
                  </p>

                  <button
                    type="button"
                    onClick={handleRegister}
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-zinc-900
                      underline
                      underline-offset-4
                    "
                  >
                    Cadastre-se
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

export default Login;