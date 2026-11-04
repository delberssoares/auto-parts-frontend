import type { ComponentType } from "react";
import {
  BoltIcon,
  BrakeIcon,
  DropIcon,
  EngineIcon,
  SuspensionIcon,
  WrenchIcon,
  type IconProps,
} from "../components/icons";

// Escolhe o ícone pelo nome da categoria (sem acento e sem diferenciar maiúsculas)
export function categoryIcon(name?: string): ComponentType<IconProps> {
  const key = (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (key.includes("freio")) return BrakeIcon;
  if (key.includes("motor")) return EngineIcon;
  if (key.includes("suspens")) return SuspensionIcon;
  if (key.includes("eletric")) return BoltIcon;
  if (key.includes("filtro") || key.includes("oleo")) return DropIcon;
  return WrenchIcon;
}