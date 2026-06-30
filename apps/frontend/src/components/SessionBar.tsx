import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, postJson } from "../lib/api";
import type { User } from "../lib/types";
import { Icon } from "./Icon";

export function SessionBar() {
  const queryClient = useQueryClient();
  const [alias, setAlias] = useState("demo-ahc");
  const me = useQuery({ queryKey: ["me"], queryFn: () => api<User | null>("/me") });
  const login = useMutation({
    mutationFn: () =>
      postJson<User>("/auth/alias", {
        alias,
        nombre: "Demo AHC",
        email: "demo@huelladecarbono.org",
        tipoUsuario: alias === "demo-ahc" ? "administrador_ahc" : "usuario_registrado",
        ciudad: "Gava",
        pais: "España",
        consentimientos: {
          registro: true,
          medicion: true,
          comunicaciones: false,
          datosAgregados: true
        }
      }),
    onSuccess: () => queryClient.invalidateQueries()
  });

  useEffect(() => {
    if (!me.isLoading && !me.data && !login.isPending && !login.isSuccess) {
      login.mutate();
    }
  }, [me.isLoading, me.data, login]);

  return null;

  /*
  const user = me.data && "alias" in me.data ? me.data : null;

  if (user) {
    return (
      <header className="topbar">
        <div>
          <span className="eyebrow">Sesion activa</span>
          <strong>{user.alias}</strong>
          <span className="muted"> {(user.tipoUsuario || "usuario_registrado").replace(/_/g, " ")}</span>
        </div>
        <button className="ghost-button" onClick={() => window.print()}>
          <Icon name="print" />
          Imprimir vista
        </button>
      </header>
    );
  }

  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">Modo demo</span>
        <strong>Entra con alias para guardar planes y resultados</strong>
      </div>
      <form
        className="session-form"
        onSubmit={(event) => {
          event.preventDefault();
          login.mutate();
        }}
      >
        <input value={alias} onChange={(event) => setAlias(event.target.value)} aria-label="Alias" />
        <button className="primary-button" type="submit" disabled={login.isPending}>
          <Icon name="login" />
          Entrar
        </button>
      </form>
    </header>
  );
  */
}
