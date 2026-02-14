var _d = Object.defineProperty;
var Ni = (e) => {
  throw TypeError(e);
};
var vd = (e, t, r) => t in e ? _d(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ze = (e, t, r) => vd(e, typeof t != "symbol" ? t + "" : t, r), Ms = (e, t, r) => t.has(e) || Ni("Cannot " + r);
var J = (e, t, r) => (Ms(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Be = (e, t, r) => t.has(e) ? Ni("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Ce = (e, t, r, n) => (Ms(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), ht = (e, t, r) => (Ms(e, t, "access private method"), r);
import nl, { app as ye, session as wd, ipcMain as rt, BrowserWindow as yn, shell as Ed, screen as bd, nativeImage as Ri, Tray as Sd, Menu as Pd } from "electron";
import { dirname as sl, join as Ct } from "path";
import { fileURLToPath as al } from "url";
import de from "node:process";
import ae from "node:path";
import { promisify as Se, isDeepStrictEqual as Oi } from "node:util";
import Y from "node:fs";
import Br from "node:crypto";
import Ti from "node:assert";
import ol from "node:os";
import "node:events";
import "node:stream";
const nn = {
  dev: !ye.isPackaged
}, Ii = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
}, Nd = {
  setAppUserModelId(e) {
    Ii.isWindows && ye.setAppUserModelId(nn.dev ? process.execPath : e);
  },
  setAutoLaunch(e) {
    if (Ii.isLinux)
      return !1;
    const t = () => ye.getLoginItemSettings().openAtLogin;
    return t() !== e ? (ye.setLoginItemSettings({ openAtLogin: e }), t() === e) : !0;
  },
  skipProxy() {
    return wd.defaultSession.setProxy({ mode: "direct" });
  }
}, Rd = {
  watchWindowShortcuts(e, t) {
    if (!e)
      return;
    const { webContents: r } = e, { escToCloseWindow: n = !1, zoom: s = !1 } = t || {};
    r.on("before-input-event", (a, o) => {
      o.type === "keyDown" && (nn.dev ? o.code === "F12" && (r.isDevToolsOpened() ? r.closeDevTools() : (r.openDevTools({ mode: "undocked" }), console.log("Open dev tool..."))) : (o.code === "KeyR" && (o.control || o.meta) && a.preventDefault(), o.code === "KeyI" && (o.alt && o.meta || o.control && o.shift) && a.preventDefault()), n && o.code === "Escape" && o.key !== "Process" && (e.close(), a.preventDefault()), s || (o.code === "Minus" && (o.control || o.meta) && a.preventDefault(), o.code === "Equal" && o.shift && (o.control || o.meta) && a.preventDefault()));
    });
  },
  registerFramelessWindowIpc() {
    rt.on("win:invoke", (e, t) => {
      const r = yn.fromWebContents(e.sender);
      r && (t === "show" ? r.show() : t === "showInactive" ? r.showInactive() : t === "min" ? r.minimize() : t === "max" ? r.isMaximized() ? r.unmaximize() : r.maximize() : t === "close" && r.close());
    });
  }
}, Od = al(import.meta.url), br = sl(Od), Td = ye.isPackaged ? Ct(br, "../dist/logo.png") : Ct(br, "../public/logo.png");
class Id {
  constructor() {
    ze(this, "dashboardWindow", null);
    ze(this, "overlayWindow", null);
  }
  createDashboardWindow() {
    if (this.dashboardWindow && !this.dashboardWindow.isDestroyed())
      return this.dashboardWindow.focus(), this.dashboardWindow;
    const t = Ct(br, "preload.cjs");
    console.log("Preload Path:", t), this.dashboardWindow = new yn({
      width: 900,
      height: 670,
      show: !1,
      autoHideMenuBar: !0,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#09090b",
        // zinc-950
        symbolColor: "#ffffff",
        height: 40
      },
      icon: Td,
      webPreferences: {
        preload: t,
        sandbox: !1
      }
    }), this.dashboardWindow.on("ready-to-show", () => {
      var n;
      (n = this.dashboardWindow) == null || n.show();
    }), this.dashboardWindow.webContents.setWindowOpenHandler((n) => (Ed.openExternal(n.url), { action: "deny" }));
    const r = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL;
    return console.log("Dev URL:", r), console.log("is.dev:", nn.dev), nn.dev && r ? this.dashboardWindow.loadURL(r) : this.dashboardWindow.loadFile(Ct(br, "../dist/index.html")), this.dashboardWindow;
  }
  createOverlayWindow(t = !1) {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed())
      return this.overlayWindow.focus(), this.overlayWindow;
    const r = bd.getPrimaryDisplay(), { width: n, height: s } = r.workAreaSize;
    this.overlayWindow = new yn({
      width: n,
      height: s,
      x: 0,
      y: 0,
      show: !1,
      frame: !1,
      fullscreen: !0,
      alwaysOnTop: !0,
      // strictMode ? true : false - actually always on top for overlay
      skipTaskbar: !0,
      closable: !t,
      kiosk: t,
      resizable: !1,
      movable: !1,
      minimizable: !1,
      webPreferences: {
        preload: Ct(br, "preload.cjs"),
        sandbox: !1
      }
    });
    const a = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL, o = nn.dev && a ? `${a}/#/overlay` : `file://${Ct(br, "../dist/index.html")}#/overlay`;
    return this.overlayWindow.loadURL(o), this.overlayWindow.on("ready-to-show", () => {
      var c, l, d;
      (c = this.overlayWindow) == null || c.show(), t && ((l = this.overlayWindow) == null || l.setIgnoreMouseEvents(!1), (d = this.overlayWindow) == null || d.setAlwaysOnTop(!0, "screen-saver"));
    }), this.overlayWindow;
  }
  closeOverlay() {
    this.overlayWindow && !this.overlayWindow.isDestroyed() && (this.overlayWindow.close(), this.overlayWindow = null);
  }
  getDashboardWindow() {
    return this.dashboardWindow;
  }
  getOverlayWindow() {
    return this.overlayWindow;
  }
}
const sn = new Id(), fr = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, il = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), cl = 1e6, jd = (e) => e >= "0" && e <= "9";
function ll(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= cl;
  }
  return !1;
}
function Ls(e, t) {
  return il.has(e) ? !1 : (e && ll(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function kd(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let r = "", n = "start", s = !1, a = 0;
  for (const o of e) {
    if (a++, s) {
      r += o, s = !1;
      continue;
    }
    if (o === "\\") {
      if (n === "index")
        throw new Error(`Invalid character '${o}' in an index at position ${a}`);
      if (n === "indexEnd")
        throw new Error(`Invalid character '${o}' after an index at position ${a}`);
      s = !0, n = n === "start" ? "property" : n;
      continue;
    }
    switch (o) {
      case ".": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (!Ls(r, t))
          return [];
        r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (n === "property" || n === "start") {
          if ((r || n === "property") && !Ls(r, t))
            return [];
          r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          if (r === "")
            r = (t.pop() || "") + "[]", n = "property";
          else {
            const c = Number.parseInt(r, 10);
            !Number.isNaN(c) && Number.isFinite(c) && c >= 0 && c <= Number.MAX_SAFE_INTEGER && c <= cl && r === String(c) ? t.push(c) : t.push(r), r = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        r += o;
        break;
      }
      default: {
        if (n === "index" && !jd(o))
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        n === "start" && (n = "property"), r += o;
      }
    }
  }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (!Ls(r, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function ys(e) {
  if (typeof e == "string")
    return kd(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [r, n] of e.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${r}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${r} must be a finite number, got ${n}`);
      if (il.has(n))
        return [];
      typeof n == "string" && ll(n) ? t.push(Number.parseInt(n, 10)) : t.push(n);
    }
    return t;
  }
  return [];
}
function ji(e, t, r) {
  if (!fr(e) || typeof t != "string" && !Array.isArray(t))
    return r === void 0 ? e : r;
  const n = ys(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function Nn(e, t, r) {
  if (!fr(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const n = e, s = ys(t);
  if (s.length === 0)
    return e;
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    if (a === s.length - 1)
      e[o] = r;
    else if (!fr(e[o])) {
      const l = typeof s[a + 1] == "number";
      e[o] = l ? [] : {};
    }
    e = e[o];
  }
  return n;
}
function Ad(e, t) {
  if (!fr(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = ys(t);
  if (r.length === 0)
    return !1;
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (n === r.length - 1)
      return Object.hasOwn(e, s) ? (delete e[s], !0) : !1;
    if (e = e[s], !fr(e))
      return !1;
  }
}
function Vs(e, t) {
  if (!fr(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = ys(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!fr(e) || !(n in e))
      return !1;
    e = e[n];
  }
  return !0;
}
const jt = ol.homedir(), Na = ol.tmpdir(), { env: Sr } = de, Cd = (e) => {
  const t = ae.join(jt, "Library");
  return {
    data: ae.join(t, "Application Support", e),
    config: ae.join(t, "Preferences", e),
    cache: ae.join(t, "Caches", e),
    log: ae.join(t, "Logs", e),
    temp: ae.join(Na, e)
  };
}, Dd = (e) => {
  const t = Sr.APPDATA || ae.join(jt, "AppData", "Roaming"), r = Sr.LOCALAPPDATA || ae.join(jt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ae.join(r, e, "Data"),
    config: ae.join(t, e, "Config"),
    cache: ae.join(r, e, "Cache"),
    log: ae.join(r, e, "Log"),
    temp: ae.join(Na, e)
  };
}, Md = (e) => {
  const t = ae.basename(jt);
  return {
    data: ae.join(Sr.XDG_DATA_HOME || ae.join(jt, ".local", "share"), e),
    config: ae.join(Sr.XDG_CONFIG_HOME || ae.join(jt, ".config"), e),
    cache: ae.join(Sr.XDG_CACHE_HOME || ae.join(jt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ae.join(Sr.XDG_STATE_HOME || ae.join(jt, ".local", "state"), e),
    temp: ae.join(Na, t, e)
  };
};
function Ld(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), de.platform === "darwin" ? Cd(e) : de.platform === "win32" ? Dd(e) : Md(e);
}
const Et = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    return e.apply(void 0, s).catch(r);
  };
}, mt = (e, t) => {
  const { onError: r } = t;
  return function(...s) {
    try {
      return e.apply(void 0, s);
    } catch (a) {
      return r(a);
    }
  };
}, Vd = 250, bt = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: a } = s, o = s.interval ?? Vd, c = Date.now() + a;
    return function l(...d) {
      return e.apply(void 0, d).catch((u) => {
        if (!r(u) || Date.now() >= c)
          throw u;
        const h = Math.round(o * Math.random());
        return h > 0 ? new Promise((g) => setTimeout(g, h)).then(() => l.apply(void 0, d)) : l.apply(void 0, d);
      });
    };
  };
}, St = (e, t) => {
  const { isRetriable: r } = t;
  return function(s) {
    const { timeout: a } = s, o = Date.now() + a;
    return function(...l) {
      for (; ; )
        try {
          return e.apply(void 0, l);
        } catch (d) {
          if (!r(d) || Date.now() >= o)
            throw d;
          continue;
        }
    };
  };
}, Pr = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!Pr.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !Fd && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!Pr.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!Pr.isNodeError(e))
      throw e;
    if (!Pr.isChangeErrorOk(e))
      throw e;
  }
}, Rn = {
  onError: Pr.onChangeError
}, Ue = {
  onError: () => {
  }
}, Fd = de.getuid ? !de.getuid() : !1, Pe = {
  isRetriable: Pr.isRetriableError
}, Oe = {
  attempt: {
    /* ASYNC */
    chmod: Et(Se(Y.chmod), Rn),
    chown: Et(Se(Y.chown), Rn),
    close: Et(Se(Y.close), Ue),
    fsync: Et(Se(Y.fsync), Ue),
    mkdir: Et(Se(Y.mkdir), Ue),
    realpath: Et(Se(Y.realpath), Ue),
    stat: Et(Se(Y.stat), Ue),
    unlink: Et(Se(Y.unlink), Ue),
    /* SYNC */
    chmodSync: mt(Y.chmodSync, Rn),
    chownSync: mt(Y.chownSync, Rn),
    closeSync: mt(Y.closeSync, Ue),
    existsSync: mt(Y.existsSync, Ue),
    fsyncSync: mt(Y.fsync, Ue),
    mkdirSync: mt(Y.mkdirSync, Ue),
    realpathSync: mt(Y.realpathSync, Ue),
    statSync: mt(Y.statSync, Ue),
    unlinkSync: mt(Y.unlinkSync, Ue)
  },
  retry: {
    /* ASYNC */
    close: bt(Se(Y.close), Pe),
    fsync: bt(Se(Y.fsync), Pe),
    open: bt(Se(Y.open), Pe),
    readFile: bt(Se(Y.readFile), Pe),
    rename: bt(Se(Y.rename), Pe),
    stat: bt(Se(Y.stat), Pe),
    write: bt(Se(Y.write), Pe),
    writeFile: bt(Se(Y.writeFile), Pe),
    /* SYNC */
    closeSync: St(Y.closeSync, Pe),
    fsyncSync: St(Y.fsyncSync, Pe),
    openSync: St(Y.openSync, Pe),
    readFileSync: St(Y.readFileSync, Pe),
    renameSync: St(Y.renameSync, Pe),
    statSync: St(Y.statSync, Pe),
    writeSync: St(Y.writeSync, Pe),
    writeFileSync: St(Y.writeFileSync, Pe)
  }
}, zd = "utf8", ki = 438, Ud = 511, qd = {}, Kd = de.geteuid ? de.geteuid() : -1, Gd = de.getegid ? de.getegid() : -1, Hd = 1e3, Wd = !!de.getuid;
de.getuid && de.getuid();
const Ai = 128, Bd = (e) => e instanceof Error && "code" in e, Ci = (e) => typeof e == "string", Fs = (e) => e === void 0, Xd = de.platform === "linux", ul = de.platform === "win32", Ra = ["SIGHUP", "SIGINT", "SIGTERM"];
ul || Ra.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Xd && Ra.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class Jd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (ul && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? de.kill(de.pid, "SIGTERM") : de.kill(de.pid, t));
      }
    }, this.hook = () => {
      de.once("exit", () => this.exit());
      for (const t of Ra)
        try {
          de.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Yd = new Jd(), Qd = Yd.register, Te = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Te.truncate(t(e));
    return n in Te.store ? Te.get(e, t, r) : (Te.store[n] = r, [n, () => delete Te.store[n]]);
  },
  purge: (e) => {
    Te.store[e] && (delete Te.store[e], Oe.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Te.store[e] && (delete Te.store[e], Oe.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Te.store)
      Te.purgeSync(e);
  },
  truncate: (e) => {
    const t = ae.basename(e);
    if (t.length <= Ai)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - Ai;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Qd(Te.purgeSyncAll);
function dl(e, t, r = qd) {
  if (Ci(r))
    return dl(e, t, { encoding: r });
  const s = { timeout: r.timeout ?? Hd };
  let a = null, o = null, c = null;
  try {
    const l = Oe.attempt.realpathSync(e), d = !!l;
    e = l || e, [o, a] = Te.get(e, r.tmpCreate || Te.create, r.tmpPurge !== !1);
    const u = Wd && Fs(r.chown), h = Fs(r.mode);
    if (d && (u || h)) {
      const E = Oe.attempt.statSync(e);
      E && (r = { ...r }, u && (r.chown = { uid: E.uid, gid: E.gid }), h && (r.mode = E.mode));
    }
    if (!d) {
      const E = ae.dirname(e);
      Oe.attempt.mkdirSync(E, {
        mode: Ud,
        recursive: !0
      });
    }
    c = Oe.retry.openSync(s)(o, "w", r.mode || ki), r.tmpCreated && r.tmpCreated(o), Ci(t) ? Oe.retry.writeSync(s)(c, t, 0, r.encoding || zd) : Fs(t) || Oe.retry.writeSync(s)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Oe.retry.fsyncSync(s)(c) : Oe.attempt.fsync(c)), Oe.retry.closeSync(s)(c), c = null, r.chown && (r.chown.uid !== Kd || r.chown.gid !== Gd) && Oe.attempt.chownSync(o, r.chown.uid, r.chown.gid), r.mode && r.mode !== ki && Oe.attempt.chmodSync(o, r.mode);
    try {
      Oe.retry.renameSync(s)(o, e);
    } catch (E) {
      if (!Bd(E) || E.code !== "ENAMETOOLONG")
        throw E;
      Oe.retry.renameSync(s)(o, Te.truncate(e));
    }
    a(), o = null;
  } finally {
    c && Oe.attempt.closeSync(c), o && Te.purge(o);
  }
}
function fl(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ia = { exports: {} }, hl = {}, et = {}, kr = {}, _n = {}, Q = {}, $n = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      c(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [g(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), c(N, v[R]), N.push(a, g(m[++R]));
    return l(N), new n(N);
  }
  e.str = o;
  function c(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = c;
  function l(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = d(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function u(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(g(m));
  }
  e.stringify = E;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function w(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = w;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function $(m) {
    return new n(m.toString());
  }
  e.regexpCode = $;
})($n);
var ca = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = $n;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const o = (0, t._)`\n`;
  class c extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const E = this.toName(d), { prefix: g } = E, w = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[g];
      if (_) {
        const v = _.get(w);
        if (v)
          return v;
      } else
        _ = this._values[g] = /* @__PURE__ */ new Map();
      _.set(w, E);
      const $ = this._scope[g] || (this._scope[g] = []), m = $.length;
      return $[m] = u.ref, E.setValue(u, { property: g, itemIndex: m }), E;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (E) => {
        if (E.value === void 0)
          throw new Error(`CodeGen: name "${E}" has no value`);
        return E.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, E) {
      let g = t.nil;
      for (const w in d) {
        const _ = d[w];
        if (!_)
          continue;
        const $ = h[w] = h[w] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if ($.has(m))
            return;
          $.set(m, n.Started);
          let v = u(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = E == null ? void 0 : E(m))
            g = (0, t._)`${g}${v}${this.opts._n}`;
          else
            throw new r(m);
          $.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = c;
})(ca);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = $n, r = ca;
  var n = $n;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = ca;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, b) {
      super(), this.varKind = i, this.name = f, this.rhs = b;
    }
    render({ es5: i, _n: f }) {
      const b = i ? r.varKinds.var : this.varKind, T = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${T};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = I(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = I(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return se(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, b, T) {
      super(i, b, T), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = I(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, b) => f + b.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const b = i[f].optimizeNodes();
        Array.isArray(b) ? i.splice(f, 1, ...b) : b ? i[f] = b : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: b } = this;
      let T = b.length;
      for (; T--; ) {
        const j = b[T];
        j.optimizeNames(i, f) || (k(i, j.names), b.splice(T, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class w extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class _ extends g {
  }
  class $ extends w {
  }
  $.kind = "else";
  class m extends w {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const b = f.optimizeNodes();
        f = this.else = Array.isArray(b) ? new $(b) : b;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(L(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = I(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return se(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = I(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, b, T) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = T;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: T, to: j } = this;
      return `for(${f} ${b}=${T}; ${b}<${j}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = se(super.names, this.from);
      return se(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, b, T) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = T;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = I(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class K extends w {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  K.kind = "func";
  class X extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  X.kind = "return";
  class ue extends w {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, T;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (T = this.finally) === null || T === void 0 || T.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class fe extends w {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  fe.kind = "catch";
  class pe extends w {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  pe.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const b = this._extScope.value(i, f);
      return (this._values[b.prefix] || (this._values[b.prefix] = /* @__PURE__ */ new Set())).add(b), b;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, b, T) {
      const j = this._scope.toName(f);
      return b !== void 0 && T && (this._constants[j.str] = b), this._leafNode(new o(i, j, b)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, b) {
      return this._def(r.varKinds.const, i, f, b);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, b) {
      return this._def(r.varKinds.let, i, f, b);
    }
    // `var` declaration with optional assignment
    var(i, f, b) {
      return this._def(r.varKinds.var, i, f, b);
    }
    // assignment code
    assign(i, f, b) {
      return this._leafNode(new c(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, T] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== T || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, T));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, b) {
      if (this._blockNode(new m(i)), f && b)
        this.code(f).else().code(b).endIf();
      else if (f)
        this.code(f).endIf();
      else if (b)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new $());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, $);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, T, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, b), () => T(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, T = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(j, (0, t._)`${F}[${V}]`), b(j);
        });
      }
      return this._for(new O("of", T, j, f), () => b(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, T = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const j = this._scope.toName(i);
      return this._for(new O("in", T, j, f), () => b(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new X();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(X);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const T = new ue();
      if (this._blockNode(T), this.code(i), f) {
        const j = this.name("e");
        this._currNode = T.catch = new fe(j), f(j);
      }
      return b && (this._currNode = T.finally = new pe(), this.code(b)), this._endBlockNode(fe, pe);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const b = this._nodes.length - f;
      if (b < 0 || i !== void 0 && b !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${b} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, b, T) {
      return this._blockNode(new K(i, f, b)), T && this.code(T).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(K);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const b = this._currNode;
      if (b instanceof i || f && b instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) + (i[f] || 0);
    return y;
  }
  function se(y, i) {
    return i instanceof t._CodeOrName ? H(y, i.names) : y;
  }
  function I(y, i, f) {
    if (y instanceof t.Name)
      return b(y);
    if (!T(y))
      return y;
    return new t._Code(y._items.reduce((j, F) => (F instanceof t.Name && (F = b(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function b(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function T(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function k(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) - (i[f] || 0);
  }
  function L(y) {
    return typeof y == "boolean" || typeof y == "number" || y === null ? !y : (0, t._)`!${S(y)}`;
  }
  e.not = L;
  const D = p(e.operators.AND);
  function G(...y) {
    return y.reduce(D);
  }
  e.and = G;
  const M = p(e.operators.OR);
  function P(...y) {
    return y.reduce(M);
  }
  e.or = P;
  function p(y) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${y} ${S(f)}`;
  }
  function S(y) {
    return y instanceof t.Name ? y : (0, t._)`(${y})`;
  }
})(Q);
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
A.checkStrictMode = A.getErrorPath = A.Type = A.useFunc = A.setEvaluated = A.evaluatedPropsToName = A.mergeEvaluated = A.eachItem = A.unescapeJsonPointer = A.escapeJsonPointer = A.escapeFragment = A.unescapeFragment = A.schemaRefOrVal = A.schemaHasRulesButRef = A.schemaHasRules = A.checkUnknownRules = A.alwaysValidSchema = A.toHash = void 0;
const oe = Q, Zd = $n;
function xd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
A.toHash = xd;
function ef(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (ml(e, t), !pl(t, e.self.RULES.all));
}
A.alwaysValidSchema = ef;
function ml(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || gl(e, `unknown keyword: "${a}"`);
}
A.checkUnknownRules = ml;
function pl(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
A.schemaHasRules = pl;
function tf(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
A.schemaHasRulesButRef = tf;
function rf({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, oe._)`${r}`;
  }
  return (0, oe._)`${e}${t}${(0, oe.getProperty)(n)}`;
}
A.schemaRefOrVal = rf;
function nf(e) {
  return yl(decodeURIComponent(e));
}
A.unescapeFragment = nf;
function sf(e) {
  return encodeURIComponent(Oa(e));
}
A.escapeFragment = sf;
function Oa(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
A.escapeJsonPointer = Oa;
function yl(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
A.unescapeJsonPointer = yl;
function af(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
A.eachItem = af;
function Di({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof oe.Name ? (a instanceof oe.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof oe.Name ? (t(s, o, a), a) : r(a, o);
    return c === oe.Name && !(l instanceof oe.Name) ? n(s, l) : l;
  };
}
A.mergeEvaluated = {
  props: Di({
    mergeNames: (e, t, r) => e.if((0, oe._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, oe._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, oe._)`${r} || {}`).code((0, oe._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, oe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, oe._)`${r} || {}`), Ta(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: $l
  }),
  items: Di({
    mergeNames: (e, t, r) => e.if((0, oe._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, oe._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, oe._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, oe._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function $l(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, oe._)`{}`);
  return t !== void 0 && Ta(e, r, t), r;
}
A.evaluatedPropsToName = $l;
function Ta(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, oe._)`${t}${(0, oe.getProperty)(n)}`, !0));
}
A.setEvaluated = Ta;
const Mi = {};
function of(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Mi[t.code] || (Mi[t.code] = new Zd._Code(t.code))
  });
}
A.useFunc = of;
var la;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(la || (A.Type = la = {}));
function cf(e, t, r) {
  if (e instanceof oe.Name) {
    const n = t === la.Num;
    return r ? n ? (0, oe._)`"[" + ${e} + "]"` : (0, oe._)`"['" + ${e} + "']"` : n ? (0, oe._)`"/" + ${e}` : (0, oe._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, oe.getProperty)(e).toString() : "/" + Oa(e);
}
A.getErrorPath = cf;
function gl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
A.checkStrictMode = gl;
var qe = {};
Object.defineProperty(qe, "__esModule", { value: !0 });
const Ne = Q, lf = {
  // validation function arguments
  data: new Ne.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ne.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ne.Name("instancePath"),
  parentData: new Ne.Name("parentData"),
  parentDataProperty: new Ne.Name("parentDataProperty"),
  rootData: new Ne.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ne.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ne.Name("vErrors"),
  // null or array of validation errors
  errors: new Ne.Name("errors"),
  // counter of validation errors
  this: new Ne.Name("this"),
  // "globals"
  self: new Ne.Name("self"),
  scope: new Ne.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ne.Name("json"),
  jsonPos: new Ne.Name("jsonPos"),
  jsonLen: new Ne.Name("jsonLen"),
  jsonPart: new Ne.Name("jsonPart")
};
qe.default = lf;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = Q, r = A, n = qe;
  e.keywordError = {
    message: ({ keyword: $ }) => (0, t.str)`must pass "${$}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: $, schemaType: m }) => m ? (0, t.str)`"${$}" keyword must be ${m} ($data)` : (0, t.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, m = e.keywordError, v, N) {
    const { it: R } = $, { gen: O, compositeRule: K, allErrors: X } = R, ue = h($, m, v);
    N ?? (K || X) ? l(O, ue) : d(R, (0, t._)`[${ue}]`);
  }
  e.reportError = s;
  function a($, m = e.keywordError, v) {
    const { it: N } = $, { gen: R, compositeRule: O, allErrors: K } = N, X = h($, m, v);
    l(R, X), O || K || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o($, m) {
    $.assign(n.default.errors, m), $.if((0, t._)`${n.default.vErrors} !== null`, () => $.if(m, () => $.assign((0, t._)`${n.default.vErrors}.length`, m), () => $.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: $, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const K = $.name("err");
    $.forRange("i", R, n.default.errors, (X) => {
      $.const(K, (0, t._)`${n.default.vErrors}[${X}]`), $.if((0, t._)`${K}.instancePath === undefined`, () => $.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), $.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && ($.assign((0, t._)`${K}.schema`, v), $.assign((0, t._)`${K}.data`, N));
    });
  }
  e.extendErrors = c;
  function l($, m) {
    const v = $.const("err", m);
    $.if((0, t._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), $.code((0, t._)`${n.default.errors}++`);
  }
  function d($, m) {
    const { gen: v, validateName: N, schemaEnv: R } = $;
    R.$async ? v.throw((0, t._)`new ${$.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h($, m, v) {
    const { createErrors: N } = $.it;
    return N === !1 ? (0, t._)`{}` : E($, m, v);
  }
  function E($, m, v = {}) {
    const { gen: N, it: R } = $, O = [
      g(R, v),
      w($, v)
    ];
    return _($, m, O), N.object(...O);
  }
  function g({ errorPath: $ }, { instancePath: m }) {
    const v = m ? (0, t.str)`${$}${(0, r.getErrorPath)(m, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: $, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${$}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [u.schemaPath, R];
  }
  function _($, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: K, it: X } = $, { opts: ue, propertyName: fe, topSchemaRef: pe, schemaPath: z } = X;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m($) : m || (0, t._)`{}`]), ue.messages && N.push([u.message, typeof v == "function" ? v($) : v]), ue.verbose && N.push([u.schema, K], [u.parentSchema, (0, t._)`${pe}${z}`], [n.default.data, O]), fe && N.push([u.propertyName, fe]);
  }
})(_n);
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.boolOrEmptySchema = kr.topBoolOrEmptySchema = void 0;
const uf = _n, df = Q, ff = qe, hf = {
  message: "boolean schema is false"
};
function mf(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? _l(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(ff.default.data) : (t.assign((0, df._)`${n}.errors`, null), t.return(!0));
}
kr.topBoolOrEmptySchema = mf;
function pf(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), _l(e)) : r.var(t, !0);
}
kr.boolOrEmptySchema = pf;
function _l(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, uf.reportError)(s, hf, void 0, t);
}
var $e = {}, hr = {};
Object.defineProperty(hr, "__esModule", { value: !0 });
hr.getRules = hr.isJSONType = void 0;
const yf = ["string", "number", "integer", "boolean", "null", "object", "array"], $f = new Set(yf);
function gf(e) {
  return typeof e == "string" && $f.has(e);
}
hr.isJSONType = gf;
function _f() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
hr.getRules = _f;
var yt = {};
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.shouldUseRule = yt.shouldUseGroup = yt.schemaHasRulesForType = void 0;
function vf({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && vl(e, n);
}
yt.schemaHasRulesForType = vf;
function vl(e, t) {
  return t.rules.some((r) => wl(e, r));
}
yt.shouldUseGroup = vl;
function wl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
yt.shouldUseRule = wl;
Object.defineProperty($e, "__esModule", { value: !0 });
$e.reportTypeError = $e.checkDataTypes = $e.checkDataType = $e.coerceAndCheckDataType = $e.getJSONTypes = $e.getSchemaTypes = $e.DataType = void 0;
const wf = hr, Ef = yt, bf = _n, Z = Q, El = A;
var Rr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Rr || ($e.DataType = Rr = {}));
function Sf(e) {
  const t = bl(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
$e.getSchemaTypes = Sf;
function bl(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(wf.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
$e.getJSONTypes = bl;
function Pf(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Nf(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Ef.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = Ia(t, n, s.strictNumbers, Rr.Wrong);
    r.if(c, () => {
      a.length ? Rf(e, t, a) : ja(e);
    });
  }
  return o;
}
$e.coerceAndCheckDataType = Pf;
const Sl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Nf(e, t) {
  return t ? e.filter((r) => Sl.has(r) || t === "array" && r === "array") : [];
}
function Rf(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Z._)`typeof ${s}`), c = n.let("coerced", (0, Z._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Z._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Z._)`${s}[0]`).assign(o, (0, Z._)`typeof ${s}`).if(Ia(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, Z._)`${c} !== undefined`);
  for (const d of r)
    (Sl.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), ja(e), n.endIf(), n.if((0, Z._)`${c} !== undefined`, () => {
    n.assign(s, c), Of(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, Z._)`${o} == "number" || ${o} == "boolean"`).assign(c, (0, Z._)`"" + ${s}`).elseIf((0, Z._)`${s} === null`).assign(c, (0, Z._)`""`);
        return;
      case "number":
        n.elseIf((0, Z._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, Z._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, Z._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, Z._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, Z._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, Z._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, Z._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, Z._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(c, (0, Z._)`[${s}]`);
    }
  }
}
function Of({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Z._)`${t} !== undefined`, () => e.assign((0, Z._)`${t}[${r}]`, n));
}
function ua(e, t, r, n = Rr.Correct) {
  const s = n === Rr.Correct ? Z.operators.EQ : Z.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, Z._)`${t} ${s} null`;
    case "array":
      a = (0, Z._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, Z._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, Z._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, Z._)`typeof ${t} ${s} ${e}`;
  }
  return n === Rr.Correct ? a : (0, Z.not)(a);
  function o(c = Z.nil) {
    return (0, Z.and)((0, Z._)`typeof ${t} == "number"`, c, r ? (0, Z._)`isFinite(${t})` : Z.nil);
  }
}
$e.checkDataType = ua;
function Ia(e, t, r, n) {
  if (e.length === 1)
    return ua(e[0], t, r, n);
  let s;
  const a = (0, El.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Z._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Z._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Z.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Z.and)(s, ua(o, t, r, n));
  return s;
}
$e.checkDataTypes = Ia;
const Tf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Z._)`{type: ${e}}` : (0, Z._)`{type: ${t}}`
};
function ja(e) {
  const t = If(e);
  (0, bf.reportError)(t, Tf);
}
$e.reportTypeError = ja;
function If(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, El.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var $s = {};
Object.defineProperty($s, "__esModule", { value: !0 });
$s.assignDefaults = void 0;
const yr = Q, jf = A;
function kf(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      Li(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => Li(e, a, s.default));
}
$s.assignDefaults = kf;
function Li(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const c = (0, yr._)`${a}${(0, yr.getProperty)(t)}`;
  if (s) {
    (0, jf.checkStrictMode)(e, `default is ignored for: ${c}`);
    return;
  }
  let l = (0, yr._)`${c} === undefined`;
  o.useDefaults === "empty" && (l = (0, yr._)`${l} || ${c} === null || ${c} === ""`), n.if(l, (0, yr._)`${c} = ${(0, yr.stringify)(r)}`);
}
var lt = {}, te = {};
Object.defineProperty(te, "__esModule", { value: !0 });
te.validateUnion = te.validateArray = te.usePattern = te.callValidateCode = te.schemaProperties = te.allSchemaProperties = te.noPropertyInData = te.propertyInData = te.isOwnProperty = te.hasPropFunc = te.reportMissingProp = te.checkMissingProp = te.checkReportMissingProp = void 0;
const ce = Q, ka = A, Pt = qe, Af = A;
function Cf(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Ca(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ce._)`${t}` }, !0), e.error();
  });
}
te.checkReportMissingProp = Cf;
function Df({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ce.or)(...n.map((a) => (0, ce.and)(Ca(e, t, a, r.ownProperties), (0, ce._)`${s} = ${a}`)));
}
te.checkMissingProp = Df;
function Mf(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
te.reportMissingProp = Mf;
function Pl(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ce._)`Object.prototype.hasOwnProperty`
  });
}
te.hasPropFunc = Pl;
function Aa(e, t, r) {
  return (0, ce._)`${Pl(e)}.call(${t}, ${r})`;
}
te.isOwnProperty = Aa;
function Lf(e, t, r, n) {
  const s = (0, ce._)`${t}${(0, ce.getProperty)(r)} !== undefined`;
  return n ? (0, ce._)`${s} && ${Aa(e, t, r)}` : s;
}
te.propertyInData = Lf;
function Ca(e, t, r, n) {
  const s = (0, ce._)`${t}${(0, ce.getProperty)(r)} === undefined`;
  return n ? (0, ce.or)(s, (0, ce.not)(Aa(e, t, r))) : s;
}
te.noPropertyInData = Ca;
function Nl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
te.allSchemaProperties = Nl;
function Vf(e, t) {
  return Nl(t).filter((r) => !(0, ka.alwaysValidSchema)(e, t[r]));
}
te.schemaProperties = Vf;
function Ff({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, ce._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Pt.default.instancePath, (0, ce.strConcat)(Pt.default.instancePath, a)],
    [Pt.default.parentData, o.parentData],
    [Pt.default.parentDataProperty, o.parentDataProperty],
    [Pt.default.rootData, Pt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Pt.default.dynamicAnchors, Pt.default.dynamicAnchors]);
  const E = (0, ce._)`${u}, ${r.object(...h)}`;
  return l !== ce.nil ? (0, ce._)`${c}.call(${l}, ${E})` : (0, ce._)`${c}(${E})`;
}
te.callValidateCode = Ff;
const zf = (0, ce._)`new RegExp`;
function Uf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ce._)`${s.code === "new RegExp" ? zf : (0, Af.useFunc)(e, s)}(${r}, ${n})`
  });
}
te.usePattern = Uf;
function qf(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return o(() => t.assign(c, !1)), c;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(c) {
    const l = t.const("len", (0, ce._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: ka.Type.Num
      }, a), t.if((0, ce.not)(a), c);
    });
  }
}
te.validateArray = qf;
function Kf(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, ka.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(o, (0, ce._)`${o} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, ce.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
te.validateUnion = Kf;
Object.defineProperty(lt, "__esModule", { value: !0 });
lt.validateKeywordUsage = lt.validSchemaType = lt.funcKeywordCode = lt.macroKeywordCode = void 0;
const Ie = Q, rr = qe, Gf = te, Hf = _n;
function Wf(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, c = t.macro.call(o.self, s, a, o), l = Rl(r, n, c);
  o.opts.validateSchema !== !1 && o.self.validateSchema(c, !0);
  const d = r.name("valid");
  e.subschema({
    schema: c,
    schemaPath: Ie.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
lt.macroKeywordCode = Wf;
function Bf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: c, it: l } = e;
  Jf(l, t);
  const d = !c && t.compile ? t.compile.call(l.self, a, o, l) : t.validate, u = Rl(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      _(), t.modifying && Vi(e), $(() => e.error());
    else {
      const m = t.async ? g() : w();
      t.modifying && Vi(e), $(() => Xf(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => _((0, Ie._)`await `), (v) => n.assign(h, !1).if((0, Ie._)`${v} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Ie._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, Ie._)`${u}.errors`;
    return n.assign(m, null), _(Ie.nil), m;
  }
  function _(m = t.async ? (0, Ie._)`await ` : Ie.nil) {
    const v = l.opts.passContext ? rr.default.this : rr.default.self, N = !("compile" in t && !c || t.schema === !1);
    n.assign(h, (0, Ie._)`${m}${(0, Gf.callValidateCode)(e, u, v, N)}`, t.modifying);
  }
  function $(m) {
    var v;
    n.if((0, Ie.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
lt.funcKeywordCode = Bf;
function Vi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Ie._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Xf(e, t) {
  const { gen: r } = e;
  r.if((0, Ie._)`Array.isArray(${t})`, () => {
    r.assign(rr.default.vErrors, (0, Ie._)`${rr.default.vErrors} === null ? ${t} : ${rr.default.vErrors}.concat(${t})`).assign(rr.default.errors, (0, Ie._)`${rr.default.vErrors}.length`), (0, Hf.extendErrors)(e);
  }, () => e.error());
}
function Jf({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function Rl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Ie.stringify)(r) });
}
function Yf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
lt.validSchemaType = Yf;
function Qf({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((c) => !Object.prototype.hasOwnProperty.call(e, c)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
lt.validateKeywordUsage = Qf;
var Lt = {};
Object.defineProperty(Lt, "__esModule", { value: !0 });
Lt.extendSubschemaMode = Lt.extendSubschemaData = Lt.getSubschema = void 0;
const it = Q, Ol = A;
function Zf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const c = e.schema[t];
    return r === void 0 ? {
      schema: c,
      schemaPath: (0, it._)`${e.schemaPath}${(0, it.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: c[r],
      schemaPath: (0, it._)`${e.schemaPath}${(0, it.getProperty)(t)}${(0, it.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, Ol.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Lt.getSubschema = Zf;
function xf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: c } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = c.let("data", (0, it._)`${t.data}${(0, it.getProperty)(r)}`, !0);
    l(E), e.errorPath = (0, it.str)`${d}${(0, Ol.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, it._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof it.Name ? s : c.let("data", s, !0);
    l(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function l(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Lt.extendSubschemaData = xf;
function eh(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Lt.extendSubschemaMode = eh;
var Ee = {}, gs = function e(t, r) {
  if (t === r) return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor) return !1;
    var n, s, a;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!e(t[s], r[s])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
    if (a = Object.keys(t), n = a.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, a[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var o = a[s];
      if (!e(t[o], r[o])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, Tl = { exports: {} }, Dt = Tl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Xn(t, n, s, e, "", e);
};
Dt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Dt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Dt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Dt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function Xn(e, t, r, n, s, a, o, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Dt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            Xn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in Dt.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            Xn(e, t, r, h[g], s + "/" + u + "/" + th(g), a, s, u, n, g);
      } else (u in Dt.keywords || e.allKeys && !(u in Dt.skipKeywords)) && Xn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function th(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var rh = Tl.exports;
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.getSchemaRefs = Ee.resolveUrl = Ee.normalizeId = Ee._getFullPath = Ee.getFullPath = Ee.inlineRef = void 0;
const nh = A, sh = gs, ah = rh, oh = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function ih(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !da(e) : t ? Il(e) <= t : !1;
}
Ee.inlineRef = ih;
const ch = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function da(e) {
  for (const t in e) {
    if (ch.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(da) || typeof r == "object" && da(r))
      return !0;
  }
  return !1;
}
function Il(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !oh.has(r) && (typeof e[r] == "object" && (0, nh.eachItem)(e[r], (n) => t += Il(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function jl(e, t = "", r) {
  r !== !1 && (t = Or(t));
  const n = e.parse(t);
  return kl(e, n);
}
Ee.getFullPath = jl;
function kl(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Ee._getFullPath = kl;
const lh = /#\/?$/;
function Or(e) {
  return e ? e.replace(lh, "") : "";
}
Ee.normalizeId = Or;
function uh(e, t, r) {
  return r = Or(r), e.resolve(t, r);
}
Ee.resolveUrl = uh;
const dh = /^[a-z_][-a-z0-9._]*$/i;
function fh(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Or(e[r] || t), a = { "": s }, o = jl(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return ah(e, { allKeys: !0 }, (h, E, g, w) => {
    if (w === void 0)
      return;
    const _ = o + E;
    let $ = a[w];
    typeof h[r] == "string" && ($ = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[E] = $;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = Or($ ? R($, N) : N), l.has(N))
        throw u(N);
      l.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== Or(_) && (N[0] === "#" ? (d(h, c[N], N), c[N] = h) : this.refs[N] = _), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!dh.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), c;
  function d(h, E, g) {
    if (E !== void 0 && !sh(h, E))
      throw u(g);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Ee.getSchemaRefs = fh;
Object.defineProperty(et, "__esModule", { value: !0 });
et.getData = et.KeywordCxt = et.validateFunctionCode = void 0;
const Al = kr, Fi = $e, Da = yt, as = $e, hh = $s, an = lt, zs = Lt, U = Q, W = qe, mh = Ee, $t = A, Xr = _n;
function ph(e) {
  if (Ml(e) && (Ll(e), Dl(e))) {
    gh(e);
    return;
  }
  Cl(e, () => (0, Al.topBoolOrEmptySchema)(e));
}
et.validateFunctionCode = ph;
function Cl({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, U._)`${W.default.data}, ${W.default.valCxt}`, n.$async, () => {
    e.code((0, U._)`"use strict"; ${zi(r, s)}`), $h(e, s), e.code(a);
  }) : e.func(t, (0, U._)`${W.default.data}, ${yh(s)}`, n.$async, () => e.code(zi(r, s)).code(a));
}
function yh(e) {
  return (0, U._)`{${W.default.instancePath}="", ${W.default.parentData}, ${W.default.parentDataProperty}, ${W.default.rootData}=${W.default.data}${e.dynamicRef ? (0, U._)`, ${W.default.dynamicAnchors}={}` : U.nil}}={}`;
}
function $h(e, t) {
  e.if(W.default.valCxt, () => {
    e.var(W.default.instancePath, (0, U._)`${W.default.valCxt}.${W.default.instancePath}`), e.var(W.default.parentData, (0, U._)`${W.default.valCxt}.${W.default.parentData}`), e.var(W.default.parentDataProperty, (0, U._)`${W.default.valCxt}.${W.default.parentDataProperty}`), e.var(W.default.rootData, (0, U._)`${W.default.valCxt}.${W.default.rootData}`), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, U._)`${W.default.valCxt}.${W.default.dynamicAnchors}`);
  }, () => {
    e.var(W.default.instancePath, (0, U._)`""`), e.var(W.default.parentData, (0, U._)`undefined`), e.var(W.default.parentDataProperty, (0, U._)`undefined`), e.var(W.default.rootData, W.default.data), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, U._)`{}`);
  });
}
function gh(e) {
  const { schema: t, opts: r, gen: n } = e;
  Cl(e, () => {
    r.$comment && t.$comment && Fl(e), bh(e), n.let(W.default.vErrors, null), n.let(W.default.errors, 0), r.unevaluated && _h(e), Vl(e), Nh(e);
  });
}
function _h(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, U._)`${r}.evaluated`), t.if((0, U._)`${e.evaluated}.dynamicProps`, () => t.assign((0, U._)`${e.evaluated}.props`, (0, U._)`undefined`)), t.if((0, U._)`${e.evaluated}.dynamicItems`, () => t.assign((0, U._)`${e.evaluated}.items`, (0, U._)`undefined`));
}
function zi(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, U._)`/*# sourceURL=${r} */` : U.nil;
}
function vh(e, t) {
  if (Ml(e) && (Ll(e), Dl(e))) {
    wh(e, t);
    return;
  }
  (0, Al.boolOrEmptySchema)(e, t);
}
function Dl({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function Ml(e) {
  return typeof e.schema != "boolean";
}
function wh(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Fl(e), Sh(e), Ph(e);
  const a = n.const("_errs", W.default.errors);
  Vl(e, a), n.var(t, (0, U._)`${a} === ${W.default.errors}`);
}
function Ll(e) {
  (0, $t.checkUnknownRules)(e), Eh(e);
}
function Vl(e, t) {
  if (e.opts.jtd)
    return Ui(e, [], !1, t);
  const r = (0, Fi.getSchemaTypes)(e.schema), n = (0, Fi.coerceAndCheckDataType)(e, r);
  Ui(e, r, !n, t);
}
function Eh(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, $t.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function bh(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, $t.checkStrictMode)(e, "default is ignored in the schema root");
}
function Sh(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, mh.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Ph(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Fl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, U._)`${W.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, U.str)`${n}/$comment`, c = e.scopeValue("root", { ref: t.root });
    e.code((0, U._)`${W.default.self}.opts.$comment(${a}, ${o}, ${c}.schema)`);
  }
}
function Nh(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, U._)`${W.default.errors} === 0`, () => t.return(W.default.data), () => t.throw((0, U._)`new ${s}(${W.default.vErrors})`)) : (t.assign((0, U._)`${n}.errors`, W.default.vErrors), a.unevaluated && Rh(e), t.return((0, U._)`${W.default.errors} === 0`));
}
function Rh({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof U.Name && e.assign((0, U._)`${t}.props`, r), n instanceof U.Name && e.assign((0, U._)`${t}.items`, n);
}
function Ui(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: c, opts: l, self: d } = e, { RULES: u } = d;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, $t.schemaHasRulesButRef)(a, u))) {
    s.block(() => ql(e, "$ref", u.all.$ref.definition));
    return;
  }
  l.jtd || Oh(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, Da.shouldUseGroup)(a, E) && (E.type ? (s.if((0, as.checkDataType)(E.type, o, l.strictNumbers)), qi(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, as.reportTypeError)(e)), s.endIf()) : qi(e, E), c || s.if((0, U._)`${W.default.errors} === ${n || 0}`));
  }
}
function qi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, hh.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Da.shouldUseRule)(n, a) && ql(e, a.keyword, a.definition, t.type);
  });
}
function Oh(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Th(e, t), e.opts.allowUnionTypes || Ih(e, t), jh(e, e.dataTypes));
}
function Th(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      zl(e.dataTypes, r) || Ma(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Ah(e, t);
  }
}
function Ih(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Ma(e, "use allowUnionTypes to allow union type keyword");
}
function jh(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Da.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => kh(t, o)) && Ma(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function kh(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function zl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Ah(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    zl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Ma(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, $t.checkStrictMode)(e, t, e.opts.strictTypes);
}
let Ul = class {
  constructor(t, r, n) {
    if ((0, an.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, $t.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Kl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, an.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", W.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, U.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, U.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, U._)`${r} !== undefined && (${(0, U.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Xr.reportExtraError : Xr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Xr.reportError)(this, this.def.$dataError || Xr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Xr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = U.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = U.nil, r = U.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, U.or)((0, U._)`${s} === undefined`, r)), t !== U.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== U.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, U.or)(o(), c());
    function o() {
      if (n.length) {
        if (!(r instanceof U.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, U._)`${(0, as.checkDataTypes)(l, r, a.opts.strictNumbers, as.DataType.Wrong)}`;
      }
      return U.nil;
    }
    function c() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, U._)`!${l}(${r})`;
      }
      return U.nil;
    }
  }
  subschema(t, r) {
    const n = (0, zs.getSubschema)(this.it, t);
    (0, zs.extendSubschemaData)(n, this.it, t), (0, zs.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return vh(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = $t.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = $t.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, U.Name)), !0;
  }
};
et.KeywordCxt = Ul;
function ql(e, t, r, n) {
  const s = new Ul(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, an.funcKeywordCode)(s, r) : "macro" in r ? (0, an.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, an.funcKeywordCode)(s, r);
}
const Ch = /^\/(?:[^~]|~0|~1)*$/, Dh = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Kl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return W.default.rootData;
  if (e[0] === "/") {
    if (!Ch.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = W.default.rootData;
  } else {
    const d = Dh.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(l("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(l("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const c = s.split("/");
  for (const d of c)
    d && (a = (0, U._)`${a}${(0, U.getProperty)((0, $t.unescapeJsonPointer)(d))}`, o = (0, U._)`${o} && ${a}`);
  return o;
  function l(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
et.getData = Kl;
var vn = {};
Object.defineProperty(vn, "__esModule", { value: !0 });
let Mh = class extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
};
vn.default = Mh;
var Mr = {};
Object.defineProperty(Mr, "__esModule", { value: !0 });
const Us = Ee;
let Lh = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Us.resolveUrl)(t, r, n), this.missingSchema = (0, Us.normalizeId)((0, Us.getFullPath)(t, this.missingRef));
  }
};
Mr.default = Lh;
var ke = {};
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.resolveSchema = ke.getCompilingSchema = ke.resolveRef = ke.compileSchema = ke.SchemaEnv = void 0;
const Xe = Q, Vh = vn, er = qe, Ze = Ee, Ki = A, Fh = et;
let _s = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Ze.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
ke.SchemaEnv = _s;
function La(e) {
  const t = Gl.call(this, e);
  if (t)
    return t;
  const r = (0, Ze.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Xe.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: Vh.default,
    code: (0, Xe._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: er.default.data,
    parentData: er.default.parentData,
    parentDataProperty: er.default.parentDataProperty,
    dataNames: [er.default.data],
    dataPathArr: [Xe.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Xe.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Xe.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Xe._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, Fh.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(er.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const g = new Function(`${er.default.self}`, `${er.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: _ } = d;
      g.evaluated = {
        props: w instanceof Xe.Name ? void 0 : w,
        items: _ instanceof Xe.Name ? void 0 : _,
        dynamicProps: w instanceof Xe.Name,
        dynamicItems: _ instanceof Xe.Name
      }, g.source && (g.source.evaluated = (0, Xe.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
ke.compileSchema = La;
function zh(e, t, r) {
  var n;
  r = (0, Ze.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = Kh.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new _s({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = Uh.call(this, a);
}
ke.resolveRef = zh;
function Uh(e) {
  return (0, Ze.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : La.call(this, e);
}
function Gl(e) {
  for (const t of this._compilations)
    if (qh(t, e))
      return t;
}
ke.getCompilingSchema = Gl;
function qh(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Kh(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || vs.call(this, e, t);
}
function vs(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Ze._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Ze.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return qs.call(this, r, e);
  const a = (0, Ze.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = vs.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : qs.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || La.call(this, o), a === (0, Ze.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, Ze.resolveUrl)(this.opts.uriResolver, s, d)), new _s({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return qs.call(this, r, o);
  }
}
ke.resolveSchema = vs;
const Gh = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function qs(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, Ki.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Gh.has(c) && d && (t = (0, Ze.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ki.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, Ze.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = vs.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new _s({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Hh = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Wh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Bh = "object", Xh = [
  "$data"
], Jh = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Yh = !1, Qh = {
  $id: Hh,
  description: Wh,
  type: Bh,
  required: Xh,
  properties: Jh,
  additionalProperties: Yh
};
var Va = {}, ws = { exports: {} };
const Zh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Hl = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Wl(e) {
  let t = "", r = 0, n = 0;
  for (n = 0; n < e.length; n++)
    if (r = e[n].charCodeAt(0), r !== 48) {
      if (!(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
        return "";
      t += e[n];
      break;
    }
  for (n += 1; n < e.length; n++) {
    if (r = e[n].charCodeAt(0), !(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
      return "";
    t += e[n];
  }
  return t;
}
const xh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function Gi(e) {
  return e.length = 0, !0;
}
function em(e, t, r) {
  if (e.length) {
    const n = Wl(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function tm(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, c = em;
  for (let l = 0; l < e.length; l++) {
    const d = e[l];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (o = !0), !c(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        l > 0 && e[l - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!c(s, n, r))
          break;
        c = Gi;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (c === Gi ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(Wl(s))), r.address = n.join(""), r;
}
function Bl(e) {
  if (rm(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = tm(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function rm(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function nm(e) {
  let t = e;
  const r = [];
  let n = -1, s = 0;
  for (; s = t.length; ) {
    if (s === 1) {
      if (t === ".")
        break;
      if (t === "/") {
        r.push("/");
        break;
      } else {
        r.push(t);
        break;
      }
    } else if (s === 2) {
      if (t[0] === ".") {
        if (t[1] === ".")
          break;
        if (t[1] === "/") {
          t = t.slice(2);
          continue;
        }
      } else if (t[0] === "/" && (t[1] === "." || t[1] === "/")) {
        r.push("/");
        break;
      }
    } else if (s === 3 && t === "/..") {
      r.length !== 0 && r.pop(), r.push("/");
      break;
    }
    if (t[0] === ".") {
      if (t[1] === ".") {
        if (t[2] === "/") {
          t = t.slice(3);
          continue;
        }
      } else if (t[1] === "/") {
        t = t.slice(2);
        continue;
      }
    } else if (t[0] === "/" && t[1] === ".") {
      if (t[2] === "/") {
        t = t.slice(2);
        continue;
      } else if (t[2] === "." && t[3] === "/") {
        t = t.slice(3), r.length !== 0 && r.pop();
        continue;
      }
    }
    if ((n = t.indexOf("/", 1)) === -1) {
      r.push(t);
      break;
    } else
      r.push(t.slice(0, n)), t = t.slice(n);
  }
  return r.join("");
}
function sm(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function am(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!Hl(r)) {
      const n = Bl(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Xl = {
  nonSimpleDomain: xh,
  recomposeAuthority: am,
  normalizeComponentEncoding: sm,
  removeDotSegments: nm,
  isIPv4: Hl,
  isUUID: Zh,
  normalizeIPv6: Bl
};
const { isUUID: om } = Xl, im = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Jl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Yl(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Ql(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function cm(e) {
  return e.secure = Jl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function lm(e) {
  if ((e.port === (Jl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function um(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(im);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = Fa(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function dm(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = Fa(s);
  a && (e = a.serialize(e, t));
  const o = e, c = e.nss;
  return o.path = `${n || t.nid}:${c}`, t.skipEscape = !0, o;
}
function fm(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !om(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function hm(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Zl = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Yl,
    serialize: Ql
  }
), mm = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Zl.domainHost,
    parse: Yl,
    serialize: Ql
  }
), Jn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: cm,
    serialize: lm
  }
), pm = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Jn.domainHost,
    parse: Jn.parse,
    serialize: Jn.serialize
  }
), ym = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: um,
    serialize: dm,
    skipNormalize: !0
  }
), $m = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: fm,
    serialize: hm,
    skipNormalize: !0
  }
), os = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Zl,
    https: mm,
    ws: Jn,
    wss: pm,
    urn: ym,
    "urn:uuid": $m
  }
);
Object.setPrototypeOf(os, null);
function Fa(e) {
  return e && (os[
    /** @type {SchemeName} */
    e
  ] || os[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var gm = {
  SCHEMES: os,
  getSchemeHandler: Fa
};
const { normalizeIPv6: _m, removeDotSegments: en, recomposeAuthority: vm, normalizeComponentEncoding: On, isIPv4: wm, nonSimpleDomain: Em } = Xl, { SCHEMES: bm, getSchemeHandler: xl } = gm;
function Sm(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  ut(vt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  vt(ut(e, t), t)), e;
}
function Pm(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = eu(vt(e, n), vt(t, n), n, !0);
  return n.skipEscape = !0, ut(s, n);
}
function eu(e, t, r, n) {
  const s = {};
  return n || (e = vt(ut(e, r), r), t = vt(ut(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = en(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = en(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = en(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = en(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function Nm(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = ut(On(vt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = ut(On(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = ut(On(vt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = ut(On(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function ut(e, t) {
  const r = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, n = Object.assign({}, t), s = [], a = xl(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = vm(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let c = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (c = en(c)), o === void 0 && c[0] === "/" && c[1] === "/" && (c = "/%2F" + c.slice(2)), s.push(c);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const Rm = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function vt(e, t) {
  const r = Object.assign({}, t), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let s = !1;
  r.reference === "suffix" && (r.scheme ? e = r.scheme + ":" + e : e = "//" + e);
  const a = e.match(Rm);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (wm(n.host) === !1) {
        const l = _m(n.host);
        n.host = l.host.toLowerCase(), s = l.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = xl(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && Em(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (c) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + c;
      }
    (!o || o && !o.skipNormalize) && (e.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), o && o.parse && o.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const za = {
  SCHEMES: bm,
  normalize: Sm,
  resolve: Pm,
  resolveComponent: eu,
  equal: Nm,
  serialize: ut,
  parse: vt
};
ws.exports = za;
ws.exports.default = za;
ws.exports.fastUri = za;
var tu = ws.exports;
Object.defineProperty(Va, "__esModule", { value: !0 });
const ru = tu;
ru.code = 'require("ajv/dist/runtime/uri").default';
Va.default = ru;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = et;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = Q;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = vn, s = Mr, a = hr, o = ke, c = Q, l = Ee, d = $e, u = A, h = Qh, E = Va, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), $ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function N(P) {
    var p, S, y, i, f, b, T, j, F, V, ne, Fe, zt, Ut, qt, Kt, Gt, Ht, Wt, Bt, Xt, Jt, Yt, Qt, Zt;
    const We = P.strict, xt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Hr = xt === !0 || xt === void 0 ? 1 : xt || 0, Wr = (y = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && y !== void 0 ? y : g, Ds = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : We) !== null && b !== void 0 ? b : !0,
      strictNumbers: (j = (T = P.strictNumbers) !== null && T !== void 0 ? T : We) !== null && j !== void 0 ? j : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : We) !== null && V !== void 0 ? V : "log",
      strictTuples: (Fe = (ne = P.strictTuples) !== null && ne !== void 0 ? ne : We) !== null && Fe !== void 0 ? Fe : "log",
      strictRequired: (Ut = (zt = P.strictRequired) !== null && zt !== void 0 ? zt : We) !== null && Ut !== void 0 ? Ut : !1,
      code: P.code ? { ...P.code, optimize: Hr, regExp: Wr } : { optimize: Hr, regExp: Wr },
      loopRequired: (qt = P.loopRequired) !== null && qt !== void 0 ? qt : v,
      loopEnum: (Kt = P.loopEnum) !== null && Kt !== void 0 ? Kt : v,
      meta: (Gt = P.meta) !== null && Gt !== void 0 ? Gt : !0,
      messages: (Ht = P.messages) !== null && Ht !== void 0 ? Ht : !0,
      inlineRefs: (Wt = P.inlineRefs) !== null && Wt !== void 0 ? Wt : !0,
      schemaId: (Bt = P.schemaId) !== null && Bt !== void 0 ? Bt : "$id",
      addUsedSchema: (Xt = P.addUsedSchema) !== null && Xt !== void 0 ? Xt : !0,
      validateSchema: (Jt = P.validateSchema) !== null && Jt !== void 0 ? Jt : !0,
      validateFormats: (Yt = P.validateFormats) !== null && Yt !== void 0 ? Yt : !0,
      unicodeRegExp: (Qt = P.unicodeRegExp) !== null && Qt !== void 0 ? Qt : !0,
      int32range: (Zt = P.int32range) !== null && Zt !== void 0 ? Zt : !0,
      uriResolver: Ds
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: y } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: _, es5: S, lines: y }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, $, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = pe.call(this), p.formats && ue.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && fe.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), X.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: y } = this.opts;
      let i = h;
      y === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[y], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let y;
      if (typeof p == "string") {
        if (y = this.getSchema(p), !y)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        y = this.compile(p);
      const i = y(S);
      return "$async" in y || (this.errors = y.errors), i;
    }
    compile(p, S) {
      const y = this._addSchema(p, S);
      return y.validate || this._compileSchemaEnv(y);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: y } = this.opts;
      return i.call(this, p, S);
      async function i(V, ne) {
        await f.call(this, V.$schema);
        const Fe = this._addSchema(V, ne);
        return Fe.validate || b.call(this, Fe);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function b(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (ne) {
          if (!(ne instanceof s.default))
            throw ne;
          return T.call(this, ne), await j.call(this, ne.missingSchema), b.call(this, V);
        }
      }
      function T({ missingSchema: V, missingRef: ne }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${ne} cannot be resolved`);
      }
      async function j(V) {
        const ne = await F.call(this, V);
        this.refs[V] || await f.call(this, ne.$schema), this.refs[V] || this.addSchema(ne, V, S);
      }
      async function F(V) {
        const ne = this._loading[V];
        if (ne)
          return ne;
        try {
          return await (this._loading[V] = y(V));
        } finally {
          delete this._loading[V];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, y, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, y, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, y, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, y = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, y), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let y;
      if (y = p.$schema, y !== void 0 && typeof y != "string")
        throw new Error("$schema must be a string");
      if (y = y || this.opts.defaultMeta || this.defaultMeta(), !y)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(y, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = K.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: y } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: y });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = K.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let y = p[this.opts.schemaId];
          return y && (y = (0, l.normalizeId)(y), delete this.schemas[y], delete this.refs[y]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let y;
      if (typeof p == "string")
        y = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = y);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, y = S.keyword, Array.isArray(y) && !y.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (I.call(this, y, S), !S)
        return (0, u.eachItem)(y, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(y, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((b) => k.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const y of S.rules) {
        const i = y.rules.findIndex((f) => f.keyword === p);
        i >= 0 && y.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: y = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${y}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const y = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const T of f)
          b = b[T];
        for (const T in y) {
          const j = y[T];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, V = b[T];
          F && V && (b[T] = M(V));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const y in p) {
        const i = p[y];
        (!S || S.test(y)) && (typeof i == "string" ? delete p[y] : i && !i.meta && (this._cache.delete(i.schema), delete p[y]));
      }
    }
    _addSchema(p, S, y, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: T } = this.opts;
      if (typeof p == "object")
        b = p[T];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      y = (0, l.normalizeId)(b || y);
      const F = l.getSchemaRefs.call(this, p, y);
      return j = new o.SchemaEnv({ schema: p, schemaId: T, meta: S, baseId: y, localRefs: F }), this._cache.set(j.schema, j), f && !y.startsWith("#") && (y && this._checkUnique(y), this.refs[y] = j), i && this.validateSchema(p, !0), j;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, y = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[y](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function K(P) {
    return P = (0, l.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function X() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function ue() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function fe(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function pe() {
    const P = { ...this.opts };
    for (const p of w)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const se = /^[a-z_$][a-z0-9_$:-]*$/i;
  function I(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, (y) => {
      if (S.keywords[y])
        throw new Error(`Keyword ${y} is already defined`);
      if (!se.test(y))
        throw new Error(`Keyword ${y} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function k(P, p, S) {
    var y;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: j }) => j === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[P] = !0, !p)
      return;
    const T = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? L.call(this, b, T, p.before) : b.rules.push(T), f.all[P] = T, (y = p.implements) === null || y === void 0 || y.forEach((j) => this.addKeyword(j));
  }
  function L(P, p, S) {
    const y = P.rules.findIndex((i) => i.keyword === S);
    y >= 0 ? P.rules.splice(y, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const G = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, G] };
  }
})(hl);
var Ua = {}, qa = {}, Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Om = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Ka.default = Om;
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
wt.callRef = wt.getValidate = void 0;
const Tm = Mr, Hi = te, Me = Q, $r = qe, Wi = ke, Tn = A, Im = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Wi.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new Tm.default(n.opts.uriResolver, s, r);
    if (u instanceof Wi.SchemaEnv)
      return E(u);
    return g(u);
    function h() {
      if (a === d)
        return Yn(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return Yn(e, (0, Me._)`${w}.validate`, d, d.$async);
    }
    function E(w) {
      const _ = nu(e, w);
      Yn(e, _, w, w.$async);
    }
    function g(w) {
      const _ = t.scopeValue("schema", c.code.source === !0 ? { ref: w, code: (0, Me.stringify)(w) } : { ref: w }), $ = t.name("valid"), m = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Me.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, $);
      e.mergeEvaluated(m), e.ok($);
    }
  }
};
function nu(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Me._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
wt.getValidate = nu;
function Yn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? $r.default.this : Me.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Me._)`await ${(0, Hi.callValidateCode)(e, t, d)}`), g(t), o || s.assign(w, !0);
    }, (_) => {
      s.if((0, Me._)`!(${_} instanceof ${a.ValidationError})`, () => s.throw(_)), E(_), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, Hi.callValidateCode)(e, t, d), () => g(t), () => E(t));
  }
  function E(w) {
    const _ = (0, Me._)`${w}.errors`;
    s.assign($r.default.vErrors, (0, Me._)`${$r.default.vErrors} === null ? ${_} : ${$r.default.vErrors}.concat(${_})`), s.assign($r.default.errors, (0, Me._)`${$r.default.vErrors}.length`);
  }
  function g(w) {
    var _;
    if (!a.opts.unevaluated)
      return;
    const $ = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = Tn.mergeEvaluated.props(s, $.props, a.props));
      else {
        const m = s.var("props", (0, Me._)`${w}.evaluated.props`);
        a.props = Tn.mergeEvaluated.props(s, m, a.props, Me.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = Tn.mergeEvaluated.items(s, $.items, a.items));
      else {
        const m = s.var("items", (0, Me._)`${w}.evaluated.items`);
        a.items = Tn.mergeEvaluated.items(s, m, a.items, Me.Name);
      }
  }
}
wt.callRef = Yn;
wt.default = Im;
Object.defineProperty(qa, "__esModule", { value: !0 });
const jm = Ka, km = wt, Am = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  jm.default,
  km.default
];
qa.default = Am;
var Ga = {}, Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const is = Q, Nt = is.operators, cs = {
  maximum: { okStr: "<=", ok: Nt.LTE, fail: Nt.GT },
  minimum: { okStr: ">=", ok: Nt.GTE, fail: Nt.LT },
  exclusiveMaximum: { okStr: "<", ok: Nt.LT, fail: Nt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Nt.GT, fail: Nt.LTE }
}, Cm = {
  message: ({ keyword: e, schemaCode: t }) => (0, is.str)`must be ${cs[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, is._)`{comparison: ${cs[e].okStr}, limit: ${t}}`
}, Dm = {
  keyword: Object.keys(cs),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Cm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, is._)`${r} ${cs[t].fail} ${n} || isNaN(${r})`);
  }
};
Ha.default = Dm;
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const on = Q, Mm = {
  message: ({ schemaCode: e }) => (0, on.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, on._)`{multipleOf: ${e}}`
}, Lm = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Mm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, on._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, on._)`${o} !== parseInt(${o})`;
    e.fail$data((0, on._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
Wa.default = Lm;
var Ba = {}, Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
function su(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Xa.default = su;
su.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ba, "__esModule", { value: !0 });
const nr = Q, Vm = A, Fm = Xa, zm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, nr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, nr._)`{limit: ${e}}`
}, Um = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: zm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? nr.operators.GT : nr.operators.LT, o = s.opts.unicode === !1 ? (0, nr._)`${r}.length` : (0, nr._)`${(0, Vm.useFunc)(e.gen, Fm.default)}(${r})`;
    e.fail$data((0, nr._)`${o} ${a} ${n}`);
  }
};
Ba.default = Um;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const qm = te, ls = Q, Km = {
  message: ({ schemaCode: e }) => (0, ls.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, ls._)`{pattern: ${e}}`
}, Gm = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Km,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", c = r ? (0, ls._)`(new RegExp(${s}, ${o}))` : (0, qm.usePattern)(e, n);
    e.fail$data((0, ls._)`!${c}.test(${t})`);
  }
};
Ja.default = Gm;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const cn = Q, Hm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, cn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, cn._)`{limit: ${e}}`
}, Wm = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Hm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? cn.operators.GT : cn.operators.LT;
    e.fail$data((0, cn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Ya.default = Wm;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const Jr = te, ln = Q, Bm = A, Xm = {
  message: ({ params: { missingProperty: e } }) => (0, ln.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, ln._)`{missingProperty: ${e}}`
}, Jm = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Xm,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const _ of r)
        if ((g == null ? void 0 : g[_]) === void 0 && !w.has(_)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${_}" is not defined at "${$}" (strictRequired)`;
          (0, Bm.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (l || a)
        e.block$data(ln.nil, h);
      else
        for (const g of r)
          (0, Jr.checkReportMissingProp)(e, g);
    }
    function u() {
      const g = t.let("missing");
      if (l || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => E(g, w)), e.ok(w);
      } else
        t.if((0, Jr.checkMissingProp)(e, r, g)), (0, Jr.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, Jr.noPropertyInData)(t, s, g, c.ownProperties), () => e.error());
      });
    }
    function E(g, w) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(w, (0, Jr.propertyInData)(t, s, g, c.ownProperties)), t.if((0, ln.not)(w), () => {
          e.error(), t.break();
        });
      }, ln.nil);
    }
  }
};
Qa.default = Jm;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const un = Q, Ym = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, un.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, un._)`{limit: ${e}}`
}, Qm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Ym,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? un.operators.GT : un.operators.LT;
    e.fail$data((0, un._)`${r}.length ${s} ${n}`);
  }
};
Za.default = Qm;
var xa = {}, wn = {};
Object.defineProperty(wn, "__esModule", { value: !0 });
const au = gs;
au.code = 'require("ajv/dist/runtime/equal").default';
wn.default = au;
Object.defineProperty(xa, "__esModule", { value: !0 });
const Ks = $e, ve = Q, Zm = A, xm = wn, ep = {
  message: ({ params: { i: e, j: t } }) => (0, ve.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, ve._)`{i: ${e}, j: ${t}}`
}, tp = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: ep,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, Ks.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, ve._)`${o} === false`), e.ok(l);
    function u() {
      const w = t.let("i", (0, ve._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: w, j: _ }), t.assign(l, !0), t.if((0, ve._)`${w} > 1`, () => (h() ? E : g)(w, _));
    }
    function h() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function E(w, _) {
      const $ = t.name("item"), m = (0, Ks.checkDataTypes)(d, $, c.opts.strictNumbers, Ks.DataType.Wrong), v = t.const("indices", (0, ve._)`{}`);
      t.for((0, ve._)`;${w}--;`, () => {
        t.let($, (0, ve._)`${r}[${w}]`), t.if(m, (0, ve._)`continue`), d.length > 1 && t.if((0, ve._)`typeof ${$} == "string"`, (0, ve._)`${$} += "_"`), t.if((0, ve._)`typeof ${v}[${$}] == "number"`, () => {
          t.assign(_, (0, ve._)`${v}[${$}]`), e.error(), t.assign(l, !1).break();
        }).code((0, ve._)`${v}[${$}] = ${w}`);
      });
    }
    function g(w, _) {
      const $ = (0, Zm.useFunc)(t, xm.default), m = t.name("outer");
      t.label(m).for((0, ve._)`;${w}--;`, () => t.for((0, ve._)`${_} = ${w}; ${_}--;`, () => t.if((0, ve._)`${$}(${r}[${w}], ${r}[${_}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
xa.default = tp;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const fa = Q, rp = A, np = wn, sp = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, fa._)`{allowedValue: ${e}}`
}, ap = {
  keyword: "const",
  $data: !0,
  error: sp,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, fa._)`!${(0, rp.useFunc)(t, np.default)}(${r}, ${s})`) : e.fail((0, fa._)`${a} !== ${r}`);
  }
};
eo.default = ap;
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const tn = Q, op = A, ip = wn, cp = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, tn._)`{allowedValues: ${e}}`
}, lp = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: cp,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, op.useFunc)(t, ip.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", a);
      u = (0, tn.or)(...s.map((w, _) => E(g, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (g) => t.if((0, tn._)`${d()}(${r}, ${g})`, () => t.assign(u, !0).break()));
    }
    function E(g, w) {
      const _ = s[w];
      return typeof _ == "object" && _ !== null ? (0, tn._)`${d()}(${r}, ${g}[${w}])` : (0, tn._)`${r} === ${_}`;
    }
  }
};
to.default = lp;
Object.defineProperty(Ga, "__esModule", { value: !0 });
const up = Ha, dp = Wa, fp = Ba, hp = Ja, mp = Ya, pp = Qa, yp = Za, $p = xa, gp = eo, _p = to, vp = [
  // number
  up.default,
  dp.default,
  // string
  fp.default,
  hp.default,
  // object
  mp.default,
  pp.default,
  // array
  yp.default,
  $p.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  gp.default,
  _p.default
];
Ga.default = vp;
var ro = {}, Lr = {};
Object.defineProperty(Lr, "__esModule", { value: !0 });
Lr.validateAdditionalItems = void 0;
const sr = Q, ha = A, wp = {
  message: ({ params: { len: e } }) => (0, sr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, sr._)`{limit: ${e}}`
}, Ep = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: wp,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, ha.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    ou(e, n);
  }
};
function ou(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, sr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, sr._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, ha.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, sr._)`${c} <= ${t.length}`);
    r.if((0, sr.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: ha.Type.Num }, d), o.allErrors || r.if((0, sr.not)(d), () => r.break());
    });
  }
}
Lr.validateAdditionalItems = ou;
Lr.default = Ep;
var no = {}, Vr = {};
Object.defineProperty(Vr, "__esModule", { value: !0 });
Vr.validateTuple = void 0;
const Bi = Q, Qn = A, bp = te, Sp = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return iu(e, "additionalItems", t);
    r.items = !0, !(0, Qn.alwaysValidSchema)(r, t) && e.ok((0, bp.validateArray)(e));
  }
};
function iu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = Qn.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, Bi._)`${a}.length`);
  r.forEach((h, E) => {
    (0, Qn.alwaysValidSchema)(c, h) || (n.if((0, Bi._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: E, errSchemaPath: g } = c, w = r.length, _ = w === h.minItems && (w === h.maxItems || h[t] === !1);
    if (E.strictTuples && !_) {
      const $ = `"${o}" is ${w}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, Qn.checkStrictMode)(c, $, E.strictTuples);
    }
  }
}
Vr.validateTuple = iu;
Vr.default = Sp;
Object.defineProperty(no, "__esModule", { value: !0 });
const Pp = Vr, Np = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Pp.validateTuple)(e, "items")
};
no.default = Np;
var so = {};
Object.defineProperty(so, "__esModule", { value: !0 });
const Xi = Q, Rp = A, Op = te, Tp = Lr, Ip = {
  message: ({ params: { len: e } }) => (0, Xi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Xi._)`{limit: ${e}}`
}, jp = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Ip,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Rp.alwaysValidSchema)(n, t) && (s ? (0, Tp.validateAdditionalItems)(e, s) : e.ok((0, Op.validateArray)(e)));
  }
};
so.default = jp;
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const Ge = Q, In = A, kp = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge.str)`must contain at least ${e} valid item(s)` : (0, Ge.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge._)`{minContains: ${e}}` : (0, Ge._)`{minContains: ${e}, maxContains: ${t}}`
}, Ap = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: kp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, c;
    const { minContains: l, maxContains: d } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, c = d) : o = 1;
    const u = t.const("len", (0, Ge._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, In.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, In.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, In.alwaysValidSchema)(a, r)) {
      let _ = (0, Ge._)`${u} >= ${o}`;
      c !== void 0 && (_ = (0, Ge._)`${_} && ${u} <= ${c}`), e.pass(_);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? g(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, Ge._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const _ = t.name("_valid"), $ = t.let("count", 0);
      g(_, () => t.if(_, () => w($)));
    }
    function g(_, $) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: In.Type.Num,
          compositeRule: !0
        }, _), $();
      });
    }
    function w(_) {
      t.code((0, Ge._)`${_}++`), c === void 0 ? t.if((0, Ge._)`${_} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ge._)`${_} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ge._)`${_} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
ao.default = Ap;
var Es = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = Q, r = A, n = te;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [d, u] = a(l);
      o(l, d), c(l, u);
    }
  };
  function a({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(l[h]) ? d : u;
      E[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: E } = l;
    if (Object.keys(d).length === 0)
      return;
    const g = u.let("missing");
    for (const w in d) {
      const _ = d[w];
      if (_.length === 0)
        continue;
      const $ = (0, n.propertyInData)(u, h, w, E.opts.ownProperties);
      l.setParams({
        property: w,
        depsCount: _.length,
        deps: _.join(", ")
      }), E.allErrors ? u.if($, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${$} && (${(0, n.checkMissingProp)(l, _, g)})`), (0, n.reportMissingProp)(l, g), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: E, it: g } = l, w = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(g, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, g.opts.ownProperties),
        () => {
          const $ = l.subschema({ keyword: E, schemaProp: _ }, w);
          l.mergeValidEvaluated($, w);
        },
        () => u.var(w, !0)
        // TODO var
      ), l.ok(w));
  }
  e.validateSchemaDeps = c, e.default = s;
})(Es);
var oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const cu = Q, Cp = A, Dp = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, cu._)`{propertyName: ${e.propertyName}}`
}, Mp = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Dp,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Cp.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, cu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
oo.default = Mp;
var bs = {};
Object.defineProperty(bs, "__esModule", { value: !0 });
const jn = te, Ye = Q, Lp = qe, kn = A, Vp = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Ye._)`{additionalProperty: ${e.additionalProperty}}`
}, Fp = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Vp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, kn.alwaysValidSchema)(o, r))
      return;
    const d = (0, jn.allSchemaProperties)(n.properties), u = (0, jn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Ye._)`${a} === ${Lp.default.errors}`);
    function h() {
      t.forIn("key", s, ($) => {
        !d.length && !u.length ? w($) : t.if(E($), () => w($));
      });
    }
    function E($) {
      let m;
      if (d.length > 8) {
        const v = (0, kn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, jn.isOwnProperty)(t, v, $);
      } else d.length ? m = (0, Ye.or)(...d.map((v) => (0, Ye._)`${$} === ${v}`)) : m = Ye.nil;
      return u.length && (m = (0, Ye.or)(m, ...u.map((v) => (0, Ye._)`${(0, jn.usePattern)(e, v)}.test(${$})`))), (0, Ye.not)(m);
    }
    function g($) {
      t.code((0, Ye._)`delete ${s}[${$}]`);
    }
    function w($) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        g($);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: $ }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, kn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (_($, m, !1), t.if((0, Ye.not)(m), () => {
          e.reset(), g($);
        })) : (_($, m), c || t.if((0, Ye.not)(m), () => t.break()));
      }
    }
    function _($, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: kn.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
bs.default = Fp;
var io = {};
Object.defineProperty(io, "__esModule", { value: !0 });
const zp = et, Ji = te, Gs = A, Yi = bs, Up = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Yi.default.code(new zp.KeywordCxt(a, Yi.default, "additionalProperties"));
    const o = (0, Ji.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Gs.mergeEvaluated.props(t, (0, Gs.toHash)(o), a.props));
    const c = o.filter((h) => !(0, Gs.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, Ji.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
io.default = Up;
var co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const Qi = te, An = Q, Zi = A, xi = A, qp = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, Qi.allSchemaProperties)(r), l = c.filter((_) => (0, Zi.alwaysValidSchema)(a, r[_]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof An.Name) && (a.props = (0, xi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const _ of c)
        d && g(_), a.allErrors ? w(_) : (t.var(u, !0), w(_), t.if(u));
    }
    function g(_) {
      for (const $ in d)
        new RegExp(_).test($) && (0, Zi.checkStrictMode)(a, `property ${$} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function w(_) {
      t.forIn("key", n, ($) => {
        t.if((0, An._)`${(0, Qi.usePattern)(e, _)}.test(${$})`, () => {
          const m = l.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: $,
            dataPropType: xi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, An._)`${h}[${$}]`, !0) : !m && !a.allErrors && t.if((0, An.not)(u), () => t.break());
        });
      });
    }
  }
};
co.default = qp;
var lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
const Kp = A, Gp = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Kp.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
lo.default = Gp;
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const Hp = te, Wp = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Hp.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
uo.default = Wp;
var fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const Zn = Q, Bp = A, Xp = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Zn._)`{passingSchemas: ${e.passing}}`
}, Jp = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Xp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, Bp.alwaysValidSchema)(s, u) ? t.var(l, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Zn._)`${l} && ${o}`).assign(o, !1).assign(c, (0, Zn._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), E && e.mergeEvaluated(E, Zn.Name);
        });
      });
    }
  }
};
fo.default = Jp;
var ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const Yp = A, Qp = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Yp.alwaysValidSchema)(n, a))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
ho.default = Qp;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const us = Q, lu = A, Zp = {
  message: ({ params: e }) => (0, us.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, us._)`{failingKeyword: ${e.ifClause}}`
}, xp = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Zp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, lu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = ec(n, "then"), a = ec(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, us.not)(c), d("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, us._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function ec(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, lu.alwaysValidSchema)(e, r);
}
mo.default = xp;
var po = {};
Object.defineProperty(po, "__esModule", { value: !0 });
const ey = A, ty = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, ey.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
po.default = ty;
Object.defineProperty(ro, "__esModule", { value: !0 });
const ry = Lr, ny = no, sy = Vr, ay = so, oy = ao, iy = Es, cy = oo, ly = bs, uy = io, dy = co, fy = lo, hy = uo, my = fo, py = ho, yy = mo, $y = po;
function gy(e = !1) {
  const t = [
    // any
    fy.default,
    hy.default,
    my.default,
    py.default,
    yy.default,
    $y.default,
    // object
    cy.default,
    ly.default,
    iy.default,
    uy.default,
    dy.default
  ];
  return e ? t.push(ny.default, ay.default) : t.push(ry.default, sy.default), t.push(oy.default), t;
}
ro.default = gy;
var yo = {}, Fr = {};
Object.defineProperty(Fr, "__esModule", { value: !0 });
Fr.dynamicAnchor = void 0;
const Hs = Q, _y = qe, tc = ke, vy = wt, wy = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => uu(e, e.schema)
};
function uu(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, Hs._)`${_y.default.dynamicAnchors}${(0, Hs.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Ey(e);
  r.if((0, Hs._)`!${s}`, () => r.assign(s, a));
}
Fr.dynamicAnchor = uu;
function Ey(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: c } = t.root, { schemaId: l } = n.opts, d = new tc.SchemaEnv({ schema: r, schemaId: l, root: s, baseId: a, localRefs: o, meta: c });
  return tc.compileSchema.call(n, d), (0, vy.getValidate)(e, d);
}
Fr.default = wy;
var zr = {};
Object.defineProperty(zr, "__esModule", { value: !0 });
zr.dynamicRef = void 0;
const rc = Q, by = qe, nc = wt, Sy = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => du(e, e.schema)
};
function du(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const l = r.let("valid", !1);
    o(l), e.ok(l);
  }
  function o(l) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, rc._)`${by.default.dynamicAnchors}${(0, rc.getProperty)(a)}`);
      r.if(d, c(d, l), c(s.validateName, l));
    } else
      c(s.validateName, l)();
  }
  function c(l, d) {
    return d ? () => r.block(() => {
      (0, nc.callRef)(e, l), r.let(d, !0);
    }) : () => (0, nc.callRef)(e, l);
  }
}
zr.dynamicRef = du;
zr.default = Sy;
var $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
const Py = Fr, Ny = A, Ry = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Py.dynamicAnchor)(e, "") : (0, Ny.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
$o.default = Ry;
var go = {};
Object.defineProperty(go, "__esModule", { value: !0 });
const Oy = zr, Ty = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, Oy.dynamicRef)(e, e.schema)
};
go.default = Ty;
Object.defineProperty(yo, "__esModule", { value: !0 });
const Iy = Fr, jy = zr, ky = $o, Ay = go, Cy = [Iy.default, jy.default, ky.default, Ay.default];
yo.default = Cy;
var _o = {}, vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
const sc = Es, Dy = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: sc.error,
  code: (e) => (0, sc.validatePropertyDeps)(e)
};
vo.default = Dy;
var wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const My = Es, Ly = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, My.validateSchemaDeps)(e)
};
wo.default = Ly;
var Eo = {};
Object.defineProperty(Eo, "__esModule", { value: !0 });
const Vy = A, Fy = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, Vy.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
Eo.default = Fy;
Object.defineProperty(_o, "__esModule", { value: !0 });
const zy = vo, Uy = wo, qy = Eo, Ky = [zy.default, Uy.default, qy.default];
_o.default = Ky;
var bo = {}, So = {};
Object.defineProperty(So, "__esModule", { value: !0 });
const Tt = Q, ac = A, Gy = qe, Hy = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Tt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Wy = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: Hy,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: c } = a;
    c instanceof Tt.Name ? t.if((0, Tt._)`${c} !== true`, () => t.forIn("key", n, (h) => t.if(d(c, h), () => l(h)))) : c !== !0 && t.forIn("key", n, (h) => c === void 0 ? l(h) : t.if(u(c, h), () => l(h))), a.props = !0, e.ok((0, Tt._)`${s} === ${Gy.default.errors}`);
    function l(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, ac.alwaysValidSchema)(a, r)) {
        const E = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: ac.Type.Str
        }, E), o || t.if((0, Tt.not)(E), () => t.break());
      }
    }
    function d(h, E) {
      return (0, Tt._)`!${h} || !${h}[${E}]`;
    }
    function u(h, E) {
      const g = [];
      for (const w in h)
        h[w] === !0 && g.push((0, Tt._)`${E} !== ${w}`);
      return (0, Tt.and)(...g);
    }
  }
};
So.default = Wy;
var Po = {};
Object.defineProperty(Po, "__esModule", { value: !0 });
const ar = Q, oc = A, By = {
  message: ({ params: { len: e } }) => (0, ar.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, ar._)`{limit: ${e}}`
}, Xy = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: By,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, ar._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, ar._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, oc.alwaysValidSchema)(s, r)) {
      const l = t.var("valid", (0, ar._)`${o} <= ${a}`);
      t.if((0, ar.not)(l), () => c(l, a)), e.ok(l);
    }
    s.items = !0;
    function c(l, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: oc.Type.Num }, l), s.allErrors || t.if((0, ar.not)(l), () => t.break());
      });
    }
  }
};
Po.default = Xy;
Object.defineProperty(bo, "__esModule", { value: !0 });
const Jy = So, Yy = Po, Qy = [Jy.default, Yy.default];
bo.default = Qy;
var No = {}, Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const he = Q, Zy = {
  message: ({ schemaCode: e }) => (0, he.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, he._)`{format: ${e}}`
}, xy = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Zy,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? E() : g();
    function E() {
      const w = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), _ = r.const("fDef", (0, he._)`${w}[${o}]`), $ = r.let("fType"), m = r.let("format");
      r.if((0, he._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign($, (0, he._)`${_}.type || "string"`).assign(m, (0, he._)`${_}.validate`), () => r.assign($, (0, he._)`"string"`).assign(m, _)), e.fail$data((0, he.or)(v(), N()));
      function v() {
        return l.strictSchema === !1 ? he.nil : (0, he._)`${o} && !${m}`;
      }
      function N() {
        const R = u.$async ? (0, he._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, he._)`${m}(${n})`, O = (0, he._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, he._)`${m} && ${m} !== true && ${$} === ${t} && !${O}`;
      }
    }
    function g() {
      const w = h.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [_, $, m] = N(w);
      _ === t && e.pass(R());
      function v() {
        if (l.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const K = O instanceof RegExp ? (0, he.regexpCode)(O) : l.code.formats ? (0, he._)`${l.code.formats}${(0, he.getProperty)(a)}` : void 0, X = r.scopeValue("formats", { key: a, ref: O, code: K });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, he._)`${X}.validate`] : ["string", O, X];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, he._)`await ${m}(${n})`;
        }
        return typeof $ == "function" ? (0, he._)`${m}(${n})` : (0, he._)`${m}.test(${n})`;
      }
    }
  }
};
Ro.default = xy;
Object.defineProperty(No, "__esModule", { value: !0 });
const e$ = Ro, t$ = [e$.default];
No.default = t$;
var Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 });
Ar.contentVocabulary = Ar.metadataVocabulary = void 0;
Ar.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Ar.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Ua, "__esModule", { value: !0 });
const r$ = qa, n$ = Ga, s$ = ro, a$ = yo, o$ = _o, i$ = bo, c$ = No, ic = Ar, l$ = [
  a$.default,
  r$.default,
  n$.default,
  (0, s$.default)(!0),
  c$.default,
  ic.metadataVocabulary,
  ic.contentVocabulary,
  o$.default,
  i$.default
];
Ua.default = l$;
var Oo = {}, Ss = {};
Object.defineProperty(Ss, "__esModule", { value: !0 });
Ss.DiscrError = void 0;
var cc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(cc || (Ss.DiscrError = cc = {}));
Object.defineProperty(Oo, "__esModule", { value: !0 });
const wr = Q, ma = Ss, lc = ke, u$ = Mr, d$ = A, f$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ma.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, wr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, h$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: f$,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, wr._)`${r}${(0, wr.getProperty)(c)}`);
    t.if((0, wr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: ma.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const g = E();
      t.if(!1);
      for (const w in g)
        t.elseIf((0, wr._)`${d} === ${w}`), t.assign(l, h(g[w]));
      t.else(), e.error(!1, { discrError: ma.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h(g) {
      const w = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: g }, w);
      return e.mergeEvaluated(_, wr.Name), w;
    }
    function E() {
      var g;
      const w = {}, _ = m(s);
      let $ = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, d$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const X = O.$ref;
          if (O = lc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), O instanceof lc.SchemaEnv && (O = O.schema), O === void 0)
            throw new u$.default(a.opts.uriResolver, a.baseId, X);
        }
        const K = (g = O == null ? void 0 : O.properties) === null || g === void 0 ? void 0 : g[c];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        $ = $ && (_ || m(O)), v(K, R);
      }
      if (!$)
        throw new Error(`discriminator: "${c}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(c);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const K of R.enum)
            N(K, O);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        w[R] = O;
      }
    }
  }
};
Oo.default = h$;
var To = {};
const m$ = "https://json-schema.org/draft/2020-12/schema", p$ = "https://json-schema.org/draft/2020-12/schema", y$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, $$ = "meta", g$ = "Core and Validation specifications meta-schema", _$ = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], v$ = [
  "object",
  "boolean"
], w$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", E$ = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, b$ = {
  $schema: m$,
  $id: p$,
  $vocabulary: y$,
  $dynamicAnchor: $$,
  title: g$,
  allOf: _$,
  type: v$,
  $comment: w$,
  properties: E$
}, S$ = "https://json-schema.org/draft/2020-12/schema", P$ = "https://json-schema.org/draft/2020-12/meta/applicator", N$ = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, R$ = "meta", O$ = "Applicator vocabulary meta-schema", T$ = [
  "object",
  "boolean"
], I$ = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, j$ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, k$ = {
  $schema: S$,
  $id: P$,
  $vocabulary: N$,
  $dynamicAnchor: R$,
  title: O$,
  type: T$,
  properties: I$,
  $defs: j$
}, A$ = "https://json-schema.org/draft/2020-12/schema", C$ = "https://json-schema.org/draft/2020-12/meta/unevaluated", D$ = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, M$ = "meta", L$ = "Unevaluated applicator vocabulary meta-schema", V$ = [
  "object",
  "boolean"
], F$ = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, z$ = {
  $schema: A$,
  $id: C$,
  $vocabulary: D$,
  $dynamicAnchor: M$,
  title: L$,
  type: V$,
  properties: F$
}, U$ = "https://json-schema.org/draft/2020-12/schema", q$ = "https://json-schema.org/draft/2020-12/meta/content", K$ = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, G$ = "meta", H$ = "Content vocabulary meta-schema", W$ = [
  "object",
  "boolean"
], B$ = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, X$ = {
  $schema: U$,
  $id: q$,
  $vocabulary: K$,
  $dynamicAnchor: G$,
  title: H$,
  type: W$,
  properties: B$
}, J$ = "https://json-schema.org/draft/2020-12/schema", Y$ = "https://json-schema.org/draft/2020-12/meta/core", Q$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, Z$ = "meta", x$ = "Core vocabulary meta-schema", eg = [
  "object",
  "boolean"
], tg = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, rg = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, ng = {
  $schema: J$,
  $id: Y$,
  $vocabulary: Q$,
  $dynamicAnchor: Z$,
  title: x$,
  type: eg,
  properties: tg,
  $defs: rg
}, sg = "https://json-schema.org/draft/2020-12/schema", ag = "https://json-schema.org/draft/2020-12/meta/format-annotation", og = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, ig = "meta", cg = "Format vocabulary meta-schema for annotation results", lg = [
  "object",
  "boolean"
], ug = {
  format: {
    type: "string"
  }
}, dg = {
  $schema: sg,
  $id: ag,
  $vocabulary: og,
  $dynamicAnchor: ig,
  title: cg,
  type: lg,
  properties: ug
}, fg = "https://json-schema.org/draft/2020-12/schema", hg = "https://json-schema.org/draft/2020-12/meta/meta-data", mg = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, pg = "meta", yg = "Meta-data vocabulary meta-schema", $g = [
  "object",
  "boolean"
], gg = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, _g = {
  $schema: fg,
  $id: hg,
  $vocabulary: mg,
  $dynamicAnchor: pg,
  title: yg,
  type: $g,
  properties: gg
}, vg = "https://json-schema.org/draft/2020-12/schema", wg = "https://json-schema.org/draft/2020-12/meta/validation", Eg = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, bg = "meta", Sg = "Validation vocabulary meta-schema", Pg = [
  "object",
  "boolean"
], Ng = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, Rg = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Og = {
  $schema: vg,
  $id: wg,
  $vocabulary: Eg,
  $dynamicAnchor: bg,
  title: Sg,
  type: Pg,
  properties: Ng,
  $defs: Rg
};
Object.defineProperty(To, "__esModule", { value: !0 });
const Tg = b$, Ig = k$, jg = z$, kg = X$, Ag = ng, Cg = dg, Dg = _g, Mg = Og, Lg = ["/properties"];
function Vg(e) {
  return [
    Tg,
    Ig,
    jg,
    kg,
    Ag,
    t(this, Cg),
    Dg,
    t(this, Mg)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, Lg) : n;
  }
}
To.default = Vg;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = hl, n = Ua, s = Oo, a = To, o = "https://json-schema.org/draft/2020-12/schema";
  class c extends r.default {
    constructor(g = {}) {
      super({
        ...g,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: g, meta: w } = this.opts;
      w && (a.default.call(this, g), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var l = et;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var d = Q;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var u = vn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = Mr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(ia, ia.exports);
var Fg = ia.exports, pa = { exports: {} }, fu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(z, H) {
    return { validate: z, compare: H };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(l(!0), d),
    "date-time": t(E(!0), g),
    "iso-time": t(l(), u),
    "iso-date-time": t(E(), w),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: pe,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: N,
    // signed 32 bit integer
    int32: { type: "number", validate: K },
    // signed 64 bit integer
    int64: { type: "number", validate: X },
    // C-type float
    float: { type: "number", validate: ue },
    // C-type double
    double: { type: "number", validate: ue },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, g),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, w),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(z) {
    return z % 4 === 0 && (z % 100 !== 0 || z % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(z) {
    const H = n.exec(z);
    if (!H)
      return !1;
    const se = +H[1], I = +H[2], k = +H[3];
    return I >= 1 && I <= 12 && k >= 1 && k <= (I === 2 && r(se) ? 29 : s[I]);
  }
  function o(z, H) {
    if (z && H)
      return z > H ? 1 : z < H ? -1 : 0;
  }
  const c = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(z) {
    return function(se) {
      const I = c.exec(se);
      if (!I)
        return !1;
      const k = +I[1], L = +I[2], D = +I[3], G = I[4], M = I[5] === "-" ? -1 : 1, P = +(I[6] || 0), p = +(I[7] || 0);
      if (P > 23 || p > 59 || z && !G)
        return !1;
      if (k <= 23 && L <= 59 && D < 60)
        return !0;
      const S = L - p * M, y = k - P * M - (S < 0 ? 1 : 0);
      return (y === 23 || y === -1) && (S === 59 || S === -1) && D < 61;
    };
  }
  function d(z, H) {
    if (!(z && H))
      return;
    const se = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf(), I = (/* @__PURE__ */ new Date("2020-01-01T" + H)).valueOf();
    if (se && I)
      return se - I;
  }
  function u(z, H) {
    if (!(z && H))
      return;
    const se = c.exec(z), I = c.exec(H);
    if (se && I)
      return z = se[1] + se[2] + se[3], H = I[1] + I[2] + I[3], z > H ? 1 : z < H ? -1 : 0;
  }
  const h = /t|\s/i;
  function E(z) {
    const H = l(z);
    return function(I) {
      const k = I.split(h);
      return k.length === 2 && a(k[0]) && H(k[1]);
    };
  }
  function g(z, H) {
    if (!(z && H))
      return;
    const se = new Date(z).valueOf(), I = new Date(H).valueOf();
    if (se && I)
      return se - I;
  }
  function w(z, H) {
    if (!(z && H))
      return;
    const [se, I] = z.split(h), [k, L] = H.split(h), D = o(se, k);
    if (D !== void 0)
      return D || d(I, L);
  }
  const _ = /\/|:/, $ = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(z) {
    return _.test(z) && $.test(z);
  }
  const v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function N(z) {
    return v.lastIndex = 0, v.test(z);
  }
  const R = -2147483648, O = 2 ** 31 - 1;
  function K(z) {
    return Number.isInteger(z) && z <= O && z >= R;
  }
  function X(z) {
    return Number.isInteger(z);
  }
  function ue() {
    return !0;
  }
  const fe = /[^\\]\\Z/;
  function pe(z) {
    if (fe.test(z))
      return !1;
    try {
      return new RegExp(z), !0;
    } catch {
      return !1;
    }
  }
})(fu);
var hu = {}, ya = { exports: {} }, mu = {}, tt = {}, Cr = {}, En = {}, ee = {}, gn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      c(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [g(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), c(N, v[R]), N.push(a, g(m[++R]));
    return l(N), new n(N);
  }
  e.str = o;
  function c(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = c;
  function l(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = d(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function u(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : g(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(g(m));
  }
  e.stringify = E;
  function g(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = g;
  function w(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = w;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function $(m) {
    return new n(m.toString());
  }
  e.regexpCode = $;
})(gn);
var $a = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = gn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const o = (0, t._)`\n`;
  class c extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const E = this.toName(d), { prefix: g } = E, w = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[g];
      if (_) {
        const v = _.get(w);
        if (v)
          return v;
      } else
        _ = this._values[g] = /* @__PURE__ */ new Map();
      _.set(w, E);
      const $ = this._scope[g] || (this._scope[g] = []), m = $.length;
      return $[m] = u.ref, E.setValue(u, { property: g, itemIndex: m }), E;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (E) => {
        if (E.value === void 0)
          throw new Error(`CodeGen: name "${E}" has no value`);
        return E.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, E) {
      let g = t.nil;
      for (const w in d) {
        const _ = d[w];
        if (!_)
          continue;
        const $ = h[w] = h[w] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if ($.has(m))
            return;
          $.set(m, n.Started);
          let v = u(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            g = (0, t._)`${g}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = E == null ? void 0 : E(m))
            g = (0, t._)`${g}${v}${this.opts._n}`;
          else
            throw new r(m);
          $.set(m, n.Completed);
        });
      }
      return g;
    }
  }
  e.ValueScope = c;
})($a);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = gn, r = $a;
  var n = gn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = $a;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, b) {
      super(), this.varKind = i, this.name = f, this.rhs = b;
    }
    render({ es5: i, _n: f }) {
      const b = i ? r.varKinds.var : this.varKind, T = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${T};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = I(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = I(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return se(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, b, T) {
      super(i, b, T), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = I(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class g extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, b) => f + b.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const b = i[f].optimizeNodes();
        Array.isArray(b) ? i.splice(f, 1, ...b) : b ? i[f] = b : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: b } = this;
      let T = b.length;
      for (; T--; ) {
        const j = b[T];
        j.optimizeNames(i, f) || (k(i, j.names), b.splice(T, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class w extends g {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class _ extends g {
  }
  class $ extends w {
  }
  $.kind = "else";
  class m extends w {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const b = f.optimizeNodes();
        f = this.else = Array.isArray(b) ? new $(b) : b;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(L(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = I(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return se(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = I(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, b, T) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = T;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: T, to: j } = this;
      return `for(${f} ${b}=${T}; ${b}<${j}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = se(super.names, this.from);
      return se(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, b, T) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = T;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = I(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class K extends w {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  K.kind = "func";
  class X extends g {
    render(i) {
      return "return " + super.render(i);
    }
  }
  X.kind = "return";
  class ue extends w {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, T;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (T = this.finally) === null || T === void 0 || T.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class fe extends w {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  fe.kind = "catch";
  class pe extends w {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  pe.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const b = this._extScope.value(i, f);
      return (this._values[b.prefix] || (this._values[b.prefix] = /* @__PURE__ */ new Set())).add(b), b;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, b, T) {
      const j = this._scope.toName(f);
      return b !== void 0 && T && (this._constants[j.str] = b), this._leafNode(new o(i, j, b)), j;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, b) {
      return this._def(r.varKinds.const, i, f, b);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, b) {
      return this._def(r.varKinds.let, i, f, b);
    }
    // `var` declaration with optional assignment
    var(i, f, b) {
      return this._def(r.varKinds.var, i, f, b);
    }
    // assignment code
    assign(i, f, b) {
      return this._leafNode(new c(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, T] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== T || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, T));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, b) {
      if (this._blockNode(new m(i)), f && b)
        this.code(f).else().code(b).endIf();
      else if (f)
        this.code(f).endIf();
      else if (b)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new $());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, $);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, T, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, b), () => T(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, T = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(j, (0, t._)`${F}[${V}]`), b(j);
        });
      }
      return this._for(new O("of", T, j, f), () => b(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, T = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const j = this._scope.toName(i);
      return this._for(new O("in", T, j, f), () => b(j));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new X();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(X);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const T = new ue();
      if (this._blockNode(T), this.code(i), f) {
        const j = this.name("e");
        this._currNode = T.catch = new fe(j), f(j);
      }
      return b && (this._currNode = T.finally = new pe(), this.code(b)), this._endBlockNode(fe, pe);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const b = this._nodes.length - f;
      if (b < 0 || i !== void 0 && b !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${b} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, b, T) {
      return this._blockNode(new K(i, f, b)), T && this.code(T).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(K);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const b = this._currNode;
      if (b instanceof i || f && b instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) + (i[f] || 0);
    return y;
  }
  function se(y, i) {
    return i instanceof t._CodeOrName ? H(y, i.names) : y;
  }
  function I(y, i, f) {
    if (y instanceof t.Name)
      return b(y);
    if (!T(y))
      return y;
    return new t._Code(y._items.reduce((j, F) => (F instanceof t.Name && (F = b(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function b(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function T(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function k(y, i) {
    for (const f in i)
      y[f] = (y[f] || 0) - (i[f] || 0);
  }
  function L(y) {
    return typeof y == "boolean" || typeof y == "number" || y === null ? !y : (0, t._)`!${S(y)}`;
  }
  e.not = L;
  const D = p(e.operators.AND);
  function G(...y) {
    return y.reduce(D);
  }
  e.and = G;
  const M = p(e.operators.OR);
  function P(...y) {
    return y.reduce(M);
  }
  e.or = P;
  function p(y) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${y} ${S(f)}`;
  }
  function S(y) {
    return y instanceof t.Name ? y : (0, t._)`(${y})`;
  }
})(ee);
var C = {};
Object.defineProperty(C, "__esModule", { value: !0 });
C.checkStrictMode = C.getErrorPath = C.Type = C.useFunc = C.setEvaluated = C.evaluatedPropsToName = C.mergeEvaluated = C.eachItem = C.unescapeJsonPointer = C.escapeJsonPointer = C.escapeFragment = C.unescapeFragment = C.schemaRefOrVal = C.schemaHasRulesButRef = C.schemaHasRules = C.checkUnknownRules = C.alwaysValidSchema = C.toHash = void 0;
const ie = ee, zg = gn;
function Ug(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = Ug;
function qg(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (pu(e, t), !yu(t, e.self.RULES.all));
}
C.alwaysValidSchema = qg;
function pu(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || _u(e, `unknown keyword: "${a}"`);
}
C.checkUnknownRules = pu;
function yu(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
C.schemaHasRules = yu;
function Kg(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
C.schemaHasRulesButRef = Kg;
function Gg({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ie._)`${r}`;
  }
  return (0, ie._)`${e}${t}${(0, ie.getProperty)(n)}`;
}
C.schemaRefOrVal = Gg;
function Hg(e) {
  return $u(decodeURIComponent(e));
}
C.unescapeFragment = Hg;
function Wg(e) {
  return encodeURIComponent(Io(e));
}
C.escapeFragment = Wg;
function Io(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
C.escapeJsonPointer = Io;
function $u(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = $u;
function Bg(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = Bg;
function uc({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof ie.Name ? (a instanceof ie.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ie.Name ? (t(s, o, a), a) : r(a, o);
    return c === ie.Name && !(l instanceof ie.Name) ? n(s, l) : l;
  };
}
C.mergeEvaluated = {
  props: uc({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ie._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ie._)`${r} || {}`).code((0, ie._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ie._)`${r} || {}`), jo(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: gu
  }),
  items: uc({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ie._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ie._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function gu(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ie._)`{}`);
  return t !== void 0 && jo(e, r, t), r;
}
C.evaluatedPropsToName = gu;
function jo(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ie._)`${t}${(0, ie.getProperty)(n)}`, !0));
}
C.setEvaluated = jo;
const dc = {};
function Xg(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: dc[t.code] || (dc[t.code] = new zg._Code(t.code))
  });
}
C.useFunc = Xg;
var ga;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(ga || (C.Type = ga = {}));
function Jg(e, t, r) {
  if (e instanceof ie.Name) {
    const n = t === ga.Num;
    return r ? n ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : n ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ie.getProperty)(e).toString() : "/" + Io(e);
}
C.getErrorPath = Jg;
function _u(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = _u;
var ft = {};
Object.defineProperty(ft, "__esModule", { value: !0 });
const Re = ee, Yg = {
  // validation function arguments
  data: new Re.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Re.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Re.Name("instancePath"),
  parentData: new Re.Name("parentData"),
  parentDataProperty: new Re.Name("parentDataProperty"),
  rootData: new Re.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Re.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Re.Name("vErrors"),
  // null or array of validation errors
  errors: new Re.Name("errors"),
  // counter of validation errors
  this: new Re.Name("this"),
  // "globals"
  self: new Re.Name("self"),
  scope: new Re.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Re.Name("json"),
  jsonPos: new Re.Name("jsonPos"),
  jsonLen: new Re.Name("jsonLen"),
  jsonPart: new Re.Name("jsonPart")
};
ft.default = Yg;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ee, r = C, n = ft;
  e.keywordError = {
    message: ({ keyword: $ }) => (0, t.str)`must pass "${$}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: $, schemaType: m }) => m ? (0, t.str)`"${$}" keyword must be ${m} ($data)` : (0, t.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, m = e.keywordError, v, N) {
    const { it: R } = $, { gen: O, compositeRule: K, allErrors: X } = R, ue = h($, m, v);
    N ?? (K || X) ? l(O, ue) : d(R, (0, t._)`[${ue}]`);
  }
  e.reportError = s;
  function a($, m = e.keywordError, v) {
    const { it: N } = $, { gen: R, compositeRule: O, allErrors: K } = N, X = h($, m, v);
    l(R, X), O || K || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o($, m) {
    $.assign(n.default.errors, m), $.if((0, t._)`${n.default.vErrors} !== null`, () => $.if(m, () => $.assign((0, t._)`${n.default.vErrors}.length`, m), () => $.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: $, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const K = $.name("err");
    $.forRange("i", R, n.default.errors, (X) => {
      $.const(K, (0, t._)`${n.default.vErrors}[${X}]`), $.if((0, t._)`${K}.instancePath === undefined`, () => $.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), $.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && ($.assign((0, t._)`${K}.schema`, v), $.assign((0, t._)`${K}.data`, N));
    });
  }
  e.extendErrors = c;
  function l($, m) {
    const v = $.const("err", m);
    $.if((0, t._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), $.code((0, t._)`${n.default.errors}++`);
  }
  function d($, m) {
    const { gen: v, validateName: N, schemaEnv: R } = $;
    R.$async ? v.throw((0, t._)`new ${$.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h($, m, v) {
    const { createErrors: N } = $.it;
    return N === !1 ? (0, t._)`{}` : E($, m, v);
  }
  function E($, m, v = {}) {
    const { gen: N, it: R } = $, O = [
      g(R, v),
      w($, v)
    ];
    return _($, m, O), N.object(...O);
  }
  function g({ errorPath: $ }, { instancePath: m }) {
    const v = m ? (0, t.str)`${$}${(0, r.getErrorPath)(m, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: $, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${$}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [u.schemaPath, R];
  }
  function _($, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: K, it: X } = $, { opts: ue, propertyName: fe, topSchemaRef: pe, schemaPath: z } = X;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m($) : m || (0, t._)`{}`]), ue.messages && N.push([u.message, typeof v == "function" ? v($) : v]), ue.verbose && N.push([u.schema, K], [u.parentSchema, (0, t._)`${pe}${z}`], [n.default.data, O]), fe && N.push([u.propertyName, fe]);
  }
})(En);
Object.defineProperty(Cr, "__esModule", { value: !0 });
Cr.boolOrEmptySchema = Cr.topBoolOrEmptySchema = void 0;
const Qg = En, Zg = ee, xg = ft, e0 = {
  message: "boolean schema is false"
};
function t0(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? vu(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(xg.default.data) : (t.assign((0, Zg._)`${n}.errors`, null), t.return(!0));
}
Cr.topBoolOrEmptySchema = t0;
function r0(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), vu(e)) : r.var(t, !0);
}
Cr.boolOrEmptySchema = r0;
function vu(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, Qg.reportError)(s, e0, void 0, t);
}
var ge = {}, mr = {};
Object.defineProperty(mr, "__esModule", { value: !0 });
mr.getRules = mr.isJSONType = void 0;
const n0 = ["string", "number", "integer", "boolean", "null", "object", "array"], s0 = new Set(n0);
function a0(e) {
  return typeof e == "string" && s0.has(e);
}
mr.isJSONType = a0;
function o0() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
mr.getRules = o0;
var gt = {};
Object.defineProperty(gt, "__esModule", { value: !0 });
gt.shouldUseRule = gt.shouldUseGroup = gt.schemaHasRulesForType = void 0;
function i0({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && wu(e, n);
}
gt.schemaHasRulesForType = i0;
function wu(e, t) {
  return t.rules.some((r) => Eu(e, r));
}
gt.shouldUseGroup = wu;
function Eu(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
gt.shouldUseRule = Eu;
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
const c0 = mr, l0 = gt, u0 = En, x = ee, bu = C;
var Tr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Tr || (ge.DataType = Tr = {}));
function d0(e) {
  const t = Su(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
ge.getSchemaTypes = d0;
function Su(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(c0.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ge.getJSONTypes = Su;
function f0(e, t) {
  const { gen: r, data: n, opts: s } = e, a = h0(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, l0.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = ko(t, n, s.strictNumbers, Tr.Wrong);
    r.if(c, () => {
      a.length ? m0(e, t, a) : Ao(e);
    });
  }
  return o;
}
ge.coerceAndCheckDataType = f0;
const Pu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function h0(e, t) {
  return t ? e.filter((r) => Pu.has(r) || t === "array" && r === "array") : [];
}
function m0(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, x._)`typeof ${s}`), c = n.let("coerced", (0, x._)`undefined`);
  a.coerceTypes === "array" && n.if((0, x._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, x._)`${s}[0]`).assign(o, (0, x._)`typeof ${s}`).if(ko(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, x._)`${c} !== undefined`);
  for (const d of r)
    (Pu.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), Ao(e), n.endIf(), n.if((0, x._)`${c} !== undefined`, () => {
    n.assign(s, c), p0(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, x._)`${o} == "number" || ${o} == "boolean"`).assign(c, (0, x._)`"" + ${s}`).elseIf((0, x._)`${s} === null`).assign(c, (0, x._)`""`);
        return;
      case "number":
        n.elseIf((0, x._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, x._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, x._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, x._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, x._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, x._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, x._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, x._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(c, (0, x._)`[${s}]`);
    }
  }
}
function p0({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, x._)`${t} !== undefined`, () => e.assign((0, x._)`${t}[${r}]`, n));
}
function _a(e, t, r, n = Tr.Correct) {
  const s = n === Tr.Correct ? x.operators.EQ : x.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, x._)`${t} ${s} null`;
    case "array":
      a = (0, x._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, x._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, x._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, x._)`typeof ${t} ${s} ${e}`;
  }
  return n === Tr.Correct ? a : (0, x.not)(a);
  function o(c = x.nil) {
    return (0, x.and)((0, x._)`typeof ${t} == "number"`, c, r ? (0, x._)`isFinite(${t})` : x.nil);
  }
}
ge.checkDataType = _a;
function ko(e, t, r, n) {
  if (e.length === 1)
    return _a(e[0], t, r, n);
  let s;
  const a = (0, bu.toHash)(e);
  if (a.array && a.object) {
    const o = (0, x._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, x._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = x.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, x.and)(s, _a(o, t, r, n));
  return s;
}
ge.checkDataTypes = ko;
const y0 = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, x._)`{type: ${e}}` : (0, x._)`{type: ${t}}`
};
function Ao(e) {
  const t = $0(e);
  (0, u0.reportError)(t, y0);
}
ge.reportTypeError = Ao;
function $0(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, bu.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var Ps = {};
Object.defineProperty(Ps, "__esModule", { value: !0 });
Ps.assignDefaults = void 0;
const gr = ee, g0 = C;
function _0(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      fc(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => fc(e, a, s.default));
}
Ps.assignDefaults = _0;
function fc(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const c = (0, gr._)`${a}${(0, gr.getProperty)(t)}`;
  if (s) {
    (0, g0.checkStrictMode)(e, `default is ignored for: ${c}`);
    return;
  }
  let l = (0, gr._)`${c} === undefined`;
  o.useDefaults === "empty" && (l = (0, gr._)`${l} || ${c} === null || ${c} === ""`), n.if(l, (0, gr._)`${c} = ${(0, gr.stringify)(r)}`);
}
var dt = {}, re = {};
Object.defineProperty(re, "__esModule", { value: !0 });
re.validateUnion = re.validateArray = re.usePattern = re.callValidateCode = re.schemaProperties = re.allSchemaProperties = re.noPropertyInData = re.propertyInData = re.isOwnProperty = re.hasPropFunc = re.reportMissingProp = re.checkMissingProp = re.checkReportMissingProp = void 0;
const le = ee, Co = C, Rt = ft, v0 = C;
function w0(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Mo(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, le._)`${t}` }, !0), e.error();
  });
}
re.checkReportMissingProp = w0;
function E0({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, le.or)(...n.map((a) => (0, le.and)(Mo(e, t, a, r.ownProperties), (0, le._)`${s} = ${a}`)));
}
re.checkMissingProp = E0;
function b0(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
re.reportMissingProp = b0;
function Nu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, le._)`Object.prototype.hasOwnProperty`
  });
}
re.hasPropFunc = Nu;
function Do(e, t, r) {
  return (0, le._)`${Nu(e)}.call(${t}, ${r})`;
}
re.isOwnProperty = Do;
function S0(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} !== undefined`;
  return n ? (0, le._)`${s} && ${Do(e, t, r)}` : s;
}
re.propertyInData = S0;
function Mo(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} === undefined`;
  return n ? (0, le.or)(s, (0, le.not)(Do(e, t, r))) : s;
}
re.noPropertyInData = Mo;
function Ru(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
re.allSchemaProperties = Ru;
function P0(e, t) {
  return Ru(t).filter((r) => !(0, Co.alwaysValidSchema)(e, t[r]));
}
re.schemaProperties = P0;
function N0({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, le._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Rt.default.instancePath, (0, le.strConcat)(Rt.default.instancePath, a)],
    [Rt.default.parentData, o.parentData],
    [Rt.default.parentDataProperty, o.parentDataProperty],
    [Rt.default.rootData, Rt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Rt.default.dynamicAnchors, Rt.default.dynamicAnchors]);
  const E = (0, le._)`${u}, ${r.object(...h)}`;
  return l !== le.nil ? (0, le._)`${c}.call(${l}, ${E})` : (0, le._)`${c}(${E})`;
}
re.callValidateCode = N0;
const R0 = (0, le._)`new RegExp`;
function O0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, le._)`${s.code === "new RegExp" ? R0 : (0, v0.useFunc)(e, s)}(${r}, ${n})`
  });
}
re.usePattern = O0;
function T0(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return o(() => t.assign(c, !1)), c;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(c) {
    const l = t.const("len", (0, le._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: Co.Type.Num
      }, a), t.if((0, le.not)(a), c);
    });
  }
}
re.validateArray = T0;
function I0(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, Co.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(o, (0, le._)`${o} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, le.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
re.validateUnion = I0;
Object.defineProperty(dt, "__esModule", { value: !0 });
dt.validateKeywordUsage = dt.validSchemaType = dt.funcKeywordCode = dt.macroKeywordCode = void 0;
const je = ee, or = ft, j0 = re, k0 = En;
function A0(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, c = t.macro.call(o.self, s, a, o), l = Ou(r, n, c);
  o.opts.validateSchema !== !1 && o.self.validateSchema(c, !0);
  const d = r.name("valid");
  e.subschema({
    schema: c,
    schemaPath: je.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
dt.macroKeywordCode = A0;
function C0(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: c, it: l } = e;
  M0(l, t);
  const d = !c && t.compile ? t.compile.call(l.self, a, o, l) : t.validate, u = Ou(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      _(), t.modifying && hc(e), $(() => e.error());
    else {
      const m = t.async ? g() : w();
      t.modifying && hc(e), $(() => D0(e, m));
    }
  }
  function g() {
    const m = n.let("ruleErrs", null);
    return n.try(() => _((0, je._)`await `), (v) => n.assign(h, !1).if((0, je._)`${v} instanceof ${l.ValidationError}`, () => n.assign(m, (0, je._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, je._)`${u}.errors`;
    return n.assign(m, null), _(je.nil), m;
  }
  function _(m = t.async ? (0, je._)`await ` : je.nil) {
    const v = l.opts.passContext ? or.default.this : or.default.self, N = !("compile" in t && !c || t.schema === !1);
    n.assign(h, (0, je._)`${m}${(0, j0.callValidateCode)(e, u, v, N)}`, t.modifying);
  }
  function $(m) {
    var v;
    n.if((0, je.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
dt.funcKeywordCode = C0;
function hc(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, je._)`${n.parentData}[${n.parentDataProperty}]`));
}
function D0(e, t) {
  const { gen: r } = e;
  r.if((0, je._)`Array.isArray(${t})`, () => {
    r.assign(or.default.vErrors, (0, je._)`${or.default.vErrors} === null ? ${t} : ${or.default.vErrors}.concat(${t})`).assign(or.default.errors, (0, je._)`${or.default.vErrors}.length`), (0, k0.extendErrors)(e);
  }, () => e.error());
}
function M0({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function Ou(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, je.stringify)(r) });
}
function L0(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
dt.validSchemaType = L0;
function V0({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((c) => !Object.prototype.hasOwnProperty.call(e, c)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
dt.validateKeywordUsage = V0;
var Vt = {};
Object.defineProperty(Vt, "__esModule", { value: !0 });
Vt.extendSubschemaMode = Vt.extendSubschemaData = Vt.getSubschema = void 0;
const ct = ee, Tu = C;
function F0(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const c = e.schema[t];
    return r === void 0 ? {
      schema: c,
      schemaPath: (0, ct._)`${e.schemaPath}${(0, ct.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: c[r],
      schemaPath: (0, ct._)`${e.schemaPath}${(0, ct.getProperty)(t)}${(0, ct.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, Tu.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Vt.getSubschema = F0;
function z0(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: c } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = c.let("data", (0, ct._)`${t.data}${(0, ct.getProperty)(r)}`, !0);
    l(E), e.errorPath = (0, ct.str)`${d}${(0, Tu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, ct._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof ct.Name ? s : c.let("data", s, !0);
    l(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function l(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Vt.extendSubschemaData = z0;
function U0(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Vt.extendSubschemaMode = U0;
var be = {}, Iu = { exports: {} }, Mt = Iu.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  xn(t, n, s, e, "", e);
};
Mt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Mt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Mt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Mt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function xn(e, t, r, n, s, a, o, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Mt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            xn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in Mt.propsKeywords) {
        if (h && typeof h == "object")
          for (var g in h)
            xn(e, t, r, h[g], s + "/" + u + "/" + q0(g), a, s, u, n, g);
      } else (u in Mt.keywords || e.allKeys && !(u in Mt.skipKeywords)) && xn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function q0(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var K0 = Iu.exports;
Object.defineProperty(be, "__esModule", { value: !0 });
be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
const G0 = C, H0 = gs, W0 = K0, B0 = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function X0(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !va(e) : t ? ju(e) <= t : !1;
}
be.inlineRef = X0;
const J0 = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function va(e) {
  for (const t in e) {
    if (J0.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(va) || typeof r == "object" && va(r))
      return !0;
  }
  return !1;
}
function ju(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !B0.has(r) && (typeof e[r] == "object" && (0, G0.eachItem)(e[r], (n) => t += ju(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function ku(e, t = "", r) {
  r !== !1 && (t = Ir(t));
  const n = e.parse(t);
  return Au(e, n);
}
be.getFullPath = ku;
function Au(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
be._getFullPath = Au;
const Y0 = /#\/?$/;
function Ir(e) {
  return e ? e.replace(Y0, "") : "";
}
be.normalizeId = Ir;
function Q0(e, t, r) {
  return r = Ir(r), e.resolve(t, r);
}
be.resolveUrl = Q0;
const Z0 = /^[a-z_][-a-z0-9._]*$/i;
function x0(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Ir(e[r] || t), a = { "": s }, o = ku(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return W0(e, { allKeys: !0 }, (h, E, g, w) => {
    if (w === void 0)
      return;
    const _ = o + E;
    let $ = a[w];
    typeof h[r] == "string" && ($ = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[E] = $;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = Ir($ ? R($, N) : N), l.has(N))
        throw u(N);
      l.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== Ir(_) && (N[0] === "#" ? (d(h, c[N], N), c[N] = h) : this.refs[N] = _), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!Z0.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), c;
  function d(h, E, g) {
    if (E !== void 0 && !H0(h, E))
      throw u(g);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
be.getSchemaRefs = x0;
Object.defineProperty(tt, "__esModule", { value: !0 });
tt.getData = tt.KeywordCxt = tt.validateFunctionCode = void 0;
const Cu = Cr, mc = ge, Lo = gt, ds = ge, e_ = Ps, dn = dt, Ws = Vt, q = ee, B = ft, t_ = be, _t = C, Yr = En;
function r_(e) {
  if (Lu(e) && (Vu(e), Mu(e))) {
    a_(e);
    return;
  }
  Du(e, () => (0, Cu.topBoolOrEmptySchema)(e));
}
tt.validateFunctionCode = r_;
function Du({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${B.default.data}, ${B.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${pc(r, s)}`), s_(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${B.default.data}, ${n_(s)}`, n.$async, () => e.code(pc(r, s)).code(a));
}
function n_(e) {
  return (0, q._)`{${B.default.instancePath}="", ${B.default.parentData}, ${B.default.parentDataProperty}, ${B.default.rootData}=${B.default.data}${e.dynamicRef ? (0, q._)`, ${B.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function s_(e, t) {
  e.if(B.default.valCxt, () => {
    e.var(B.default.instancePath, (0, q._)`${B.default.valCxt}.${B.default.instancePath}`), e.var(B.default.parentData, (0, q._)`${B.default.valCxt}.${B.default.parentData}`), e.var(B.default.parentDataProperty, (0, q._)`${B.default.valCxt}.${B.default.parentDataProperty}`), e.var(B.default.rootData, (0, q._)`${B.default.valCxt}.${B.default.rootData}`), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, q._)`${B.default.valCxt}.${B.default.dynamicAnchors}`);
  }, () => {
    e.var(B.default.instancePath, (0, q._)`""`), e.var(B.default.parentData, (0, q._)`undefined`), e.var(B.default.parentDataProperty, (0, q._)`undefined`), e.var(B.default.rootData, B.default.data), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function a_(e) {
  const { schema: t, opts: r, gen: n } = e;
  Du(e, () => {
    r.$comment && t.$comment && zu(e), u_(e), n.let(B.default.vErrors, null), n.let(B.default.errors, 0), r.unevaluated && o_(e), Fu(e), h_(e);
  });
}
function o_(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function pc(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function i_(e, t) {
  if (Lu(e) && (Vu(e), Mu(e))) {
    c_(e, t);
    return;
  }
  (0, Cu.boolOrEmptySchema)(e, t);
}
function Mu({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function Lu(e) {
  return typeof e.schema != "boolean";
}
function c_(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && zu(e), d_(e), f_(e);
  const a = n.const("_errs", B.default.errors);
  Fu(e, a), n.var(t, (0, q._)`${a} === ${B.default.errors}`);
}
function Vu(e) {
  (0, _t.checkUnknownRules)(e), l_(e);
}
function Fu(e, t) {
  if (e.opts.jtd)
    return yc(e, [], !1, t);
  const r = (0, mc.getSchemaTypes)(e.schema), n = (0, mc.coerceAndCheckDataType)(e, r);
  yc(e, r, !n, t);
}
function l_(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, _t.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function u_(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, _t.checkStrictMode)(e, "default is ignored in the schema root");
}
function d_(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, t_.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function f_(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function zu({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${B.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, c = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${B.default.self}.opts.$comment(${a}, ${o}, ${c}.schema)`);
  }
}
function h_(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${B.default.errors} === 0`, () => t.return(B.default.data), () => t.throw((0, q._)`new ${s}(${B.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, B.default.vErrors), a.unevaluated && m_(e), t.return((0, q._)`${B.default.errors} === 0`));
}
function m_({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function yc(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: c, opts: l, self: d } = e, { RULES: u } = d;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, _t.schemaHasRulesButRef)(a, u))) {
    s.block(() => Ku(e, "$ref", u.all.$ref.definition));
    return;
  }
  l.jtd || p_(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, Lo.shouldUseGroup)(a, E) && (E.type ? (s.if((0, ds.checkDataType)(E.type, o, l.strictNumbers)), $c(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, ds.reportTypeError)(e)), s.endIf()) : $c(e, E), c || s.if((0, q._)`${B.default.errors} === ${n || 0}`));
  }
}
function $c(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, e_.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Lo.shouldUseRule)(n, a) && Ku(e, a.keyword, a.definition, t.type);
  });
}
function p_(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (y_(e, t), e.opts.allowUnionTypes || $_(e, t), g_(e, e.dataTypes));
}
function y_(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Uu(e.dataTypes, r) || Vo(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), v_(e, t);
  }
}
function $_(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Vo(e, "use allowUnionTypes to allow union type keyword");
}
function g_(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Lo.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => __(t, o)) && Vo(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function __(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Uu(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function v_(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Uu(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Vo(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, _t.checkStrictMode)(e, t, e.opts.strictTypes);
}
class qu {
  constructor(t, r, n) {
    if ((0, dn.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, _t.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Gu(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, dn.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", B.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, q.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, q.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, q._)`${r} !== undefined && (${(0, q.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Yr.reportExtraError : Yr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Yr.reportError)(this, this.def.$dataError || Yr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Yr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = q.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = q.nil, r = q.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, q.or)((0, q._)`${s} === undefined`, r)), t !== q.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== q.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, q.or)(o(), c());
    function o() {
      if (n.length) {
        if (!(r instanceof q.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, q._)`${(0, ds.checkDataTypes)(l, r, a.opts.strictNumbers, ds.DataType.Wrong)}`;
      }
      return q.nil;
    }
    function c() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, q._)`!${l}(${r})`;
      }
      return q.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Ws.getSubschema)(this.it, t);
    (0, Ws.extendSubschemaData)(n, this.it, t), (0, Ws.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return i_(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = _t.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = _t.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, q.Name)), !0;
  }
}
tt.KeywordCxt = qu;
function Ku(e, t, r, n) {
  const s = new qu(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, dn.funcKeywordCode)(s, r) : "macro" in r ? (0, dn.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, dn.funcKeywordCode)(s, r);
}
const w_ = /^\/(?:[^~]|~0|~1)*$/, E_ = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Gu(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return B.default.rootData;
  if (e[0] === "/") {
    if (!w_.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = B.default.rootData;
  } else {
    const d = E_.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(l("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(l("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const c = s.split("/");
  for (const d of c)
    d && (a = (0, q._)`${a}${(0, q.getProperty)((0, _t.unescapeJsonPointer)(d))}`, o = (0, q._)`${o} && ${a}`);
  return o;
  function l(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
tt.getData = Gu;
var bn = {};
Object.defineProperty(bn, "__esModule", { value: !0 });
class b_ extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
bn.default = b_;
var Ur = {};
Object.defineProperty(Ur, "__esModule", { value: !0 });
const Bs = be;
class S_ extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Bs.resolveUrl)(t, r, n), this.missingSchema = (0, Bs.normalizeId)((0, Bs.getFullPath)(t, this.missingRef));
  }
}
Ur.default = S_;
var Ve = {};
Object.defineProperty(Ve, "__esModule", { value: !0 });
Ve.resolveSchema = Ve.getCompilingSchema = Ve.resolveRef = Ve.compileSchema = Ve.SchemaEnv = void 0;
const Je = ee, P_ = bn, tr = ft, xe = be, gc = C, N_ = tt;
class Ns {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Ve.SchemaEnv = Ns;
function Fo(e) {
  const t = Hu.call(this, e);
  if (t)
    return t;
  const r = (0, xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Je.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: P_.default,
    code: (0, Je._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: tr.default.data,
    parentData: tr.default.parentData,
    parentDataProperty: tr.default.parentDataProperty,
    dataNames: [tr.default.data],
    dataPathArr: [Je.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Je.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Je.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Je._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, N_.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(tr.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const g = new Function(`${tr.default.self}`, `${tr.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: g }), g.errors = null, g.schema = e.schema, g.schemaEnv = e, e.$async && (g.$async = !0), this.opts.code.source === !0 && (g.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: _ } = d;
      g.evaluated = {
        props: w instanceof Je.Name ? void 0 : w,
        items: _ instanceof Je.Name ? void 0 : _,
        dynamicProps: w instanceof Je.Name,
        dynamicItems: _ instanceof Je.Name
      }, g.source && (g.source.evaluated = (0, Je.stringify)(g.evaluated));
    }
    return e.validate = g, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Ve.compileSchema = Fo;
function R_(e, t, r) {
  var n;
  r = (0, xe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = I_.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new Ns({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = O_.call(this, a);
}
Ve.resolveRef = R_;
function O_(e) {
  return (0, xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Fo.call(this, e);
}
function Hu(e) {
  for (const t of this._compilations)
    if (T_(t, e))
      return t;
}
Ve.getCompilingSchema = Hu;
function T_(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function I_(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Rs.call(this, e, t);
}
function Rs(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, xe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, xe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Xs.call(this, r, e);
  const a = (0, xe.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = Rs.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Xs.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Fo.call(this, o), a === (0, xe.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, xe.resolveUrl)(this.opts.uriResolver, s, d)), new Ns({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Xs.call(this, r, o);
  }
}
Ve.resolveSchema = Rs;
const j_ = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Xs(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, gc.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !j_.has(c) && d && (t = (0, xe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, gc.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, xe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = Rs.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new Ns({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const k_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", A_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", C_ = "object", D_ = [
  "$data"
], M_ = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, L_ = !1, V_ = {
  $id: k_,
  description: A_,
  type: C_,
  required: D_,
  properties: M_,
  additionalProperties: L_
};
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const Wu = tu;
Wu.code = 'require("ajv/dist/runtime/uri").default';
zo.default = Wu;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = tt;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = ee;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = bn, s = Ur, a = mr, o = Ve, c = ee, l = be, d = ge, u = C, h = V_, E = zo, g = (P, p) => new RegExp(P, p);
  g.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), $ = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function N(P) {
    var p, S, y, i, f, b, T, j, F, V, ne, Fe, zt, Ut, qt, Kt, Gt, Ht, Wt, Bt, Xt, Jt, Yt, Qt, Zt;
    const We = P.strict, xt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Hr = xt === !0 || xt === void 0 ? 1 : xt || 0, Wr = (y = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && y !== void 0 ? y : g, Ds = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : We) !== null && b !== void 0 ? b : !0,
      strictNumbers: (j = (T = P.strictNumbers) !== null && T !== void 0 ? T : We) !== null && j !== void 0 ? j : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : We) !== null && V !== void 0 ? V : "log",
      strictTuples: (Fe = (ne = P.strictTuples) !== null && ne !== void 0 ? ne : We) !== null && Fe !== void 0 ? Fe : "log",
      strictRequired: (Ut = (zt = P.strictRequired) !== null && zt !== void 0 ? zt : We) !== null && Ut !== void 0 ? Ut : !1,
      code: P.code ? { ...P.code, optimize: Hr, regExp: Wr } : { optimize: Hr, regExp: Wr },
      loopRequired: (qt = P.loopRequired) !== null && qt !== void 0 ? qt : v,
      loopEnum: (Kt = P.loopEnum) !== null && Kt !== void 0 ? Kt : v,
      meta: (Gt = P.meta) !== null && Gt !== void 0 ? Gt : !0,
      messages: (Ht = P.messages) !== null && Ht !== void 0 ? Ht : !0,
      inlineRefs: (Wt = P.inlineRefs) !== null && Wt !== void 0 ? Wt : !0,
      schemaId: (Bt = P.schemaId) !== null && Bt !== void 0 ? Bt : "$id",
      addUsedSchema: (Xt = P.addUsedSchema) !== null && Xt !== void 0 ? Xt : !0,
      validateSchema: (Jt = P.validateSchema) !== null && Jt !== void 0 ? Jt : !0,
      validateFormats: (Yt = P.validateFormats) !== null && Yt !== void 0 ? Yt : !0,
      unicodeRegExp: (Qt = P.unicodeRegExp) !== null && Qt !== void 0 ? Qt : !0,
      int32range: (Zt = P.int32range) !== null && Zt !== void 0 ? Zt : !0,
      uriResolver: Ds
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: y } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: _, es5: S, lines: y }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, $, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = pe.call(this), p.formats && ue.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && fe.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), X.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: y } = this.opts;
      let i = h;
      y === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[y], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let y;
      if (typeof p == "string") {
        if (y = this.getSchema(p), !y)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        y = this.compile(p);
      const i = y(S);
      return "$async" in y || (this.errors = y.errors), i;
    }
    compile(p, S) {
      const y = this._addSchema(p, S);
      return y.validate || this._compileSchemaEnv(y);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: y } = this.opts;
      return i.call(this, p, S);
      async function i(V, ne) {
        await f.call(this, V.$schema);
        const Fe = this._addSchema(V, ne);
        return Fe.validate || b.call(this, Fe);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function b(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (ne) {
          if (!(ne instanceof s.default))
            throw ne;
          return T.call(this, ne), await j.call(this, ne.missingSchema), b.call(this, V);
        }
      }
      function T({ missingSchema: V, missingRef: ne }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${ne} cannot be resolved`);
      }
      async function j(V) {
        const ne = await F.call(this, V);
        this.refs[V] || await f.call(this, ne.$schema), this.refs[V] || this.addSchema(ne, V, S);
      }
      async function F(V) {
        const ne = this._loading[V];
        if (ne)
          return ne;
        try {
          return await (this._loading[V] = y(V));
        } finally {
          delete this._loading[V];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, y, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, y, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, y, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, y = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, y), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let y;
      if (y = p.$schema, y !== void 0 && typeof y != "string")
        throw new Error("$schema must be a string");
      if (y = y || this.opts.defaultMeta || this.defaultMeta(), !y)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(y, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = K.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: y } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: y });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = K.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let y = p[this.opts.schemaId];
          return y && (y = (0, l.normalizeId)(y), delete this.schemas[y], delete this.refs[y]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let y;
      if (typeof p == "string")
        y = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = y);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, y = S.keyword, Array.isArray(y) && !y.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (I.call(this, y, S), !S)
        return (0, u.eachItem)(y, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(y, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((b) => k.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const y of S.rules) {
        const i = y.rules.findIndex((f) => f.keyword === p);
        i >= 0 && y.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: y = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${y}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const y = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const T of f)
          b = b[T];
        for (const T in y) {
          const j = y[T];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, V = b[T];
          F && V && (b[T] = M(V));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const y in p) {
        const i = p[y];
        (!S || S.test(y)) && (typeof i == "string" ? delete p[y] : i && !i.meta && (this._cache.delete(i.schema), delete p[y]));
      }
    }
    _addSchema(p, S, y, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: T } = this.opts;
      if (typeof p == "object")
        b = p[T];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      y = (0, l.normalizeId)(b || y);
      const F = l.getSchemaRefs.call(this, p, y);
      return j = new o.SchemaEnv({ schema: p, schemaId: T, meta: S, baseId: y, localRefs: F }), this._cache.set(j.schema, j), f && !y.startsWith("#") && (y && this._checkUnique(y), this.refs[y] = j), i && this.validateSchema(p, !0), j;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, y = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[y](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function K(P) {
    return P = (0, l.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function X() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function ue() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function fe(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function pe() {
    const P = { ...this.opts };
    for (const p of w)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const se = /^[a-z_$][a-z0-9_$:-]*$/i;
  function I(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, (y) => {
      if (S.keywords[y])
        throw new Error(`Keyword ${y} is already defined`);
      if (!se.test(y))
        throw new Error(`Keyword ${y} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function k(P, p, S) {
    var y;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: j }) => j === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[P] = !0, !p)
      return;
    const T = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? L.call(this, b, T, p.before) : b.rules.push(T), f.all[P] = T, (y = p.implements) === null || y === void 0 || y.forEach((j) => this.addKeyword(j));
  }
  function L(P, p, S) {
    const y = P.rules.findIndex((i) => i.keyword === S);
    y >= 0 ? P.rules.splice(y, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const G = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, G] };
  }
})(mu);
var Uo = {}, qo = {}, Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const F_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Ko.default = F_;
var pr = {};
Object.defineProperty(pr, "__esModule", { value: !0 });
pr.callRef = pr.getValidate = void 0;
const z_ = Ur, _c = re, Le = ee, _r = ft, vc = Ve, Cn = C, U_ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = vc.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new z_.default(n.opts.uriResolver, s, r);
    if (u instanceof vc.SchemaEnv)
      return E(u);
    return g(u);
    function h() {
      if (a === d)
        return es(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return es(e, (0, Le._)`${w}.validate`, d, d.$async);
    }
    function E(w) {
      const _ = Bu(e, w);
      es(e, _, w, w.$async);
    }
    function g(w) {
      const _ = t.scopeValue("schema", c.code.source === !0 ? { ref: w, code: (0, Le.stringify)(w) } : { ref: w }), $ = t.name("valid"), m = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Le.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, $);
      e.mergeEvaluated(m), e.ok($);
    }
  }
};
function Bu(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Le._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
pr.getValidate = Bu;
function es(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? _r.default.this : Le.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Le._)`await ${(0, _c.callValidateCode)(e, t, d)}`), g(t), o || s.assign(w, !0);
    }, (_) => {
      s.if((0, Le._)`!(${_} instanceof ${a.ValidationError})`, () => s.throw(_)), E(_), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, _c.callValidateCode)(e, t, d), () => g(t), () => E(t));
  }
  function E(w) {
    const _ = (0, Le._)`${w}.errors`;
    s.assign(_r.default.vErrors, (0, Le._)`${_r.default.vErrors} === null ? ${_} : ${_r.default.vErrors}.concat(${_})`), s.assign(_r.default.errors, (0, Le._)`${_r.default.vErrors}.length`);
  }
  function g(w) {
    var _;
    if (!a.opts.unevaluated)
      return;
    const $ = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (a.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (a.props = Cn.mergeEvaluated.props(s, $.props, a.props));
      else {
        const m = s.var("props", (0, Le._)`${w}.evaluated.props`);
        a.props = Cn.mergeEvaluated.props(s, m, a.props, Le.Name);
      }
    if (a.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (a.items = Cn.mergeEvaluated.items(s, $.items, a.items));
      else {
        const m = s.var("items", (0, Le._)`${w}.evaluated.items`);
        a.items = Cn.mergeEvaluated.items(s, m, a.items, Le.Name);
      }
  }
}
pr.callRef = es;
pr.default = U_;
Object.defineProperty(qo, "__esModule", { value: !0 });
const q_ = Ko, K_ = pr, G_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  q_.default,
  K_.default
];
qo.default = G_;
var Go = {}, Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const fs = ee, Ot = fs.operators, hs = {
  maximum: { okStr: "<=", ok: Ot.LTE, fail: Ot.GT },
  minimum: { okStr: ">=", ok: Ot.GTE, fail: Ot.LT },
  exclusiveMaximum: { okStr: "<", ok: Ot.LT, fail: Ot.GTE },
  exclusiveMinimum: { okStr: ">", ok: Ot.GT, fail: Ot.LTE }
}, H_ = {
  message: ({ keyword: e, schemaCode: t }) => (0, fs.str)`must be ${hs[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, fs._)`{comparison: ${hs[e].okStr}, limit: ${t}}`
}, W_ = {
  keyword: Object.keys(hs),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: H_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, fs._)`${r} ${hs[t].fail} ${n} || isNaN(${r})`);
  }
};
Ho.default = W_;
var Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
const fn = ee, B_ = {
  message: ({ schemaCode: e }) => (0, fn.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, fn._)`{multipleOf: ${e}}`
}, X_ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: B_,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, fn._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, fn._)`${o} !== parseInt(${o})`;
    e.fail$data((0, fn._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
Wo.default = X_;
var Bo = {}, Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
function Xu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Xo.default = Xu;
Xu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Bo, "__esModule", { value: !0 });
const ir = ee, J_ = C, Y_ = Xo, Q_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, ir.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, ir._)`{limit: ${e}}`
}, Z_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Q_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? ir.operators.GT : ir.operators.LT, o = s.opts.unicode === !1 ? (0, ir._)`${r}.length` : (0, ir._)`${(0, J_.useFunc)(e.gen, Y_.default)}(${r})`;
    e.fail$data((0, ir._)`${o} ${a} ${n}`);
  }
};
Bo.default = Z_;
var Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const x_ = re, ms = ee, ev = {
  message: ({ schemaCode: e }) => (0, ms.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, ms._)`{pattern: ${e}}`
}, tv = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: ev,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", c = r ? (0, ms._)`(new RegExp(${s}, ${o}))` : (0, x_.usePattern)(e, n);
    e.fail$data((0, ms._)`!${c}.test(${t})`);
  }
};
Jo.default = tv;
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const hn = ee, rv = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, hn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, hn._)`{limit: ${e}}`
}, nv = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: rv,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? hn.operators.GT : hn.operators.LT;
    e.fail$data((0, hn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Yo.default = nv;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const Qr = re, mn = ee, sv = C, av = {
  message: ({ params: { missingProperty: e } }) => (0, mn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, mn._)`{missingProperty: ${e}}`
}, ov = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: av,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const g = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const _ of r)
        if ((g == null ? void 0 : g[_]) === void 0 && !w.has(_)) {
          const $ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${_}" is not defined at "${$}" (strictRequired)`;
          (0, sv.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (l || a)
        e.block$data(mn.nil, h);
      else
        for (const g of r)
          (0, Qr.checkReportMissingProp)(e, g);
    }
    function u() {
      const g = t.let("missing");
      if (l || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => E(g, w)), e.ok(w);
      } else
        t.if((0, Qr.checkMissingProp)(e, r, g)), (0, Qr.reportMissingProp)(e, g), t.else();
    }
    function h() {
      t.forOf("prop", n, (g) => {
        e.setParams({ missingProperty: g }), t.if((0, Qr.noPropertyInData)(t, s, g, c.ownProperties), () => e.error());
      });
    }
    function E(g, w) {
      e.setParams({ missingProperty: g }), t.forOf(g, n, () => {
        t.assign(w, (0, Qr.propertyInData)(t, s, g, c.ownProperties)), t.if((0, mn.not)(w), () => {
          e.error(), t.break();
        });
      }, mn.nil);
    }
  }
};
Qo.default = ov;
var Zo = {};
Object.defineProperty(Zo, "__esModule", { value: !0 });
const pn = ee, iv = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, pn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, pn._)`{limit: ${e}}`
}, cv = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: iv,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? pn.operators.GT : pn.operators.LT;
    e.fail$data((0, pn._)`${r}.length ${s} ${n}`);
  }
};
Zo.default = cv;
var xo = {}, Sn = {};
Object.defineProperty(Sn, "__esModule", { value: !0 });
const Ju = gs;
Ju.code = 'require("ajv/dist/runtime/equal").default';
Sn.default = Ju;
Object.defineProperty(xo, "__esModule", { value: !0 });
const Js = ge, we = ee, lv = C, uv = Sn, dv = {
  message: ({ params: { i: e, j: t } }) => (0, we.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, we._)`{i: ${e}, j: ${t}}`
}, fv = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: dv,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, Js.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, we._)`${o} === false`), e.ok(l);
    function u() {
      const w = t.let("i", (0, we._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: w, j: _ }), t.assign(l, !0), t.if((0, we._)`${w} > 1`, () => (h() ? E : g)(w, _));
    }
    function h() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function E(w, _) {
      const $ = t.name("item"), m = (0, Js.checkDataTypes)(d, $, c.opts.strictNumbers, Js.DataType.Wrong), v = t.const("indices", (0, we._)`{}`);
      t.for((0, we._)`;${w}--;`, () => {
        t.let($, (0, we._)`${r}[${w}]`), t.if(m, (0, we._)`continue`), d.length > 1 && t.if((0, we._)`typeof ${$} == "string"`, (0, we._)`${$} += "_"`), t.if((0, we._)`typeof ${v}[${$}] == "number"`, () => {
          t.assign(_, (0, we._)`${v}[${$}]`), e.error(), t.assign(l, !1).break();
        }).code((0, we._)`${v}[${$}] = ${w}`);
      });
    }
    function g(w, _) {
      const $ = (0, lv.useFunc)(t, uv.default), m = t.name("outer");
      t.label(m).for((0, we._)`;${w}--;`, () => t.for((0, we._)`${_} = ${w}; ${_}--;`, () => t.if((0, we._)`${$}(${r}[${w}], ${r}[${_}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
xo.default = fv;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const wa = ee, hv = C, mv = Sn, pv = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, wa._)`{allowedValue: ${e}}`
}, yv = {
  keyword: "const",
  $data: !0,
  error: pv,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, wa._)`!${(0, hv.useFunc)(t, mv.default)}(${r}, ${s})`) : e.fail((0, wa._)`${a} !== ${r}`);
  }
};
ei.default = yv;
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
const rn = ee, $v = C, gv = Sn, _v = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, rn._)`{allowedValues: ${e}}`
}, vv = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: _v,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, $v.useFunc)(t, gv.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const g = t.const("vSchema", a);
      u = (0, rn.or)(...s.map((w, _) => E(g, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (g) => t.if((0, rn._)`${d()}(${r}, ${g})`, () => t.assign(u, !0).break()));
    }
    function E(g, w) {
      const _ = s[w];
      return typeof _ == "object" && _ !== null ? (0, rn._)`${d()}(${r}, ${g}[${w}])` : (0, rn._)`${r} === ${_}`;
    }
  }
};
ti.default = vv;
Object.defineProperty(Go, "__esModule", { value: !0 });
const wv = Ho, Ev = Wo, bv = Bo, Sv = Jo, Pv = Yo, Nv = Qo, Rv = Zo, Ov = xo, Tv = ei, Iv = ti, jv = [
  // number
  wv.default,
  Ev.default,
  // string
  bv.default,
  Sv.default,
  // object
  Pv.default,
  Nv.default,
  // array
  Rv.default,
  Ov.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Tv.default,
  Iv.default
];
Go.default = jv;
var ri = {}, qr = {};
Object.defineProperty(qr, "__esModule", { value: !0 });
qr.validateAdditionalItems = void 0;
const cr = ee, Ea = C, kv = {
  message: ({ params: { len: e } }) => (0, cr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, cr._)`{limit: ${e}}`
}, Av = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: kv,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Ea.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Yu(e, n);
  }
};
function Yu(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, cr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, cr._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Ea.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, cr._)`${c} <= ${t.length}`);
    r.if((0, cr.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: Ea.Type.Num }, d), o.allErrors || r.if((0, cr.not)(d), () => r.break());
    });
  }
}
qr.validateAdditionalItems = Yu;
qr.default = Av;
var ni = {}, Kr = {};
Object.defineProperty(Kr, "__esModule", { value: !0 });
Kr.validateTuple = void 0;
const wc = ee, ts = C, Cv = re, Dv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Qu(e, "additionalItems", t);
    r.items = !0, !(0, ts.alwaysValidSchema)(r, t) && e.ok((0, Cv.validateArray)(e));
  }
};
function Qu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = ts.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, wc._)`${a}.length`);
  r.forEach((h, E) => {
    (0, ts.alwaysValidSchema)(c, h) || (n.if((0, wc._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: E, errSchemaPath: g } = c, w = r.length, _ = w === h.minItems && (w === h.maxItems || h[t] === !1);
    if (E.strictTuples && !_) {
      const $ = `"${o}" is ${w}-tuple, but minItems or maxItems/${t} are not specified or different at path "${g}"`;
      (0, ts.checkStrictMode)(c, $, E.strictTuples);
    }
  }
}
Kr.validateTuple = Qu;
Kr.default = Dv;
Object.defineProperty(ni, "__esModule", { value: !0 });
const Mv = Kr, Lv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Mv.validateTuple)(e, "items")
};
ni.default = Lv;
var si = {};
Object.defineProperty(si, "__esModule", { value: !0 });
const Ec = ee, Vv = C, Fv = re, zv = qr, Uv = {
  message: ({ params: { len: e } }) => (0, Ec.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ec._)`{limit: ${e}}`
}, qv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Uv,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Vv.alwaysValidSchema)(n, t) && (s ? (0, zv.validateAdditionalItems)(e, s) : e.ok((0, Fv.validateArray)(e)));
  }
};
si.default = qv;
var ai = {};
Object.defineProperty(ai, "__esModule", { value: !0 });
const He = ee, Dn = C, Kv = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, He.str)`must contain at least ${e} valid item(s)` : (0, He.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, He._)`{minContains: ${e}}` : (0, He._)`{minContains: ${e}, maxContains: ${t}}`
}, Gv = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Kv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, c;
    const { minContains: l, maxContains: d } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, c = d) : o = 1;
    const u = t.const("len", (0, He._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, Dn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, Dn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Dn.alwaysValidSchema)(a, r)) {
      let _ = (0, He._)`${u} >= ${o}`;
      c !== void 0 && (_ = (0, He._)`${_} && ${u} <= ${c}`), e.pass(_);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? g(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, He._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const _ = t.name("_valid"), $ = t.let("count", 0);
      g(_, () => t.if(_, () => w($)));
    }
    function g(_, $) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: Dn.Type.Num,
          compositeRule: !0
        }, _), $();
      });
    }
    function w(_) {
      t.code((0, He._)`${_}++`), c === void 0 ? t.if((0, He._)`${_} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, He._)`${_} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, He._)`${_} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
ai.default = Gv;
var Zu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ee, r = C, n = re;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [d, u] = a(l);
      o(l, d), c(l, u);
    }
  };
  function a({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(l[h]) ? d : u;
      E[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: E } = l;
    if (Object.keys(d).length === 0)
      return;
    const g = u.let("missing");
    for (const w in d) {
      const _ = d[w];
      if (_.length === 0)
        continue;
      const $ = (0, n.propertyInData)(u, h, w, E.opts.ownProperties);
      l.setParams({
        property: w,
        depsCount: _.length,
        deps: _.join(", ")
      }), E.allErrors ? u.if($, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${$} && (${(0, n.checkMissingProp)(l, _, g)})`), (0, n.reportMissingProp)(l, g), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: E, it: g } = l, w = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(g, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, g.opts.ownProperties),
        () => {
          const $ = l.subschema({ keyword: E, schemaProp: _ }, w);
          l.mergeValidEvaluated($, w);
        },
        () => u.var(w, !0)
        // TODO var
      ), l.ok(w));
  }
  e.validateSchemaDeps = c, e.default = s;
})(Zu);
var oi = {};
Object.defineProperty(oi, "__esModule", { value: !0 });
const xu = ee, Hv = C, Wv = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, xu._)`{propertyName: ${e.propertyName}}`
}, Bv = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Wv,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Hv.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, xu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
oi.default = Bv;
var Os = {};
Object.defineProperty(Os, "__esModule", { value: !0 });
const Mn = re, Qe = ee, Xv = ft, Ln = C, Jv = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Qe._)`{additionalProperty: ${e.additionalProperty}}`
}, Yv = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Jv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, Ln.alwaysValidSchema)(o, r))
      return;
    const d = (0, Mn.allSchemaProperties)(n.properties), u = (0, Mn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Qe._)`${a} === ${Xv.default.errors}`);
    function h() {
      t.forIn("key", s, ($) => {
        !d.length && !u.length ? w($) : t.if(E($), () => w($));
      });
    }
    function E($) {
      let m;
      if (d.length > 8) {
        const v = (0, Ln.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, Mn.isOwnProperty)(t, v, $);
      } else d.length ? m = (0, Qe.or)(...d.map((v) => (0, Qe._)`${$} === ${v}`)) : m = Qe.nil;
      return u.length && (m = (0, Qe.or)(m, ...u.map((v) => (0, Qe._)`${(0, Mn.usePattern)(e, v)}.test(${$})`))), (0, Qe.not)(m);
    }
    function g($) {
      t.code((0, Qe._)`delete ${s}[${$}]`);
    }
    function w($) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        g($);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: $ }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, Ln.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (_($, m, !1), t.if((0, Qe.not)(m), () => {
          e.reset(), g($);
        })) : (_($, m), c || t.if((0, Qe.not)(m), () => t.break()));
      }
    }
    function _($, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: Ln.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
Os.default = Yv;
var ii = {};
Object.defineProperty(ii, "__esModule", { value: !0 });
const Qv = tt, bc = re, Ys = C, Sc = Os, Zv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Sc.default.code(new Qv.KeywordCxt(a, Sc.default, "additionalProperties"));
    const o = (0, bc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ys.mergeEvaluated.props(t, (0, Ys.toHash)(o), a.props));
    const c = o.filter((h) => !(0, Ys.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, bc.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
ii.default = Zv;
var ci = {};
Object.defineProperty(ci, "__esModule", { value: !0 });
const Pc = re, Vn = ee, Nc = C, Rc = C, xv = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, Pc.allSchemaProperties)(r), l = c.filter((_) => (0, Nc.alwaysValidSchema)(a, r[_]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof Vn.Name) && (a.props = (0, Rc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const _ of c)
        d && g(_), a.allErrors ? w(_) : (t.var(u, !0), w(_), t.if(u));
    }
    function g(_) {
      for (const $ in d)
        new RegExp(_).test($) && (0, Nc.checkStrictMode)(a, `property ${$} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function w(_) {
      t.forIn("key", n, ($) => {
        t.if((0, Vn._)`${(0, Pc.usePattern)(e, _)}.test(${$})`, () => {
          const m = l.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: $,
            dataPropType: Rc.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, Vn._)`${h}[${$}]`, !0) : !m && !a.allErrors && t.if((0, Vn.not)(u), () => t.break());
        });
      });
    }
  }
};
ci.default = xv;
var li = {};
Object.defineProperty(li, "__esModule", { value: !0 });
const ew = C, tw = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, ew.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
li.default = tw;
var ui = {};
Object.defineProperty(ui, "__esModule", { value: !0 });
const rw = re, nw = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: rw.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
ui.default = nw;
var di = {};
Object.defineProperty(di, "__esModule", { value: !0 });
const rs = ee, sw = C, aw = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, rs._)`{passingSchemas: ${e.passing}}`
}, ow = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: aw,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, sw.alwaysValidSchema)(s, u) ? t.var(l, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, rs._)`${l} && ${o}`).assign(o, !1).assign(c, (0, rs._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), E && e.mergeEvaluated(E, rs.Name);
        });
      });
    }
  }
};
di.default = ow;
var fi = {};
Object.defineProperty(fi, "__esModule", { value: !0 });
const iw = C, cw = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, iw.alwaysValidSchema)(n, a))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
fi.default = cw;
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
const ps = ee, ed = C, lw = {
  message: ({ params: e }) => (0, ps.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, ps._)`{failingKeyword: ${e.ifClause}}`
}, uw = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: lw,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, ed.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Oc(n, "then"), a = Oc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, ps.not)(c), d("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, ps._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Oc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, ed.alwaysValidSchema)(e, r);
}
hi.default = uw;
var mi = {};
Object.defineProperty(mi, "__esModule", { value: !0 });
const dw = C, fw = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, dw.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
mi.default = fw;
Object.defineProperty(ri, "__esModule", { value: !0 });
const hw = qr, mw = ni, pw = Kr, yw = si, $w = ai, gw = Zu, _w = oi, vw = Os, ww = ii, Ew = ci, bw = li, Sw = ui, Pw = di, Nw = fi, Rw = hi, Ow = mi;
function Tw(e = !1) {
  const t = [
    // any
    bw.default,
    Sw.default,
    Pw.default,
    Nw.default,
    Rw.default,
    Ow.default,
    // object
    _w.default,
    vw.default,
    gw.default,
    ww.default,
    Ew.default
  ];
  return e ? t.push(mw.default, yw.default) : t.push(hw.default, pw.default), t.push($w.default), t;
}
ri.default = Tw;
var pi = {}, yi = {};
Object.defineProperty(yi, "__esModule", { value: !0 });
const me = ee, Iw = {
  message: ({ schemaCode: e }) => (0, me.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, me._)`{format: ${e}}`
}, jw = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Iw,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? E() : g();
    function E() {
      const w = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), _ = r.const("fDef", (0, me._)`${w}[${o}]`), $ = r.let("fType"), m = r.let("format");
      r.if((0, me._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign($, (0, me._)`${_}.type || "string"`).assign(m, (0, me._)`${_}.validate`), () => r.assign($, (0, me._)`"string"`).assign(m, _)), e.fail$data((0, me.or)(v(), N()));
      function v() {
        return l.strictSchema === !1 ? me.nil : (0, me._)`${o} && !${m}`;
      }
      function N() {
        const R = u.$async ? (0, me._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, me._)`${m}(${n})`, O = (0, me._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, me._)`${m} && ${m} !== true && ${$} === ${t} && !${O}`;
      }
    }
    function g() {
      const w = h.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [_, $, m] = N(w);
      _ === t && e.pass(R());
      function v() {
        if (l.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const K = O instanceof RegExp ? (0, me.regexpCode)(O) : l.code.formats ? (0, me._)`${l.code.formats}${(0, me.getProperty)(a)}` : void 0, X = r.scopeValue("formats", { key: a, ref: O, code: K });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, me._)`${X}.validate`] : ["string", O, X];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, me._)`await ${m}(${n})`;
        }
        return typeof $ == "function" ? (0, me._)`${m}(${n})` : (0, me._)`${m}.test(${n})`;
      }
    }
  }
};
yi.default = jw;
Object.defineProperty(pi, "__esModule", { value: !0 });
const kw = yi, Aw = [kw.default];
pi.default = Aw;
var Dr = {};
Object.defineProperty(Dr, "__esModule", { value: !0 });
Dr.contentVocabulary = Dr.metadataVocabulary = void 0;
Dr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Dr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Uo, "__esModule", { value: !0 });
const Cw = qo, Dw = Go, Mw = ri, Lw = pi, Tc = Dr, Vw = [
  Cw.default,
  Dw.default,
  (0, Mw.default)(),
  Lw.default,
  Tc.metadataVocabulary,
  Tc.contentVocabulary
];
Uo.default = Vw;
var $i = {}, Ts = {};
Object.defineProperty(Ts, "__esModule", { value: !0 });
Ts.DiscrError = void 0;
var Ic;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Ic || (Ts.DiscrError = Ic = {}));
Object.defineProperty($i, "__esModule", { value: !0 });
const Er = ee, ba = Ts, jc = Ve, Fw = Ur, zw = C, Uw = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ba.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, Er._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, qw = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Uw,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, Er._)`${r}${(0, Er.getProperty)(c)}`);
    t.if((0, Er._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: ba.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const g = E();
      t.if(!1);
      for (const w in g)
        t.elseIf((0, Er._)`${d} === ${w}`), t.assign(l, h(g[w]));
      t.else(), e.error(!1, { discrError: ba.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h(g) {
      const w = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: g }, w);
      return e.mergeEvaluated(_, Er.Name), w;
    }
    function E() {
      var g;
      const w = {}, _ = m(s);
      let $ = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, zw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const X = O.$ref;
          if (O = jc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), O instanceof jc.SchemaEnv && (O = O.schema), O === void 0)
            throw new Fw.default(a.opts.uriResolver, a.baseId, X);
        }
        const K = (g = O == null ? void 0 : O.properties) === null || g === void 0 ? void 0 : g[c];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        $ = $ && (_ || m(O)), v(K, R);
      }
      if (!$)
        throw new Error(`discriminator: "${c}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(c);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const K of R.enum)
            N(K, O);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        w[R] = O;
      }
    }
  }
};
$i.default = qw;
const Kw = "http://json-schema.org/draft-07/schema#", Gw = "http://json-schema.org/draft-07/schema#", Hw = "Core schema meta-schema", Ww = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Bw = [
  "object",
  "boolean"
], Xw = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, Jw = {
  $schema: Kw,
  $id: Gw,
  title: Hw,
  definitions: Ww,
  type: Bw,
  properties: Xw,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = mu, n = Uo, s = $i, a = Jw, o = ["/properties"], c = "http://json-schema.org/draft-07/schema";
  class l extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((w) => this.addVocabulary(w)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const w = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(w, c, !1), this.refs["http://json-schema.org/schema"] = c;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var d = tt;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = ee;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return u._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return u.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return u.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return u.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return u.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return u.CodeGen;
  } });
  var h = bn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var E = Ur;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
})(ya, ya.exports);
var Yw = ya.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = Yw, r = ee, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: c, schemaCode: l }) => (0, r.str)`should be ${s[c].okStr} ${l}`,
    params: ({ keyword: c, schemaCode: l }) => (0, r._)`{comparison: ${s[c].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(c) {
      const { gen: l, data: d, schemaCode: u, keyword: h, it: E } = c, { opts: g, self: w } = E;
      if (!g.validateFormats)
        return;
      const _ = new t.KeywordCxt(E, w.RULES.all.format.definition, "format");
      _.$data ? $() : m();
      function $() {
        const N = l.scopeValue("formats", {
          ref: w.formats,
          code: g.code.formats
        }), R = l.const("fmt", (0, r._)`${N}[${_.schemaCode}]`);
        c.fail$data((0, r.or)((0, r._)`typeof ${R} != "object"`, (0, r._)`${R} instanceof RegExp`, (0, r._)`typeof ${R}.compare != "function"`, v(R)));
      }
      function m() {
        const N = _.schema, R = w.formats[N];
        if (!R || R === !0)
          return;
        if (typeof R != "object" || R instanceof RegExp || typeof R.compare != "function")
          throw new Error(`"${h}": format "${N}" does not define "compare" function`);
        const O = l.scopeValue("formats", {
          key: N,
          ref: R,
          code: g.code.formats ? (0, r._)`${g.code.formats}${(0, r.getProperty)(N)}` : void 0
        });
        c.fail$data(v(O));
      }
      function v(N) {
        return (0, r._)`${N}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (c) => (c.addKeyword(e.formatLimitDefinition), c);
  e.default = o;
})(hu);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = fu, n = hu, s = ee, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), c = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return l(d, u, r.fullFormats, a), d;
    const [h, E] = u.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], g = u.formats || r.formatNames;
    return l(d, g, h, E), u.keywords && (0, n.default)(d), d;
  };
  c.get = (d, u = "full") => {
    const E = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!E)
      throw new Error(`Unknown format "${d}"`);
    return E;
  };
  function l(d, u, h, E) {
    var g, w;
    (g = (w = d.opts.code).formats) !== null && g !== void 0 || (w.formats = (0, s._)`require("ajv-formats/dist/formats").${E}`);
    for (const _ of u)
      d.addFormat(_, h[_]);
  }
  e.exports = t = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
})(pa, pa.exports);
var Qw = pa.exports;
const Zw = /* @__PURE__ */ fl(Qw), xw = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !eE(s, a) && n || Object.defineProperty(e, r, a);
}, eE = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, tE = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, rE = (e, t) => `/* Wrapped ${e}*/
${t}`, nE = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), sE = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), aE = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = rE.bind(null, n, t.toString());
  Object.defineProperty(s, "name", sE);
  const { writable: a, enumerable: o, configurable: c } = nE;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: c });
};
function oE(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    xw(e, t, s, r);
  return tE(e, t), aE(e, t, n), e;
}
const kc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: a = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, c, l;
  const d = function(...u) {
    const h = this, E = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), a && (l = e.apply(h, u));
    }, g = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), a && (l = e.apply(h, u));
    }, w = s && !o;
    return clearTimeout(o), o = setTimeout(E, r), n > 0 && n !== Number.POSITIVE_INFINITY && !c && (c = setTimeout(g, n)), w && (l = e.apply(h, u)), l;
  };
  return oE(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), c && (clearTimeout(c), c = void 0);
  }, d;
};
var Sa = { exports: {} };
const iE = "2.0.0", td = 256, cE = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, lE = 16, uE = td - 6, dE = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var Is = {
  MAX_LENGTH: td,
  MAX_SAFE_COMPONENT_LENGTH: lE,
  MAX_SAFE_BUILD_LENGTH: uE,
  MAX_SAFE_INTEGER: cE,
  RELEASE_TYPES: dE,
  SEMVER_SPEC_VERSION: iE,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const fE = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var js = fE;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = Is, a = js;
  t = e.exports = {};
  const o = t.re = [], c = t.safeRe = [], l = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const E = "[a-zA-Z0-9-]", g = [
    ["\\s", 1],
    ["\\d", s],
    [E, n]
  ], w = ($) => {
    for (const [m, v] of g)
      $ = $.split(`${m}*`).join(`${m}{0,${v}}`).split(`${m}+`).join(`${m}{1,${v}}`);
    return $;
  }, _ = ($, m, v) => {
    const N = w(m), R = h++;
    a($, R, m), u[$] = R, l[R] = m, d[R] = N, o[R] = new RegExp(m, v ? "g" : void 0), c[R] = new RegExp(N, v ? "g" : void 0);
  };
  _("NUMERICIDENTIFIER", "0|[1-9]\\d*"), _("NUMERICIDENTIFIERLOOSE", "\\d+"), _("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${E}*`), _("MAINVERSION", `(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})`), _("MAINVERSIONLOOSE", `(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASEIDENTIFIER", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIER]})`), _("PRERELEASEIDENTIFIERLOOSE", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASE", `(?:-(${l[u.PRERELEASEIDENTIFIER]}(?:\\.${l[u.PRERELEASEIDENTIFIER]})*))`), _("PRERELEASELOOSE", `(?:-?(${l[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[u.PRERELEASEIDENTIFIERLOOSE]})*))`), _("BUILDIDENTIFIER", `${E}+`), _("BUILD", `(?:\\+(${l[u.BUILDIDENTIFIER]}(?:\\.${l[u.BUILDIDENTIFIER]})*))`), _("FULLPLAIN", `v?${l[u.MAINVERSION]}${l[u.PRERELEASE]}?${l[u.BUILD]}?`), _("FULL", `^${l[u.FULLPLAIN]}$`), _("LOOSEPLAIN", `[v=\\s]*${l[u.MAINVERSIONLOOSE]}${l[u.PRERELEASELOOSE]}?${l[u.BUILD]}?`), _("LOOSE", `^${l[u.LOOSEPLAIN]}$`), _("GTLT", "((?:<|>)?=?)"), _("XRANGEIDENTIFIERLOOSE", `${l[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), _("XRANGEIDENTIFIER", `${l[u.NUMERICIDENTIFIER]}|x|X|\\*`), _("XRANGEPLAIN", `[v=\\s]*(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:${l[u.PRERELEASE]})?${l[u.BUILD]}?)?)?`), _("XRANGEPLAINLOOSE", `[v=\\s]*(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:${l[u.PRERELEASELOOSE]})?${l[u.BUILD]}?)?)?`), _("XRANGE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAIN]}$`), _("XRANGELOOSE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAINLOOSE]}$`), _("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), _("COERCE", `${l[u.COERCEPLAIN]}(?:$|[^\\d])`), _("COERCEFULL", l[u.COERCEPLAIN] + `(?:${l[u.PRERELEASE]})?(?:${l[u.BUILD]})?(?:$|[^\\d])`), _("COERCERTL", l[u.COERCE], !0), _("COERCERTLFULL", l[u.COERCEFULL], !0), _("LONETILDE", "(?:~>?)"), _("TILDETRIM", `(\\s*)${l[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", _("TILDE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAIN]}$`), _("TILDELOOSE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAINLOOSE]}$`), _("LONECARET", "(?:\\^)"), _("CARETTRIM", `(\\s*)${l[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", _("CARET", `^${l[u.LONECARET]}${l[u.XRANGEPLAIN]}$`), _("CARETLOOSE", `^${l[u.LONECARET]}${l[u.XRANGEPLAINLOOSE]}$`), _("COMPARATORLOOSE", `^${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]})$|^$`), _("COMPARATOR", `^${l[u.GTLT]}\\s*(${l[u.FULLPLAIN]})$|^$`), _("COMPARATORTRIM", `(\\s*)${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]}|${l[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", _("HYPHENRANGE", `^\\s*(${l[u.XRANGEPLAIN]})\\s+-\\s+(${l[u.XRANGEPLAIN]})\\s*$`), _("HYPHENRANGELOOSE", `^\\s*(${l[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[u.XRANGEPLAINLOOSE]})\\s*$`), _("STAR", "(<|>)?=?\\s*\\*"), _("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), _("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Sa, Sa.exports);
var Pn = Sa.exports;
const hE = Object.freeze({ loose: !0 }), mE = Object.freeze({}), pE = (e) => e ? typeof e != "object" ? hE : e : mE;
var gi = pE;
const Ac = /^[0-9]+$/, rd = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = Ac.test(e), n = Ac.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, yE = (e, t) => rd(t, e);
var nd = {
  compareIdentifiers: rd,
  rcompareIdentifiers: yE
};
const Fn = js, { MAX_LENGTH: Cc, MAX_SAFE_INTEGER: zn } = Is, { safeRe: Un, t: qn } = Pn, $E = gi, { compareIdentifiers: Qs } = nd;
let gE = class at {
  constructor(t, r) {
    if (r = $E(r), t instanceof at) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > Cc)
      throw new TypeError(
        `version is longer than ${Cc} characters`
      );
    Fn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? Un[qn.LOOSE] : Un[qn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > zn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > zn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > zn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < zn)
          return a;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (Fn("SemVer.compare", this.version, this.options, t), !(t instanceof at)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new at(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof at || (t = new at(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof at || (t = new at(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (Fn("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Qs(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof at || (t = new at(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (Fn("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Qs(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? Un[qn.PRERELEASELOOSE] : Un[qn.PRERELEASE]);
        if (!s || s[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let a = [r, s];
          n === !1 && (a = [r]), Qs(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ae = gE;
const Dc = Ae, _E = (e, t, r = !1) => {
  if (e instanceof Dc)
    return e;
  try {
    return new Dc(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Gr = _E;
const vE = Gr, wE = (e, t) => {
  const r = vE(e, t);
  return r ? r.version : null;
};
var EE = wE;
const bE = Gr, SE = (e, t) => {
  const r = bE(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var PE = SE;
const Mc = Ae, NE = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new Mc(
      e instanceof Mc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var RE = NE;
const Lc = Gr, OE = (e, t) => {
  const r = Lc(e, null, !0), n = Lc(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, c = a ? n : r, l = !!o.prerelease.length;
  if (!!c.prerelease.length && !l) {
    if (!c.patch && !c.minor)
      return "major";
    if (c.compareMain(o) === 0)
      return c.minor && !c.patch ? "minor" : "patch";
  }
  const u = l ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var TE = OE;
const IE = Ae, jE = (e, t) => new IE(e, t).major;
var kE = jE;
const AE = Ae, CE = (e, t) => new AE(e, t).minor;
var DE = CE;
const ME = Ae, LE = (e, t) => new ME(e, t).patch;
var VE = LE;
const FE = Gr, zE = (e, t) => {
  const r = FE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var UE = zE;
const Vc = Ae, qE = (e, t, r) => new Vc(e, r).compare(new Vc(t, r));
var nt = qE;
const KE = nt, GE = (e, t, r) => KE(t, e, r);
var HE = GE;
const WE = nt, BE = (e, t) => WE(e, t, !0);
var XE = BE;
const Fc = Ae, JE = (e, t, r) => {
  const n = new Fc(e, r), s = new Fc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var _i = JE;
const YE = _i, QE = (e, t) => e.sort((r, n) => YE(r, n, t));
var ZE = QE;
const xE = _i, eb = (e, t) => e.sort((r, n) => xE(n, r, t));
var tb = eb;
const rb = nt, nb = (e, t, r) => rb(e, t, r) > 0;
var ks = nb;
const sb = nt, ab = (e, t, r) => sb(e, t, r) < 0;
var vi = ab;
const ob = nt, ib = (e, t, r) => ob(e, t, r) === 0;
var sd = ib;
const cb = nt, lb = (e, t, r) => cb(e, t, r) !== 0;
var ad = lb;
const ub = nt, db = (e, t, r) => ub(e, t, r) >= 0;
var wi = db;
const fb = nt, hb = (e, t, r) => fb(e, t, r) <= 0;
var Ei = hb;
const mb = sd, pb = ad, yb = ks, $b = wi, gb = vi, _b = Ei, vb = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return mb(e, r, n);
    case "!=":
      return pb(e, r, n);
    case ">":
      return yb(e, r, n);
    case ">=":
      return $b(e, r, n);
    case "<":
      return gb(e, r, n);
    case "<=":
      return _b(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var od = vb;
const wb = Ae, Eb = Gr, { safeRe: Kn, t: Gn } = Pn, bb = (e, t) => {
  if (e instanceof wb)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? Kn[Gn.COERCEFULL] : Kn[Gn.COERCE]);
  else {
    const l = t.includePrerelease ? Kn[Gn.COERCERTLFULL] : Kn[Gn.COERCERTL];
    let d;
    for (; (d = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), l.lastIndex = d.index + d[1].length + d[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", c = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return Eb(`${n}.${s}.${a}${o}${c}`, t);
};
var Sb = bb;
class Pb {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var Nb = Pb, Zs, zc;
function st() {
  if (zc) return Zs;
  zc = 1;
  const e = /\s+/g;
  class t {
    constructor(k, L) {
      if (L = s(L), k instanceof t)
        return k.loose === !!L.loose && k.includePrerelease === !!L.includePrerelease ? k : new t(k.raw, L);
      if (k instanceof a)
        return this.raw = k.value, this.set = [[k]], this.formatted = void 0, this;
      if (this.options = L, this.loose = !!L.loose, this.includePrerelease = !!L.includePrerelease, this.raw = k.trim().replace(e, " "), this.set = this.raw.split("||").map((D) => this.parseRange(D.trim())).filter((D) => D.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const D = this.set[0];
        if (this.set = this.set.filter((G) => !_(G[0])), this.set.length === 0)
          this.set = [D];
        else if (this.set.length > 1) {
          for (const G of this.set)
            if (G.length === 1 && $(G[0])) {
              this.set = [G];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let k = 0; k < this.set.length; k++) {
          k > 0 && (this.formatted += "||");
          const L = this.set[k];
          for (let D = 0; D < L.length; D++)
            D > 0 && (this.formatted += " "), this.formatted += L[D].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(k) {
      const D = ((this.options.includePrerelease && g) | (this.options.loose && w)) + ":" + k, G = n.get(D);
      if (G)
        return G;
      const M = this.options.loose, P = M ? l[d.HYPHENRANGELOOSE] : l[d.HYPHENRANGE];
      k = k.replace(P, H(this.options.includePrerelease)), o("hyphen replace", k), k = k.replace(l[d.COMPARATORTRIM], u), o("comparator trim", k), k = k.replace(l[d.TILDETRIM], h), o("tilde trim", k), k = k.replace(l[d.CARETTRIM], E), o("caret trim", k);
      let p = k.split(" ").map((f) => v(f, this.options)).join(" ").split(/\s+/).map((f) => z(f, this.options));
      M && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(l[d.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), y = p.map((f) => new a(f, this.options));
      for (const f of y) {
        if (_(f))
          return [f];
        S.set(f.value, f);
      }
      S.size > 1 && S.has("") && S.delete("");
      const i = [...S.values()];
      return n.set(D, i), i;
    }
    intersects(k, L) {
      if (!(k instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((D) => m(D, L) && k.set.some((G) => m(G, L) && D.every((M) => G.every((P) => M.intersects(P, L)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(k) {
      if (!k)
        return !1;
      if (typeof k == "string")
        try {
          k = new c(k, this.options);
        } catch {
          return !1;
        }
      for (let L = 0; L < this.set.length; L++)
        if (se(this.set[L], k, this.options))
          return !0;
      return !1;
    }
  }
  Zs = t;
  const r = Nb, n = new r(), s = gi, a = As(), o = js, c = Ae, {
    safeRe: l,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: E
  } = Pn, { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: w } = Is, _ = (I) => I.value === "<0.0.0-0", $ = (I) => I.value === "", m = (I, k) => {
    let L = !0;
    const D = I.slice();
    let G = D.pop();
    for (; L && D.length; )
      L = D.every((M) => G.intersects(M, k)), G = D.pop();
    return L;
  }, v = (I, k) => (I = I.replace(l[d.BUILD], ""), o("comp", I, k), I = K(I, k), o("caret", I), I = R(I, k), o("tildes", I), I = ue(I, k), o("xrange", I), I = pe(I, k), o("stars", I), I), N = (I) => !I || I.toLowerCase() === "x" || I === "*", R = (I, k) => I.trim().split(/\s+/).map((L) => O(L, k)).join(" "), O = (I, k) => {
    const L = k.loose ? l[d.TILDELOOSE] : l[d.TILDE];
    return I.replace(L, (D, G, M, P, p) => {
      o("tilde", I, D, G, M, P, p);
      let S;
      return N(G) ? S = "" : N(M) ? S = `>=${G}.0.0 <${+G + 1}.0.0-0` : N(P) ? S = `>=${G}.${M}.0 <${G}.${+M + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${G}.${M}.${P}-${p} <${G}.${+M + 1}.0-0`) : S = `>=${G}.${M}.${P} <${G}.${+M + 1}.0-0`, o("tilde return", S), S;
    });
  }, K = (I, k) => I.trim().split(/\s+/).map((L) => X(L, k)).join(" "), X = (I, k) => {
    o("caret", I, k);
    const L = k.loose ? l[d.CARETLOOSE] : l[d.CARET], D = k.includePrerelease ? "-0" : "";
    return I.replace(L, (G, M, P, p, S) => {
      o("caret", I, G, M, P, p, S);
      let y;
      return N(M) ? y = "" : N(P) ? y = `>=${M}.0.0${D} <${+M + 1}.0.0-0` : N(p) ? M === "0" ? y = `>=${M}.${P}.0${D} <${M}.${+P + 1}.0-0` : y = `>=${M}.${P}.0${D} <${+M + 1}.0.0-0` : S ? (o("replaceCaret pr", S), M === "0" ? P === "0" ? y = `>=${M}.${P}.${p}-${S} <${M}.${P}.${+p + 1}-0` : y = `>=${M}.${P}.${p}-${S} <${M}.${+P + 1}.0-0` : y = `>=${M}.${P}.${p}-${S} <${+M + 1}.0.0-0`) : (o("no pr"), M === "0" ? P === "0" ? y = `>=${M}.${P}.${p}${D} <${M}.${P}.${+p + 1}-0` : y = `>=${M}.${P}.${p}${D} <${M}.${+P + 1}.0-0` : y = `>=${M}.${P}.${p} <${+M + 1}.0.0-0`), o("caret return", y), y;
    });
  }, ue = (I, k) => (o("replaceXRanges", I, k), I.split(/\s+/).map((L) => fe(L, k)).join(" ")), fe = (I, k) => {
    I = I.trim();
    const L = k.loose ? l[d.XRANGELOOSE] : l[d.XRANGE];
    return I.replace(L, (D, G, M, P, p, S) => {
      o("xRange", I, D, G, M, P, p, S);
      const y = N(M), i = y || N(P), f = i || N(p), b = f;
      return G === "=" && b && (G = ""), S = k.includePrerelease ? "-0" : "", y ? G === ">" || G === "<" ? D = "<0.0.0-0" : D = "*" : G && b ? (i && (P = 0), p = 0, G === ">" ? (G = ">=", i ? (M = +M + 1, P = 0, p = 0) : (P = +P + 1, p = 0)) : G === "<=" && (G = "<", i ? M = +M + 1 : P = +P + 1), G === "<" && (S = "-0"), D = `${G + M}.${P}.${p}${S}`) : i ? D = `>=${M}.0.0${S} <${+M + 1}.0.0-0` : f && (D = `>=${M}.${P}.0${S} <${M}.${+P + 1}.0-0`), o("xRange return", D), D;
    });
  }, pe = (I, k) => (o("replaceStars", I, k), I.trim().replace(l[d.STAR], "")), z = (I, k) => (o("replaceGTE0", I, k), I.trim().replace(l[k.includePrerelease ? d.GTE0PRE : d.GTE0], "")), H = (I) => (k, L, D, G, M, P, p, S, y, i, f, b) => (N(D) ? L = "" : N(G) ? L = `>=${D}.0.0${I ? "-0" : ""}` : N(M) ? L = `>=${D}.${G}.0${I ? "-0" : ""}` : P ? L = `>=${L}` : L = `>=${L}${I ? "-0" : ""}`, N(y) ? S = "" : N(i) ? S = `<${+y + 1}.0.0-0` : N(f) ? S = `<${y}.${+i + 1}.0-0` : b ? S = `<=${y}.${i}.${f}-${b}` : I ? S = `<${y}.${i}.${+f + 1}-0` : S = `<=${S}`, `${L} ${S}`.trim()), se = (I, k, L) => {
    for (let D = 0; D < I.length; D++)
      if (!I[D].test(k))
        return !1;
    if (k.prerelease.length && !L.includePrerelease) {
      for (let D = 0; D < I.length; D++)
        if (o(I[D].semver), I[D].semver !== a.ANY && I[D].semver.prerelease.length > 0) {
          const G = I[D].semver;
          if (G.major === k.major && G.minor === k.minor && G.patch === k.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Zs;
}
var xs, Uc;
function As() {
  if (Uc) return xs;
  Uc = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(u, h) {
      if (h = r(h), u instanceof t) {
        if (u.loose === !!h.loose)
          return u;
        u = u.value;
      }
      u = u.trim().split(/\s+/).join(" "), o("comparator", u, h), this.options = h, this.loose = !!h.loose, this.parse(u), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(u) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], E = u.match(h);
      if (!E)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = E[1] !== void 0 ? E[1] : "", this.operator === "=" && (this.operator = ""), E[2] ? this.semver = new c(E[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (o("Comparator.test", u, this.options.loose), this.semver === e || u === e)
        return !0;
      if (typeof u == "string")
        try {
          u = new c(u, this.options);
        } catch {
          return !1;
        }
      return a(u, this.operator, this.semver, this.options);
    }
    intersects(u, h) {
      if (!(u instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(u.value, h).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new l(this.value, h).test(u.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || a(this.semver, "<", u.semver, h) && this.operator.startsWith(">") && u.operator.startsWith("<") || a(this.semver, ">", u.semver, h) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  xs = t;
  const r = gi, { safeRe: n, t: s } = Pn, a = od, o = js, c = Ae, l = st();
  return xs;
}
const Rb = st(), Ob = (e, t, r) => {
  try {
    t = new Rb(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var Cs = Ob;
const Tb = st(), Ib = (e, t) => new Tb(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var jb = Ib;
const kb = Ae, Ab = st(), Cb = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Ab(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new kb(n, r));
  }), n;
};
var Db = Cb;
const Mb = Ae, Lb = st(), Vb = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Lb(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new Mb(n, r));
  }), n;
};
var Fb = Vb;
const ea = Ae, zb = st(), qc = ks, Ub = (e, t) => {
  e = new zb(e, t);
  let r = new ea("0.0.0");
  if (e.test(r) || (r = new ea("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const c = new ea(o.semver.version);
      switch (o.operator) {
        case ">":
          c.prerelease.length === 0 ? c.patch++ : c.prerelease.push(0), c.raw = c.format();
        case "":
        case ">=":
          (!a || qc(c, a)) && (a = c);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || qc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var qb = Ub;
const Kb = st(), Gb = (e, t) => {
  try {
    return new Kb(e, t).range || "*";
  } catch {
    return null;
  }
};
var Hb = Gb;
const Wb = Ae, id = As(), { ANY: Bb } = id, Xb = st(), Jb = Cs, Kc = ks, Gc = vi, Yb = Ei, Qb = wi, Zb = (e, t, r, n) => {
  e = new Wb(e, n), t = new Xb(t, n);
  let s, a, o, c, l;
  switch (r) {
    case ">":
      s = Kc, a = Yb, o = Gc, c = ">", l = ">=";
      break;
    case "<":
      s = Gc, a = Qb, o = Kc, c = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Jb(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, E = null;
    if (u.forEach((g) => {
      g.semver === Bb && (g = new id(">=0.0.0")), h = h || g, E = E || g, s(g.semver, h.semver, n) ? h = g : o(g.semver, E.semver, n) && (E = g);
    }), h.operator === c || h.operator === l || (!E.operator || E.operator === c) && a(e, E.semver))
      return !1;
    if (E.operator === l && o(e, E.semver))
      return !1;
  }
  return !0;
};
var bi = Zb;
const xb = bi, eS = (e, t, r) => xb(e, t, ">", r);
var tS = eS;
const rS = bi, nS = (e, t, r) => rS(e, t, "<", r);
var sS = nS;
const Hc = st(), aS = (e, t, r) => (e = new Hc(e, r), t = new Hc(t, r), e.intersects(t, r));
var oS = aS;
const iS = Cs, cS = nt;
var lS = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((u, h) => cS(u, h, r));
  for (const u of o)
    iS(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const c = [];
  for (const [u, h] of n)
    u === h ? c.push(u) : !h && u === o[0] ? c.push("*") : h ? u === o[0] ? c.push(`<=${h}`) : c.push(`${u} - ${h}`) : c.push(`>=${u}`);
  const l = c.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < d.length ? l : t;
};
const Wc = st(), Si = As(), { ANY: ta } = Si, Zr = Cs, Pi = nt, uS = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Wc(e, r), t = new Wc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = fS(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, dS = [new Si(">=0.0.0-0")], Bc = [new Si(">=0.0.0")], fS = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === ta) {
    if (t.length === 1 && t[0].semver === ta)
      return !0;
    r.includePrerelease ? e = dS : e = Bc;
  }
  if (t.length === 1 && t[0].semver === ta) {
    if (r.includePrerelease)
      return !0;
    t = Bc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? s = Xc(s, g, r) : g.operator === "<" || g.operator === "<=" ? a = Jc(a, g, r) : n.add(g.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = Pi(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const g of n) {
    if (s && !Zr(g, String(s), r) || a && !Zr(g, String(a), r))
      return null;
    for (const w of t)
      if (!Zr(g, String(w), r))
        return !1;
    return !0;
  }
  let c, l, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, E = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const g of t) {
    if (u = u || g.operator === ">" || g.operator === ">=", d = d || g.operator === "<" || g.operator === "<=", s) {
      if (E && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === E.major && g.semver.minor === E.minor && g.semver.patch === E.patch && (E = !1), g.operator === ">" || g.operator === ">=") {
        if (c = Xc(s, g, r), c === g && c !== s)
          return !1;
      } else if (s.operator === ">=" && !Zr(s.semver, String(g), r))
        return !1;
    }
    if (a) {
      if (h && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === h.major && g.semver.minor === h.minor && g.semver.patch === h.patch && (h = !1), g.operator === "<" || g.operator === "<=") {
        if (l = Jc(a, g, r), l === g && l !== a)
          return !1;
      } else if (a.operator === "<=" && !Zr(a.semver, String(g), r))
        return !1;
    }
    if (!g.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || E || h);
}, Xc = (e, t, r) => {
  if (!e)
    return t;
  const n = Pi(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Jc = (e, t, r) => {
  if (!e)
    return t;
  const n = Pi(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var hS = uS;
const ra = Pn, Yc = Is, mS = Ae, Qc = nd, pS = Gr, yS = EE, $S = PE, gS = RE, _S = TE, vS = kE, wS = DE, ES = VE, bS = UE, SS = nt, PS = HE, NS = XE, RS = _i, OS = ZE, TS = tb, IS = ks, jS = vi, kS = sd, AS = ad, CS = wi, DS = Ei, MS = od, LS = Sb, VS = As(), FS = st(), zS = Cs, US = jb, qS = Db, KS = Fb, GS = qb, HS = Hb, WS = bi, BS = tS, XS = sS, JS = oS, YS = lS, QS = hS;
var ZS = {
  parse: pS,
  valid: yS,
  clean: $S,
  inc: gS,
  diff: _S,
  major: vS,
  minor: wS,
  patch: ES,
  prerelease: bS,
  compare: SS,
  rcompare: PS,
  compareLoose: NS,
  compareBuild: RS,
  sort: OS,
  rsort: TS,
  gt: IS,
  lt: jS,
  eq: kS,
  neq: AS,
  gte: CS,
  lte: DS,
  cmp: MS,
  coerce: LS,
  Comparator: VS,
  Range: FS,
  satisfies: zS,
  toComparators: US,
  maxSatisfying: qS,
  minSatisfying: KS,
  minVersion: GS,
  validRange: HS,
  outside: WS,
  gtr: BS,
  ltr: XS,
  intersects: JS,
  simplifyRange: YS,
  subset: QS,
  SemVer: mS,
  re: ra.re,
  src: ra.src,
  tokens: ra.t,
  SEMVER_SPEC_VERSION: Yc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Yc.RELEASE_TYPES,
  compareIdentifiers: Qc.compareIdentifiers,
  rcompareIdentifiers: Qc.rcompareIdentifiers
};
const vr = /* @__PURE__ */ fl(ZS), xS = Object.prototype.toString, eP = "[object Uint8Array]", tP = "[object ArrayBuffer]";
function cd(e, t, r) {
  return e ? e.constructor === t ? !0 : xS.call(e) === r : !1;
}
function ld(e) {
  return cd(e, Uint8Array, eP);
}
function rP(e) {
  return cd(e, ArrayBuffer, tP);
}
function nP(e) {
  return ld(e) || rP(e);
}
function sP(e) {
  if (!ld(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function aP(e) {
  if (!nP(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function na(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    sP(s), r.set(s, n), n += s.length;
  return r;
}
const Hn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Wn(e, t = "utf8") {
  return aP(e), Hn[t] ?? (Hn[t] = new globalThis.TextDecoder(t)), Hn[t].decode(e);
}
function oP(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const iP = new globalThis.TextEncoder();
function sa(e) {
  return oP(e), iP.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Zc = "aes-256-cbc", ud = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), cP = (e) => typeof e == "string" && ud.has(e), pt = () => /* @__PURE__ */ Object.create(null), xc = (e) => e !== void 0, aa = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, It = "__internal__", oa = `${It}.migrations.version`;
var kt, At, lr, De, Ke, ur, dr, jr, ot, _e, dd, fd, hd, md, pd, yd, $d, gd;
class lP {
  constructor(t = {}) {
    Be(this, _e);
    ze(this, "path");
    ze(this, "events");
    Be(this, kt);
    Be(this, At);
    Be(this, lr);
    Be(this, De);
    Be(this, Ke, {});
    Be(this, ur, !1);
    Be(this, dr);
    Be(this, jr);
    Be(this, ot);
    ze(this, "_deserialize", (t) => JSON.parse(t));
    ze(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = ht(this, _e, dd).call(this, t);
    Ce(this, De, r), ht(this, _e, fd).call(this, r), ht(this, _e, md).call(this, r), ht(this, _e, pd).call(this, r), this.events = new EventTarget(), Ce(this, At, r.encryptionKey), Ce(this, lr, r.encryptionAlgorithm ?? Zc), this.path = ht(this, _e, yd).call(this, r), ht(this, _e, $d).call(this, r), r.watch && this._watch();
  }
  get(t, r) {
    if (J(this, De).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${It} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      if (aa(a, o), J(this, De).accessPropertiesByDotNotation)
        Nn(n, a, o);
      else {
        if (a === "__proto__" || a === "constructor" || a === "prototype")
          return;
        n[a] = o;
      }
    };
    if (typeof t == "object") {
      const a = t;
      for (const [o, c] of Object.entries(a))
        s(o, c);
    } else
      s(t, r);
    this.store = n;
  }
  has(t) {
    return J(this, De).accessPropertiesByDotNotation ? Vs(this.store, t) : t in this.store;
  }
  appendToArray(t, r) {
    aa(t, r);
    const n = J(this, De).accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(n))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...n, r]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      xc(J(this, Ke)[r]) && this.set(r, J(this, Ke)[r]);
  }
  delete(t) {
    const { store: r } = this;
    J(this, De).accessPropertiesByDotNotation ? Ad(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = pt();
    for (const r of Object.keys(J(this, Ke)))
      xc(J(this, Ke)[r]) && (aa(r, J(this, Ke)[r]), J(this, De).accessPropertiesByDotNotation ? Nn(t, r, J(this, Ke)[r]) : t[r] = J(this, Ke)[r]);
    this.store = t;
  }
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleValueChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((r) => !this._isReservedKeyPath(r)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    var t;
    try {
      const r = Y.readFileSync(this.path, J(this, At) ? null : "utf8"), n = this._decryptData(r);
      return ((a) => {
        const o = this._deserialize(a);
        return J(this, ur) || this._validate(o), Object.assign(pt(), o);
      })(n);
    } catch (r) {
      if ((r == null ? void 0 : r.code) === "ENOENT")
        return this._ensureDirectory(), pt();
      if (J(this, De).clearInvalidConfig) {
        const n = r;
        if (n.name === "SyntaxError" || (t = n.message) != null && t.startsWith("Config schema violation:") || n.message === "Failed to decrypt config data.")
          return pt();
      }
      throw r;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Vs(t, It))
      try {
        const r = Y.readFileSync(this.path, J(this, At) ? null : "utf8"), n = this._decryptData(r), s = this._deserialize(n);
        Vs(s, It) && Nn(t, It, ji(s, It));
      } catch {
      }
    J(this, ur) || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, r]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    J(this, dr) && (J(this, dr).close(), Ce(this, dr, void 0)), J(this, jr) && (Y.unwatchFile(this.path), Ce(this, jr, !1)), Ce(this, ot, void 0);
  }
  _decryptData(t) {
    const r = J(this, At);
    if (!r)
      return typeof t == "string" ? t : Wn(t);
    const n = J(this, lr), s = n === "aes-256-gcm" ? 16 : 0, a = ":".codePointAt(0), o = typeof t == "string" ? t.codePointAt(16) : t[16];
    if (!(a !== void 0 && o === a)) {
      if (n === "aes-256-cbc")
        return typeof t == "string" ? t : Wn(t);
      throw new Error("Failed to decrypt config data.");
    }
    const l = (g) => {
      if (s === 0)
        return { ciphertext: g };
      const w = g.length - s;
      if (w < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: g.slice(0, w),
        authenticationTag: g.slice(w)
      };
    }, d = t.slice(0, 16), u = t.slice(17), h = typeof u == "string" ? sa(u) : u, E = (g) => {
      const { ciphertext: w, authenticationTag: _ } = l(h), $ = Br.pbkdf2Sync(r, g, 1e4, 32, "sha512"), m = Br.createDecipheriv(n, $, d);
      return _ && m.setAuthTag(_), Wn(na([m.update(w), m.final()]));
    };
    try {
      return E(d);
    } catch {
      try {
        return E(d.toString());
      } catch {
      }
    }
    if (n === "aes-256-cbc")
      return typeof t == "string" ? t : Wn(t);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(t) {
    let r = this.store;
    const n = () => {
      const s = r, a = this.store;
      Oi(a, s) || (r = a, t.call(this, a, s));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Oi(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!J(this, kt) || J(this, kt).call(this, t) || !J(this, kt).errors)
      return;
    const n = J(this, kt).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Y.mkdirSync(ae.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    const n = J(this, At);
    if (n) {
      const s = Br.randomBytes(16), a = Br.pbkdf2Sync(n, s, 1e4, 32, "sha512"), o = Br.createCipheriv(J(this, lr), a, s), c = na([o.update(sa(r)), o.final()]), l = [s, sa(":"), c];
      J(this, lr) === "aes-256-gcm" && l.push(o.getAuthTag()), r = na(l);
    }
    if (de.env.SNAP)
      Y.writeFileSync(this.path, r, { mode: J(this, De).configFileMode });
    else
      try {
        dl(this.path, r, { mode: J(this, De).configFileMode });
      } catch (s) {
        if ((s == null ? void 0 : s.code) === "EXDEV") {
          Y.writeFileSync(this.path, r, { mode: J(this, De).configFileMode });
          return;
        }
        throw s;
      }
  }
  _watch() {
    if (this._ensureDirectory(), Y.existsSync(this.path) || this._write(pt()), de.platform === "win32" || de.platform === "darwin") {
      J(this, ot) ?? Ce(this, ot, kc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const t = ae.dirname(this.path), r = ae.basename(this.path);
      Ce(this, dr, Y.watch(t, { persistent: !1, encoding: "utf8" }, (n, s) => {
        s && s !== r || typeof J(this, ot) == "function" && J(this, ot).call(this);
      }));
    } else
      J(this, ot) ?? Ce(this, ot, kc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), Y.watchFile(this.path, { persistent: !1 }, (t, r) => {
        typeof J(this, ot) == "function" && J(this, ot).call(this);
      }), Ce(this, jr, !0);
  }
  _migrate(t, r, n) {
    let s = this._get(oa, "0.0.0");
    const a = Object.keys(t).filter((c) => this._shouldPerformMigration(c, s, r));
    let o = structuredClone(this.store);
    for (const c of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: c,
          finalVersion: r,
          versions: a
        });
        const l = t[c];
        l == null || l(this), this._set(oa, c), s = c, o = structuredClone(this.store);
      } catch (l) {
        this.store = o;
        const d = l instanceof Error ? l.message : String(l);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(s) || !vr.eq(s, r)) && this._set(oa, r);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [r, n] of Object.entries(t))
      if (this._isReservedKeyPath(r) || this._objectContainsReservedKey(n))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === It || t.startsWith(`${It}.`);
  }
  _isVersionInRangeFormat(t) {
    return vr.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && vr.satisfies(r, t) ? !1 : vr.satisfies(n, t) : !(vr.lte(t, r) || vr.gt(t, n));
  }
  _get(t, r) {
    return ji(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    Nn(n, t, r), this.store = n;
  }
}
kt = new WeakMap(), At = new WeakMap(), lr = new WeakMap(), De = new WeakMap(), Ke = new WeakMap(), ur = new WeakMap(), dr = new WeakMap(), jr = new WeakMap(), ot = new WeakMap(), _e = new WeakSet(), dd = function(t) {
  const r = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...t
  };
  if (r.encryptionAlgorithm ?? (r.encryptionAlgorithm = Zc), !cP(r.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...ud].join(", ")}`);
  if (!r.cwd) {
    if (!r.projectName)
      throw new Error("Please specify the `projectName` option.");
    r.cwd = Ld(r.projectName, { suffix: r.projectSuffix }).config;
  }
  return typeof r.fileExtension == "string" && (r.fileExtension = r.fileExtension.replace(/^\.+/, "")), r;
}, fd = function(t) {
  if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
    return;
  if (t.schema && typeof t.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const r = Zw.default, n = new Fg.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...t.ajvOptions
  });
  r(n);
  const s = {
    ...t.rootSchema,
    type: "object",
    properties: t.schema
  };
  Ce(this, kt, n.compile(s)), ht(this, _e, hd).call(this, t.schema);
}, hd = function(t) {
  const r = Object.entries(t ?? {});
  for (const [n, s] of r) {
    if (!s || typeof s != "object" || !Object.hasOwn(s, "default"))
      continue;
    const { default: a } = s;
    a !== void 0 && (J(this, Ke)[n] = a);
  }
}, md = function(t) {
  t.defaults && Object.assign(J(this, Ke), t.defaults);
}, pd = function(t) {
  t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
}, yd = function(t) {
  const r = typeof t.fileExtension == "string" ? t.fileExtension : void 0, n = r ? `.${r}` : "";
  return ae.resolve(t.cwd, `${t.configName ?? "config"}${n}`);
}, $d = function(t) {
  if (t.migrations) {
    ht(this, _e, gd).call(this, t), this._validate(this.store);
    return;
  }
  const r = this.store, n = Object.assign(pt(), t.defaults ?? {}, r);
  this._validate(n);
  try {
    Ti.deepEqual(r, n);
  } catch {
    this.store = n;
  }
}, gd = function(t) {
  const { migrations: r, projectVersion: n } = t;
  if (r) {
    if (!n)
      throw new Error("Please specify the `projectVersion` option.");
    Ce(this, ur, !0);
    try {
      const s = this.store, a = Object.assign(pt(), t.defaults ?? {}, s);
      try {
        Ti.deepEqual(s, a);
      } catch {
        this._write(a);
      }
      this._migrate(r, n, t.beforeEachMigration);
    } finally {
      Ce(this, ur, !1);
    }
  }
};
const { app: ns, ipcMain: Pa, shell: uP } = nl;
let el = !1;
const tl = () => {
  if (!Pa || !ns)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: ns.getPath("userData"),
    appVersion: ns.getVersion()
  };
  return el || (Pa.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), el = !0), e;
};
class dP extends lP {
  constructor(t) {
    let r, n;
    if (de.type === "renderer") {
      const s = nl.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else Pa && ns && ({ defaultCwd: r, appVersion: n } = tl());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = ae.isAbsolute(t.cwd) ? t.cwd : ae.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    tl();
  }
  async openInEditor() {
    const t = await uP.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const fP = {
  settings: {
    type: "object",
    properties: {
      strictMode: { type: "boolean", default: !1 },
      timers: {
        type: "object",
        properties: {
          visual: { type: "number", default: 20 },
          posture: { type: "number", default: 120 },
          wrist: { type: "number", default: 60 },
          lowerBody: { type: "number", default: 60 }
        },
        default: {}
      },
      durations: {
        type: "object",
        properties: {
          visual: { type: "number", default: 20 },
          posture: { type: "number", default: 20 },
          wrist: { type: "number", default: 20 },
          lowerBody: { type: "number", default: 20 }
        },
        default: {}
      }
    },
    default: {}
  },
  stats: {
    type: "object",
    properties: {
      totalBreaks: { type: "number", default: 0 },
      skippedBreaks: { type: "number", default: 0 }
    },
    default: {}
  }
};
class hP {
  constructor() {
    ze(this, "store");
    this.store = new dP({ schema: fP });
  }
  getSettings() {
    const t = {
      strictMode: !1,
      runOnStartup: !1,
      timers: {
        visual: 20,
        posture: 120,
        wrist: 60,
        lowerBody: 60
      },
      durations: {
        visual: 20,
        // seconds
        posture: 20,
        wrist: 20,
        lowerBody: 20
      }
    }, r = this.store.get("settings") || {};
    return {
      ...t,
      ...r,
      timers: {
        ...t.timers,
        ...r.timers || {}
      },
      durations: {
        ...t.durations,
        ...r.durations || {}
      }
    };
  }
  setSettings(t) {
    this.store.set("settings", t);
  }
  updateStats(t) {
    t === "total" ? this.store.set("stats.totalBreaks", this.store.get("stats.totalBreaks") + 1) : this.store.set("stats.skippedBreaks", this.store.get("stats.skippedBreaks") + 1);
  }
  get(t) {
    return this.store.get(t);
  }
  set(t, r) {
    this.store.set(t, r);
  }
}
const Nr = new hP(), mP = {
  visual: {
    title: "Visual Health Break",
    description: "The 20-20-20 Rule: Look 20ft away for 20s."
  },
  posture: {
    title: "Posture Check",
    description: "Ergonomic Check: Eyes level, elbows 90°."
  },
  wrist: {
    title: "Wrist & RSI Relief",
    description: "Stretches: Prayer & Reverse Wrist Pull."
  },
  lowerBody: {
    title: "Back & Knee Movement",
    description: "Movement breaks: Glute bridges & Couch stretch."
  }
};
class pP {
  constructor() {
    ze(this, "timers", []);
    ze(this, "isBreakActive", !1);
    ze(this, "currentBreakType", null);
    ze(this, "currentBreakSettings", null);
    ze(this, "isRunning", !1);
  }
  startTimers() {
    this.stopTimers(), this.isRunning = !0;
    const t = Nr.getSettings();
    return !t || !t.timers ? (console.error("Failed to start timers: Invalid settings", t), this.isRunning = !1, !1) : (this.scheduleTimer("visual", t.timers.visual * 60 * 1e3), this.scheduleTimer("posture", t.timers.posture * 60 * 1e3), this.scheduleTimer("wrist", t.timers.wrist * 60 * 1e3), this.scheduleTimer("lowerBody", t.timers.lowerBody * 60 * 1e3), !0);
  }
  stopTimers() {
    this.isRunning = !1, this.timers.forEach(clearTimeout), this.timers = [];
  }
  scheduleTimer(t, r) {
    const n = setTimeout(() => {
      this.triggerBreak(t);
    }, r);
    this.timers.push(n);
  }
  triggerBreak(t) {
    var a;
    if (this.isBreakActive) return;
    this.isBreakActive = !0, this.currentBreakType = t;
    const r = Nr.getSettings(), n = ((a = r.durations) == null ? void 0 : a[t]) ?? 20;
    this.currentBreakSettings = {
      strictMode: r.strictMode,
      duration: n
    };
    const s = sn.createOverlayWindow(r.strictMode);
    r.strictMode && (s.setAlwaysOnTop(!0, "screen-saver"), s.focus()), console.log(`Scheduler: Triggered break '${t}', waiting for overlay ready...`);
  }
  handleOverlayReady(t) {
    if (console.log("Scheduler: Overlay reported ready"), this.isBreakActive && this.currentBreakType && this.currentBreakSettings) {
      console.log(`Scheduler: Sending break data to overlay: ${this.currentBreakType}`);
      const r = mP[this.currentBreakType] || { title: "Break Time", description: "Take a moment to relax." };
      t.reply("break-trigger", {
        type: this.currentBreakType,
        strictMode: this.currentBreakSettings.strictMode,
        duration: this.currentBreakSettings.duration,
        title: r.title,
        description: r.description
      });
    }
  }
  completeBreak() {
    this.isBreakActive = !1, this.currentBreakType = null, this.currentBreakSettings = null, sn.closeOverlay(), this.startTimers(), Nr.updateStats("total");
  }
  skipBreak() {
    this.isBreakActive = !1, this.currentBreakType = null, this.currentBreakSettings = null, sn.closeOverlay(), this.startTimers(), Nr.updateStats("skipped");
  }
}
const Ft = new pP(), yP = al(import.meta.url), rl = sl(yP), xr = ye.isPackaged ? Ct(rl, "../dist/logo.png") : Ct(rl, "../public/logo.png");
let Bn = null, ss = !1;
rt.handle("get-settings", () => Nr.getSettings());
rt.handle("set-settings", (e, t) => (Nr.setSettings(t), Ft.startTimers(), !0));
rt.handle("break-complete", () => {
  Ft.completeBreak();
});
rt.handle("break-skipped", () => {
  Ft.skipBreak();
});
rt.handle("start-timers", () => Ft.startTimers());
rt.handle("stop-timers", () => (Ft.stopTimers(), !0));
rt.handle("get-timer-status", () => Ft.isRunning);
rt.handle("get-startup-status", () => ye.getLoginItemSettings().openAtLogin);
rt.handle("toggle-startup", (e, t) => (ye.setLoginItemSettings({
  openAtLogin: t,
  path: process.execPath
}), ye.getLoginItemSettings().openAtLogin));
rt.on("overlay-ready", (e) => {
  Ft.handleOverlayReady(e);
});
const $P = ye.requestSingleInstanceLock();
$P ? (ye.on("second-instance", (e, t, r) => {
  const n = yn.getAllWindows().find((s) => !s.isDestroyed());
  n && (n.isMinimized() && n.restore(), n.show(), n.focus());
}), ye.whenReady().then(() => {
  Nd.setAppUserModelId("com.electron"), ye.on("browser-window-created", (n, s) => {
    Rd.watchWindowShortcuts(s), s.webContents.on("console-message", (a, o, c, l, d) => {
      console.log(`[Renderer] ${c}`);
    });
  });
  const e = sn.createDashboardWindow();
  e.on("close", (n) => {
    if (!ss)
      return n.preventDefault(), e.hide(), !1;
  });
  let t;
  typeof xr == "string" && xr.startsWith("data:") ? t = Ri.createFromDataURL(xr) : t = Ri.createFromPath(xr), t.isEmpty() && console.error("Failed to load tray icon from:", xr), Bn = new Sd(t);
  const r = Pd.buildFromTemplate([
    {
      label: "Open Dashboard",
      click: () => e.show()
    },
    {
      label: "Quit RefactorMe",
      click: () => {
        ss = !0, ye.quit();
      }
    }
  ]);
  Bn.setToolTip("RefactorMe - Developer Wellness"), Bn.setContextMenu(r), Bn.on("double-click", () => {
    e.show();
  }), Ft.startTimers(), ye.on("activate", function() {
    yn.getAllWindows().length === 0 ? sn.createDashboardWindow() : e.show();
  }), ye.on("before-quit", () => {
    ss = !0;
  });
})) : ye.quit();
ye.on("window-all-closed", () => {
  process.platform !== "darwin" && ss && ye.quit();
});
