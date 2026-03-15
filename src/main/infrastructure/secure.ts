import { ipcMain, BrowserWindow, safeStorage } from "electron";
import { IPC_EVENTS } from "@common/ipc-events";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

// 凭证存储结构
interface CredentialEntry {
  account: string;
  encryptedPassword: string;
}

// 凭证存储路径
const getCredentialsPath = (): string => {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "credentials.json");
};

const APP_NAME = "hetu";
let window: BrowserWindow | null = null;

/**
 * 读取凭证文件
 * @returns Promise<CredentialEntry[]> - 凭证列表
 */
const readCredentials = async (): Promise<CredentialEntry[]> => {
  const credPath = getCredentialsPath();
  try {
    if (!fs.existsSync(credPath)) {
      return [];
    }
    const data = await fs.promises.readFile(credPath, "utf8");
    return JSON.parse(data) || [];
  } catch (error) {
    console.error("读取凭证文件失败:", error);
    return [];
  }
};

/**
 * 写入凭证文件
 * @param credentials - 凭证列表
 * @returns Promise<void>
 */
const writeCredentials = async (
  credentials: CredentialEntry[]
): Promise<void> => {
  const credPath = getCredentialsPath();
  try {
    // 确保目录存在
    const dir = path.dirname(credPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(
      credPath,
      JSON.stringify(credentials, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("写入凭证文件失败:", error);
    throw error;
  }
};

/**
 * Initialize the secure storage
 * @param win - BrowserWindow instance
 */
export const init = (win: BrowserWindow): void => {
  window = win;

  // 检查 safeStorage 是否可用
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn("safeStorage 加密不可用，凭证存储功能受限");
  }

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.SECURE.CLEAR_CACHE, (event, arg) => {
    clearCache()
      .then(() => {
        event.sender.send(IPC_EVENTS.SECURE.CACHE_CLEARED);
      })
      .catch((error) => {
        event.sender.send(IPC_EVENTS.SECURE.CLEAR_CACHE_FAILED, {
          error: "GENERIC",
          detail: error,
        });
      });
  });
};

/**
 * Get the password for the given account
 * @param account - Account identifier
 * @returns Promise<string> - Password or empty string
 */
export const getPass = async (account: string): Promise<string> => {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn("safeStorage 不可用，返回空密码");
    return "";
  }

  try {
    const credentials = await readCredentials();
    const credential = credentials.find((cred) => cred.account === account);

    if (!credential) {
      return "";
    }

    // 解密密码
    const encryptedBuffer = Buffer.from(credential.encryptedPassword, "base64");
    const decryptedPassword = safeStorage.decryptString(encryptedBuffer);
    return decryptedPassword;
  } catch (error) {
    console.error("获取密码失败:", error);
    return "";
  }
};

/**
 * Set the password for the given account
 * @param account - Account identifier
 * @param password - Password to store
 * @returns Promise<void>
 */
export const setPass = async (
  account: string,
  password: string
): Promise<void> => {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn("safeStorage 不可用，无法设置密码");
    return;
  }

  if (!account || !password) {
    return;
  }

  try {
    // 加密密码
    const encryptedBuffer = safeStorage.encryptString(password);
    const encryptedPassword = encryptedBuffer.toString("base64");

    // 读取现有凭证
    const credentials = await readCredentials();

    // 查找现有条目并更新，或添加新条目
    const existingIndex = credentials.findIndex(
      (cred) => cred.account === account
    );

    if (existingIndex >= 0) {
      credentials[existingIndex].encryptedPassword = encryptedPassword;
    } else {
      credentials.push({ account, encryptedPassword });
    }

    // 保存凭证
    await writeCredentials(credentials);
  } catch (err) {
    console.error("设置密码失败:", err);
    if (window) {
      window.webContents.send(IPC_EVENTS.SECURE.SET_PASSWORD_FAILED, {
        error: "GENERIC",
        detail: err,
      });
    }
  }
};

/**
 * Clear all cached credentials
 * @returns Promise<void>
 */
export const clearCache = async (): Promise<void> => {
  try {
    // 直接删除凭证文件
    const credPath = getCredentialsPath();
    if (fs.existsSync(credPath)) {
      await fs.promises.unlink(credPath);
    }
  } catch (err) {
    console.error("清除缓存失败:", err);
    if (window) {
      window.webContents.send(IPC_EVENTS.SECURE.CLEAR_CACHE_FAILED, {
        error: "GENERIC",
        detail: err,
      });
    }
    throw err;
  }
};

/**
 * Clear cached credentials for a specific repository
 * @param repoID - Repository identifier
 * @returns Promise<void>
 */
export const clearRepoCache = async (repoID: string): Promise<void> => {
  try {
    const credentials = await readCredentials();

    // 过滤掉包含指定仓库ID的凭证
    const filteredCredentials = credentials.filter(
      (cred) => !cred.account.includes(repoID)
    );

    // 如果有变化，则保存更新后的凭证
    if (filteredCredentials.length !== credentials.length) {
      await writeCredentials(filteredCredentials);
    }
  } catch (error) {
    console.error("清除仓库缓存失败:", error);
  }
};
