// @bun
// The office tool's office plugin, bundled from its plugins/office/. `office sync` replaces this copy; change the tool's.

// plugins/office/instructions.ts
import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, join, relative, sep } from "path";

// node_modules/.pnpm/valibot@1.5.0_typescript@7.0.2/node_modules/valibot/dist/index.mjs
var store$4;
var DEFAULT_CONFIG = {
  lang: undefined,
  message: undefined,
  abortEarly: undefined,
  abortPipeEarly: undefined
};
function getGlobalConfig(config$1) {
  if (!config$1 && !store$4)
    return DEFAULT_CONFIG;
  return {
    lang: config$1?.lang ?? store$4?.lang,
    message: config$1?.message,
    abortEarly: config$1?.abortEarly ?? store$4?.abortEarly,
    abortPipeEarly: config$1?.abortPipeEarly ?? store$4?.abortPipeEarly
  };
}
var store$3;
function getGlobalMessage(lang) {
  return store$3?.get(lang);
}
var store$2;
function getSchemaMessage(lang) {
  return store$2?.get(lang);
}
var store$1;
function getSpecificMessage(reference, lang) {
  return store$1?.get(reference)?.get(lang);
}
function _stringify(input) {
  const type = typeof input;
  if (type === "string")
    return `"${input}"`;
  if (type === "number" || type === "bigint" || type === "boolean")
    return `${input}`;
  if (type === "object" || type === "function")
    return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  return type;
}
function _addIssue(context, label, dataset, config$1, other) {
  const input = other && "input" in other ? other.input : dataset.value;
  const expected = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? /* @__PURE__ */ _stringify(input);
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config$1.lang,
    abortEarly: config$1.abortEarly,
    abortPipeEarly: config$1.abortPipeEarly
  };
  const isSchema = context.kind === "schema";
  const message$1 = other?.message ?? context.message ?? /* @__PURE__ */ getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? /* @__PURE__ */ getSchemaMessage(issue.lang) : null) ?? config$1.message ?? /* @__PURE__ */ getGlobalMessage(issue.lang);
  if (message$1 !== undefined)
    issue.message = typeof message$1 === "function" ? message$1(issue) : message$1;
  if (isSchema)
    dataset.typed = false;
  if (dataset.issues)
    dataset.issues.push(issue);
  else
    dataset.issues = [issue];
}
function _isSameValueZero(value1, value2) {
  return value1 === value2 || Number.isNaN(value1) && Number.isNaN(value2);
}
function _isValidObjectKey(object$1, key) {
  return Object.prototype.hasOwnProperty.call(object$1, key) && key !== "__proto__" && key !== "prototype" && key !== "constructor";
}
function _joinExpects(values$1, separator) {
  const list = [...new Set(values$1)];
  if (list.length > 1)
    return `(${list.join(` ${separator} `)})`;
  return list[0] ?? "never";
}
function _standardSchema(schema) {
  schema["~standard"] = {
    version: 1,
    vendor: "valibot",
    validate: (value$1) => schema["~run"]({ value: value$1 }, /* @__PURE__ */ getGlobalConfig())
  };
  return schema;
}
var EMAIL_REGEX = /^[\w+-]+(?:\.[\w+-]+)*@[\da-zA-Z]+(?:[.-][\da-zA-Z]+)*\.[a-zA-Z]{2,}$/u;
function check(requirement, message$1) {
  return {
    kind: "validation",
    type: "check",
    reference: check,
    async: false,
    expects: null,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement(dataset.value))
        _addIssue(this, "input", dataset, config$1);
      return dataset;
    }
  };
}
function email(message$1) {
  return {
    kind: "validation",
    type: "email",
    reference: email,
    expects: null,
    async: false,
    requirement: EMAIL_REGEX,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value))
        _addIssue(this, "email", dataset, config$1);
      return dataset;
    }
  };
}
function nonEmpty(message$1) {
  return {
    kind: "validation",
    type: "non_empty",
    reference: nonEmpty,
    async: false,
    expects: "!0",
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && dataset.value.length === 0)
        _addIssue(this, "length", dataset, config$1, { received: "0" });
      return dataset;
    }
  };
}
function regex(requirement, message$1) {
  return {
    kind: "validation",
    type: "regex",
    reference: regex,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value))
        _addIssue(this, "format", dataset, config$1);
      return dataset;
    }
  };
}
function transform(operation) {
  return {
    kind: "transformation",
    type: "transform",
    reference: transform,
    async: false,
    operation,
    "~run"(dataset) {
      dataset.value = this.operation(dataset.value);
      return dataset;
    }
  };
}
function url(message$1) {
  return {
    kind: "validation",
    type: "url",
    reference: url,
    async: false,
    expects: null,
    requirement(input) {
      try {
        if (URL.canParse)
          return URL.canParse(input);
        new URL(input);
        return true;
      } catch {
        return false;
      }
    },
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement(dataset.value))
        _addIssue(this, "URL", dataset, config$1);
      return dataset;
    }
  };
}
var ABORT_EARLY_CONFIG = { abortEarly: true };
function getFallback(schema, dataset, config$1) {
  return typeof schema.fallback === "function" ? schema.fallback(dataset, config$1) : schema.fallback;
}
function getDefault(schema, dataset, config$1) {
  return typeof schema.default === "function" ? schema.default(dataset, config$1) : schema.default;
}
function array(item, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "array",
    reference: array,
    expects: "Array",
    async: false,
    item,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0;key < input.length; key++) {
          const value$1 = input[key];
          const itemDataset = this.item["~run"]({ value: value$1 }, config$1);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value$1
            };
            for (const issue of itemDataset.issues) {
              if (issue.path)
                issue.path.unshift(pathItem);
              else
                issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues)
              dataset.issues = itemDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed)
            dataset.typed = false;
          dataset.value.push(itemDataset.value);
        }
      } else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function boolean(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "boolean",
    reference: boolean,
    expects: "boolean",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "boolean")
        dataset.typed = true;
      else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function literal(literal_, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "literal",
    reference: literal,
    expects: /* @__PURE__ */ _stringify(literal_),
    async: false,
    literal: literal_,
    message: message$1,
    "~run"(dataset, config$1) {
      if (/* @__PURE__ */ _isSameValueZero(dataset.value, this.literal))
        dataset.typed = true;
      else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function nullish(wrapped, default_) {
  return _standardSchema({
    kind: "schema",
    type: "nullish",
    reference: nullish,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: false,
    wrapped,
    default: default_,
    "~run"(dataset, config$1) {
      if (dataset.value === null || dataset.value === undefined) {
        if (this.default !== undefined)
          dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === null || dataset.value === undefined) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  });
}
function number(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "number",
    reference: number,
    expects: "number",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "number" && !isNaN(dataset.value))
        dataset.typed = true;
      else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function optional(wrapped, default_) {
  return _standardSchema({
    kind: "schema",
    type: "optional",
    reference: optional,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    "~run"(dataset, config$1) {
      if (dataset.value === undefined) {
        if (this.default !== undefined)
          dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === undefined) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  });
}
function record(key, value$1, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "record",
    reference: record,
    expects: "Object",
    async: false,
    key,
    value: value$1,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const entryKey in input)
          if (/* @__PURE__ */ _isValidObjectKey(input, entryKey)) {
            const entryValue = input[entryKey];
            const keyDataset = this.key["~run"]({ value: entryKey }, config$1);
            if (keyDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "key",
                input,
                key: entryKey,
                value: entryValue
              };
              for (const issue of keyDataset.issues) {
                issue.path = [pathItem];
                dataset.issues?.push(issue);
              }
              if (!dataset.issues)
                dataset.issues = keyDataset.issues;
              if (config$1.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            const valueDataset = this.value["~run"]({ value: entryValue }, config$1);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key: entryKey,
                value: entryValue
              };
              for (const issue of valueDataset.issues) {
                if (issue.path)
                  issue.path.unshift(pathItem);
                else
                  issue.path = [pathItem];
                dataset.issues?.push(issue);
              }
              if (!dataset.issues)
                dataset.issues = valueDataset.issues;
              if (config$1.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!keyDataset.typed || !valueDataset.typed)
              dataset.typed = false;
            if (keyDataset.typed)
              dataset.value[keyDataset.value] = valueDataset.value;
          }
      } else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function strictObject(entries$1, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "strict_object",
    reference: strictObject,
    expects: "Object",
    async: false,
    entries: entries$1,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && valueSchema.default !== undefined) {
            const value$1 = key in input ? input[key] : /* @__PURE__ */ getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value$1 }, config$1);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value$1
              };
              for (const issue of valueDataset.issues) {
                if (issue.path)
                  issue.path.unshift(pathItem);
                else
                  issue.path = [pathItem];
                dataset.issues?.push(issue);
              }
              if (!dataset.issues)
                dataset.issues = valueDataset.issues;
              if (config$1.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed)
              dataset.typed = false;
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== undefined)
            dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
          else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config$1, {
              input: undefined,
              expected: `"${key}"`,
              path: [{
                type: "object",
                origin: "key",
                input,
                key,
                value: input[key]
              }]
            });
            if (config$1.abortEarly)
              break;
          }
        }
        if (!dataset.issues || !config$1.abortEarly) {
          for (const key in input)
            if (!Object.prototype.hasOwnProperty.call(this.entries, key)) {
              _addIssue(this, "key", dataset, config$1, {
                input: key,
                expected: "never",
                path: [{
                  type: "object",
                  origin: "key",
                  input,
                  key,
                  value: input[key]
                }]
              });
              break;
            }
        }
      } else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function string(message$1) {
  return _standardSchema({
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message: message$1,
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "string")
        dataset.typed = true;
      else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function _subIssues(datasets) {
  let issues;
  if (datasets)
    for (const dataset of datasets)
      if (issues)
        for (const issue of dataset.issues)
          issues.push(issue);
      else
        issues = dataset.issues;
  return issues;
}
function union(options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "union",
    reference: union,
    expects: /* @__PURE__ */ _joinExpects(options.map((option) => option.expects), "|"),
    async: false,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      let validDataset;
      let typedDatasets;
      let untypedDatasets;
      for (const schema of this.options) {
        const optionDataset = schema["~run"]({ value: dataset.value }, config$1);
        if (optionDataset.typed)
          if (optionDataset.issues)
            if (typedDatasets)
              typedDatasets.push(optionDataset);
            else
              typedDatasets = [optionDataset];
          else {
            validDataset = optionDataset;
            break;
          }
        else if (untypedDatasets)
          untypedDatasets.push(optionDataset);
        else
          untypedDatasets = [optionDataset];
      }
      if (validDataset)
        return validDataset;
      if (typedDatasets) {
        if (typedDatasets.length === 1)
          return typedDatasets[0];
        _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(typedDatasets) });
        dataset.typed = true;
      } else if (untypedDatasets?.length === 1)
        return untypedDatasets[0];
      else
        _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(untypedDatasets) });
      return dataset;
    }
  });
}
function variant(key, options, message$1) {
  return _standardSchema({
    kind: "schema",
    type: "variant",
    reference: variant,
    expects: "Object",
    async: false,
    key,
    options,
    message: message$1,
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        let outputDataset;
        let maxDiscriminatorPriority = 0;
        let invalidDiscriminatorKey = this.key;
        let expectedDiscriminators = [];
        const parseOptions = (variant$1, allKeys) => {
          for (const schema of variant$1.options) {
            if (schema.type === "variant")
              parseOptions(schema, new Set(allKeys).add(schema.key));
            else {
              let keysAreValid = true;
              let currentPriority = 0;
              for (const currentKey of allKeys) {
                const discriminatorSchema = schema.entries[currentKey];
                if (currentKey in input ? discriminatorSchema["~run"]({
                  typed: false,
                  value: input[currentKey]
                }, ABORT_EARLY_CONFIG).issues : discriminatorSchema.type !== "exact_optional" && discriminatorSchema.type !== "optional" && discriminatorSchema.type !== "nullish") {
                  keysAreValid = false;
                  if (invalidDiscriminatorKey !== currentKey && (maxDiscriminatorPriority < currentPriority || maxDiscriminatorPriority === currentPriority && (currentKey in input) && !(invalidDiscriminatorKey in input))) {
                    maxDiscriminatorPriority = currentPriority;
                    invalidDiscriminatorKey = currentKey;
                    expectedDiscriminators = [];
                  }
                  if (invalidDiscriminatorKey === currentKey)
                    expectedDiscriminators.push(schema.entries[currentKey].expects);
                  break;
                }
                currentPriority++;
              }
              if (keysAreValid) {
                const optionDataset = schema["~run"]({ value: input }, config$1);
                if (!outputDataset || !outputDataset.typed && optionDataset.typed)
                  outputDataset = optionDataset;
              }
            }
            if (outputDataset && !outputDataset.issues)
              break;
          }
        };
        parseOptions(this, new Set([this.key]));
        if (outputDataset)
          return outputDataset;
        _addIssue(this, "type", dataset, config$1, {
          input: input[invalidDiscriminatorKey],
          expected: /* @__PURE__ */ _joinExpects(expectedDiscriminators, "|"),
          path: [{
            type: "object",
            origin: "value",
            input,
            key: invalidDiscriminatorKey,
            value: input[invalidDiscriminatorKey]
          }]
        });
      } else
        _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  });
}
function pipe(...pipe$1) {
  return _standardSchema({
    ...pipe$1[0],
    pipe: pipe$1,
    "~run"(dataset, config$1) {
      for (const item of pipe$1)
        if (item.kind !== "metadata") {
          if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
            dataset.typed = false;
            break;
          }
          if (!dataset.issues || !config$1.abortEarly && !config$1.abortPipeEarly)
            dataset = item["~run"](dataset, config$1);
        }
      return dataset;
    }
  });
}
function safeParse(schema, input, config$1) {
  const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config$1));
  return {
    typed: dataset.typed,
    success: !dataset.issues,
    output: dataset.value,
    issues: dataset.issues
  };
}

