import { type SchemaTypeDefinition } from "sanity";
import { category } from "./category";
import { laptop } from "./laptop";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [category, laptop],
};
