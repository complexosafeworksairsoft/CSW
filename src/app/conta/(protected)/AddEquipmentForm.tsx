"use client";

import { useActionState } from "react";
import PhotoUploadField from "@/components/PhotoUploadField";
import { DescriptionField, SelectField, CheckboxGroup } from "@/components/EquipmentSpecFields";
import { addEquipmentAction, type EquipmentActionState } from "../actions";
import {
  WEAPON_CLASSES,
  PROPULSION_TYPES,
  RED_DOT_OPTICS,
  SCOPE_OPTICS,
  LIGHTS_LASERS,
  MUZZLE_DEVICES,
  STOCKS,
  GEAR_RATIOS,
  MOTOR_TYPES,
  SHAFT_SIZES,
  BATTERIES,
  BB_WEIGHTS,
} from "@/lib/equipment-catalog";

const initialState: EquipmentActionState = { error: null, resetToken: 0 };

export default function AddEquipmentForm() {
  const [state, formAction, pending] = useActionState(addEquipmentAction, initialState);

  return (
    <form action={formAction} className="border border-dashed border-line-strong bg-surface-2 p-4">
      <p className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
        Adicionar equipamento
      </p>

      {/* Keyed by resetToken so fields (incl. the file input/preview and the description counter) clear after a successful add, but stay filled in if the submission was rejected. */}
      <div key={state.resetToken} className="mt-3 grid gap-3 sm:grid-cols-[100px_1fr]">
        <PhotoUploadField name="photo" label="Foto do item" ratio="square" />

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="eq-name" className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
                Nome
              </label>
              <input
                id="eq-name"
                name="name"
                type="text"
                required
                className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="eq-brand" className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
                Marca
              </label>
              <input
                id="eq-brand"
                name="brand"
                type="text"
                className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <DescriptionField id="eq-desc" />
        </div>
      </div>

      <details className="mt-4 border-t border-line-strong pt-3">
        <summary className="cursor-pointer select-none font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
          Especificações técnicas da réplica (opcional)
        </summary>

        <div className="mt-3 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id="eq-weapon-class" name="weaponClass" label="Classe da arma" options={WEAPON_CLASSES} />
            <SelectField id="eq-propulsion" name="propulsion" label="Sistema de propulsão" options={PROPULSION_TYPES} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CheckboxGroup legend="Red dots e holográficas" name="optics" options={RED_DOT_OPTICS} idPrefix="eq-optics" />
            <CheckboxGroup legend="Lunetas e magnifiers" name="scopes" options={SCOPE_OPTICS} idPrefix="eq-scopes" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CheckboxGroup legend="Luz e laser" name="lightsLasers" options={LIGHTS_LASERS} idPrefix="eq-lights" />
            <CheckboxGroup legend="Dispositivos de cano" name="muzzleDevices" options={MUZZLE_DEVICES} idPrefix="eq-muzzle" />
          </div>

          <CheckboxGroup legend="Coronhas" name="stocks" options={STOCKS} idPrefix="eq-stocks" />

          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id="eq-gear" name="gearRatio" label="Relação de engrenagens" options={GEAR_RATIOS} />
            <SelectField id="eq-motor" name="motorType" label="Tipo do motor" options={MOTOR_TYPES} />
            <SelectField id="eq-shaft" name="shaftSize" label="Tamanho do eixo" options={SHAFT_SIZES} />
            <SelectField id="eq-battery" name="battery" label="Bateria utilizada" options={BATTERIES} />
            <SelectField id="eq-bb" name="bbWeight" label="Gramatura de BBs" options={BB_WEIGHTS} />
          </div>
        </div>
      </details>

      {state.error && (
        <p role="alert" className="mt-3 border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 border border-line-strong px-4 py-2 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar equipamento"}
      </button>
    </form>
  );
}
