"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import PhotoTile from "./PhotoTile";
import PhotoUploadField from "./PhotoUploadField";
import ConfirmDeleteButton from "./ConfirmDeleteButton";
import { DescriptionField, SelectField, CheckboxGroup } from "./EquipmentSpecFields";
import type { Equipment } from "@/lib/roster-data";
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

type EquipmentFormState = { error: string | null; resetToken: number };

const initialState: EquipmentFormState = { error: null, resetToken: 0 };

const hasSpecs = (item: Equipment) =>
  Boolean(
    item.weaponClass ||
      item.propulsion ||
      item.optics.length ||
      item.scopes.length ||
      item.lightsLasers.length ||
      item.muzzleDevices.length ||
      item.stocks.length ||
      item.gearRatio ||
      item.motorType ||
      item.shaftSize ||
      item.battery ||
      item.bbWeight
  );

/**
 * One equipment item, either in the team portal's roster (OperatorCard) or
 * the operator's own self-service list (conta's EquipmentManager) — same
 * `equipment` table either way. Toggles locally between a read-only summary
 * and an inline edit form pre-filled with the item's current values, closing
 * back to the summary automatically once a save succeeds.
 *
 * `operatorId` is only passed by the team portal, which needs it to scope
 * updateEquipmentAction/removeEquipmentAction to the right operator; the
 * self-service caller resolves its own operator from the session instead.
 */