// src/schema.ts
var name = pipe(string("must be a name"), regex(/^[a-z0-9][a-z0-9-]*$/, "must be lowercase letters, digits and dashes"));
var text = pipe(string("must be text"), nonEmpty("must not be empty"));
var version = pipe(string("must be a version such as 2.3.0"), regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/, "must be a version such as 2.3.0"));
var age = pipe(string("must be an age such as 1d"), regex(/^\d+[hdw]$/, "must be an age such as 36h, 1d or 2w"));
function uniqueNames(items) {
  return new Set(items.map((item) => item.name)).size === items.length;
}
var mapping = "must be a mapping of the fields this schema knows";
var repository = strictObject({
  name,
  url: text,
  ref: optional(text),
  description: optional(text)
}, mapping);
var repositories = pipe(nullish(array(repository, "must be a list"), []), check(uniqueNames, "lists a name twice"));
var names = nullish(array(name, "must be a list"), []);
var desk = nullish(strictObject({
  description: optional(text),
  repos: repositories,
  skills: names
}, mapping), {});
var reservedPlugins = ["office"];
var plugin = strictObject({
  name: pipe(name, check((value) => !reservedPlugins.includes(value), "is one of the tool's own plugins")),
  repo: text,
  ref: optional(text)
}, mapping);
var opencode = nullish(union([
  literal("container"),
  variant("mode", [
    strictObject({ mode: literal("container") }),
    strictObject({ mode: literal("host"), url: pipe(text, url("must be a URL such as http://127.0.0.1:49374")) })
  ])
], "must be container, or { mode: host, url: <the server's URL> }"), "container");
var versions = optional(strictObject({
  opencode: optional(version),
  claude: optional(version),
  executor: optional(version),
  mise: optional(version)
}, "must map opencode, claude, executor and mise to versions"));
var upgrades = nullish(record(text, age, "must map minimum_release_age or a tool to an age such as 1d"), {});
var skills = nullish(strictObject({
  enabled: names,
  copied: pipe(nullish(array(strictObject({ name, repo: text, ref: optional(text), path: text }, mapping), "must be a list"), []), check(uniqueNames, "lists a name twice"))
}, mapping), {});
var settingValue = union([string(), number(), boolean()], "must be text, a number or true/false");
var packageEntry = pipe(strictObject({
  name,
  repo: optional(text),
  path: optional(text),
  ref: optional(text),
  settings: nullish(record(string(), settingValue, "must map setting names to values"), {})
}, mapping), check((entry) => entry.repo === undefined ? entry.path === undefined && entry.ref === undefined : entry.path !== undefined && entry.ref !== undefined, "needs repo, path and ref together, or none of them for a package in packages/<name>/"), transform(({ name: packageName, settings, repo, path, ref }) => ({
  name: packageName,
  settings,
  source: repo !== undefined && path !== undefined && ref !== undefined ? { repo, path, ref } : undefined
})));
var git = optional(pipe(strictObject({
  name: optional(text),
  email: optional(pipe(text, email("must be an email address"))),
  credentials: optional(literal("gh", "must be gh, the host's GitHub CLI login"))
}, "must be a mapping of name, email and credentials"), check((value) => value.name === undefined === (value.email === undefined), "needs both name and email, or neither")));
var officeSchema = strictObject({
  name,
  state: optional(text),
  opencode,
  git,
  secrets: optional(strictObject({ executor_owner: optional(text) })),
  claude: optional(strictObject({ credential: text, settings: text })),
  versions,
  upgrades,
  references: repositories,
  desks: nullish(record(name, desk, "must map desk names to desks"), {}),
  skills,
  plugins: pipe(nullish(array(plugin, "must be a list"), []), check(uniqueNames, "lists a name twice")),
  packages: pipe(nullish(array(packageEntry, "must be a list"), []), check(uniqueNames, "lists a name twice"))
}, "must be a mapping of name, state, opencode, git, secrets, claude, versions, upgrades, references, desks, skills, plugins and packages");
var packageSetting = pipe(strictObject({ description: text, default: optional(settingValue), required: optional(literal(true, "must be true, or left out with a default")) }, mapping), check((setting) => setting.default === undefined !== (setting.required === undefined), "needs a default or required: true, not both"));
var packageManifestSchema = strictObject({
  name,
  description: text,
  settings: nullish(record(string(), packageSetting, "must map setting names to settings"), {})
}, "must be a mapping of name, description and settings");
var lockEntry = strictObject({ version, digest: pipe(string(), regex(/^sha256:[0-9a-f]{64}$/, "must be sha256:<64 hex digits>")) });
var lockSchema = strictObject({
  opencode: lockEntry,
  claude: lockEntry,
  executor: lockEntry,
  mise: lockEntry
});
function location(issue) {
  let where = "";
  for (const item of issue.path ?? []) {
    const key = String(item.key);
    where = item.type === "array" ? `${where}[${key}]` : where === "" ? key : `${where}.${key}`;
  }
  return where === "" ? "the file" : where;
}
function check2(result) {
  if (result.success)
    return { ok: true, value: result.output };
  return { ok: false, errors: result.issues.map((issue) => `${location(issue)}: ${issue.message}`) };
}

