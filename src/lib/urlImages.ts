/**
 * Referências:
 * https://www.serebii.net/pokemonsleep/meals/eggbombcurry.png
 * https://www.serebii.net/pokemonsleep/berries/durinberry.png
 * https://www.serebii.net/pokemonsleep/ingredients/honey.png
 * https://www.serebii.net/pokemonsleep/pokemon/1.png
 * https://www.serebii.net/pokemonsleep/pokemon/shiny/1.png
 * https://www.serebii.net/pokemonsleep/pokemon/type/grass.png
 * https://www.serebii.net/pokemonsleep/pokemon/sleep/1.png
 * https://www.serebii.net/pokemonsleep/items/bulbasaurcandy.png
 */

import { sl } from "zod/v4/locales";

export const RECIPE_PLACEHOLDER = "/recipe-placeholder.png";

export function slugifyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9-']+/g, "") // troca tudo por hífen
    .replace(/-+/g, "-") // evita hífens duplicados
    .replace(/^-|-$/g, ""); // remove hífen no início/fim
}

function buildSlugUrl(base: string, name: string) {
  return `${base}/${slugifyName(name)}.png`;
}

// === Slug-based ===
export function getRecipeImageUrl(recipeName: string) {
  return buildSlugUrl("https://www.serebii.net/pokemonsleep/meals", recipeName);
}

export function getBerryImageUrl(berryName: string) {
  return buildSlugUrl("https://www.serebii.net/pokemonsleep/berries", berryName);
}

export function getIngredientImageUrl(ingredientName: string) {
  return buildSlugUrl(
    "https://www.serebii.net/pokemonsleep/ingredients",
    ingredientName
  );
}

export function getCandyImageUrl(candyName: string) {
  return buildSlugUrl("https://www.serebii.net/pokemonsleep/items", candyName);
}

export function getTypeImageUrl(typeName: string) {
  return buildSlugUrl(
    "https://www.serebii.net/pokemonsleep/pokemon/type",
    typeName
  );
}

// === Dex-number-based ===
export function getPokemonImageUrl(dexNum: number, isShiny?: boolean) {
  return isShiny
    ? `https://www.serebii.net/pokemonsleep/pokemon/shiny/${dexNum}.png`
    : `https://www.serebii.net/pokemonsleep/pokemon/${dexNum}.png`;
}

export function getSleepStyleImageUrl(dexNum: number) {
  return `https://www.serebii.net/pokemonsleep/pokemon/sleep/${dexNum}.png`;
}
