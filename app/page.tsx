"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Blocks,
  Bot,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  KeyRound,
  Link2,
  PackageOpen,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { runXbcCommand, type CommandRequest } from "@/lib/xbc-command";

type LogEntry = {
  id: number;
  message: string;
  api?: string;
  type?: number;
};

type Language = "zh" | "en";
type SectionKey = "base" | "client" | "provider" | "rag";
type PackFieldKey =
  | "provider"
  | "summary"
  | "price"
  | "termination";

type PackValues = Record<PackFieldKey, string>;
type Logs = Record<SectionKey, string[]>;

type BalanceDialogController = {
  open: () => void;
  close: () => void;
  setBalance: (value: string, unit?: string, meta?: string) => void;
};

const packKeys: PackFieldKey[] = [
  "provider",
  "summary",
  "price",
  "termination",
];

const initialPackValues: PackValues = {
  provider: "",
  summary: "",
  price: "",
  termination: "",
};

const copy = {
  zh: {
    eyebrow: "VS1984 PKN MVP",
    title: "PKN PROVIDER 控制页面",
    description:
      "基于 VS1984 去中心化匿名网络框架开发的私有知识库问答网络。",
    language: "中英文切换",
    chinese: "中文",
    english: "English",
    online: "在线",
    ready: "已就绪",
    disabled: "已停用",
    sharedHint: "所有按钮动作都会写入浏览器控制台；关键流程也会在对应卡片的日志中显示。",
    base: {
      title: "基础功能",
      certPlaceholder: "输入密码",
      certButton: "证书",
      register: "注册",
      balance: "余额",
      bind: "绑定",
      logTitle: "基础日志",
    },
    client: {
      title: "客户端",
      description: "面向客户端下载与日志输出的操作区。",
      screen: "vs1984x-日志",
      commandPlaceholder: "输入要打印的内容",
      commandButton: "SEND",
      empty: "暂无日志，执行 COMMAND 后会显示在这里。",
    },
    provider: {
      title: "Provider",
      description: "上传 txt、生成 desc 与 zip、文件选择和链路参数输入都集中在这里。",
      switch: "Provider",
      ingest: "INGEST",
      pack: "PACK",
      chainPlaceholder: "输入 2CHAIN 内容",
      chainButton: "2CHAIN",
      logTitle: "Provider 日志",
      empty: "启用后可以执行上传、打包和读取路径的操作。",
      ingestHint: "只接受 txt 文件，上传后返回后台临时路径。",
      btHint: "选择任意文件并打印其浏览器路径占位值。",
      modalTitle: "撰写知识库描述",
      modalDescription: "填写所有 key 的 value，完成后后端会生成 描述 文件、创建文件夹并打成 zip。",
      complete: "完成",
    },
    rag: {
      logTitle: "Rag 日志",
    },
    status: {
      base: "基础",
      client: "客户端",
      provider: "提供者",
    },
    fieldLabels: {
      provider: "provider",
      summary: "summary",
      price: "price(vsx)",
      termination: "termination",
    },
  },
  en: {
    eyebrow: "VS1984 PKN MVP",
    title: "PKN PROVIDER CONSOLE",
    description:
      "A private knowledge network based on the VS1984 framework.",
    language: "Chinese / English",
    chinese: "中文",
    english: "English",
    online: "Online",
    ready: "Ready",
    disabled: "Disabled",
    sharedHint: "Every action prints to the browser console, and key flows are mirrored into the card logs.",
    base: {
      title: "Base Controls",
      certPlaceholder: "Enter password",
      certButton: "CERT",
      register: "REGISTER",
      balance: "BALANCE",
      bind: "BIND",
      logTitle: "Base Log",
    },
    client: {
      title: "Client",
      description: "Workspace for client-side command input and screen logging.",
      screen: "vs1984x-logs",
      commandPlaceholder: "Type content to print",
      commandButton: "COMMAND",
      empty: "No logs yet. Run COMMAND and entries will appear here.",
    },
    provider: {
      title: "Provider",
      description: "TXT upload, desc packing, file picking, and chain input in one place.",
      switch: "Provider",
      ingest: "INGEST",
      pack: "PACK",
      chainPlaceholder: "Enter 2CHAIN content",
      chainButton: "2CHAIN",
      logTitle: "Provider Log",
      empty: "Enable the role to start uploading, packing, and reading file paths.",
      ingestHint: "TXT files only. The backend returns a temporary stored path.",
      btHint: "Pick any file and print the browser-reported path placeholder.",
      modalTitle: "Write knowledge dataset description",
      modalDescription: "Fill every value. The backend will create a desc file, a folder, and a zip archive.",
      complete: "Complete",
    },
    rag: {
      logTitle: "Rag Log",
    },
    status: {
      base: "Base",
      client: "Client",
      provider: "Provider",
      rag: "Rag",
    },
    fieldLabels: {
      provider: "provider",
      summary: "summary",
      price: "price(vsx)",
      termination: "termination",
    },
  },
} as const;