// plugins/office/instructions.ts
function packageDescription(office, name) {
  const path = join(office, "packages", name, "package.yaml");
  if (!existsSync(path))
    return;
  const result = check2(safeParse(packageManifestSchema, Bun.YAML.parse(readFileSync(path, "utf8"))));
  return result.ok ? result.value.description : undefined;
}
function readOffice(office) {
  const result = check2(safeParse(officeSchema, Bun.YAML.parse(readFileSync(join(office, "office.yaml"), "utf8"))));
  if (!result.ok)
    return result;
  const config = result.value;
  return {
    ok: true,
    value: {
      name: config.name,
      desks: Object.entries(config.desks).map(([name, desk]) => ({ name, ...desk })),
      references: config.references,
      packages: config.packages.map((entry) => ({ name: entry.name, description: packageDescription(office, entry.name) }))
    }
  };
}
function invalidText(errors) {
  return [
    "# This office's office.yaml is not valid",
    "",
    "`office` commands refuse to run here until these fields are fixed:",
    "",
    ...errors.map((error) => `- ${error}`)
  ].join(`
`);
}
function findOffice(folder) {
  for (let dir = folder;; dir = dirname(dir)) {
    if (existsSync(join(dir, "office.yaml")))
      return dir;
    if (dirname(dir) === dir)
      return;
  }
}
function entry(path, description) {
  return description === undefined ? `- \`${path}\`` : `- \`${path}\`: ${description}`;
}
function sharedApps(office) {
  const dir = join(office, "executor/apps");
  if (!existsSync(dir))
    return [];
  return readdirSync(dir, { withFileTypes: true }).filter((item) => item.isDirectory() && existsSync(join(dir, item.name, "package.json"))).map((item) => {
    const manifest = JSON.parse(readFileSync(join(dir, item.name, "package.json"), "utf8"));
    const title = manifest.executor?.title;
    return entry(`executor/apps/${item.name}/`, title === undefined ? undefined : `the \`${item.name}\` app (${title}) in the \`office-executor\` MCP server`);
  });
}
function sharedSections(office, apps) {
  return [
    "## References (read-only clones; `office sync` updates them)",
    "",
    ...office.references.length === 0 ? ["None."] : office.references.map((reference) => entry(`references/${reference.name}/`, reference.description)),
    "",
    "## Shared Executor apps",
    "",
    ...apps.length === 0 ? ["None."] : apps,
    ...office.packages.length === 0 ? [] : [
      "",
      "## Packages (their skills and plugins load in every session)",
      "",
      ...office.packages.map((item) => entry(`packages/${item.name}/`, item.description ?? "not installed yet; `office sync` installs it"))
    ]
  ];
}
function repoLines(desk, indent = "") {
  return desk.repos.map((repo) => `${indent}${entry(`${desk.name}/repos/${repo.name}/`, repo.description)}`);
}
function rootText(office, apps) {
  return [
    `# The ${office.name} office`,
    "",
    "This session is at the root of an office: a source-controlled folder of desks. Paths below are relative to the office root.",
    "",
    "- Each desk is a top-level folder. A session started in a desk loads the root's instructions, config and skills plus the desk's own; desks never load each other's. Do a desk's work in a session started there.",
    "- `office.yaml` declares the desks, their repositories, the references, which skills from `skills/` are enabled where, cloned plugins and packages (`packages/<name>/`). After changing it, run `office sync`.",
    "- Reach services through the `office-executor` MCP server. Each desk has an Executor app at `<desk>/executor/apps/<desk>/` with `reports.*`, `notifications.*` and `agent.ask`; after changing it, run `office apps deploy`. For onboarding use `office setup`. Owner credentials are human-only: let the human run `office executor credentials` in their terminal, never capture its output in an agent transcript. Keep private age identities and decrypted runtime state outside the office repository.",
    "- `cron/crontab` runs file-system jobs in the container.",
    "- `git` in `office.yaml` sets the commit identity of the container and the office's jobs; with `credentials: gh`, HTTPS remotes use the user's GitHub login, which the user manages on the host. Never run `gh auth login`, `logout` or `switch` for them.",
    "",
    "## Desks",
    "",
    ...office.desks.length === 0 ? ["No desks yet."] : office.desks.flatMap((desk) => [entry(`${desk.name}/`, desk.description), ...repoLines(desk, "  ")]),
    "",
    ...sharedSections(office, apps)
  ].join(`
`);
}
function deskText(office, desk, apps) {
  const repos = repoLines(desk);
  const others = office.desks.flatMap((other) => other.name === desk.name ? [] : [other.name]);
  return [
    `# The ${desk.name} desk of the ${office.name} office`,
    "",
    `This session is at the ${desk.name} desk (\`${desk.name}/\`)${desk.description === undefined ? "." : `: ${desk.description}`} Paths below are relative to the office root.`,
    "",
    `- Keep this desk's work inside \`${desk.name}/\`: repositories under \`${desk.name}/repos/\` (declare new ones under \`desks.${desk.name}.repos\` in \`office.yaml\`, then run \`office sync\`), throwaway work in \`${desk.name}/scratch/\`.`,
    `- The desk's Executor app is \`${desk.name}/executor/apps/${desk.name}/\`, the \`${desk.name}\` app in the \`office-executor\` MCP server: save results with \`reports.save\`, reach the user with \`notifications.send\`. After changing it, run \`office apps deploy\`.`,
    "",
    "## Repositories",
    "",
    ...repos.length === 0 ? ["None yet."] : repos,
    "",
    "Shared from the office root, for this desk to use directly:",
    "",
    ...sharedSections(office, apps),
    ...others.length === 0 ? [] : ["", `Other desks (${others.join(", ")}) have their own folders; their work belongs to sessions started there.`]
  ].join(`
`);
}
function officeInstructions(folder) {
  const dir = findOffice(folder);
  if (dir === undefined)
    return "";
  const read = readOffice(dir);
  if (!read.ok)
    return invalidText(read.errors);
  const office = read.value;
  const apps = sharedApps(dir);
  const [first] = relative(dir, folder).split(sep);
  const desk = office.desks.find((candidate) => candidate.name === first);
  return desk === undefined ? rootText(office, apps) : deskText(office, desk, apps);
}

// plugins/office/index.ts
var office_default = {
  id: "office",
  async setup(ctx) {
    const attached = new Map;
    await ctx.session.hook("prompt", async ({ sessionID }) => {
      const text = officeInstructions(ctx.location.directory);
      if (text === "" || attached.get(sessionID) === text)
        return;
      await ctx.session.instructions.entry.put({ sessionID, key: "office", value: text });
      attached.set(sessionID, text);
    });
  }
};
export {
  office_default as default
};
