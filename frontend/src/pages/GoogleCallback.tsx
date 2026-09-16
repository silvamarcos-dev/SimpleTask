import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { saveToken } from "../lib/authStorage";


function GoogleCallback() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Token de autenticação não encontrado.");
      return;
    }

    const params = new URLSearchParams(
      hash.substring(1),
    );

    const accessToken = params.get(
      "access_token",
    );

    if (!accessToken) {
      setError(
        "Não foi possível concluir o login com Google.",
      );
      return;
    }

    saveToken(accessToken);

    window.history.replaceState(
      null,
      "",
      window.location.pathname,
    );

    navigate("/dashboard", {
      replace: true,
    });
  }, [navigate]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Não foi possível entrar
          </h1>

          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Voltar para o login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />

        <p className="mt-5 text-sm text-zinc-500">
          Entrando no Simple Task...
        </p>
      </div>
    </main>
  );
}

export default GoogleCallback;