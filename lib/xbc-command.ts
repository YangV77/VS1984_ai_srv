export type CommandValue = string | number;

export type CommandRequest = {
  action: string[];
  args?: CommandValue[];
};

const safeCommandTokenPattern = /^[A-Za-z0-9._:/+=@-]+$/;
const controlCharPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function encodeCommandPart(raw: CommandValue, allowEmpty = false): string {
  const value = String(raw);
  if (!value.trim()) {
    if (allowEmpty) {
      return "''";
    }
    throw new Error("empty command argument");
  }
  if (controlCharPattern.test(value)) {
    throw new Error("command argument contains control characters");
  }

  if (safeCommandTokenPattern.test(value)) {
    return value;
  }

  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

export function buildCommand(request: CommandRequest): string {
  if (!request.action.length) {
    throw new Error("command action is required");
  }

  const actionParts = request.action.map((part) => encodeCommandPart(part));
  const args = (request.args ?? []).map((part) => encodeCommandPart(part, true));
  return ["cmd", ...actionParts, ...args].join(" ");
}

export async function runXbcCommand(command: CommandRequest | string): Promise<Response> {
  const cmd = typeof command === "string" ? command.trim() : buildCommand(command);
  if (!cmd) {
    throw new Error("empty command");
  }

  const res = await fetch("/api/xbc/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd }),
  });

  if (!res.ok) {
    console.error("send cmd failed", await res.text());
  }

  return res;
}