export default function EquipmentListItem({
  item,
  operatorId,
  updateAction,
  removeAction,
}: {
  item: Equipment;
  operatorId?: string;
  updateAction: (prevState: EquipmentFormState, formData: FormData) => Promise<EquipmentFormState>;
  removeAction: (formData: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateAction, initialState);
  const lastToken = useRef(state.resetToken);

  useEffect(() => {
    if (state.resetToken !== lastToken.current) {
      lastToken.current = state.resetToken;
      setEditing(false);
    }
  }, [state.resetToken]);

  if (!editing) {
    return (
      <li className="border border-line bg-surface-2 p-3">
        <div className="flex gap-3">
          <PhotoTile photo={item.photo} fit={item.photoFit} label={`Foto: ${item.name}`} className="w-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink truncate">{item.name}</p>
            {item.brand && (
              <p className="font-mono-safe text-[11px] uppercase tracking-widest text-muted">{item.brand}</p>
            )}
            {item.description && <p className="mt-1 text-xs text-ink-soft break-words">{item.description}</p>}
            {(item.weaponClass || item.propulsion) && (
              <p className="mt-1.5 flex flex-wrap gap-1">
                {item.weaponClass && (
                  <span className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono-safe text-[10px] uppercase tracking-widest text-ink-soft">
                    {item.weaponClass}
                  </span>
                )}
                {item.propulsion && (
                  <span className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono-safe text-[10px] uppercase tracking-widest text-ink-soft">
                    {item.propulsion}
                  </span>
                )}
              </p>
            )}
            {[...item.optics, ...item.scopes, ...item.lightsLasers, ...item.muzzleDevices, ...item.stocks].length >
              0 && (
              <p className="mt-1 text-[11px] text-muted break-words">
                {[...item.optics, ...item.scopes, ...item.lightsLasers, ...item.muzzleDevices, ...item.stocks].join(
                  " · "
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft hover:border-accent hover:text-accent transition-colors"
          >
            Editar
          </button>
          <form action={removeAction}>
            {operatorId && <input type="hidden" name="operatorId" value={operatorId} />}
            <input type="hidden" name="equipmentId" value={item.id} />
            <ConfirmDeleteButton
              label="Excluir"
              confirmMessage="Tem certeza que deseja excluir este equipamento? Essa ação não pode ser desfeita."
              size="sm"
            />
          </form>
        </div>
      </li>
    );
  }

  return (
    <li className="border border-accent bg-surface-2 p-3">
      <form action={formAction}>
        {operatorId && <input type="hidden" name="operatorId" value={operatorId} />}
        <input type="hidden" name="equipmentId" value={item.id} />

        <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
          <PhotoUploadField
            name="photo"
            label="Foto do item"
            existingPhoto={item.photo}
            existingFit={item.photoFit}
            ratio="square"
          />

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`eq-edit-name-${item.id}`}
                  className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft"
                >
                  Nome
                </label>
                <input
                  id={`eq-edit-name-${item.id}`}
                  name="name"
                  type="text"
                  required
                  defaultValue={item.name}
                  className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor={`eq-edit-brand-${item.id}`}
                  className="font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft"
                >
                  Marca
                </label>
                <input
                  id={`eq-edit-brand-${item.id}`}
                  name="brand"
                  type="text"
                  defaultValue={item.brand}
                  className="mt-1 w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <DescriptionField id={`eq-edit-desc-${item.id}`} defaultValue={item.description} />
          </div>
        </div>

        <details className="mt-4 border-t border-line-strong pt-3" open={hasSpecs(item)}>
          <summary className="cursor-pointer select-none font-mono-safe text-[11px] uppercase tracking-widest text-ink-soft">
            Especificações técnicas da réplica (opcional)
          </summary>

          <div className="mt-3 grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id={`eq-edit-weapon-class-${item.id}`}
                name="weaponClass"
                label="Classe da arma"
                options={WEAPON_CLASSES}
                defaultValue={item.weaponClass ?? ""}
              />
              <SelectField
                id={`eq-edit-propulsion-${item.id}`}
                name="propulsion"
                label="Sistema de propulsão"
                options={PROPULSION_TYPES}
                defaultValue={item.propulsion ?? ""}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxGroup
                legend="Red dots e holográficas"
                name="optics"
                options={RED_DOT_OPTICS}
                idPrefix={`eq-edit-optics-${item.id}`}
                defaultValues={item.optics}
              />
              <CheckboxGroup
                legend="Lunetas e magnifiers"
                name="scopes"
                options={SCOPE_OPTICS}
                idPrefix={`eq-edit-scopes-${item.id}`}
                defaultValues={item.scopes}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <CheckboxGroup
                legend="Luz e laser"
                name="lightsLasers"
                options={LIGHTS_LASERS}
                idPrefix={`eq-edit-lights-${item.id}`}
                defaultValues={item.lightsLasers}
              />
              <CheckboxGroup
                legend="Dispositivos de cano"
                name="muzzleDevices"
                options={MUZZLE_DEVICES}
                idPrefix={`eq-edit-muzzle-${item.id}`}
                defaultValues={item.muzzleDevices}
              />
            </div>

            <CheckboxGroup
              legend="Coronhas"
              name="stocks"
              options={STOCKS}
              idPrefix={`eq-edit-stocks-${item.id}`}
              defaultValues={item.stocks}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id={`eq-edit-gear-${item.id}`}
                name="gearRatio"
                label="Relação de engrenagens"
                options={GEAR_RATIOS}
                defaultValue={item.gearRatio ?? ""}
              />
              <SelectField
                id={`eq-edit-motor-${item.id}`}
                name="motorType"
                label="Tipo do motor"
                options={MOTOR_TYPES}
                defaultValue={item.motorType ?? ""}
              />
              <SelectField
                id={`eq-edit-shaft-${item.id}`}
                name="shaftSize"
                label="Tamanho do eixo"
                options={SHAFT_SIZES}
                defaultValue={item.shaftSize ?? ""}
              />
              <SelectField
                id={`eq-edit-battery-${item.id}`}
                name="battery"
                label="Bateria utilizada"
                options={BATTERIES}
                defaultValue={item.battery ?? ""}
              />
              <SelectField
                id={`eq-edit-bb-${item.id}`}
                name="bbWeight"
                label="Gramatura de BBs"
                options={BB_WEIGHTS}
                defaultValue={item.bbWeight ?? ""}
              />
            </div>
          </div>
        </details>

        {state.error && (
          <p role="alert" className="mt-3 border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
            {state.error}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="border border-line-strong px-4 py-2 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar alterações"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-line-strong px-4 py-2 rounded-sm font-mono-safe text-xs uppercase tracking-widest text-muted hover:border-accent hover:text-accent transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </li>
  );
}
