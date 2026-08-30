"use client";

import { useActionState } from "react";
import { updateSafetyInfoAction, type SafetyInfoState } from "../actions";
import { BLOOD_TYPES, type SafetyInfo } from "@/lib/safety-info";

const initialState: SafetyInfoState = { error: null, saved: false };

/**
 * Private safety/emergency data (see src/lib/safety-info.ts) — collapsed by
 * default since it's the account's most sensitive form on the site;
 * expanding it is an explicit choice, not something shown open by default.
 */
export default function SafetyInfoForm({ info }: { info: SafetyInfo }) {
  const [state, formAction, pending] = useActionState(updateSafetyInfoAction, initialState);

  return (
    <details className="border border-line-strong bg-surface-2 rounded-sm">
      <summary className="cursor-pointer select-none px-5 py-4 font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
        Dados de segurança (privado)
      </summary>

      <form action={formAction} className="border-t border-line-strong p-5 sm:p-6">
        <p className="text-xs text-muted max-w-xl">
          Visível só pra você e pra administração do Complexo, em caso de emergência em campo.
          Nunca aparece pra equipes nem no site público.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="birthDate" className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
              Data de nascimento
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={info.birthDate ?? ""}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="city" className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
              Cidade / Bairro
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={info.city}
              placeholder="Para organização de caronas e esquadrões"
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="bloodType" className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft">
              Tipo sanguíneo
            </label>
            <select
              id="bloodType"
              name="bloodType"
              defaultValue={info.bloodType ?? ""}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">Não informado</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="emergencyContactName"
              className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
            >
              Contato de emergência — nome
            </label>
            <input
              id="emergencyContactName"
              name="emergencyContactName"
              type="text"
              defaultValue={info.emergencyContactName}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContactPhone"
              className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
            >
              Contato de emergência — telefone
            </label>
            <input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              defaultValue={info.emergencyContactPhone}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="medicalConditions"
              className="font-mono-safe text-xs uppercase tracking-widest text-ink-soft"
            >
              Alergias ou condições médicas
            </label>
            <textarea
              id="medicalConditions"
              name="medicalConditions"
              rows={3}
              defaultValue={info.medicalConditions}
              placeholder="Asma, problemas cardíacos, diabetes, alergia a insetos ou medicamentos, etc."
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {state.error && (
          <p role="alert" className="mt-4 border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
            {state.error}
          </p>
        )}
        {state.saved && (
          <p className="mt-4 border border-accent bg-accent/10 px-3 py-2 text-sm text-ink">
            Dados salvos.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 border border-line-strong px-5 py-3 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar dados de segurança"}
        </button>
      </form>
    </details>
  );
}
