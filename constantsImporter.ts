import joi from "joi";
import { parse } from "flags";
import Constants from "./types/constants.type.ts";

const { config, c } = parse(Deno.args) as { config?: string; c?: string };

const constantsSchema = joi.object<Constants>({
  homePath: joi.string().required(),
  extraDockers: joi.array().items(joi.string()).optional(),
  instructions: joi
    .array()
    .items(
      joi
        .object({
          shardName: joi.string().required(),
          toNodesIndex: joi.array().items(joi.number()).required(),
          fromNodeIndex: joi.number().optional(),
          fromPath: joi.string().optional(),
        })
        .xor("fromNodeIndex", "fromPath")
    )
    .optional(),
  maxEpochsToNextEvent: joi.number().optional(),
  validatorPublicKeys: joi.object().pattern(joi.number(), joi.string()).required(),
});

const constants = JSON.parse(await Deno.readTextFile(config ?? c ?? "./constants.jsonc")) as Constants;

const { error } = constantsSchema.validate(constants);

if (error) {
  console.error(error);
  Deno.exit(1);
}

export default constants;
