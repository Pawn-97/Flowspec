import Ajv2020 from "ajv/dist/2020.js";
import { readJson, resolveFromRoot } from "./io.js";

export async function validateWithSchema(schemaFile, data) {
  const schema = await readJson(resolveFromRoot("schemas", schemaFile));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return {
    valid,
    errors: (validate.errors || []).map((error) => ({
      severity: "critical",
      category: "schema",
      message: `${error.instancePath || "/"} ${error.message}`,
      details: error
    }))
  };
}