function formatLog(message: string) {
  return `${new Date().toLocaleTimeString()}  ${message}`;
}

function SectionBadge({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-(--muted-foreground) shadow-sm ring-1 ring-(--border)">
      <span className="size-2 rounded-full bg-(--success)" />
      <span>{label}</span>
      <span className="text-(--foreground)">{status}</span>
    </div>
  );
}

function LogPanel({
  title,
  logs,
  empty,
}: {
  title: string;
  logs: string[];
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-[#f8fbff] p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-xs text-(--muted-foreground)">{logs.length}</span>
      </div>
      <ScrollArea className="h-44 rounded-md bg-white px-3 py-2 ring-1 ring-(--border)">
        <div className="space-y-2" style={{ whiteSpace: "pre-wrap" }}>
          {logs.length > 0 ? (
            logs.map((entry, index) => (
              <p key={`${entry}-${index}`} className="text-sm text-(--muted-foreground)">
                {entry}
              </p>
            ))
          ) : (
            <p className="text-sm text-(--muted-foreground)">{empty}</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function BalanceAlertDialog({
                              open,
                              onOpenChange,
                              language,
                              loading,
                              value,
                              unit,
                              meta,
                              contentRef,
                            }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language;
  loading: boolean;
  value: string;
  unit: string;
  meta: string;
  contentRef?: React.Ref<HTMLDivElement>;
}) {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent ref={contentRef} className="w-[min(92vw,520px)]">
          <DialogHeader>
            <DialogTitle>{language === "zh" ? "余额提醒" : "Balance Alert"}</DialogTitle>
            <DialogDescription>
              {language === "zh" ? "当前可用余额" : "Current available balance"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-(--border) bg-white p-4 shadow-sm">
            {loading ? (
                <div className="flex items-center gap-2 text-(--muted-foreground)">
                  <Loader2 className="size-4 animate-spin" />
                  <p className="text-sm">
                    {language === "zh" ? "正在查询余额，请稍候..." : "Fetching balance, please wait..."}
                  </p>
                </div>
            ) : (
                <>
                  <p className="text-3xl font-semibold text-(--foreground)">
                    {value} {unit}
                  </p>
                  <p className="mt-2 text-xs text-(--muted-foreground)">
                    {meta || (language === "zh" ? "等待余额函数赋值..." : "Waiting for balance assignment...")}
                  </p>
                </>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}
// let packageName = "";
export default function HomePage() {
  const [language, setLanguage] = useState<Language>("zh");
  const [providerEnabled, setProviderEnabled] = useState(true);
  const [certPassword, setCertPassword] = useState("");
  const [provider_id, setProvider_id] = useState("");
  const [packageName, setPackageName] = useState("");
  const packageNameRef = useRef(packageName);
  const [showCertPassword, setShowCertPassword] = useState(false);
  const [sendingCert, setSendingCert] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceDisplayValue, setBalanceDisplayValue] = useState<string>("--");
  const [balanceDisplayUnit, setBalanceDisplayUnit] = useState<string>("VSX");
  const [balanceDisplayMeta, setBalanceDisplayMeta] = useState<string>("");
  const balanceDialogRef = useRef<BalanceDialogController | null>(null);
  const balanceDialogContentRef = useRef<HTMLDivElement | null>(null);
  const showBalanceRef = useRef(false);
  const pollingStoppedRef = useRef(false);
  const activePollControllerRef = useRef<AbortController | null>(null);
  const dropboxTimerRef = useRef<number | null>(null);
  const coreTimerRef = useRef<number | null>(null);
  const [packValues, setPackValues] = useState<PackValues>(initialPackValues);
  const [packOpen, setPackOpen] = useState(false);
  const [logs, setLogs] = useState<Logs>({
    base: [],
    client: [],
    provider: [],
    rag: [],
  });

  const ingestInputRef = useRef<HTMLInputElement>(null);

  const text = copy[language];

  const roleSummary = useMemo(
    () => [
      { key: "base", label: text.status.base, status: text.online },
      {
        key: "provider",
        label: text.status.provider,
        status: providerEnabled ? text.ready : text.disabled,
      },
    ],
    [providerEnabled, text],
  );

  const addLog = useCallback((section: SectionKey, message: string) => {
    const normalized = formatLog(message).replace(/\\n/g, "\n");

    setLogs((current) => ({
      ...current,
      [section]: [normalized, ...current[section]].slice(0, 12),
    }));
  }, []);

  const handleCommand = useCallback(async (request: CommandRequest | string) => {
    try {
      return await runXbcCommand(request);
    } catch (e) {
      console.error("send cmd error:", e);
      throw e;
    }
  }, []);

  useEffect(() => {
    packageNameRef.current = packageName;
  }, [packageName]);

  useEffect(() => {
    balanceDialogRef.current = {
      open: () => setBalanceDialogOpen(true),
      close: () => setBalanceDialogOpen(false),
      setBalance: (value, unit = "VSX", meta = "") => {
        setBalanceDisplayValue(value);
        setBalanceDisplayUnit(unit);
        setBalanceDisplayMeta(meta);
        setBalanceLoading(false);
      },
    };

    return () => {
      balanceDialogRef.current = null;
    };
  }, []);

  useEffect(() => {
    showBalanceRef.current = showBalance;
  }, [showBalance]);

  const lastXBCLogIdRef = useRef<number | null>(null);

  useEffect(() => {
    let disposed = false;

    async function poll() {
      while (!disposed && !pollingStoppedRef.current) {
        try {
          const url =
              lastXBCLogIdRef.current != null
                  ? `/api/xbc/logs?since=${lastXBCLogIdRef.current}`
                  : `/api/xbc/logs`;
          activePollControllerRef.current = new AbortController();
          const res = await fetch(url, { signal: activePollControllerRef.current.signal });
          if (!res.ok) {
            console.error("fetch logs failed", res.status);
          } else {
            const data = (await res.json()) as { logs: LogEntry[] };
            if (data.logs?.length) {
              const droppedLogs = data.logs.filter((log) => log.type === 37 || log.type === 36 || log.type === 61 || log.type === 62 || log.type === 14 || log.type === 50 || log.type === 34 || log.type === 7);
              droppedLogs.forEach((log) => {
                if (log.type === 36){ // DROPBOX_POP
                  if (log.api) {
                    const obj = JSON.parse(log.api);
                    if (obj && obj.record) {
                      const record = obj.record;
                      const record_obj = JSON.parse(record)
                      const msg = record_obj.msg;
                      const nid = record_obj.nid;
                      const content_obj = JSON.parse(msg);
                      if (content_obj.vs1984x === "003"){
                        handleCommand({
                          action: ["rag", "query"],
                          args: [nid, content_obj.query],
                        }).then((res) => {
                          if (!res) return;
                          addLog("rag", "rag query request: "+content_obj.query+" from "+nid);
                        });
                      }
                    }
                  }
                }else if (log.type === 7){ //RAG_SRV_QUERYING_ANSWER
                  if (log.api) {
                    try {
                      const obj = JSON.parse(log.api);
                      const callback_id = obj.callback_id;
                      delete obj.callback_id;
                      obj["vs1984x"] = "006";
                      const resp_str = JSON.stringify(obj, null, 4);
                      console.log("RAG_SRV_QUERYING_ANSWER:", resp_str);
                      handleCommand({
                        action: ["dropbox"],
                        args: [callback_id, resp_str],
                      }).then((res) => {
                        if (!res) return;
                        addLog("rag", "rag srv answer: "+resp_str);
                      });
                    } catch (error) {
                      console.error("JSON 解析失败:", error);
                    }
                  }
                }else if (log.type === 34){ //CHAIN_MSG_SEND
                  setSendingCert(false);
                  if (log.api) {
                    addLog("base", "send to chain msg");
                  }
                }else if (log.type === 61){ // CORE_ID
                  if (log.api) {
                    try {
                      const obj = JSON.parse(log.api);
                      const core = obj.core;
                      handleCommand({
                        action: ["mpt"],
                        args: [core],
                      }).then((res) => {
                        if (!res) return;
                        setProvider_id(core);
                        addLog("base", "core id: "+core);
                      });
                    } catch (error) {
                      console.error("JSON 解析失败:", error);
                    }
                  }
                }else if (log.type === 62){ // MPT_RECORD
                  if (log.api) {
                    const obj = JSON.parse(log.api);
                    addLog("base", "mpt record: "+JSON.stringify(obj, null, 4));
                    try {
                      const obj = JSON.parse(log.api);
                      if (showBalanceRef.current){
                        balanceDialogRef.current?.setBalance(obj.wallet, "VSX", new Date().toLocaleString())
                        balanceDialogRef.current?.open();
                        setShowBalance(false);
                      }
                    } catch (error) {
                      console.error("JSON 解析失败:", error);
                    }

                  }
                }else if (log.type === 14){ //BT_SEED_ADDED
                  if (log.api) {
                    try {
                      const obj = JSON.parse(log.api);
                      const infohash = obj.infohash;
                      const to_chain_obj: Record<string, string> = {};
                      to_chain_obj["vs1984x"] = "001";
                      to_chain_obj["pack"] = packageNameRef.current;
                      to_chain_obj["infohash"] = infohash;
                      const to_chain_str = JSON.stringify(to_chain_obj, null, 4);
                      addLog("provider", `bt seed added: ${infohash}`);
                      if (to_chain_str !== "") {
                        handleCommand({
                          action: ["kk"],
                          args: [to_chain_str],
                        }).then(() => {
                          addLog("provider", "send bt record to chain");
                        });
                      }
                    } catch (error) {
                      console.error("JSON 解析失败:", error);
                    }
                  }
                }
              });
              const lastLog = data.logs[data.logs.length - 1];
              lastXBCLogIdRef.current = lastLog.id ?? lastXBCLogIdRef.current;

            }
          }
        } catch (e) {
          if (pollingStoppedRef.current) {
            break;
          }
          if (e instanceof DOMException && e.name === "AbortError") {
            break;
          }
          console.warn("poll logs request interrupted:", e);
        } finally {
          activePollControllerRef.current = null;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    void poll();
    return () => {
      disposed = true;
      activePollControllerRef.current?.abort();
    };
  }, [addLog, handleCommand]);

  const stopAllPolling = useCallback(() => {
    pollingStoppedRef.current = true;
    activePollControllerRef.current?.abort();
    if (dropboxTimerRef.current != null) {
      window.clearInterval(dropboxTimerRef.current);
      dropboxTimerRef.current = null;
    }
    if (coreTimerRef.current != null) {
      window.clearTimeout(coreTimerRef.current);
      coreTimerRef.current = null;
    }
  }, []);

  const handleExit = useCallback(async () => {
    stopAllPolling();
    try {
      await handleCommand("cmd exit");
      addLog("base", "cmd exit sent");
    } catch (error) {
      addLog("base", `cmd exit failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }, [addLog, handleCommand, stopAllPolling]);

  useEffect(() => {
    if (pollingStoppedRef.current) {
      return;
    }

    dropboxTimerRef.current = window.setInterval(() => {
      handleCommand({ action: ["dropbox", "pop"] });
    }, 4000);

    return () => {
      if (dropboxTimerRef.current != null) {
        window.clearInterval(dropboxTimerRef.current);
        dropboxTimerRef.current = null;
      }
    };
  }, [handleCommand]);

  useEffect(() => {
    if (pollingStoppedRef.current) {
      return;
    }

    coreTimerRef.current = window.setTimeout(() => {
      handleCommand({ action: ["core"] });
    }, 3000);

    return () => {
      if (coreTimerRef.current != null) {
        window.clearTimeout(coreTimerRef.current);
        coreTimerRef.current = null;
      }
    };
  }, [handleCommand]);

  const handleProviderState = (enabled: boolean) => {
    setProviderEnabled(enabled);
    addLog("provider", `provider switch: ${enabled ? "on" : "off"}`);
  };

  const submitFormData = async <T extends Record<string, unknown>>(url: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { error?: string } & T;

    if (!response.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Request failed");
    }

    return payload;
  };

  const handleIngestChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = await submitFormData<{ tempPath: string }>("/api/provider/ingest", file);
      handleCommand({
        action: ["rag", "ingest"],
        args: [payload.tempPath],
      }).then(() => {
        addLog("provider", `ingest file: ${payload.tempPath}`)
        setPackOpen(true);
      });
    } catch (error) {
      addLog("provider", `ingest failed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      event.target.value = "";
    }
  };

  const handleProviderChange = (value: string) => {
    setPackValues((current) => ({
      ...current,
      provider: value,
    }));
  };

  const handlePackSubmit = async () => {
    try {
      const postData = {
        ...packValues,
        provider: provider_id,
      };
      const response = await fetch("/api/provider/pack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const payload = (await response.json()) as {
        packageName?: string;
        descPath?: string;
        folderPath?: string;
        zipPath?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Pack request failed");
      }

      handleCommand({
        action: ["bt", "seed"],
        args: [payload.descPath ?? ""],
      }).then(() => {
        setPackageName(payload.packageName!);
        addLog("provider", `desc path: ${payload.descPath ?? ""}`);
      });
      setPackOpen(false);

    } catch (error) {
      addLog("provider", `pack failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  };

  const cardClass = "min-h-full backdrop-blur-xl";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[36px] border border-(--border) bg-(--surface) px-6 py-7 shadow-[0_25px_90px_-55px_rgba(40,72,130,0.55)] sm:px-10 sm:py-10">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(79,126,247,0.18),transparent_58%)]" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm text-(--muted-foreground) shadow-sm ring-1 ring-(--border)">
                <Blocks className="size-4 text-(--brand)" />
                <span>{text.eyebrow}</span>
              </div>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  {text.title}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-(--muted-foreground) sm:text-lg">
                  {text.description}
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[28px] border border-(--border) bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{text.language}</p>
                  <p className="text-sm text-(--muted-foreground)">
                    {language === "zh" ? text.chinese : text.english}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-(--muted-foreground)">{text.chinese}</span>
                  <Switch
                    checked={language === "en"}
                    onCheckedChange={(checked) => setLanguage(checked ? "en" : "zh")}
                    aria-label={text.language}
                  />
                  <span className="text-sm text-(--muted-foreground)">{text.english}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleExit}
                className="mt-4 w-full bg-[#ffe8e8] text-[#a72828] ring-[#ffd0d0] hover:bg-[#ffdada]"
              >
                {language === "zh" ? "退出" : "Exit"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {roleSummary.map((item) => (
              <SectionBadge key={item.key} label={item.label} status={item.status} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card className={cardClass}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex size-11 items-center justify-center rounded-md bg-[#eef4ff] text-(--brand)">
                  <Bot className="size-5" />
                </div>
                <CardTitle>{text.base.title}</CardTitle>
              </div>
              <SectionBadge label={text.status.base} status={text.online} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Input
                    type={showCertPassword ? "text" : "password"}
                    placeholder={text.base.certPlaceholder}
                    value={certPassword}
                    onChange={(event) => setCertPassword(event.target.value)}
                    className="pr-12"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCertPassword((current) => !current)}
                    className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                    aria-label={showCertPassword ? "Hide password" : "Show password"}
                >
                  {showCertPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              <Button onClick={() => {setSendingCert(true); handleCommand({ action: ["cert"], args: [certPassword] });}}
                      disabled={sendingCert}>
                <KeyRound className="size-4" />
                {sendingCert ? "GENERATING..." : text.base.certButton}
              </Button>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button variant="secondary" onClick={() => {handleCommand({ action: ["register"] }).then(() => {addLog("base", "Register command executed")});}}>
                  <ShieldCheck className="size-4" />
                  {text.base.register}
                </Button>
                <Button variant="secondary" onClick={() => {handleCommand({ action: ["bind", "provider"] }).then(() => {addLog("base", "Bind command executed")});}}>
                  <Link2 className="size-4" />
                  {text.base.bind}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => {
                      // Your function can assign:
                      setBalanceLoading(true);
                      setBalanceDisplayValue("--");
                      setBalanceDisplayMeta("");
                      setBalanceDialogOpen(true);
                      setShowBalance(true);
                      handleCommand({
                        action: ["mpt"],
                        args: [provider_id],
                      });
                    }}
                >
                  <ShieldCheck className="size-4" />
                  {text.base.balance}
                </Button>
              </div>
            </div>
            <BalanceAlertDialog
                open={balanceDialogOpen}
                onOpenChange={setBalanceDialogOpen}
                language={language}
                loading={balanceLoading}
                value={balanceDisplayValue}
                unit={balanceDisplayUnit}
                meta={balanceDisplayMeta}
                contentRef={balanceDialogContentRef}
            />
            <LogPanel title={text.base.logTitle} logs={logs.base} empty={text.client.empty} />
            <LogPanel title={text.rag.logTitle} logs={logs.rag} empty={text.client.empty} />
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex size-11 items-center justify-center rounded-md bg-[#fff8eb] text-[#d28704]">
                  <PackageOpen className="size-5" />
                </div>
                <CardTitle>{text.provider.title}</CardTitle>
                <CardDescription>{text.provider.description}</CardDescription>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-(--border)">
                <span className="text-sm text-(--muted-foreground)">{text.provider.switch}</span>
                <Switch checked={providerEnabled} onCheckedChange={handleProviderState} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3">
              <Button
                onClick={() => ingestInputRef.current?.click()}
                disabled={!providerEnabled}
                className="w-full"
              >
                <FileText className="size-4" />
                {text.provider.ingest}
              </Button>
              <Dialog open={packOpen} onOpenChange={setPackOpen}>
                <DialogTrigger asChild>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{text.provider.modalTitle}</DialogTitle>
                    <DialogDescription>{text.provider.modalDescription}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 md:grid-cols-2">
                    {packKeys.map((key) => (
                        <label key={key} className="space-y-2">
                            <span className="text-sm font-medium text-(--muted-foreground)">
                              {text.fieldLabels[key]}
                            </span>
                          {key === "termination" ? (
                              <Input
                                  type="date"
                                  min={new Date().toISOString().slice(0, 10)}
                                  value={packValues.termination ? `${packValues.termination.slice(0, 4)}-${packValues.termination.slice(4, 6)}-${packValues.termination.slice(6, 8)}` : ""}
                                  onChange={(event) =>
                                      setPackValues((current) => ({
                                        ...current,
                                        termination: event.target.value.replaceAll("-", ""),
                                      }))
                                  }
                              />
                          ) : (
                              <Input
                                  value={key === "provider" ? provider_id : packValues[key]}
                                  onChange={(event) =>
                                      key === "provider"
                                          ? handleProviderChange(event.target.value)
                                          : setPackValues((current) => ({
                                            ...current,
                                            [key]: event.target.value,
                                          }))
                                  }
                              />
                          )}
                        </label>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handlePackSubmit}>{text.provider.complete}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3 rounded-xl border border-dashed border-(--border-strong) bg-[#fdfbf4] p-4 text-sm text-(--muted-foreground) sm:grid-cols-2">
              <p>{text.provider.ingestHint}</p>
              <p>{text.provider.btHint}</p>
            </div>

            <LogPanel title={text.provider.logTitle} logs={logs.provider} empty={text.provider.empty} />

            <input
              ref={ingestInputRef}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={handleIngestChange}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
